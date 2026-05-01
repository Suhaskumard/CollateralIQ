import { Router } from 'express';
import { getMetrics } from './dashboard.controller.js';

const router = Router();

router.get('/metrics', getMetrics);

export default router;
