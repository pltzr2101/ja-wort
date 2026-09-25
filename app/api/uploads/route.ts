import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api";
import { addImage, deleteImage, getImages } from "@/lib/images";
import { detectImageType, saveImage, validateImageFile } from "@/lib/upload";

/** Listet alle Galerie-Bilder (nur Admin). */
export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }
  return NextResponse.json(getImages());
}

/** Laedt ein Bild hoch (nur Admin). */
export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Ungueltige Anfrage." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Keine Datei gefunden." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const error = validateImageFile(file.type, buffer);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const type = detectImageType(buffer);
  if (!type) {
    return NextResponse.json({ error: "Die Datei ist kein gueltiges Bild." }, { status: 400 });
  }

  const caption = formData.get("caption");
  const filename = saveImage(buffer, type);
  const image = addImage(filename, typeof caption === "string" ? caption.trim() || null : null);

  return NextResponse.json({ ok: true, image });
}

/** Loescht ein Bild anhand seiner ID (nur Admin). */
export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { id?: unknown } | null;
  if (!body || typeof body.id !== "number") {
    return NextResponse.json({ error: "Ungueltige Anfrage." }, { status: 400 });
  }

  const deleted = deleteImage(body.id);
  if (!deleted) {
    return NextResponse.json({ error: "Bild nicht gefunden." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
