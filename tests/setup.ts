import "@testing-library/jest-dom/vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Deterministischer Signierschluessel fuer Tests (kein Dateisystem-Zugriff).
process.env.SESSION_SECRET = "test-secret-1234567890";

// Isoliert die SQLite-DB in ein temporaeres Verzeichnis, damit Tests nie in
// das echte ./data-Verzeichnis des Repositories schreiben.
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "jawort-test-"));
