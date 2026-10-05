import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import asyncHandler from 'express-async-handler';
import { triggerService } from './trigger.service';
import { AuthRequest } from '../../middleware/auth.middleware';
import { UnauthorizedError } from '../../middleware/error.middleware';

export const triggerRouter = Router();
triggerRouter.use(authenticate);

triggerRouter.get('/:workflowId', asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) throw new UnauthorizedError();
  const workspaceId = req.headers['x-workspace-id'] as string;
  const triggers = await triggerService.getTriggers(req.params.workflowId, req.user.sub, workspaceId);
  res.json(triggers);
}));

triggerRouter.post('/:workflowId/webhook', asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) throw new UnauthorizedError();
  const workspaceId = req.headers['x-workspace-id'] as string;
  const trigger = await triggerService.createWebhookTrigger(req.user.sub, req.params.workflowId, workspaceId, req.body);
  res.status(201).json(trigger);
}));

triggerRouter.post('/:workflowId/schedule', asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) throw new UnauthorizedError();
  const workspaceId = req.headers['x-workspace-id'] as string;
  const trigger = await triggerService.createScheduleTrigger(req.user.sub, req.params.workflowId, workspaceId, req.body);
  res.status(201).json(trigger);
}));

triggerRouter.delete('/:triggerId', asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) throw new UnauthorizedError();
  const workspaceId = req.headers['x-workspace-id'] as string;
  await triggerService.deleteTrigger(req.params.triggerId, req.user.sub, workspaceId);
  res.status(204).send();
}));
