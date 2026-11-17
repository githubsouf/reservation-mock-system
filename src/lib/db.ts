import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

// On Vercel, only /tmp is writable. We copy the seed DB there on cold start.
const IS_VERCEL = process.env.VERCEL === '1';
const TMP_DB_PATH = '/tmp/salle.db';
const SEED_DB_PATH = path.join(process.cwd(), 'data', 'salle.db');

function getDbPath(): string {
  if (!IS_VERCEL) {
    // Local dev: use data/ directly (fully writable)
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, 'salle.db');
  }

  // Vercel: copy seed DB to /tmp if not already there
  if (!fs.existsSync(TMP_DB_PATH)) {
    if (fs.existsSync(SEED_DB_PATH)) {
      fs.copyFileSync(SEED_DB_PATH, TMP_DB_PATH);
    }
    // If no seed DB exists either, start fresh — initSchema will create all tables
  }
  return TMP_DB_PATH;
}

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  // On Vercel /tmp can be wiped between warm invocations — reopen if file gone
  if (db) {
    try { db.prepare('SELECT 1').get(); return db; } catch { db = null; }
  }
  const dbPath = getDbPath();
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  initSchema(db);
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      email       TEXT    NOT NULL UNIQUE,
      password    TEXT    NOT NULL,
      role        TEXT    NOT NULL DEFAULT 'employee' CHECK(role IN ('employee','organizer','admin')),
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT    NOT NULL,
      building     TEXT    NOT NULL,
      floor        TEXT    NOT NULL,
      capacity     INTEGER NOT NULL,
      equipments   TEXT    NOT NULL DEFAULT '[]',
      status       TEXT    NOT NULL DEFAULT 'active' CHECK(status IN ('active','maintenance')),
      photo_url    TEXT,
      description  TEXT,
      created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS recurrences (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      frequency    TEXT NOT NULL CHECK(frequency IN ('daily','weekly','biweekly','monthly')),
      ends_at      TEXT,
      max_count    INTEGER
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id         INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      organizer_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title           TEXT    NOT NULL,
      start_at        TEXT    NOT NULL,
      end_at          TEXT    NOT NULL,
      status          TEXT    NOT NULL DEFAULT 'confirmed' CHECK(status IN ('confirmed','cancelled','no_show')),
      recurrence_id   INTEGER REFERENCES recurrences(id) ON DELETE SET NULL,
      created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS participants (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_id  INTEGER NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
      user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status          TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','declined')),
      UNIQUE(reservation_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS favorites (
      user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      room_id  INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, room_id)
    );

    -- Seed sample rooms
    INSERT OR IGNORE INTO rooms (id, name, building, floor, capacity, equipments, description) VALUES
      (1, 'Salle Étoile',    'Bâtiment A', 'RDC',   8,  '["Projecteur","Tableau blanc","Visio"]', 'Salle lumineuse avec vue sur le jardin'),
      (2, 'Salle Comète',    'Bâtiment A', '1er',   12, '["Projecteur","TV 4K","Climatisation"]', 'Grande salle pour présentations'),
      (3, 'Salle Nébuleuse', 'Bâtiment B', 'RDC',   4,  '["TV 4K","Tableau blanc"]',              'Petite salle calme pour focus'),
      (4, 'Salle Galaxie',   'Bâtiment B', '2ème',  20, '["Scène","Micro","Projecteur","Visio"]', 'Amphithéâtre interne'),
      (5, 'Salle Aurora',    'Bâtiment C', '1er',   6,  '["Tableau blanc","Visio"]',              'Salle de brainstorming');
  `);

  // Seed admin user if not present
  const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@salle.app');
  if (!adminExists) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Admin', 'admin@salle.app', hash, 'admin');
  }
}
