import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { executionService } from './execution.service';
import { AuthRequest } from '../../middleware/auth.middleware';
import { UnauthorizedError } from '../../middleware/error.middleware';

function getWorkspaceId(req: AuthRequest): string {
  const id = req.headers['x-workspace-id'] as string || req.query.workspaceId as string;
  if (!id) throw new UnauthorizedError('X-Workspace-Id header required');
  return id;
}

export const getExecutions = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const workspaceId = getWorkspaceId(req);
  const execs = await executionService.getAll(req.user.sub, workspaceId, {
    workflowId: req.query.workflowId as string,
    status: req.query.status as string,
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 20,
  });
  res.json(execs);
});

export const getExecution = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const workspaceId = getWorkspaceId(req);
  const execution = await executionService.getById(req.params.id, req.user.sub, workspaceId);
  res.json(execution);
});

export const cancelExecution = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const workspaceId = getWorkspaceId(req);
  const result = await executionService.cancel(req.params.id, req.user.sub, workspaceId);
  res.json(result);
});

export const getExecutionLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const workspaceId = getWorkspaceId(req);
  const logs = await executionService.getLogs(req.params.id, req.user.sub, workspaceId);
  res.json(logs);
});

export const getExecutionStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const workspaceId = getWorkspaceId(req);
  const stats = await executionService.getStats(req.user.sub, workspaceId);
  res.json(stats);
});
