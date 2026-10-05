import 'dotenv/config';
import { app } from './app';
import { logger } from './lib/logger';
import { db } from './db';
import { redis } from './lib/redis';
import { startWorkers } from './workers';

const PORT = parseInt(process.env.PORT || '3001', 10);

async function main() {
  try {
    // Test DB connection
    await db.execute('SELECT 1');
    logger.info('✅ PostgreSQL connected');

    // Test Redis connection
    await redis.ping();
    logger.info('✅ Redis connected');

    // Start background workers
    await startWorkers();
    logger.info('✅ Workers started');

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`🔥 FlowForge API running on port ${PORT}`);
      logger.info(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await redis.quit();
        logger.info('Server closed. Goodbye.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
