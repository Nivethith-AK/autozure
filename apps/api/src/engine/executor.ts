import { WorkflowGraph, Execution, NodeExecutionResult, ExecutionLog } from '@autozure/types';
import { topologicalSort, getPredecessors } from './graph';
import { nodeRegistry } from '../nodes/registry';
import { ExecutionContext } from '../nodes/types';
import { db, isDbConnected } from '../db';
import { memoryStore } from '../db/memoryStore';
import { executions, executionNodeResults, executionLogs, workflows } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../lib/logger';

export interface ExecutionOptions {
  timeoutMs?: number;
  retries?: number;
}

export class WorkflowExecutor {
  async execute(
    executionId: string,
    graph: WorkflowGraph,
    triggerData: Record<string, unknown> = {},
    options: ExecutionOptions = {}
  ): Promise<void> {
    const { timeoutMs = 300_000 } = options; // 5 min default timeout

    let execution: any;
    if (!isDbConnected) {
      execution = memoryStore.executions.get(executionId);
      if (!execution) throw new Error(`Execution ${executionId} not found`);
      execution.status = 'running';
      execution.startedAt = new Date();
    } else {
      // Mark execution as running
      await db.update(executions)
        .set({ status: 'running', startedAt: new Date() })
        .where(eq(executions.id, executionId));

      execution = await db.query.executions.findFirst({
        where: eq(executions.id, executionId),
      });
      if (!execution) throw new Error(`Execution ${executionId} not found`);
    }

    await this.log(executionId, 'info', 'Execution started');

    // Global abort controller for timeout
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort('Timeout'), timeoutMs);

