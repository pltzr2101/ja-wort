import { NextRequest, NextResponse } from "next/server";
import { type Locale, type SiteContent } from "@/content/default";
import { requireAdmin } from "@/lib/api";
import { defaultForLocale, getContent, mergeContent, saveContent } from "@/lib/content";

/** Liest die Sprache aus dem Query-Parameter (Default: de). */
function parseLocale(req: NextRequest): Locale {
  return req.nextUrl.searchParams.get("locale") === "ko" ? "ko" : "de";
}

/** Liefert die aktuellen Inhalte einer Sprache (nur Admin). */
export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }
  return NextResponse.json(getContent(parseLocale(req)));
}

/** Speichert die Inhalte einer Sprache (nur Admin). Merged mit Defaults. */
export async function PUT(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Partial<SiteContent> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Ungueltige Anfrage." }, { status: 400 });
  }

  const locale = parseLocale(req);
  const merged = mergeContent(defaultForLocale(locale), body);
  saveContent(merged, locale);
  return NextResponse.json({ ok: true, content: getContent(locale) });
}
