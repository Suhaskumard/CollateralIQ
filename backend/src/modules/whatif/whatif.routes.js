import { Router } from 'express';
import { analyze } from './whatif.controller.js';

const router = Router();

router.post('/analyze', analyze);

export default router;
