import { Router } from 'express';
import { getDb } from '../database/db.js';

const router = Router();

// GET /api/settings - Get all settings
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const getAllSettings = db.prepare('SELECT key, value FROM config');
    const settings = getAllSettings.all();
    
    const result = {};
    settings.forEach(row => {
      result[row.key] = row.value;
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
});

// PUT /api/settings - Update settings
router.put('/', (req, res) => {
  try {
    const { school_name, teacher_name } = req.body;
    const db = getDb();
    
    const upsert = db.prepare(`
      INSERT INTO config (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);
    
    // Use transaction for multiple updates
    const transaction = db.transaction(() => {
      if (school_name !== undefined) {
        upsert.run('school_name', school_name || '');
      }
      
      if (teacher_name !== undefined) {
        upsert.run('teacher_name', teacher_name || '');
      }
    });
    
    transaction();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Error al guardar configuración' });
  }
});

export default router;