import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { workspaceService } from './workspace.service';
import { createWorkspaceSchema, updateWorkspaceSchema } from './workspace.schema';
import { AuthRequest } from '../../middleware/auth.middleware';
import { UnauthorizedError } from '../../middleware/error.middleware';

export const createWorkspace = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const { body } = createWorkspaceSchema.parse({ body: req.body });
  const workspace = await workspaceService.create(req.user.sub, body);
  res.status(201).json(workspace);
});

export const getWorkspaces = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const workspaces = await workspaceService.getByUser(req.user.sub);
  res.json(workspaces);
});

export const getWorkspace = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const workspace = await workspaceService.getById(req.params.id, req.user.sub);
  res.json(workspace);
});

export const updateWorkspace = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const { body } = updateWorkspaceSchema.parse({ body: req.body });
  const workspace = await workspaceService.update(req.params.id, req.user.sub, body);
  res.json(workspace);
});

export const deleteWorkspace = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  await workspaceService.delete(req.params.id, req.user.sub);
  res.status(204).send();
});

export const getMembers = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const members = await workspaceService.getMembers(req.params.id, req.user.sub);
  res.json(members);
});
