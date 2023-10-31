import { Queue, QueueOptions } from 'bull';
import { Transform } from 'stream';

export type QueueControllerInput = {
   queue: Queue
   readStream: Transform
}

type Config = {
   limit: QueueOptions['limiter']
   intervalMs?: number
   cron?: string
   timeout?: number
}

export type QueueConfig = {
   getTtsUrlQueue: Config
   downloadTtsAudioQueue: Config
   processAudioQueue: Config
   syncAudioFileQueue: Config
   syncBlacklistQueue: Config
}
