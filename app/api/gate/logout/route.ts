import { NextResponse } from "next/server";
import { isGuestGateEnabled } from "@/lib/auth";

/**
 * Logout (oeffentliche Seite): loescht BEIDE Session-Cookies.
 *
 * Wichtig: Das oeffentliche `(site)`-Layout akzeptiert Gast- UND Admin-Sessions.
 * Wuerde hier nur `guest_session` geloescht, bliebe ein eingeloggter Admin ueber
 * sein `admin_session`-Cookie weiter angemeldet und kaeme nie auf die /gate-Seite.
 *
 * Ist das Gaeste-Gate deaktiviert (GUEST_GATE_ENABLED=false), wird direkt auf
 * die Website (/) weitergeleitet statt auf die dann nicht mehr noetige /gate-Seite.
 */
export async function POST() {
  // Relative Location statt absolutem URL aus `req.url`: Der interne Host
  // (z. B. 0.0.0.0:3000 hinter einem Reverse-Proxy) darf nicht in die
  // Redirect-URL gelangen. Der Browser loest relative Pfade selbst auf.
  const location = isGuestGateEnabled() ? "/gate" : "/";
  const res = new NextResponse(null, { status: 303, headers: { Location: location } });
  res.cookies.set("guest_session", "", { path: "/", maxAge: 0 });
  res.cookies.set("admin_session", "", { path: "/", maxAge: 0 });
  return res;
}
