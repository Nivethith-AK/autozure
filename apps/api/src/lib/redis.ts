import Redis from 'ioredis';
import { logger } from './logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
  retryStrategy: () => null, // Don't loop infinitely trying to reconnect if down
});

export let isRedisConnected = false;
export function setRedisConnected(val: boolean) {
  isRedisConnected = val;
}

redis.on('connect', () => {
  isRedisConnected = true;
  logger.debug('Redis: connecting');
});
redis.on('ready', () => {
  isRedisConnected = true;
  logger.info('Redis: ready');
});
redis.on('error', (err) => {
  isRedisConnected = false;
  logger.error('Redis error:', err);
});
redis.on('close', () => {
  isRedisConnected = false;
  logger.warn('Redis: connection closed');
});

// Separate subscriber connection for pub/sub if needed
export const redisSub = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
});
