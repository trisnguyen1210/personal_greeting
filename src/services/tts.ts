import { access, constants, unlink } from 'fs';
import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';
import { promisify } from 'util';

import { TtsApiRes, TtsUrlInfo } from '../dtos/tts';
import { ApiRes } from '../dtos/api';
import { audioConfig } from '../configs/audio';
import { audioTemplateConfig } from '../configs/audio-template';
import { AudioTemplateConfig } from '../dtos/template-audio';
import consts from '../consts';
import { downloadFile } from '../helpers/audio';
import { IGreetAudio } from '../dtos/greet-audio';
import { logger } from '../helpers/logger';
import { queueConfig } from '../configs/queue';
import { request } from '../helpers/axios';
import { ttsConfig } from '../configs/tts';

const accessPromise = promisify(access);
const unlinkPromise = promisify(unlink);

export async function getTemplateAudio(): Promise<void> {
   const audioTemplateFileNames = Object.keys(audioTemplateConfig.text);

   audioTemplateFileNames.forEach(async (templateAudioFileName) => {
      const audioTemplateText: string = audioTemplateConfig
         .text[templateAudioFileName as keyof AudioTemplateConfig['text']];

      if (!audioTemplateText.includes('<<')) {
         const ttsRes = await request<TtsApiRes>({ ...ttsConfig.api, data: audioTemplateText });

         if (!ttsRes.success) {
            logger.error({
               action: 'get template audio files',
               output: ttsRes,
            });

            process.stdout.write(`canot get template audio: ${ttsRes.error}\n`);
            setTimeout(process.exit, 500, 1);
            return;
         }

         const timeoutMs = queueConfig.downloadTtsAudioQueue.timeout || 30_000;
         setTimeout(downloadFile, timeoutMs, ttsRes.data[0].async, `${templateAudioFileName}.mp3`, consts.templateAudioBasePath);
      }
   });
}

export async function checkDirsAndFilesExists(): Promise<void> {
   const accessPromises = Object.values(consts)
      .map((path) => accessPromise(path, constants.R_OK));

   Promise.all(accessPromises)
      .then(() => {
         logger.info({
            action: 'check dirs and template audio files',
         });

         process.stdout.write('All dirs and template audio files are exist\n');
      })
      .catch((err) => {
         logger.error({
            action: 'check dirs and template audio files',
            error: err.toString(),
         });

         process.stdout.write(`dirs or template audio files not exist: ${err.toString()}\n`);
         setTimeout(process.exit, 500, 1);
      });
}

function formatAudio(ffmpegCmd: FfmpegCommand): void {
   const {
      freq, channel, bitRate, codec,
   } = audioConfig;

   ffmpegCmd
      .audioFrequency(freq)
      .audioChannels(channel)
      .audioCodec(codec)
      .audioBitrate(bitRate);
}

function getAudioTemplate(ffmpegCmd: FfmpegCommand, dynamicAudioPath: string): void {
   const {
      audioText2Path,
      audioText3Path,
      audioText4Path,
      audioText5Path,
      silent5sPath,
      silent2sPath,
      silent1sPath,
   } = consts;

   const { templates } = audioTemplateConfig;

   templates.forEach((template) => {
      switch (template) {
         case 'dtext1':
            ffmpegCmd.input(dynamicAudioPath);
            break;
         case 'text2':
            ffmpegCmd.input(audioText2Path);
            break;
         case 'text3':
            ffmpegCmd.input(audioText3Path);
            break;
         case 'text4':
            ffmpegCmd.input(audioText4Path);
            break;
         case 'text5':
            ffmpegCmd.input(audioText5Path);
            break;
         case 'silent1s':
            ffmpegCmd.input(silent1sPath);
            break;
         case 'silent5s':
            ffmpegCmd.input(silent5sPath);
            break;
         case 'silent2s':
            ffmpegCmd.input(silent2sPath);
            break;
         default:
      }
   });
}

