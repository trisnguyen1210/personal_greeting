import { QueueConfig } from '../dtos/queue';

export const queueConfig: QueueConfig = {
   getTtsUrlQueue: {
      limit: {
         max: Number(process.env.QUEUE_GET_TTS_URL_MAX || '20'),
         duration: Number(process.env.QUEUE_GET_TTS_URL_WINDOW_MS || '1000'),
      },
   },
   downloadTtsAudioQueue: {
      limit: {
         max: Number(process.env.QUEUE_DOWNLOAD_TTS_AUDIO_MAX || '20'),
         duration: Number(process.env.QUEUE_DOWNLOAD_TTS_AUDIO_WINDOW_MS || '1000'),
      },
      timeout: Number(process.env.QUEUE_DOWNLOAD_TTS_AUDIO_TIMEOUT || '25000'),
   },
   processAudioQueue: {
      limit: {
         max: Number(process.env.QUEUE_PROCESS_AUDIO_MAX || '20'),
         duration: Number(process.env.QUEUE_PROCESS_AUDIO_WINDOW_MS || '1000'),
      },
   },
   syncAudioFileQueue: {
      limit: {
         max: Number(process.env.QUEUE_SYNC_AUDIO_FILE_MAX || '1'),
         duration: Number(process.env.QUEUE_SYNC_AUDIO_FILE_WINDOW_MS || String(2 * 3600 * 1000)),
      },
      cron: process.env.QUEUE_SYNC_AUDIO_FILE_CRON || '0 3 * * *',
   },
   syncBlacklistQueue: {
      limit: {
         max: Number(process.env.QUEUE_SYNC_BLACKLIST_MAX || '1'),
         duration: Number(process.env.QUEUE_SYNC_BLACKLIST_WINDOW_MS || String(2 * 3600 * 1000)),
      },
      cron: process.env.QUEUE_SYNC_BLACKLIST_CRON || '0 2 * * *',
   },
};
