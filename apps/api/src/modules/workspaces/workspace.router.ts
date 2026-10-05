import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import {
  createWorkspace, getWorkspaces, getWorkspace,
  updateWorkspace, deleteWorkspace, getMembers,
} from './workspace.controller';

export const workspaceRouter = Router();
workspaceRouter.use(authenticate);

workspaceRouter.post('/', createWorkspace);
workspaceRouter.get('/', getWorkspaces);
workspaceRouter.get('/:id', getWorkspace);
workspaceRouter.patch('/:id', updateWorkspace);
workspaceRouter.delete('/:id', deleteWorkspace);
workspaceRouter.get('/:id/members', getMembers);
