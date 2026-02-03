import express from 'express';
import * as locationController from '../controllers/locationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken as any, locationController.updateLocation as any);
router.get('/current', authenticateToken as any, locationController.getCurrentLocations as any);

export default router;
