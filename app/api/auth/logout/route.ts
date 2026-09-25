import { NextRequest, NextResponse } from "next/server";

/** Admin-Logout: Cookie loeschen und zurueck zur Anmeldung. */
export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/admin/login", req.url));
  res.cookies.set("admin_session", "", { path: "/", maxAge: 0 });
  return res;
}
