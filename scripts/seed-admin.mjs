/**
 * Run once to seed the admin user with a real password hash.
 * Usage: node --experimental-vm-modules scripts/seed-admin.mjs
 * Or simply: npm run seed
 */
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'salle.db');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Init schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'employee' CHECK(role IN ('employee','organizer','admin')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    building TEXT NOT NULL,
    floor TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    equipments TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','maintenance')),
    photo_url TEXT,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS recurrences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    frequency TEXT NOT NULL CHECK(frequency IN ('daily','weekly','biweekly','monthly')),
    ends_at TEXT,
    max_count INTEGER
  );
  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    organizer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_at TEXT NOT NULL,
    end_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK(status IN ('confirmed','cancelled','no_show')),
    recurrence_id INTEGER REFERENCES recurrences(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reservation_id INTEGER NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','declined')),
    UNIQUE(reservation_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS favorites (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, room_id)
  );
  INSERT OR IGNORE INTO rooms (id,name,building,floor,capacity,equipments,description) VALUES
    (1,'Salle Étoile','Bâtiment A','RDC',8,'["Projecteur","Tableau blanc","Visio"]','Salle lumineuse avec vue sur le jardin'),
    (2,'Salle Comète','Bâtiment A','1er',12,'["Projecteur","TV 4K","Climatisation"]','Grande salle pour présentations'),
    (3,'Salle Nébuleuse','Bâtiment B','RDC',4,'["TV 4K","Tableau blanc"]','Petite salle calme pour focus'),
    (4,'Salle Galaxie','Bâtiment B','2ème',20,'["Scène","Micro","Projecteur","Visio"]','Amphithéâtre interne'),
    (5,'Salle Aurora','Bâtiment C','1er',6,'["Tableau blanc","Visio"]','Salle de brainstorming');
`);

const hash = bcrypt.hashSync('admin123', 10);
db.prepare(`
  INSERT INTO users (name, email, password, role) VALUES ('Admin', 'admin@salle.app', ?, 'admin')
  ON CONFLICT(email) DO UPDATE SET password = excluded.password
`).run(hash);

console.log('✅ Base de données initialisée.');
console.log('✅ Compte admin : admin@salle.app / admin123');
db.close();
