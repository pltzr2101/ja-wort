import "@testing-library/jest-dom/vitest";

// Deterministischer Signierschluessel fuer Tests (kein Dateisystem-Zugriff).
process.env.SESSION_SECRET = "test-secret-1234567890";
