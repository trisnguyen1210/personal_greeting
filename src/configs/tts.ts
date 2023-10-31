import { Method } from 'axios';

import { TtsConfig, Voice } from '../dtos/tts';

export const ttsConfig: TtsConfig = {
   api: {
      url: process.env.TTS_URL || 'http://localhost:4444',
      method: <Method>(process.env.TTS_METHOD || 'POST'),
      headers: {
         'Content-Type': 'text/plain',
         api_key: process.env.TTS_API_KEY || 'no api key provided',
         speed: Number(process.env.TTS_SPEED || '0.5'),
         voice: <Voice>(process.env.TTS_VOICE || Voice.ThuMinh),
         format: 'wav',
      },
      body: 'no text',
      timeout: 120_000,
   },
};
