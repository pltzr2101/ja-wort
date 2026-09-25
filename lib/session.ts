import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DATA_DIR } from "./paths";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 Tage Gueltigkeit

export type SessionKind = "guest" | "admin";

let secret: Buffer | null = null;

/**
 * Liest bzw. erzeugt den Signierschluessel. Ein vorhandener
 * SESSION_SECRET aus der Umgebung hat Vorrang; ansonsten wird beim
 * ersten Start ein Zufallswert erzeugt und persistent gespeichert.
 */
function getSecret(): Buffer {
  if (secret) return secret;

  const fromEnv = process.env.SESSION_SECRET;
  if (fromEnv && fromEnv.trim().length > 0) {
    secret = Buffer.from(fromEnv.trim());
    return secret;
  }

  const file = path.join(DATA_DIR, "session-secret");
  if (fs.existsSync(file)) {
    secret = Buffer.from(fs.readFileSync(file, "utf8").trim());
    return secret;
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });
  const generated = crypto.randomBytes(32).toString("hex");
  fs.writeFileSync(file, generated, { mode: 0o600 });
  secret = Buffer.from(generated);
  return secret;
}

/**
 * Erzeugt ein signiertes Session-Token der Form "<kind>.<timestamp>.<hmac>".
 */
export function createSession(kind: SessionKind): string {
  const payload = `${kind}.${Date.now()}`;
  const signature = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

/**
 * Prueft ein Token auf Signatur und Ablauf. Liefert null bei ungueltigem Token.
 */
export function verifySession(
  token: string | undefined
): { kind: SessionKind; createdAt: number } | null {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [kind, timestamp, signature] = parts;
  if (kind !== "guest" && kind !== "admin") return null;

  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(`${kind}.${timestamp}`)
    .digest("hex");

  const provided = Buffer.from(signature);
  const calculated = Buffer.from(expected);
  if (provided.length !== calculated.length || !crypto.timingSafeEqual(provided, calculated)) {
    return null;
  }

  const createdAt = Number(timestamp);
  if (!Number.isFinite(createdAt) || Date.now() - createdAt > SESSION_TTL_MS) {
    return null;
  }

  return { kind, createdAt };
}
