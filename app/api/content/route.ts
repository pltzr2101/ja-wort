import { NextRequest, NextResponse } from "next/server";
import { defaultContent, type SiteContent } from "@/content/default";
import { requireAdmin } from "@/lib/api";
import { getContent, mergeContent, saveContent } from "@/lib/content";

/** Liefert die aktuellen Inhalte (nur Admin). */
export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }
  return NextResponse.json(getContent());
}

/** Speichert die Inhalte (nur Admin). Merged mit Defaults, damit nie kaputt. */
export async function PUT(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Partial<SiteContent> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Ungueltige Anfrage." }, { status: 400 });
  }

  const merged = mergeContent(defaultContent, body);
  saveContent(merged);
  return NextResponse.json({ ok: true, content: merged });
}
