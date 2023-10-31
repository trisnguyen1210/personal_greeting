import { Router } from 'express';

import { addPhonesToBlacklist, getAudioFile } from '../controllers/greet-audio';

export const greetAudioRouter = Router();

greetAudioRouter.post('/', getAudioFile);
greetAudioRouter.post('/add-blacklist', addPhonesToBlacklist);
