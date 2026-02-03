import { Response } from 'express';
import { db } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';
import { Server } from 'socket.io';

interface LocationCache {
  [userId: string]: {
    lat: number;
    lng: number;
    timestamp: Date;
    battery: number;
  };
}

// In-memory cache for current locations
const currentLocations: LocationCache = {};

export const updateLocation = async (req: AuthRequest, res: Response) => {
  const { latitude, longitude, accuracy, battery_level } = req.body;
  const userId = req.user.id;

  if (!isValidCoordinate(latitude, longitude)) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }

  try {
    // Save to database
    await db.query(
      `INSERT INTO locations (id, user_id, latitude, longitude, accuracy, battery_level, timestamp)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())`,
      [userId, latitude, longitude, accuracy, battery_level]
    );

    // Update in-memory cache
    currentLocations[userId] = {
      lat: latitude,
      lng: longitude,
      timestamp: new Date(),
      battery: battery_level
    };

    // Get user's family ID(s)
    const familiesResult = await db.query(
      'SELECT family_id FROM family_members WHERE user_id = $1',
      [userId]
    );

    // Broadcast to family members via WebSocket
    const io: Server = req.app.get('socketio');
    familiesResult.rows.forEach(row => {
      io.to(`family-${row.family_id}`).emit('location-update', {
        userId,
        latitude,
        longitude,
        battery_level,
        timestamp: new Date()
      });
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update location' });
  }
};

export const getCurrentLocations = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  try {
    // Get all members of the families the user belongs to
    const membersResult = await db.query(
      `SELECT DISTINCT fm2.user_id 
       FROM family_members fm1
       JOIN family_members fm2 ON fm1.family_id = fm2.family_id
       WHERE fm1.user_id = $1`,
      [userId]
    );

    const familyMemberIds = membersResult.rows.map(row => row.user_id);
    const locations: LocationCache = {};
    
    familyMemberIds.forEach(id => {
      if (currentLocations[id]) {
        locations[id] = currentLocations[id];
      }
    });

    res.json(locations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get current locations' });
  }
};

function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}
