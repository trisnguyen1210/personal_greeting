import process from 'process';

import { AppConfig } from '../dtos/app';

const uploadDir = process.env.APP_UPLOAD_DIR || `${process.cwd()}/upload`;

export const appConfig: AppConfig = {
   proxy: process.env.APP_PROXY,
   port: Number(process.env.APP_PORT || '3000'),
   apiRateLimit: Number(process.env.APP_API_RATE_LIMIT || '100'),
   apiRateLimitWindowMs: Number(process.env.APP_API_RATE_LIMIT_WINDOW_MS || String(15 * 60 * 1000)),
   userCsvPathPattern: `${uploadDir}/whitelist/smart_routing_<<date>>.csv`,
   blacklistUserCsvPath: `${uploadDir}/blacklist/blacklist.csv`,
   apiKey: process.env.APP_API_KEY || 'unknown',
   corsOrigin: process.env.APP_CORS_ORIGIN || '*',
   corsMethods: process.env.APP_CORS_METHODS || 'OPTIONS,GET,POST,DELETE,HEAD',
};
