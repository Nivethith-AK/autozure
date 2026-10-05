import { createExecutionWorker } from './execution.worker';
import { createSchedulerWorker } from './scheduler.worker';
import { logger } from '../lib/logger';

let executionWorker: ReturnType<typeof createExecutionWorker> | null = null;
let schedulerWorker: ReturnType<typeof createSchedulerWorker> | null = null;

export async function startWorkers() {
  executionWorker = createExecutionWorker();
  schedulerWorker = createSchedulerWorker();
  logger.info('BullMQ workers started');
}

export async function stopWorkers() {
  await executionWorker?.close();
  await schedulerWorker?.close();
  logger.info('BullMQ workers stopped');
}
