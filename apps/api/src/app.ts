import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { authRouter } from './modules/auth/auth.router';
import { workspaceRouter } from './modules/workspaces/workspace.router';
import { workflowRouter } from './modules/workflows/workflow.router';
import { executionRouter } from './modules/executions/execution.router';
import { credentialRouter } from './modules/credentials/credential.router';
import { triggerRouter } from './modules/triggers/trigger.router';
import { webhookRouter } from './modules/triggers/webhook.router';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';
import { logger } from './lib/logger';

export const app = express();

// Trust proxy (for Docker/reverse proxies)
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
  origin: true, // Allow requests from any origin (e.g. localhost:3000, 127.0.0.1:3000)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-workspace-id', 'X-Workspace-Id', 'Accept'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Logging
app.use(morgan('combined', {
  stream: { write: (msg) => logger.http(msg.trim()) },
}));

// Global rate limit
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded' },
}));

// Health check (no auth required)
app.get('/health', (_, res) => {
  res.json({ status: 'ok', service: 'autozure-api', timestamp: new Date().toISOString() });
});

// Webhook routes (special auth — signed secret, not JWT)
app.use('/webhooks', webhookRouter);

// API v1
const v1 = express.Router();
v1.use('/auth', authRouter);
v1.use('/workspaces', workspaceRouter);
v1.use('/workflows', workflowRouter);
v1.use('/executions', executionRouter);
v1.use('/credentials', credentialRouter);
v1.use('/triggers', triggerRouter);

app.use('/api/v1', v1);

// 404 and error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);
