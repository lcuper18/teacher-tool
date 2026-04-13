import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './database/migrations.js';

// Import routes
import uploadRoutes from './routes/upload.js';
import generateRoutes from './routes/generate.js';
import sessionsRoutes from './routes/sessions.js';
import settingsRoutes from './routes/settings.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for generated DOCX
app.use('/storage', express.static(path.join(__dirname, 'storage')));

// API Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  const checks = {
    server: { status: 'ok', message: 'Servidor corriendo' },
    database: { status: 'unknown', message: '' },
    openrouter: { status: 'unknown', message: '' },
    ollama: { status: 'unknown', message: '' }
  };
  
  // Check database
  try {
    const db = await import('./database/db.js');
    const conn = db.getDb();
    const result = conn.prepare('SELECT COUNT(*) as count FROM sessions').get();
    checks.database = { status: 'ok', message: `DB accesible (${result.count} sesiones)` };
  } catch (err) {
    checks.database = { status: 'error', message: err.message };
  }
  
  // Check OpenRouter API key
  if (process.env.OPENROUTER_API_KEY) {
    checks.openrouter = { status: 'ok', message: 'API key configurada' };
  } else {
    checks.openrouter = { status: 'error', message: 'API key no configurada' };
  }
  
  // Check Ollama
  try {
    const response = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(2000) });
    if (response.ok) {
      const data = await response.json();
      checks.ollama = { status: 'ok', message: `${data.models?.length || 0} modelos disponibles` };
    } else {
      checks.ollama = { status: 'error', message: `HTTP ${response.status}` };
    }
  } catch {
    checks.ollama = { status: 'offline', message: 'Ollama no está corriendo' };
  }
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'El archivo excede el límite de 10 MB' });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Campo de archivo inesperado' });
  }
  
  res.status(500).json({ error: err.message || 'Error interno del servidor' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initDatabase();
    console.log('✅ Base de datos inicializada');
    
     app.listen(PORT, () => {
       console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
       console.log(`📁 Storage: ${path.join(__dirname, 'storage')}`);
       console.log('✅ Socket bound, server listening');
     });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;