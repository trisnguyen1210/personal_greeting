import { Request, Response } from 'express';
import { access } from 'fs';
import { promisify } from 'util';

import { BlacklistedUser } from '../dtos/greet-audio';
import { client } from '../helpers/redis-cli';
import consts from '../consts';
import { redisConfig } from '../configs/redis';

const accessPromise = promisify(access);

export async function getAudioFile(req: Request, res: Response): Promise<Response> {
   if (!req.body) {
      return res.json({
         success: 0,
         error: 'request failed: empty body',
      });
   }

   const { CallerID } = req.body;
   const audioPath = `${consts.audioBasePath}/${CallerID}.wav`;

   await client.select(redisConfig.db.blacklistDb);
   const blacklistedUser: string[] = await client.keys(CallerID);

   if (blacklistedUser.length) {
      return res.json({
         success: 0,
         error: 'phone is already in blacklist',
      });
   }

   const respContent = await accessPromise(audioPath)
      .then(() => ({
         success: 1,
         data: [{
            url: `${req.protocol}://${req.headers.host}/audio/${CallerID}.wav`,
         }],
      }))
      .catch(() => ({
         success: 0,
         error: 'file not found',
      }));

   return res.json(respContent);
}

export async function addPhonesToBlacklist(req: Request, res: Response): Promise<Response> {
   if (!req.body) {
      return res.json({
         success: 0,
         error: 'request failed: empty body',
      });
   }

   const blacklistedUsers: BlacklistedUser[] = req.body;

   if (!Array.isArray(blacklistedUsers) || !blacklistedUsers.length) {
      return res.json({
         success: 0,
         error: 'request failed: wrong or empty data format in request body',
      });
   }

   const validUsers = blacklistedUsers.filter((user) => user.phone && user.note);
   await client.select(redisConfig.db.blacklistDb);

   validUsers.forEach((blacklistedUser) => {
      const { phone, note } = blacklistedUser;

      if (phone && note) {
         client.hSet(phone, 'note', note);
      }
   });

   return res.json({
      success: 1,
      data: validUsers,
   });
}
