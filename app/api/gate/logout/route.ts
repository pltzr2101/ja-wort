import { NextResponse } from "next/server";

/** Gast-Logout: Cookie loeschen und zurueck zur Anmeldung. */
export async function POST() {
  // Relative Location statt absolutem URL aus `req.url`: Der interne Host
  // (z. B. 0.0.0.0:3000 hinter einem Reverse-Proxy) darf nicht in die
  // Redirect-URL gelangen. Der Browser loest relative Pfade selbst auf.
  const res = new NextResponse(null, { status: 303, headers: { Location: "/gate" } });
  res.cookies.set("guest_session", "", { path: "/", maxAge: 0 });
  return res;
}
