import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../lib/jwt';
import { UnauthorizedError, ForbiddenError } from './error.middleware';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

export function requireWorkspace(req: AuthRequest, _res: Response, next: NextFunction) {
  const workspaceId = req.headers['x-workspace-id'] as string || req.params.workspaceId;
  if (!workspaceId) {
    throw new ForbiddenError('Workspace ID required');
  }
  if (req.user) {
    req.user.workspaceId = workspaceId;
  }
  next();
}
