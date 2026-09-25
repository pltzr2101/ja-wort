import { type NextRequest } from "next/server";
import { verifySession } from "./session";

/**
 * Auth-Helfer fuer Route Handler. Prueft das jeweilige Cookie
 * direkt aus dem Request (synchron, kein next/headers noetig).
 */

export function requireGuest(req: NextRequest): boolean {
  return verifySession(req.cookies.get("guest_session")?.value)?.kind === "guest";
}

export function requireAdmin(req: NextRequest): boolean {
  return verifySession(req.cookies.get("admin_session")?.value)?.kind === "admin";
}

/**
 * Ermittelt, ob die urspruengliche Anfrage ueber HTTPS lief.
 *
 * Hinter Cloudflare/Reverse-Proxy terminiert der Proxy TLS und setzt
 * `X-Forwarded-Proto` auf das Protokoll des Clients. Ohne diesen Header
 * (direkter HTTP-Zugriff auf den Container) faellt die Funktion auf das
 * Protokoll der Anfrage-URL zurueck.
 *
 * Wird fuer das `Secure`-Flag der Session-Cookies verwendet: Ein blindes
 * `secure: NODE_ENV === "production"` wuerde hinter einem Proxy, der die
 * Seite per HTTP ausliefert, zu einem stillen Login-Fehlschlag fuehren, weil
 * der Browser ein `Secure`-Cookie ueber HTTP nicht speichert.
 */
export function isSecureRequest(req: Request): boolean {
  const forwarded = req.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0].trim().toLowerCase() === "https";
  try {
    return new URL(req.url).protocol === "https:";
  } catch {
    return false;
  }
}
