import { Worker, Job } from 'bullmq';
import { redis } from '../lib/redis';
import { logger } from '../lib/logger';
import { db } from '../db';
import { executions, workflowTriggers, workflows } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { executionQueue } from './queue';
import { WorkflowGraph } from '@flowforge/types';

export interface SchedulerJobData {
  workflowId: string;
  triggerId: string;
  workspaceId: string;
}

export function createSchedulerWorker() {
  const worker = new Worker<SchedulerJobData>(
    'workflow-scheduler',
    async (job: Job<SchedulerJobData>) => {
      const { workflowId, triggerId, workspaceId } = job.data;
      logger.info(`Scheduler: triggering workflow ${workflowId}`);

      // Verify trigger is still active
      const trigger = await db.query.workflowTriggers.findFirst({
        where: and(eq(workflowTriggers.id, triggerId), eq(workflowTriggers.active, true)),
      });
      if (!trigger) {
        logger.warn(`Scheduler: trigger ${triggerId} is no longer active`);
        return;
      }

      const workflow = await db.query.workflows.findFirst({
        where: and(eq(workflows.id, workflowId), eq(workflows.active, true)),
      });
      if (!workflow) {
        logger.warn(`Scheduler: workflow ${workflowId} is not active`);
        return;
      }

      const [execution] = await db.insert(executions).values({
        workflowId,
        workspaceId,
        status: 'pending',
        triggerType: 'schedule',
        triggerData: { _scheduledAt: new Date().toISOString(), triggerId },
        startedAt: new Date(),
      }).returning();

      await executionQueue.add('execute-workflow', {
        executionId: execution.id,
        graph: workflow.graph as WorkflowGraph,
        triggerData: { _scheduledAt: new Date().toISOString() },
      });

      logger.info(`Scheduler: queued execution ${execution.id} for workflow ${workflowId}`);
    },
    { connection: redis, concurrency: 10 }
  );

  worker.on('error', (err) => logger.error('Scheduler worker error:', err));
  return worker;
}
