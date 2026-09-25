import crypto from "node:crypto";

/**
 * Passwort-Hashing mit Node-eigenem scrypt (keine nativen Zusatzmodule).
 * Format: "<salt>:<hash>" (beide hex-kodiert).
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/** Konstantzeit-Vergleich eines Passworts gegen einen Hash. */
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return crypto.timingSafeEqual(candidate, expected);
}

let adminHash: string | null = null;

function getAdminHash(): string {
  if (!adminHash) {
    const password = process.env.ADMIN_PASSWORD;
    if (!password) throw new Error("ADMIN_PASSWORD ist nicht gesetzt.");
    adminHash = hashPassword(password);
  }
  return adminHash;
}

/** Prueft das Admin-Passwort gegen den zur Laufzeit gehashten Wert. */
export function verifyAdminPassword(input: string): boolean {
  try {
    return verifyPassword(input, getAdminHash());
  } catch {
    return false;
  }
}

/** Prueft das Gast-Passwort (gemeinsames Passwort) in konstanter Zeit. */
export function verifyGuestPassword(input: string): boolean {
  const password = process.env.GUEST_PASSWORD;
  if (!password) return false;

  const a = Buffer.from(input);
  const b = Buffer.from(password);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Gibt an, ob das Gaeste-Gate (Passwort vor der Website) aktiv ist.
 * Standard: aktiv (true). Ueber die Umgebungsvariable `GUEST_GATE_ENABLED=false`
 * kann das Gate deaktiviert werden, damit die Seite ohne Passwort erreichbar
 * ist. Der Admin-Bereich bleibt davon unberuehrt und weiterhin geschuetzt.
 */
export function isGuestGateEnabled(): boolean {
  return process.env.GUEST_GATE_ENABLED !== "false";
}
