import { NextRequest, NextResponse } from "next/server";

/** Gast-Logout: Cookie loeschen und zurueck zur Anmeldung. */
export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/gate", req.url));
  res.cookies.set("guest_session", "", { path: "/", maxAge: 0 });
  return res;
}
