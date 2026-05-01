import { Router } from 'express';
import { getTrail, log } from './audit.controller.js';

const router = Router();

router.get('/trail', getTrail);
router.post('/log',  log);

export default router;
