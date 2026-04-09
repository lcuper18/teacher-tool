import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'database', 'teacher_tool.db');

let db = null;

export const getDb = () => {
  if (!db) {
    db = new Database(DB_PATH, { verbose: console.log });
    db.pragma('journal_mode = WAL');
  }
  return db;
};

export const closeDb = () => {
  if (db) {
    db.close();
    db = null;
  }
};

export default { getDb, closeDb };