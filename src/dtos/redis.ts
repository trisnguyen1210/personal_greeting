import { QueueOptions } from 'bull';

export type RedisConfig = {
   queue: QueueOptions['redis']
   db: {
      url: string
      blacklistDb: number
      ignoreCauseDb: number
   }
}
