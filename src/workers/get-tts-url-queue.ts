import Bull, { Job } from 'bull';

import { addQueueEvent } from '../helpers/queue';
import { downloadTtsDynamicAudioQueue } from './download-tts-audio-queue';
import { getTtsUrls } from '../services/tts';
import { IGreetAudio } from '../dtos/greet-audio';
import { queueConfig } from '../configs/queue';
import { redisConfig } from '../configs/redis';

export const getTtsUrlQueue = new Bull('get-tts-url-queue', {
   redis: redisConfig.queue,
   limiter: queueConfig.getTtsUrlQueue.limit,
});

getTtsUrlQueue.process(async (job: Job) => {
   const user: IGreetAudio = job.data;

   const ttsUrlInfos = await getTtsUrls(user);

   if (!ttsUrlInfos.length) {
      throw Error('no tts url info found');
   }

   downloadTtsDynamicAudioQueue.add(
      {
         user,
         ttsUrlInfos,
      },
      {
         delay: queueConfig.downloadTtsAudioQueue.timeout,
         lifo: false,
         attempts: 10,
         removeOnFail: true,
         removeOnComplete: true,
      },
   );
});

addQueueEvent(getTtsUrlQueue);
