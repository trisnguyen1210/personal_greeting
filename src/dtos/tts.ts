import { Method } from 'axios';

export enum Voice {
   LinhSan = 'linhsanace',
   BanMai = 'banmaiace',
   NgocLam = 'ngoclamace',
   ThuMinh = 'thuminhace',
}

export type TtsConfig = {
   api: {
      url: string
      method: Method
      body?: string
      headers: {
         'Content-Type': string
         api_key: string
         voice: Voice
         speed: number
         format: string
      }
      timeout: number
   }
}

export type TtsApiRes = {
   async: string
   error: number
   message: string
   request_id: string
}

export type TtsUrlInfo = {
   url: string
   fileName: string
}