    try {
      const sortedIds = topologicalSort(graph);
      const nodeMap = new Map(graph.nodes.map(n => [n.id, n]));
      const resultMap = new Map<string, unknown>(); // nodeId -> output data

      // Store initial trigger data
      resultMap.set('__trigger__', triggerData);

      for (const nodeId of sortedIds) {
        if (controller.signal.aborted) break;

        const node = nodeMap.get(nodeId);
        if (!node) continue;
        if (node.data.disabled) {
          await this.saveNodeResult(executionId, nodeId, node.data.type, 'skipped', {}, {});
          continue;
        }

        // Gather inputs from predecessors
        const predecessors = getPredecessors(nodeId, graph.edges);
        const inputs: Record<string, unknown[]> = {};
        for (const predId of predecessors) {
          inputs[predId] = [resultMap.get(predId) ?? {}];
        }
        // Include trigger data
        if (predecessors.length === 0) {
          inputs['__trigger__'] = [triggerData];
        }

        // Get the node handler
        const handler = nodeRegistry.get(node.data.type || node.type);
        if (!handler) {
          await this.saveNodeResult(executionId, nodeId, node.data.type, 'failed', inputs, null, `Unknown node type: ${node.data.type}`);
          await this.failExecution(executionId, `Unknown node type: ${node.data.type}`);
          return;
        }

        // Build execution context
        const ctx: ExecutionContext = {
          nodeId,
          parameters: node.data.parameters || {},
          inputs,
          credentials: {},
          executionId,
          workspaceId: execution.workspaceId,
          logger: {
            info: (msg, meta) => this.log(executionId, 'info', msg, nodeId, meta),
            warn: (msg, meta) => this.log(executionId, 'warn', msg, nodeId, meta),
            error: (msg, meta) => this.log(executionId, 'error', msg, nodeId, meta),
            debug: (msg, meta) => this.log(executionId, 'debug', msg, nodeId, meta),
          },
          signal: controller.signal,
        };

        const startedAt = new Date();
        await this.saveNodeResult(executionId, nodeId, node.data.type, 'running', inputs, null);
        await this.log(executionId, 'info', `Running node: ${node.data.label || nodeId}`, nodeId);

        try {
          const result = await handler.execute(ctx);
          const finishedAt = new Date();
          const durationMs = finishedAt.getTime() - startedAt.getTime();

          if (result.success) {
            resultMap.set(nodeId, result.data);
            await this.saveNodeResult(executionId, nodeId, node.data.type, 'success', inputs, result.data, undefined, startedAt, finishedAt, durationMs);
            await this.log(executionId, 'info', `Node completed in ${durationMs}ms`, nodeId);
          } else {
            await this.saveNodeResult(executionId, nodeId, node.data.type, 'failed', inputs, null, result.error, startedAt, finishedAt, durationMs);
            await this.failExecution(executionId, result.error || 'Node failed');
            return;
          }
        } catch (err) {
          const error = err instanceof Error ? err.message : String(err);
          await this.saveNodeResult(executionId, nodeId, node.data.type, 'failed', inputs, null, error, startedAt);
          await this.failExecution(executionId, error);
          return;
        }
      }

      // All nodes done
      if (controller.signal.aborted) {
        await this.failExecution(executionId, 'Execution timed out');
      } else {
        if (!isDbConnected) {
          const exec = memoryStore.executions.get(executionId);
          if (exec) {
            exec.status = 'success';
            exec.finishedAt = new Date();
          }
          const wf = memoryStore.workflows.get(execution.workflowId);
          if (wf) {
            wf.lastRunAt = new Date();
            wf.lastRunStatus = 'success';
          }
          await this.log(executionId, 'info', 'Execution completed successfully');
        } else {
          await db.update(executions)
            .set({ status: 'success', finishedAt: new Date() })
            .where(eq(executions.id, executionId));
          // Update workflow's last run
          await db.update(workflows)
            .set({ lastRunAt: new Date(), lastRunStatus: 'success' })
            .where(eq(workflows.id, execution.workflowId));
          await this.log(executionId, 'info', 'Execution completed successfully');
        }
      }
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  private async failExecution(executionId: string, error: string) {
    if (!isDbConnected) {
      const exec = memoryStore.executions.get(executionId);
      if (exec) {
        exec.status = 'failed';
        exec.finishedAt = new Date();
        exec.error = error;
      }
      const wf = memoryStore.workflows.get(exec?.workflowId || '');
      if (wf) {
        wf.lastRunAt = new Date();
        wf.lastRunStatus = 'failed';
      }
      await this.log(executionId, 'error', `Execution failed: ${error}`);
      return;
    }

    const execution = await db.query.executions.findFirst({ where: eq(executions.id, executionId) });
    await db.update(executions)
      .set({ status: 'failed', finishedAt: new Date(), error })
      .where(eq(executions.id, executionId));
    if (execution) {
      await db.update(workflows)
        .set({ lastRunAt: new Date(), lastRunStatus: 'failed' })
        .where(eq(workflows.id, execution.workflowId));
    }
    await this.log(executionId, 'error', `Execution failed: ${error}`);
  }

  private async saveNodeResult(
    executionId: string,
    nodeId: string,
    nodeType: string,
    status: 'waiting' | 'running' | 'success' | 'failed' | 'skipped',
    inputData: unknown,
    outputData: unknown,
    error?: string,
    startedAt?: Date,
    finishedAt?: Date,
    durationMs?: number
  ) {
    if (!isDbConnected) {
      let results = memoryStore.nodeResults.get(executionId);
      if (!results) {
        results = [];
        memoryStore.nodeResults.set(executionId, results);
      }
      const idx = results.findIndex(r => r.nodeId === nodeId);
      const nr: any = {
        id: `nr-${nodeId}`,
        executionId,
        nodeId,
        nodeType,
        status,
        inputData,
        outputData,
        error,
        startedAt: startedAt || new Date(),
        finishedAt,
        durationMs,
      };
      if (idx >= 0) results[idx] = nr;
      else results.push(nr);
      return;
    }

    // Upsert
    const existing = await db.query.executionNodeResults.findFirst({
      where: eq(executionNodeResults.executionId, executionId),
    });
    await db.insert(executionNodeResults).values({
      executionId,
      nodeId,
      nodeType,
      status,
      inputData: inputData as any,
      outputData: outputData as any,
      error,
      startedAt,
      finishedAt,
      durationMs,
    }).onConflictDoUpdate({
      target: [executionNodeResults.executionId, executionNodeResults.nodeId],
      set: { status, outputData: outputData as any, error, finishedAt, durationMs },
    }).catch(() => {});
  }

  private async log(
    executionId: string,
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    nodeId?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    if (!isDbConnected) {
      let logs = memoryStore.logs.get(executionId);
      if (!logs) {
        logs = [];
        memoryStore.logs.set(executionId, logs);
      }
      logs.push({
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        executionId,
        nodeId,
        level,
        message,
        metadata: metadata as any,
        timestamp: new Date(),
      });
      logger[level](`[Execution:${executionId.slice(0, 8)}] ${message}`, metadata);
      return;
    }

    await db.insert(executionLogs).values({
      executionId,
      nodeId,
      level,
      message,
      metadata: metadata as any,
      timestamp: new Date(),
    }).catch(() => {});
    logger[level](`[Execution:${executionId.slice(0, 8)}] ${message}`, metadata);
  }
}

export const workflowExecutor = new WorkflowExecutor();
