import { accessSync, createReadStream } from 'fs';
import csvParser, { Options } from 'csv-parser';
import { Transform } from 'stream';

import { logger } from './logger';

function mapHeaders(arg: { header: string, index: number }): string {
   switch (arg.header) {
      // user csv data headers
      case 'FULL_NAME':
         return 'fullName';
      case 'DOB':
         return 'birthDay';
      case 'MOBILE':
         return 'phone';
      case 'GENDER':
         return 'gender';
      case 'UPDATED_DATE':
         return 'lastUpdate';
      // blacklist user csv headers
      case 'NOTE':
         return 'note';
      default:
         return arg.header;
   }
}

const csvParseOpts: Options = {
   mapHeaders,
   separator: ';',
   skipComments: true,
};

export function readCsvStream(path: string, pathPattern?: string): Promise<Transform> {
   const logInput = {
      path,
      pathPattern,
   };

   return new Promise((resolve, reject) => {
      logger.info({
         action: 'preparing stream file',
         input: logInput,
      });

      try {
         accessSync(path);

         const readStream = createReadStream(path)
            .pipe(csvParser(csvParseOpts))
            .on('error', (rsErr: Error) => {
               logger.error({
                  action: 'read user csv file',
                  error: rsErr.toString(),
                  input: logInput,
               });
            })
            .on('pause', () => {
               logger.info({
                  action: 'pause read stream',
                  input: logInput,
               });
            })
            .on('resume', () => {
               logger.info({
                  action: 'resume read stream',
                  input: logInput,
               });
            });

         resolve(readStream);
      } catch (accessErr: any) {
         logger.error({
            action: 'access file',
            error: accessErr.toString(),
            input: logInput,
         });

         reject(accessErr);
      }
   });
}

export function readDynamicCsvFile(pathPattern: string): Promise<Transform> {
   const [DD, MM, YYYY] = new Date()
      .toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .split('/');

   const currentDate = `${YYYY}-${MM}-${DD}`;
   const path = pathPattern.replace('<<date>>', currentDate);
   return readCsvStream(path, pathPattern);
}