export async function processAudio(dynamicAudioPath: string, userInfo: IGreetAudio): Promise<void> {
   const startTime = Date.now();
   const rawMergedAudioPath = `${consts.tempBasePath}/${userInfo.phone}-raw.wav`;
   const audioPath = `${consts.audioBasePath}/${userInfo.phone}.wav`;
   const { backgroundMusicPath } = consts;

   // concatenate audio
   const concatAudioCmd = ffmpeg();

   getAudioTemplate(concatAudioCmd, dynamicAudioPath);
   formatAudio(concatAudioCmd);

   concatAudioCmd.mergeToFile(rawMergedAudioPath)
      .on('error', (error) => {
         logger.error({
            action: 'merge tts files',
            error: error.toString(),
            input: {
               dynamicAudioPath,
               userInfo,
            },
            output: {
               processDurationMs: Date.now() - startTime,
               path: rawMergedAudioPath,
            },
         });
      })
      .on('end', () => {
         logger.info({
            action: 'merge tts files',
            input: {
               dynamicAudioPath,
               userInfo,
            },
            output: {
               processDurationMs: Date.now() - startTime,
            },
         });

         const addBgMusicStartTime = Date.now();

         // then add background music to file
         const addBgMusicCmd = ffmpeg()
            .input(rawMergedAudioPath)
            .input(backgroundMusicPath)
            .complexFilter([{
               filter: 'amix',
               options: { inputs: 2, duration: 'shortest' },
            }]);

         formatAudio(addBgMusicCmd);

         addBgMusicCmd.saveToFile(audioPath)
            .on('error', (err) => {
               logger.error({
                  action: 'add background music to tts file',
                  error: err.toString(),
                  input: {
                     dynamicAudioPath,
                     userInfo,
                  },
                  output: {
                     processDurationMs: Date.now() - addBgMusicStartTime,
                     path: audioPath,
                  },
               });
            })

            .on('end', () => {
               logger.info({
                  action: 'add background music to tts file',
                  input: {
                     dynamicAudioPath,
                     userInfo,
                  },
                  output: {
                     processDurationMs: Date.now() - addBgMusicStartTime,
                     path: audioPath,
                  },
               });

               // remove temp files
               const rmPromises = [rawMergedAudioPath, dynamicAudioPath].map((path) => unlinkPromise(path));
               const rmTempFilesStartTime = Date.now();

               Promise.all(rmPromises)
                  .then(() => {
                     logger.info({
                        action: 'remove temp files',
                        input: {
                           rawMergedAudioPath,
                           dynamicAudioPath,
                        },
                        output: {
                           processDurationMs: Date.now() - rmTempFilesStartTime,
                        },
                     });
                  })
                  .catch((err) => {
                     logger.error({
                        action: 'remove temp files',
                        error: err.toString(),
                        input: {
                           rawMergedAudioPath,
                           dynamicAudioPath,
                        },
                        output: {
                           processDurationMs: Date.now() - rmTempFilesStartTime,
                        },
                     });
                  });
            });
      });
}

function hydrateDynamicAudioText(
   userInfo: IGreetAudio,
   audioTextKey: keyof AudioTemplateConfig['text'],
): string | void {
   let currentAudioText = audioTemplateConfig.text[audioTextKey];
   let dynamicParams = currentAudioText.match(/<<\w+>>/g) || [];

   if (!dynamicParams.length) {
      return undefined;
   }

   const dynamicParamsSet = new Set(dynamicParams);
   dynamicParams = Array.from(dynamicParamsSet);

   dynamicParams.forEach((dynamicParam) => {
      const userInfoValue = userInfo[dynamicParam.slice(2, -2) as keyof IGreetAudio];
      currentAudioText = currentAudioText.replace(new RegExp(dynamicParam, 'g'), userInfoValue);
   });

   return currentAudioText;
}

export async function getTtsUrls(userInfo: IGreetAudio): Promise<TtsUrlInfo[]> {
   const start = Date.now();
   const audioTextKeys = Object.keys(audioTemplateConfig.text);
   const ttsResPromises: { promise: Promise<ApiRes<TtsApiRes>>, fileName: string }[] = [];

   audioTextKeys.forEach((audioTextKey) => {
      const dynamicAudioText = hydrateDynamicAudioText(userInfo, audioTextKey as keyof AudioTemplateConfig['text']);

      if (dynamicAudioText) {
         ttsResPromises.push({
            promise: request<TtsApiRes>({ ...ttsConfig.api, data: dynamicAudioText }),
            fileName: `${audioTextKey}-${userInfo.phone}.wav`,
         });
      }
   });

   const ttsReses: ApiRes<TtsApiRes>[] = await Promise
      .all(ttsResPromises.map((ttsRes) => ttsRes.promise))
      .then((res) => {
         logger.info({
            action: 'get tts url info',
            input: {
               userInfo,
            },
            output: {
               durationMs: Date.now() - start,
               response: res,
            },
         });

         return res;
      })
      .catch((error: Error) => {
         logger.error({
            action: 'get tts url error',
            input: {
               userInfo,
            },
            output: {
               durationMs: Date.now() - start,
            },
            error: error.toString(),
         });

         return [];
      });

   return ttsReses.reduce((result: TtsUrlInfo[], ttsRes, index) => {
      if (ttsRes.success && ttsRes.data.length) {
         result.push({
            url: ttsRes.data[0].async,
            fileName: ttsResPromises[index].fileName,
         });
      }

      return result;
   }, []);
}
