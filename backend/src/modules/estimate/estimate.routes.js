import { Router } from 'express';
import { run } from './estimate.controller.js';

const router = Router();

router.post('/run', run);

export default router;
