import { RedisConfig } from '../dtos/redis';

const host = process.env.REDIS_HOST || 'localhost';
const port = Number(process.env.REDIS_PORT || '6379');
const blacklistDb = Number(process.env.REDIS_BLACKLIST_DB || '1');
const ignoreCauseDb = Number(process.env.REDIS_IGNORE_CAUSE_DB || '2');

export const redisConfig: RedisConfig = {
   queue: {
      host: process.env.REDIS_QUEUE_HOST || 'localhost',
      port: Number(process.env.REDIS_QUEUE_PORT || '6379'),
      db: Number(process.env.REDIS_QUEUE_DB || '0'),
   },
   db: {
      url: `redis://${host}:${port}/${blacklistDb}`,
      blacklistDb,
      ignoreCauseDb,
   },
};
