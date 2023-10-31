import { Job, Queue } from 'bull';
import { logger } from './logger';

function handleQueueCompleted(job: Job) {
   logger.info({
      action: 'job completed',
      input: {
         name: job.queue.name,
         data: job.data,
      },
   });
}

function handleQueueFailed(job: Job, err: Error) {
   logger.error({
      action: 'job failed',
      error: err.toString(),
      input: {
         name: job.queue.name,
         data: job.data,
      },
   });
}

function handleQueueProgress(job: Job, progress: number) {
   logger.info({
      action: 'job progress',
      input: {
         name: job.queue.name,
         progress: `${progress * 100}%`,
      },
   });
}

function handleQueueActived(job: Job) {
   logger.info({
      action: 'job actived',
      input: {
         name: job.queue.name,
      },
   });
}

export function addQueueEvent(queue: Queue) {
   queue.on('completed', handleQueueCompleted);
   queue.on('failed', handleQueueFailed);
   queue.on('progress', handleQueueProgress);
   queue.on('active', handleQueueActived);
}
