import { eq, and, desc } from 'drizzle-orm';
import { db, isDbConnected } from '../../db';
import { memoryStore } from '../../db/memoryStore';
import { workflows, workflowVersions, executions } from '../../db/schema';
import { workspaceService } from '../workspaces/workspace.service';
import { NotFoundError, ForbiddenError, ValidationError } from '../../middleware/error.middleware';
import { validateGraph } from '../../engine/graph';
import { nodeRegistry } from '../../nodes/registry';
import { WorkflowGraph } from '@flowforge/types';

export class WorkflowService {
  async create(userId: string, workspaceId: string, data: {
    name: string;
    description?: string;
    graph?: WorkflowGraph;
  }) {
    await workspaceService.assertRole(workspaceId, userId, ['owner', 'admin', 'editor']);

    const graph = data.graph || { nodes: [], edges: [] };

    if (!isDbConnected) {
      const id = `wf-${Date.now()}`;
      const newWf: any = {
        id,
        workspaceId,
        name: data.name,
        description: data.description,
        graph,
        createdBy: userId,
        status: 'draft',
        active: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.workflows.set(id, newWf);
      return newWf;
    }

    const [workflow] = await db.insert(workflows).values({
      workspaceId,
      name: data.name,
      description: data.description,
      graph,
      createdBy: userId,
      status: 'draft',
    }).returning();

    return workflow;
  }

  async getAll(userId: string, workspaceId: string, page = 1, pageSize = 20) {
    await workspaceService.assertRole(workspaceId, userId, ['owner', 'admin', 'editor', 'viewer']);

    if (!isDbConnected) {
      return Array.from(memoryStore.workflows.values()).filter(
        w => w.workspaceId === workspaceId
      );
    }

    const offset = (page - 1) * pageSize;
    const all = await db.query.workflows.findMany({
      where: eq(workflows.workspaceId, workspaceId),
      orderBy: [desc(workflows.updatedAt)],
      limit: pageSize,
      offset,
    });

    return all;
  }

  async getById(id: string, userId: string, workspaceId: string) {
    await workspaceService.assertRole(workspaceId, userId, ['owner', 'admin', 'editor', 'viewer']);

    if (!isDbConnected) {
      const wf = memoryStore.workflows.get(id);
      if (!wf || wf.workspaceId !== workspaceId) throw new NotFoundError('Workflow');
      return wf;
    }

    const workflow = await db.query.workflows.findFirst({
      where: and(eq(workflows.id, id), eq(workflows.workspaceId, workspaceId)),
    });
    if (!workflow) throw new NotFoundError('Workflow');
    return workflow;
  }

  async update(id: string, userId: string, workspaceId: string, data: {
    name?: string;
    description?: string;
    graph?: WorkflowGraph;
    status?: 'draft' | 'active' | 'archived';
  }) {
    const workflow = await this.getById(id, userId, workspaceId);
    await workspaceService.assertRole(workspaceId, userId, ['owner', 'admin', 'editor']);

    if (data.graph) {
      const { valid, errors } = validateGraph(data.graph);
      if (!valid && data.status === 'active') {
        throw new ValidationError('Workflow graph is invalid', { graph: errors });
      }
    }

    if (!isDbConnected) {
      const updated: any = {
        ...workflow,
        ...data,
        updatedAt: new Date(),
        active: data.status ? data.status === 'active' : (workflow as any).active,
      };
      memoryStore.workflows.set(id, updated);
      return updated;
    }

    // Save version snapshot before update
    const latestVersion = await db.query.workflowVersions.findFirst({
      where: eq(workflowVersions.workflowId, id),
      orderBy: [desc(workflowVersions.version)],
    });
    const nextVersion = (latestVersion?.version || 0) + 1;

    if (data.graph) {
      await db.insert(workflowVersions).values({
        workflowId: id,
        version: nextVersion,
        graph: data.graph,
        createdBy: userId,
      });
    }

    const [updated] = await db.update(workflows)
      .set({
        ...data,
        updatedAt: new Date(),
        active: data.status === 'active',
      })
      .where(eq(workflows.id, id))
      .returning();

    return updated;
  }

  async delete(id: string, userId: string, workspaceId: string) {
    await this.getById(id, userId, workspaceId);
    await workspaceService.assertRole(workspaceId, userId, ['owner', 'admin']);
    if (!isDbConnected) {
      memoryStore.workflows.delete(id);
      return;
    }
    await db.delete(workflows).where(eq(workflows.id, id));
  }

  async getVersions(id: string, userId: string, workspaceId: string) {
    await this.getById(id, userId, workspaceId);
    if (!isDbConnected) {
      return memoryStore.workflowVersions.get(id) || [];
    }
    return db.query.workflowVersions.findMany({
      where: eq(workflowVersions.workflowId, id),
      orderBy: [desc(workflowVersions.version)],
    });
  }

  async createExecution(workflowId: string, userId: string, workspaceId: string, triggerData: Record<string, unknown> = {}) {
    const workflow = await this.getById(workflowId, userId, workspaceId);
    await workspaceService.assertRole(workspaceId, userId, ['owner', 'admin', 'editor']);

    const { valid, errors } = validateGraph(workflow.graph as WorkflowGraph);
    if (!valid) throw new ValidationError('Workflow graph has errors', { graph: errors });

    if (!isDbConnected) {
      const executionId = `exec-${Date.now()}`;
      const newExec: any = {
        id: executionId,
        workflowId,
        workspaceId,
        status: 'pending',
        triggerType: 'manual',
        triggerData,
        startedAt: new Date(),
      };
      memoryStore.executions.set(executionId, newExec);
      return { execution: newExec, graph: workflow.graph as WorkflowGraph };
    }

    const [execution] = await db.insert(executions).values({
      workflowId,
      workspaceId,
      status: 'pending',
      triggerType: 'manual',
      triggerData,
      startedAt: new Date(),
    }).returning();

    return { execution, graph: workflow.graph as WorkflowGraph };
  }

  getNodeDefinitions() {
    return nodeRegistry.getAll().map(n => ({
      type: n.type,
      category: n.category,
      label: n.label,
      description: n.description,
      icon: n.icon,
      color: n.color,
      inputs: n.inputs,
      outputs: n.outputs,
      credentials: n.credentials,
      parameters: n.parameters,
    }));
  }
}

export const workflowService = new WorkflowService();
