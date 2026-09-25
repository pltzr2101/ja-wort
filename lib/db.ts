import Database from "better-sqlite3";
import fs from "node:fs";
import { DB_PATH, DATA_DIR } from "./paths";

let db: Database.Database | null = null;

/**
 * Liefert die (lazy initialisierte) SQLite-Verbindung als Singleton.
 * Das Schema wird beim ersten Zugriff angelegt (idempotente Migrationen).
 */
export function getDb(): Database.Database {
  if (db) return db;

  fs.mkdirSync(DATA_DIR, { recursive: true });
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  return db;
}

function migrate(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS rsvps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      attending INTEGER NOT NULL,
      guests INTEGER,
      has_children INTEGER,
      children_ages TEXT,
      needs_accommodation INTEGER,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS content (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      caption TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  migrateContentRows(database);
}

/**
 * Migriert den alten einzelnen Inhaltssatz (key = "site") in den deutschen
 * Sprach-Inhaltssatz (key = "site:de"). Idempotent: laeuft nur, wenn der
 * alte Key noch vorhanden und der neue noch nicht belegt ist.
 */
function migrateContentRows(database: Database.Database): void {
  const hasDe = database.prepare("SELECT 1 FROM content WHERE key = 'site:de'").get();
  if (hasDe) return;

  const old = database.prepare("SELECT value_json FROM content WHERE key = 'site'").get() as
    { value_json: string } | undefined;
  if (!old) return;

  database
    .prepare("INSERT OR IGNORE INTO content (key, value_json) VALUES ('site:de', ?)")
    .run(old.value_json);
}
