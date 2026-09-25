import { cookies } from "next/headers";
import { verifySession, type SessionKind } from "./session";

/**
 * Ermittelt die aktuelle Session-Art aus den Cookies.
 * Wird in Server Components (Layouts/Seiten) verwendet.
 */
export async function getSessionKind(): Promise<SessionKind | null> {
  const store = await cookies();

  // Admin zuerst pruefen: Ein Admin hat hoehere Rechte. Ist gleichzeitig noch
  // ein (aelteres) guest_session-Cookie vorhanden, wuerde ein Gast-Check zuerst
  // den Admin faelschlich als "guest" einstufen und ihn aus dem Admin-Bereich
  // aussperren.
  const admin = verifySession(store.get("admin_session")?.value);
  if (admin?.kind === "admin") return "admin";

  const guest = verifySession(store.get("guest_session")?.value);
  if (guest?.kind === "guest") return "guest";

  return null;
}
