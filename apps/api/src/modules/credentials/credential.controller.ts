import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { credentialService } from './credential.service';
import { AuthRequest } from '../../middleware/auth.middleware';
import { UnauthorizedError } from '../../middleware/error.middleware';
import { z } from 'zod';

const createCredentialSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    type: z.string().min(1).max(100),
    data: z.record(z.string()),
  }),
});

function getWorkspaceId(req: AuthRequest): string {
  const id = req.headers['x-workspace-id'] as string;
  if (!id) throw new UnauthorizedError('X-Workspace-Id header required');
  return id;
}

export const createCredential = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const workspaceId = getWorkspaceId(req);
  const { body } = createCredentialSchema.parse({ body: req.body });
  const cred = await credentialService.create(req.user.sub, workspaceId, body);
  res.status(201).json(cred);
});

export const getCredentials = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const workspaceId = getWorkspaceId(req);
  const creds = await credentialService.getAll(req.user.sub, workspaceId);
  res.json(creds);
});

export const updateCredential = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const workspaceId = getWorkspaceId(req);
  const cred = await credentialService.update(req.params.id, req.user.sub, workspaceId, req.body);
  res.json(cred);
});

export const deleteCredential = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const workspaceId = getWorkspaceId(req);
  await credentialService.delete(req.params.id, req.user.sub, workspaceId);
  res.status(204).send();
});
