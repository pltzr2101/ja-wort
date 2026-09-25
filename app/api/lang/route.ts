import { NextRequest, NextResponse } from "next/server";
import { isSecureRequest } from "@/lib/api";
import { LOCALE_COOKIE, LOCALES, localeCookieTtl } from "@/lib/i18n";

/**
 * Setzt die bevorzugte Sprache als Cookie. Wird vom Sprach-Umschalter auf
 * der Website verwendet; danach rendert der Server alle Inhalte in der
 * gewaehlten Sprache.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { lang?: unknown };
  const lang = LOCALES.includes(body.lang as never)
    ? (body.lang as (typeof LOCALES)[number])
    : "de";

  const res = NextResponse.json({ ok: true, lang });
  res.cookies.set(LOCALE_COOKIE, lang, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(req),
    path: "/",
    maxAge: localeCookieTtl(),
  });
  return res;
}
