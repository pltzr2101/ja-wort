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
