import { Request, Response } from 'express';
import { uuid } from 'uuidv4';

import { client } from '../helpers/redis-cli';
import { IgnoreCause } from '../dtos/ignore-cause';
import { redisConfig } from '../configs/redis';

const db = redisConfig.db.ignoreCauseDb;

export async function add(req: Request, res: Response): Promise<Response> {
   const input = req.body;
   const ignoreCauses = !Array.isArray(input) ? [input] : input;
   await client.select(db);

   ignoreCauses.forEach((ignoreCause: IgnoreCause) => {
      client.hSet(uuid(), 'value', ignoreCause.value);
   });

   return res.json({
      success: 1,
      data: ignoreCauses,
   });
}

export async function remove(req: Request, res: Response): Promise<Response> {
   const { id } = req.params;
   await client.select(db);
   client.del(id);

   return res.json({
      success: 1,
      data: [id],
   });
}

export async function list(_req: Request, res: Response): Promise<Response> {
   await client.select(db);
   const keys = await client.keys('*');

   const results = keys.map(async (key) => ({
      ...await client.hGetAll(key),
      key,
   }));

   return res.json({
      success: 1,
      data: await Promise.all(results),
   });
}
