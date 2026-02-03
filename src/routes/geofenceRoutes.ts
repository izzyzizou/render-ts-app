import express from 'express';
import * as geofenceController from '../controllers/geofenceController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken as any, geofenceController.createGeofence as any);
router.get('/', authenticateToken as any, geofenceController.getGeofences as any);

export default router;
