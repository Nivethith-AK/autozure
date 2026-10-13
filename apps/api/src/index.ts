import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { app } from './app';
import { logger } from './lib/logger';
import { db, setDbConnected } from './db';
import { redis, setRedisConnected } from './lib/redis';
import { startWorkers } from './workers';

const PORT = parseInt(process.env.PORT || '3001', 10);

async function main() {
  try {
    // Test DB connection
    try {
      await db.execute(sql`SELECT 1`);
      setDbConnected(true);
      logger.info('✅ PostgreSQL connected');
    } catch (dbErr: any) {
      setDbConnected(false);
      logger.warn(`⚠️ PostgreSQL connection unavailable (${dbErr.message}). Using local in-memory store for development.`);
    }

    // Test Redis connection & workers
    try {
      await redis.ping();
      setRedisConnected(true);
      logger.info('✅ Redis connected');
      await startWorkers();
      logger.info('✅ Background workers started');
    } catch (redisErr: any) {
      setRedisConnected(false);
      logger.warn(`⚠️ Redis connection unavailable (${redisErr.message}). Using direct in-process workflow execution.`);
    }

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`🔥 AutoZure API running on http://localhost:${PORT}`);
      logger.info(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        try {
          await redis.quit();
        } catch {}
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
