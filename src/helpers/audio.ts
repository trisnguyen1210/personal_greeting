import { exec } from 'child_process';
import { stat } from 'fs';

import consts from '../consts';
import { logger } from './logger';

export function downloadFile(url: string, fileName: string, dir = consts.tempBasePath): Promise<string> {
   return new Promise((resolve, reject) => {
      const path = `${dir}/${fileName}`;

      exec(`curl ${url} --output ${path}`, (curlErr: null | Error, curlStdout: string) => {
         if (curlErr) {
            logger.error({
               action: 'make curl to url',
               input: {
                  url,
                  path,
               },
               error: curlErr.toString(),
               output: {
                  curlStdout,
               },
            });

            return reject(curlErr);
         }

         return stat(path, (statErr: null | Error, statRes) => {
            const minFileSizeB = 1000;
            const fileSizeB = statRes.size;

            if (statErr || fileSizeB < minFileSizeB) {
               logger.error({
                  action: 'download audio file',
                  error: statErr?.toString(),
                  input: {
                     url,
                     path,
                     minFileSizeB,
                  },
                  output: {
                     fileSizeB,
                  },
               });

               return reject(statErr);
            }

            logger.info({
               action: 'download audio file',
               input: {
                  path,
                  url,
               },
               output: {
                  curlStdout,
               },
            });

            return resolve(path);
         });
      });
   });
}
