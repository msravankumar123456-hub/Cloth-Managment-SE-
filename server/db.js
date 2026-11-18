// SQLite via Node's built-in module (Node >= 22.5). No npm dependencies.
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const file = process.env.DB_FILE || './data/loopmex.db';
if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true });
export const db = new DatabaseSync(file);

db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS retailers (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name     TEXT NOT NULL,
  full_name_lc  TEXT NOT NULL,
  mobile        TEXT NOT NULL UNIQUE,
  city          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  pin_code      TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_retailers_name ON retailers(full_name_lc);

CREATE TABLE IF NOT EXISTS factory_members (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name     TEXT NOT NULL,
  full_name_lc  TEXT NOT NULL UNIQUE,
  role          TEXT NOT NULL DEFAULT 'factory_staff',  -- factory_admin | factory_staff
  password_hash TEXT NOT NULL,
  active        INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,          -- sha256 of the cookie token
  user_type  TEXT NOT NULL,             -- retailer | factory
  user_id    INTEGER NOT NULL,
  expires_at INTEGER NOT NULL           -- epoch ms
);

CREATE TABLE IF NOT EXISTS login_attempts (
  key TEXT NOT NULL, at INTEGER NOT NULL
);
`);
