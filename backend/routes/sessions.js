import { Router } from 'express';
import { getDb } from '../database/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET /api/sessions - List all sessions with pagination
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    const getSessions = db.prepare(`
      SELECT id, title, model, material_type, extra_instructions, 
             input_filename, output_text, docx_path, created_at, updated_at
      FROM sessions 
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);
    
    const sessions = getSessions.all(limit, offset);
    
    // Get total count
    const getCount = db.prepare('SELECT COUNT(*) as total FROM sessions');
    const { total } = getCount.get();
    
    res.json({
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting sessions:', error);
    res.status(500).json({ error: 'Error al obtener sesiones' });
  }
});

// GET /api/sessions/:id - Get single session
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    
    const getSession = db.prepare(`
      SELECT * FROM sessions WHERE id = ?
    `);
    
    const session = getSession.get(id);
    
    if (!session) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ error: 'Error al obtener sesión' });
  }
});

// GET /api/sessions/:id/download - Download generated DOCX
router.get('/:id/download', (req, res) => {
  const sessionId = req.params.id;
  console.log('📥 Solicitud de descarga:', sessionId, 'length:', sessionId.length);
  try {
    const db = getDb();
    
    // First, let's see what sessions exist
    const allSessions = db.prepare('SELECT id, docx_path FROM sessions LIMIT 5').all();
    console.log('📋 Sesiones en DB:', JSON.stringify(allSessions.map(s => ({id: s.id, docx_path: s.docx_path}))));
    
    const getDocxPath = db.prepare('SELECT docx_path, title FROM sessions WHERE id = ?');
    const session = getDocxPath.get(sessionId);
    
    console.log('📄 Resultados query:', session);
    console.log('📄 Ruta DOCX en DB:', session?.docx_path);
    
    if (!session) {
      console.log('❌ Sesión no encontrada:', sessionId);
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }
    
    if (!session.docx_path) {
      console.log('❌ DOCX no disponible para:', sessionId);
      return res.status(404).json({ error: 'DOCX no disponible' });
    }
    
    // Check if file exists
    if (!fs.existsSync(session.docx_path)) {
      console.log('❌ Archivo no encontrado:', session.docx_path);
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    // Send file
    const filename = `material_${sessionId}.docx`;
    console.log('✅ Enviando archivo:', session.docx_path);
    res.download(session.docx_path, filename);
  } catch (error) {
    console.error('Error downloading DOCX:', error);
    res.status(500).json({ error: 'Error al descargar archivo' });
  }
});

// DELETE /api/sessions/:id - Delete session
router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    
    // Get session to delete associated DOCX
    const getSession = db.prepare('SELECT docx_path FROM sessions WHERE id = ?');
    const session = getSession.get(id);
    
    if (!session) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }
    
    // Delete DOCX file if exists
    if (session.docx_path && fs.existsSync(session.docx_path)) {
      fs.unlinkSync(session.docx_path);
    }
    
    // Delete from database
    const deleteSession = db.prepare('DELETE FROM sessions WHERE id = ?');
    deleteSession.run(id);
    
    res.json({ success: true, message: 'Sesión eliminada' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Error al eliminar sesión' });
  }
});

export default router;