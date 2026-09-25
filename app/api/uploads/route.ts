import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api";
import { addImage, deleteImage, getImages, reorderImages } from "@/lib/images";
import { detectImageType, saveImage, validateImageFile, type ImageType } from "@/lib/upload";

/** Listet alle Galerie-Bilder (nur Admin). */
export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }
  return NextResponse.json(getImages());
}

/** Laedt ein oder mehrere Bilder hoch (nur Admin). */
export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Ungueltige Anfrage." }, { status: 400 });
  }

  const files = formData.getAll("file").filter((entry): entry is File => entry instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "Keine Datei gefunden." }, { status: 400 });
  }

  // Alle Dateien zuerst validieren, damit bei einer ungueltigen Datei keine
  // Teilmenge gespeichert wird (Alles-oder-nichts).
  const buffers: { buffer: Buffer; type: ImageType }[] = [];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const error = validateImageFile(file.type, buffer);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const type = detectImageType(buffer);
    if (!type) {
      return NextResponse.json({ error: "Die Datei ist kein gueltiges Bild." }, { status: 400 });
    }
    buffers.push({ buffer, type });
  }

  const caption = formData.get("caption");
  const captionValue = typeof caption === "string" ? caption.trim() || null : null;

  const images = buffers.map(({ buffer, type }) => {
    const filename = saveImage(buffer, type);
    return addImage(filename, captionValue);
  });

  return NextResponse.json({ ok: true, images });
}

/** Sortiert die Galerie-Bilder neu (nur Admin). */
export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { ids?: unknown } | null;
  if (!body || !Array.isArray(body.ids) || !body.ids.every((id) => typeof id === "number")) {
    return NextResponse.json({ error: "Ungueltige Anfrage." }, { status: 400 });
  }

  reorderImages(body.ids as number[]);
  return NextResponse.json({ ok: true });
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
