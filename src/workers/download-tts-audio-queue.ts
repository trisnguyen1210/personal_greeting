import Bull, { Job } from 'bull';

import { addQueueEvent } from '../helpers/queue';
import consts from '../consts';
import { downloadFile } from '../helpers/audio';
import { IGreetAudio } from '../dtos/greet-audio';
import { processAudioQueue } from './process-audio-queue';
import { queueConfig } from '../configs/queue';
import { redisConfig } from '../configs/redis';
import { TtsUrlInfo } from '../dtos/tts';

type DownloadTtsDynamicAudioInput = {
   ttsUrlInfos: TtsUrlInfo[]
   user: IGreetAudio
}

export const downloadTtsDynamicAudioQueue = new Bull<DownloadTtsDynamicAudioInput>('download-tts-dynamic-audio-queue', {
   redis: redisConfig.queue,
   limiter: queueConfig.downloadTtsAudioQueue.limit,
});

downloadTtsDynamicAudioQueue.process(async (job: Job) => {
   const { ttsUrlInfos, user }: DownloadTtsDynamicAudioInput = job.data;

   if (!ttsUrlInfos.length) {
      throw new Error('tts infos is empty');
   }

   const { url, fileName } = ttsUrlInfos[0];

   return downloadFile(url, fileName, consts.tempBasePath)
      .then((filePath): void => {
         if (filePath) {
            processAudioQueue.add(
               {
                  path: filePath,
                  user,
               },
               {
                  lifo: false,
                  removeOnFail: true,
                  removeOnComplete: true,
               },
            );
         }
      });
});

addQueueEvent(downloadTtsDynamicAudioQueue);
