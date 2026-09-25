import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const COOKIE_TTL = 60 * 60 * 24 * 30; // 30 Tage

/** Admin-Anmeldung (eigenes Passwort, mit Rate-Limit). */
export async function POST(req: NextRequest) {
  const limit = rateLimit(`admin:${clientKey(req)}`, 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Zu viele Versuche. Bitte versuche es spaeter erneut." },
      { status: 429 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as { password?: unknown };
  if (typeof body.password !== "string" || !verifyAdminPassword(body.password)) {
    return NextResponse.json({ error: "Falsches Passwort." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", createSession("admin"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_TTL,
  });
  return res;
}
