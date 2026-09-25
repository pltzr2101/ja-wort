import { NextResponse } from "next/server";

/** Admin-Logout: Cookie loeschen und zurueck zur Anmeldung. */
export async function POST() {
  // Relative Location statt absolutem URL aus `req.url` (siehe Gast-Logout).
  const res = new NextResponse(null, { status: 303, headers: { Location: "/admin/login" } });
  res.cookies.set("admin_session", "", { path: "/", maxAge: 0 });
  return res;
}
