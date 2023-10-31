import axios, { AxiosError, AxiosRequestConfig } from 'axios';

import { ApiRes } from '../dtos/api';
import { logger } from './logger';

export async function request<Type>(opts: AxiosRequestConfig): Promise<ApiRes<Type>> {
   const {
      url, data, params, method,
   } = opts;

   const start = Date.now();

   const response = await axios.request({
      timeout: 30000,
      ...opts,
   }).catch((error: AxiosError) => {
      logger.error(
         {
            error: error.toString(),
            action: 'call external api',
            input: {
               reqBody: data,
               url,
               method,
            },
         },
      );

      return { data: null };
   });

   if (!response.data) {
      return {
         success: false,
         data: [],
      };
   }

   const reqDurationMs = Date.now() - start;
   const logResp = response.data;

   logger.info({
      action: 'call external api',
      input: {

         url,
         params,
         body: data,
      },
      output: {
         reqDurationMs,
         resp: logResp,
      },
   });

   return { data: [<Type>response.data], success: true };
}
