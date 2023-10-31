import { Router } from 'express';

import { add, list, remove } from '../controllers/ignore-cause';

export const ignoreCauseRouter = Router();

ignoreCauseRouter.post('/', add);
ignoreCauseRouter.delete('/:id', remove);
ignoreCauseRouter.get('/', list);
