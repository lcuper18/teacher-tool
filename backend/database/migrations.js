import { getDb } from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const initDatabase = () => {
  const db = getDb();
  
  console.log('📂 Inicializando base de datos en:', db.name);
  
  // Create sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id               TEXT PRIMARY KEY,
      title            TEXT NOT NULL,
      model            TEXT NOT NULL,
      material_type    TEXT NOT NULL,
      extra_instructions TEXT,
      input_filename   TEXT NOT NULL,
      input_text       TEXT,
      output_text      TEXT,
      docx_path        TEXT,
      created_at       DATETIME DEFAULT (datetime('now')),
      updated_at       DATETIME DEFAULT (datetime('now'))
    )
  `);
  
  // Create indexes for sessions
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_sessions_material ON sessions(material_type);
  `);
  
  // Create config table
  db.exec(`
    CREATE TABLE IF NOT EXISTS config (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
  
  // Insert default config values
  const insertConfig = db.prepare(`
    INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)
  `);
  
  insertConfig.run('school_name', '');
  insertConfig.run('teacher_name', '');
  
  console.log('✅ Tablas creadas: sessions, config');
  console.log('✅ Índices creados: idx_sessions_created, idx_sessions_material');
  
  return true;
};

export default { initDatabase };