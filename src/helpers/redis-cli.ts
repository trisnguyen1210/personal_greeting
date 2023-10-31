import { createClient } from 'redis';

import { logger } from './logger';
import { redisConfig } from '../configs/redis';

export const client = createClient({
   url: redisConfig.db.url,
});

client.on('error', (redisErr: Error) => {
   logger.error({
      action: 'redis error',
      error: redisErr.message,
      input: {
         redisConfig,
      },
   });
});
