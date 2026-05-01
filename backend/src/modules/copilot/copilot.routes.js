import { Router } from 'express';
import { chat } from './copilot.controller.js';

const router = Router();

router.post('/chat', chat);

export default router;
