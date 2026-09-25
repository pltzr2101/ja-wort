import path from "node:path";

/**
 * Zentraler Speicherort fuer persistente Daten (SQLite + Uploads).
 * Standard: ./data relativ zum Arbeitsverzeichnis. Im Docker-Container
 * wird dieses Verzeichnis als Volume eingebunden und bleibt so erhalten.
 */
export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");

export const DB_PATH = path.join(DATA_DIR, "wedding.db");
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
