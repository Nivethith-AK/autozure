import { Worker, Job } from 'bullmq';
import { redis } from '../lib/redis';
import { workflowExecutor } from '../engine/executor';
import { logger } from '../lib/logger';
import { db } from '../db';
import { executions } from '../db/schema';
import { eq } from 'drizzle-orm';
import { WorkflowGraph } from '@flowforge/types';

export interface ExecutionJobData {
  executionId: string;
  graph: WorkflowGraph;
  triggerData: Record<string, unknown>;
}

export function createExecutionWorker() {
  const worker = new Worker<ExecutionJobData>(
    'workflow-executions',
    async (job: Job<ExecutionJobData>) => {
      const { executionId, graph, triggerData } = job.data;
      logger.info(`Worker: starting execution ${executionId}`);

      try {
        await workflowExecutor.execute(executionId, graph, triggerData);
        logger.info(`Worker: execution ${executionId} completed`);
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        logger.error(`Worker: execution ${executionId} failed: ${error}`);
        await db.update(executions)
          .set({ status: 'failed', finishedAt: new Date(), error })
          .where(eq(executions.id, executionId));
        throw err;
      }
    },
    {
      connection: redis,
      concurrency: Number(process.env.WORKER_CONCURRENCY) || 5,
      limiter: { max: 100, duration: 60000 },
    }
  );

  worker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed: ${err.message}`);
  });

  worker.on('error', (err) => {
    logger.error('Worker error:', err);
  });

  return worker;
}
