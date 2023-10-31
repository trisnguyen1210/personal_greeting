import Bull from 'bull';

import { addQueueEvent } from '../helpers/queue';
import { appConfig } from '../configs/app';
import { BlacklistedUser } from '../dtos/greet-audio';
import { client } from '../helpers/redis-cli';
import { logger } from '../helpers/logger';
import { queueConfig } from '../configs/queue';
import { readCsvStream } from '../helpers/read-stream';
import { redisConfig } from '../configs/redis';

export const syncBlacklistQueue = new Bull<undefined>('sync-blacklist-queue', {
   redis: redisConfig.queue,
   limiter: queueConfig.downloadTtsAudioQueue.limit,
});

syncBlacklistQueue.process(async () => {
   let syncCount = 0;
   let total = 0;
   const path = appConfig.blacklistUserCsvPath;

   const readStream = await readCsvStream(path);

   readStream
      .on('data', (user: BlacklistedUser) => {
         total++;
         const { phone, note } = user;

         if (!phone || !note) {
            return logger.error({
               action: 'check valid blacklist user',
               error: 'invalid data',
               input: {
                  user,
               },
            });
         }

         syncCount++;
         client.hSet(phone, 'note', note);

         return logger.info({
            action: 'add user to blacklist',
            input: {
               user,
            },
         });
      })
      .on('end', () => {
         logger.info({
            action: 'read blacklist user csv file',
            output: {
               syncCount,
               total,
            },
            input: {
               path,
            },
         });
      });
});

addQueueEvent(syncBlacklistQueue);
