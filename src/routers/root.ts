import { Request, Response, Router } from 'express';

export const rootRouter = Router();

rootRouter.get('/ping', (_req: Request, res: Response) => res.json());
