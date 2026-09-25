import { cookies } from "next/headers";
import { verifySession, type SessionKind } from "./session";

/**
 * Ermittelt die aktuelle Session-Art aus den Cookies.
 * Wird in Server Components (Layouts/Seiten) verwendet.
 */
export async function getSessionKind(): Promise<SessionKind | null> {
  const store = await cookies();

  const guest = verifySession(store.get("guest_session")?.value);
  if (guest?.kind === "guest") return "guest";

  const admin = verifySession(store.get("admin_session")?.value);
  if (admin?.kind === "admin") return "admin";

  return null;
}
