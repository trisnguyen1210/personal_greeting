import { AudioConfig } from '../dtos/audio';

export const audioConfig: AudioConfig = {
   freq: Number(process.env.AUDIO_FREQ || '8000'),
   channel: Number(process.env.AUDIO_CHANNEL || '1'),
   codec: process.env.AUDIO_CODEC || 'pcm_mulaw',
   bitRate: process.env.AUDIO_BIT_RATE || '64k',
};
