import { eq, and } from 'drizzle-orm';
import { db } from '../../db';
import { workflowTriggers, workflows, executions } from '../../db/schema';
import { workspaceService } from '../workspaces/workspace.service';
import { NotFoundError } from '../../middleware/error.middleware';
import { schedulerQueue, executionQueue } from '../../workers/queue';
import { WorkflowGraph } from '@autozure/types';
import crypto from 'crypto';

export class TriggerService {
  async createWebhookTrigger(userId: string, workflowId: string, workspaceId: string, config: Record<string, unknown>) {
    await workspaceService.assertRole(workspaceId, userId, ['owner', 'admin', 'editor']);
    const webhookPath = `${workflowId}-${crypto.randomBytes(8).toString('hex')}`;
    const webhookSecret = crypto.randomBytes(32).toString('hex');

    const [trigger] = await db.insert(workflowTriggers).values({
      workflowId,
      type: 'webhook',
      config,
      active: true,
      webhookPath,
      webhookSecret,
    }).returning();

    return { ...trigger, webhookUrl: `/webhooks/${webhookPath}` };
  }

  async createScheduleTrigger(userId: string, workflowId: string, workspaceId: string, config: { cron: string; timezone?: string }) {
    await workspaceService.assertRole(workspaceId, userId, ['owner', 'admin', 'editor']);

    const workflow = await db.query.workflows.findFirst({ where: eq(workflows.id, workflowId) });
    if (!workflow) throw new NotFoundError('Workflow');

    const [trigger] = await db.insert(workflowTriggers).values({
      workflowId,
      type: 'schedule',
      config,
      active: true,
    }).returning();

    // Register cron job in BullMQ
    await schedulerQueue.add(
      `schedule-${trigger.id}`,
      { workflowId, triggerId: trigger.id, workspaceId },
      { repeat: { pattern: config.cron, tz: config.timezone || 'UTC' } }
    );

    return trigger;
  }

  async getTriggers(workflowId: string, userId: string, workspaceId: string) {
    await workspaceService.assertRole(workspaceId, userId, ['owner', 'admin', 'editor', 'viewer']);
    return db.query.workflowTriggers.findMany({
      where: eq(workflowTriggers.workflowId, workflowId),
    });
  }

  async deleteTrigger(triggerId: string, userId: string, workspaceId: string) {
    await workspaceService.assertRole(workspaceId, userId, ['owner', 'admin', 'editor']);
    const trigger = await db.query.workflowTriggers.findFirst({ where: eq(workflowTriggers.id, triggerId) });
    if (!trigger) throw new NotFoundError('Trigger');

    if (trigger.type === 'schedule') {
      // Remove BullMQ repeatable job
      const jobs = await schedulerQueue.getRepeatableJobs();
      const job = jobs.find(j => j.name === `schedule-${triggerId}`);
      if (job) await schedulerQueue.removeRepeatableByKey(job.key);
    }

    await db.delete(workflowTriggers).where(eq(workflowTriggers.id, triggerId));
  }

  async handleWebhook(webhookPath: string, method: string, headers: Record<string, string>, body: unknown) {
    const trigger = await db.query.workflowTriggers.findFirst({
      where: and(
        eq(workflowTriggers.webhookPath, webhookPath),
        eq(workflowTriggers.active, true)
      ),
    });
    if (!trigger) throw new NotFoundError('Webhook');

    const workflow = await db.query.workflows.findFirst({
      where: and(eq(workflows.id, trigger.workflowId), eq(workflows.active, true)),
    });
    if (!workflow) throw new Error('Workflow is not active');

    const [execution] = await db.insert(executions).values({
      workflowId: trigger.workflowId,
      workspaceId: workflow.workspaceId,
      status: 'pending',
      triggerType: 'webhook',
      triggerData: { method, headers, body, _webhookPath: webhookPath },
      startedAt: new Date(),
    }).returning();

    await executionQueue.add('execute-workflow', {
      executionId: execution.id,
      graph: workflow.graph as WorkflowGraph,
      triggerData: { method, headers, body, _webhookPath: webhookPath },
    });

    return { executionId: execution.id, accepted: true };
  }
}

export const triggerService = new TriggerService();
