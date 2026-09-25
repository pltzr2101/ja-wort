import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { UPLOADS_DIR } from "./paths";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

export type ImageType = "jpg" | "png" | "webp";

const EXTENSION_BY_TYPE: Record<ImageType, string> = {
  jpg: "jpg",
  png: "png",
  webp: "webp",
};

/**
 * Erkennt den echten Bildtyp anhand der Magic Bytes (unabhaengig vom
 * uebermittelten MIME-Type, schuetzt vor gefaelschten Dateien).
 */
export function detectImageType(buffer: Buffer): ImageType | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return "png";
  }

  // WebP: RIFF .... WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "webp";
  }

  return null;
}

/**
 * Prueft eine hochgeladene Datei (MIME + Magic Bytes + Groesse).
 * Liefert null bei Erfolg, sonst eine verstaendliche Fehlermeldung.
 */
export function validateImageFile(mime: string, buffer: Buffer): string | null {
  if (buffer.length === 0) return "Die Datei ist leer.";
  if (buffer.length > MAX_UPLOAD_BYTES) return "Die Datei ist groesser als 5 MB.";
  if (!ALLOWED_MIME.has(mime)) return "Nur JPG, PNG oder WebP sind erlaubt.";
  if (detectImageType(buffer) === null) return "Die Datei ist kein gueltiges Bild.";
  return null;
}

/**
 * Speichert ein Bild unter einem zufaelligen Dateinamen und gibt diesen zurueck.
 */
export function saveImage(buffer: Buffer, type: ImageType): string {
  const extension = EXTENSION_BY_TYPE[type];
  const filename = `${crypto.randomBytes(16).toString("hex")}.${extension}`;
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
  return filename;
}

/** Entfernt eine Bilddatei (best effort, wirft nie). */
export function deleteImageFile(filename: string): void {
  try {
    fs.unlinkSync(path.join(UPLOADS_DIR, filename));
  } catch {
    // Datei existiert nicht (mehr) – ignorieren.
  }
}

/** Erlaubte Dateinamen (hex + erlaubte Endung) – verhindert Path Traversal. */
export function isSafeFilename(filename: string): boolean {
  return /^[a-f0-9]{32}\.(jpg|png|webp)$/.test(filename);
}
