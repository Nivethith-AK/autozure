import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { triggerService } from './trigger.service';

export const webhookRouter = Router();

webhookRouter.all('/:path', asyncHandler(async (req: Request, res: Response) => {
  const result = await triggerService.handleWebhook(
    req.params.path,
    req.method,
    req.headers as Record<string, string>,
    req.body
  );
  res.status(202).json(result);
}));
