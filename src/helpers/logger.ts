import { createLogger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { join } from 'path';

import { LogInfo } from '../dtos/logger';

enum LogLevel {
   info = 'info',
   error = 'error'
}

const dailyRotateFileTransportFn = (level: LogLevel) => new DailyRotateFile({
   level,
   filename: join(process.cwd(), 'logs', `${level}.%DATE%.log`),
   datePattern: 'YYYY-MM-DD',
   zippedArchive: true,
   maxFiles: '30d',
   handleExceptions: level === LogLevel.error,
   handleRejections: level === LogLevel.error,
});

const log = createLogger({
   transports: [
      dailyRotateFileTransportFn(LogLevel.info),
      dailyRotateFileTransportFn(LogLevel.error),
   ],
   exitOnError: false,
});

export const logger = {
   info: (info: LogInfo) => {
      log.info({
         ...info,
         ts: new Date(),
      });
   },
   error: async (err: LogInfo) => {
      log.error({
         ...err,
         ts: new Date(),
      });
   },
};
