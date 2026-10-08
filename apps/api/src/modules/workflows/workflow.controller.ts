import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { workflowService } from './workflow.service';
import { createWorkflowSchema, updateWorkflowSchema, executeWorkflowSchema } from './workflow.schema';
import { AuthRequest } from '../../middleware/auth.middleware';
import { UnauthorizedError } from '../../middleware/error.middleware';
import { executionQueue } from '../../workers/queue';
import { isRedisConnected } from '../../lib/redis';
import { workflowExecutor } from '../../engine/executor';

function getWorkspaceId(req: AuthRequest): string {
  const id = req.headers['x-workspace-id'] as string || req.query.workspaceId as string;
  if (!id) throw new UnauthorizedError('X-Workspace-Id header required');
  return id;
}

export const createWorkflow = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const workspaceId = getWorkspaceId(req);
  const { body } = createWorkflowSchema.parse({ body: req.body });
  const workflow = await workflowService.create(req.user.sub, workspaceId, body);
  res.status(201).json(workflow);
});

export const getWorkflows = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const workspaceId = getWorkspaceId(req);
  const page = Number(req.query.page) || 1;
  const pageSize = Math.min(Number(req.query.pageSize) || 20, 100);
  const workflows = await workflowService.getAll(req.user.sub, workspaceId, page, pageSize);
  res.json(workflows);
});

export const getWorkflow = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const workspaceId = getWorkspaceId(req);
  const workflow = await workflowService.getById(req.params.id, req.user.sub, workspaceId);
  res.json(workflow);
});

export const updateWorkflow = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const workspaceId = getWorkspaceId(req);
  const { body } = updateWorkflowSchema.parse({ body: req.body });
  const workflow = await workflowService.update(req.params.id, req.user.sub, workspaceId, body);
  res.json(workflow);
});

export const deleteWorkflow = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const workspaceId = getWorkspaceId(req);
  await workflowService.delete(req.params.id, req.user.sub, workspaceId);
  res.status(204).send();
});

export const executeWorkflow = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const workspaceId = getWorkspaceId(req);
  const { body } = executeWorkflowSchema.parse({ body: req.body });
  
  const { execution, graph } = await workflowService.createExecution(
    req.params.id, req.user.sub, workspaceId, body.data
  );

  if (isRedisConnected) {
    // Queue the execution via BullMQ
    const job = await executionQueue.add('execute-workflow', {
      executionId: execution.id,
      graph,
      triggerData: body.data,
    });

    res.status(202).json({
      executionId: execution.id,
      jobId: job.id,
      status: 'pending',
      message: 'Workflow execution queued in BullMQ',
    });
  } else {
    // Execute directly in-process for local development
    workflowExecutor.execute(execution.id, graph, body.data).catch((err) => {
      console.error('In-process execution error:', err);
    });

    res.status(202).json({
      executionId: execution.id,
      jobId: 'local-process',
      status: 'running',
      message: 'Workflow execution running in local process',
    });
  }
});

export const getWorkflowVersions = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const workspaceId = getWorkspaceId(req);
  const versions = await workflowService.getVersions(req.params.id, req.user.sub, workspaceId);
  res.json(versions);
});

export const getNodeDefinitions = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const nodes = workflowService.getNodeDefinitions();
  res.json(nodes);
});
