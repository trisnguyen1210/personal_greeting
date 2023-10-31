import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { checkDirsAndFilesExists, getTemplateAudio } from './services/tts';
import { appConfig } from './configs/app';
import { client } from './helpers/redis-cli';
import { greetAudioRouter } from './routers/greet-audio';
import { ignoreCauseRouter } from './routers/ignore-cause';
import { logger } from './helpers/logger';
import { queueConfig } from './configs/queue';
import { redisConfig } from './configs/redis';
import { rootRouter } from './routers/root';
import { syncAudioFileQueue } from './workers/sync-audio-file-queue';

const app = express();
const { port, corsOrigin, corsMethods } = appConfig;

app.use(express.json());

app.use(
   cors({
      origin: corsOrigin,
      methods: corsMethods,
   }),
);

app.use('/api', (req: Request, res: Response, next: NextFunction) => {
   const apiKey = req.headers['api-key'];

   if (!apiKey) {
      return res.json({
         success: 0,
         error: 'apiKey is not presented on request headers',
      });
   }

   if (apiKey !== appConfig.apiKey) {
      return res.json({
         success: 0,
         error: 'incorrect apiKey',
      });
   }

   return next();
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
   if (error) {
      logger.error({
         action: `call api: ${req.method} ${req.path}`,
         input: {
            body: req.body,
         },
         error: error.message,
      });

      return res.json({
         success: 0,
         errror: 'request cannot be fullfilled',
      });
   }

   return next();
});

app.use('/api/v1/greet-audio', greetAudioRouter);
app.use('/api/v1/ignore-case', ignoreCauseRouter);
app.use('/', rootRouter);
app.use(express.static('public'));
app.use(helmet());
app.disable('x-powered-by');

app.use(rateLimit({
   windowMs: appConfig.apiRateLimitWindowMs,
   max: appConfig.apiRateLimit,
   standardHeaders: true,
   legacyHeaders: false,
}));

client.connect().then(() => {
   process.stdout.write(`Redis is connected to: ${redisConfig.db.url}\n`);
   app.listen(port, () => process.stdout.write(`Server is listening on port ${port}\n`));
});

checkDirsAndFilesExists().then(getTemplateAudio);

// add syncAudioFileQueue
syncAudioFileQueue.add(undefined);

syncAudioFileQueue.add(
   undefined,
   {
      repeat: {
         cron: queueConfig.syncAudioFileQueue.cron || '0 5 * * *',
         tz: 'UTC+7',
      },
      removeOnFail: true,
      removeOnComplete: true,
   },
);
