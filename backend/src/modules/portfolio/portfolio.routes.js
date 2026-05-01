import { Router } from 'express';
import { list, save, remove } from './portfolio.controller.js';

const router = Router();

router.get('/',        list);
router.post('/save',   save);
router.delete('/:id',  remove);

export default router;
