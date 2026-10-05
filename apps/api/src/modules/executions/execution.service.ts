import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../db';
import { executions, executionNodeResults, executionLogs } from '../../db/schema';
import { workspaceService } from '../workspaces/workspace.service';
import { NotFoundError } from '../../middleware/error.middleware';

export class ExecutionService {
  async getAll(userId: string, workspaceId: string, filters: {
    workflowId?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  } = {}) {
    await workspaceService.assertRole(workspaceId, userId, ['owner', 'admin', 'editor', 'viewer']);
    
    const page = filters.page || 1;
    const pageSize = Math.min(filters.pageSize || 20, 100);
    const offset = (page - 1) * pageSize;

    const all = await db.query.executions.findMany({
      where: eq(executions.workspaceId, workspaceId),
      orderBy: [desc(executions.startedAt)],
      limit: pageSize,
      offset,
    });

    return all;
  }

  async getById(id: string, userId: string, workspaceId: string) {
    await workspaceService.assertRole(workspaceId, userId, ['owner', 'admin', 'editor', 'viewer']);
    
    const execution = await db.query.executions.findFirst({
      where: and(eq(executions.id, id), eq(executions.workspaceId, workspaceId)),
      with: {
        nodeResults: true,
        logs: { orderBy: [desc(executionLogs.timestamp)], limit: 500 },
      },
    });
    if (!execution) throw new NotFoundError('Execution');
    return execution;
  }

  async cancel(id: string, userId: string, workspaceId: string) {
    const execution = await this.getById(id, userId, workspaceId);
    await workspaceService.assertRole(workspaceId, userId, ['owner', 'admin', 'editor']);

    if (!['pending', 'running'].includes(execution.status)) {
      throw new Error('Only pending or running executions can be cancelled');
    }

    await db.update(executions)
      .set({ status: 'cancelled', finishedAt: new Date() })
      .where(eq(executions.id, id));

    return { cancelled: true };
  }

  async getLogs(id: string, userId: string, workspaceId: string, nodeId?: string) {
    await this.getById(id, userId, workspaceId);
    
    return db.query.executionLogs.findMany({
      where: eq(executionLogs.executionId, id),
      orderBy: [desc(executionLogs.timestamp)],
      limit: 1000,
    });
  }

  async getStats(userId: string, workspaceId: string) {
    await workspaceService.assertRole(workspaceId, userId, ['owner', 'admin', 'editor', 'viewer']);
    
    const [total, successful, failed, running] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(executions).where(eq(executions.workspaceId, workspaceId)),
      db.select({ count: sql<number>`count(*)` }).from(executions).where(and(eq(executions.workspaceId, workspaceId), eq(executions.status, 'success'))),
      db.select({ count: sql<number>`count(*)` }).from(executions).where(and(eq(executions.workspaceId, workspaceId), eq(executions.status, 'failed'))),
      db.select({ count: sql<number>`count(*)` }).from(executions).where(and(eq(executions.workspaceId, workspaceId), eq(executions.status, 'running'))),
    ]);

    const totalCount = Number(total[0]?.count || 0);
    const successCount = Number(successful[0]?.count || 0);

    return {
      total: totalCount,
      successful: successCount,
      failed: Number(failed[0]?.count || 0),
      running: Number(running[0]?.count || 0),
      successRate: totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0,
    };
  }
}

export const executionService = new ExecutionService();
