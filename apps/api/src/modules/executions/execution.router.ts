import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { getExecutions, getExecution, cancelExecution, getExecutionLogs, getExecutionStats } from './execution.controller';

export const executionRouter = Router();
executionRouter.use(authenticate);

executionRouter.get('/stats', getExecutionStats);
executionRouter.get('/', getExecutions);
executionRouter.get('/:id', getExecution);
executionRouter.post('/:id/cancel', cancelExecution);
executionRouter.get('/:id/logs', getExecutionLogs);
