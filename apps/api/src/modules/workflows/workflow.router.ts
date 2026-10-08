import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import {
  createWorkflow, getWorkflows, getWorkflow, updateWorkflow,
  deleteWorkflow, executeWorkflow, getWorkflowVersions, getNodeDefinitions,
} from './workflow.controller';

export const workflowRouter = Router();

// Allow reading node definitions publicly
workflowRouter.get('/nodes', getNodeDefinitions);

workflowRouter.use(authenticate);
workflowRouter.post('/', createWorkflow);
workflowRouter.get('/', getWorkflows);
workflowRouter.get('/:id', getWorkflow);
workflowRouter.patch('/:id', updateWorkflow);
workflowRouter.delete('/:id', deleteWorkflow);
workflowRouter.post('/:id/execute', executeWorkflow);
workflowRouter.get('/:id/versions', getWorkflowVersions);
