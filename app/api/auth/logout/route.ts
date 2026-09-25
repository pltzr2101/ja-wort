import { NextResponse } from "next/server";

/**
 * Admin-Logout: loescht BEIDE Session-Cookies (Gast + Admin) und leitet
 * zur Admin-Anmeldung weiter. Relative Location statt absolutem URL aus
 * `req.url` (siehe Gast-Logout), damit der interne Host nicht in die
 * Redirect-URL gelaengt.
 */
export async function POST() {
  const res = new NextResponse(null, { status: 303, headers: { Location: "/admin/login" } });
  res.cookies.set("guest_session", "", { path: "/", maxAge: 0 });
  res.cookies.set("admin_session", "", { path: "/", maxAge: 0 });
  return res;
}
