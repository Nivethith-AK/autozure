import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { authService } from './auth.service';
import { registerSchema, loginSchema, refreshSchema } from './auth.schema';
import { AuthRequest } from '../../middleware/auth.middleware';
import { UnauthorizedError } from '../../middleware/error.middleware';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { body } = registerSchema.parse({ body: req.body });
  const result = await authService.register(body);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { body } = loginSchema.parse({ body: req.body });
  const result = await authService.login(body);
  res.json(result);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { body } = refreshSchema.parse({ body: req.body });
  const tokens = await authService.refresh(body.refreshToken);
  res.json({ tokens });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { body } = refreshSchema.parse({ body: req.body });
  await authService.logout(body.refreshToken);
  res.json({ message: 'Logged out successfully' });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const user = await authService.getMe(req.user.sub);
  res.json(user);
});
