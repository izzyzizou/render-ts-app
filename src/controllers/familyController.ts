import { Response } from 'express';
import { db } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

export const getFamily = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  try {
    const result = await db.query(
      `SELECT f.* FROM families f 
       JOIN family_members fm ON f.id = fm.family_id 
       WHERE fm.user_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get family' });
  }
};

export const inviteMember = async (req: AuthRequest, res: Response) => {
  const { familyId, email, role } = req.body;
  try {
    const userResult = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = userResult.rows[0].id;
    await db.query(
      'INSERT INTO family_members (family_id, user_id, role, joined_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT DO NOTHING',
      [familyId, userId, role || 'member']
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to invite member' });
  }
};

export const createFamily = async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  const userId = req.user.id;
  try {
    const result = await db.query(
      'INSERT INTO families (id, name, created_by, created_at) VALUES (gen_random_uuid(), $1, $2, NOW()) RETURNING *',
      [name, userId]
    );
    const family = result.rows[0];
    
    await db.query(
      'INSERT INTO family_members (family_id, user_id, role, joined_at) VALUES ($1, $2, $3, NOW())',
      [family.id, userId, 'admin']
    );
    
    res.status(201).json(family);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create family' });
  }
};
