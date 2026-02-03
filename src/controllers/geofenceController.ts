import { Response } from 'express';
import { db } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

export const createGeofence = async (req: AuthRequest, res: Response) => {
  const { familyId, name, latitude, longitude, radius_meters } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO geofences (id, family_id, name, latitude, longitude, radius_meters, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW()) RETURNING *',
      [familyId, name, latitude, longitude, radius_meters]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create geofence' });
  }
};

export const getGeofences = async (req: AuthRequest, res: Response) => {
  const { familyId } = req.query;
  try {
    const result = await db.query('SELECT * FROM geofences WHERE family_id = $1', [familyId]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get geofences' });
  }
};
