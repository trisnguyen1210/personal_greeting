import { AudioTemplateConfig } from '../dtos/template-audio';

export const audioTemplateConfig: AudioTemplateConfig = {
   text: {
      text1: process.env.TEMPLATE_AUDIO_TEXT1 || 'sample text',
      text2: process.env.TEMPLATE_AUDIO_TEXT2 || 'sample text',
      text3: process.env.TEMPLATE_AUDIO_TEXT3 || 'sample text',
      text4: process.env.TEMPLATE_AUDIO_TEXT4 || 'sample text',
      text5: process.env.TEMPLATE_AUDIO_TEXT5 || 'sample text',
   },
   templates: (process.env.AUDIO_TEMPLATE || '').split('->'),
};
