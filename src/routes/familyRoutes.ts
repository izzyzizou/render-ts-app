import express from 'express';
import * as familyController from '../controllers/familyController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken as any, familyController.getFamily as any);
router.post('/', authenticateToken as any, familyController.createFamily as any);
router.post('/invite', authenticateToken as any, familyController.inviteMember as any);

export default router;
