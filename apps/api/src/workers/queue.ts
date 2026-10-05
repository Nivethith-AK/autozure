import { Queue } from 'bullmq';
import { redis } from '../lib/redis';

export const executionQueue = new Queue('workflow-executions', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
  },
});

export const schedulerQueue = new Queue('workflow-scheduler', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: { count: 100 },
  },
});
