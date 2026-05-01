import { Router } from 'express';
import { propertyTypes, locations, modelHealth } from './metadata.controller.js';

const router = Router();

router.get('/property-types', propertyTypes);
router.get('/locations',      locations);
router.get('/models',         modelHealth);

export default router;
