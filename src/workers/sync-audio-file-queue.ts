import { accessSync, constants } from 'fs';
import Bull, { JobOptions } from 'bull';
import { Transform } from 'stream';

import { addQueueEvent } from '../helpers/queue';
import { appConfig } from '../configs/app';
import consts from '../consts';
import { getTtsUrlQueue } from './get-tts-url-queue';
import { IGreetAudio } from '../dtos/greet-audio';
import { logger } from '../helpers/logger';
import { processAudioQueue } from './process-audio-queue';
import { queueConfig } from '../configs/queue';
import { readDynamicCsvFile } from '../helpers/read-stream';
import { redisConfig } from '../configs/redis';

let readStream: Transform;
let checkStreamInterval: ReturnType<typeof setInterval> | undefined;

async function checkStream() {
   const [ttsJobCount, processAudioCount] = await Promise.all([
      getTtsUrlQueue.getJobCounts(),
      processAudioQueue.getJobCounts(),
   ]);

   const getTtsJobCount = ttsJobCount.waiting;
   const processAudioJobCount = processAudioCount.waiting;
   const currentJobCount = getTtsJobCount - processAudioJobCount;
   const maxProcessAudioPerSec = queueConfig.processAudioQueue.limit?.max || 100;
   const downloadTtsAudioTimeoutS = (queueConfig.downloadTtsAudioQueue.timeout || 30_000) / 1000;
   const resumeAudioQueueThreshold = maxProcessAudioPerSec * downloadTtsAudioTimeoutS;
   const isStreamResumed = readStream && currentJobCount < resumeAudioQueueThreshold;

   logger.info({
      action: 'check stream interval',
      input: {
         getTtsJobCount,
         processAudioJobCount,
         currentJobCount,
         maxProcessAudioPerSec,
         downloadTtsAudioTimeoutS,
         resumeAudioQueueThreshold,
      },
      output: {
         isStreamResumed,
      },
   });

   if (isStreamResumed) {
      readStream.resume();
   }
}

async function syncAudioFile(): Promise<void> {
   let syncCount = 0;
   let total = 0;

   if (checkStreamInterval) {
      clearInterval(checkStreamInterval);
   }

   readStream = await readDynamicCsvFile(appConfig.userCsvPathPattern);
   checkStreamInterval = setInterval(checkStream, 1000);
   const tempBucket: { data: IGreetAudio, otps: JobOptions }[] = [];

   readStream
      .on('data', async (user: IGreetAudio) => {
         total++;
         const audioFilePath = `${consts.audioBasePath}/${user.phone}.wav`;

         try {
            accessSync(audioFilePath, constants.R_OK);

            logger.info({
               action: 'check audio file exist',
               input: {
                  audioFilePath,
                  user,
               },
            });
         } catch (err) {
            syncCount++;

            tempBucket.push({
               data: user,
               otps: {
                  lifo: false,
                  removeOnComplete: true,
                  removeOnFail: true,
               },
            });

            const maxTempBucketLength = queueConfig.getTtsUrlQueue.limit?.max || 100;

            if (tempBucket.length >= maxTempBucketLength) {
               readStream.pause();
               getTtsUrlQueue.addBulk(tempBucket.splice(0));
            }
         }
      })
      .on('end', () => {
         if (checkStreamInterval) {
            clearInterval(checkStreamInterval);
         }

         getTtsUrlQueue.addBulk(tempBucket.splice(0));

         logger.info({
            action: 'read user csv file',
            output: {
               syncCount,
               total,
            },
            input: {
               path: appConfig.userCsvPathPattern,
            },
         });
      });
}

export const syncAudioFileQueue = new Bull<undefined>('sync-audio-file', {
   redis: redisConfig.queue,
   limiter: queueConfig.syncAudioFileQueue.limit,
});

syncAudioFileQueue.process(syncAudioFile);

addQueueEvent(syncAudioFileQueue);
