import { NextRequest, NextResponse } from "next/server";
import { verifyGuestPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { isSecureRequest } from "@/lib/api";

const COOKIE_TTL = 60 * 60 * 24 * 30; // 30 Tage

/** Gast-Anmeldung mit gemeinsamem Passwort. */
export async function POST(req: NextRequest) {
  const limit = rateLimit(`gate:${clientKey(req)}`, 10, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Zu viele Versuche. Bitte versuche es spaeter erneut." },
      { status: 429 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as { password?: unknown };
  if (typeof body.password !== "string" || !verifyGuestPassword(body.password)) {
    return NextResponse.json({ error: "Falsches Passwort." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("guest_session", createSession("guest"), {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(req),
    path: "/",
    maxAge: COOKIE_TTL,
  });
  return res;
}
