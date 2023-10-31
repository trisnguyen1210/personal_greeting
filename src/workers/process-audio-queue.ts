import Bull, { Job } from 'bull';

import { addQueueEvent } from '../helpers/queue';
import { IGreetAudio } from '../dtos/greet-audio';
import { processAudio } from '../services/tts';
import { queueConfig } from '../configs/queue';
import { redisConfig } from '../configs/redis';

type ProcessAudioInput = {
   path: string
   user: IGreetAudio
}

export const processAudioQueue = new Bull<ProcessAudioInput>('process-audio-queue', {
   redis: redisConfig.queue,
   limiter: queueConfig.processAudioQueue.limit,
});

processAudioQueue.process(async (job: Job) => {
   const { path, user }: ProcessAudioInput = job.data;

   if (!path || !user) {
      throw new Error('path or user is empty');
   }

   return processAudio(path, user);
});

addQueueEvent(processAudioQueue);
