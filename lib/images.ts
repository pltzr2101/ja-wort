import { getDb } from "./db";
import { deleteImageFile } from "./upload";

export interface ImageRow {
  id: number;
  filename: string;
  caption: string | null;
  sortOrder: number;
}

/** Liefert alle Galerie-Bilder in gewuenschter Reihenfolge. */
export function getImages(): ImageRow[] {
  const rows = getDb()
    .prepare(
      "SELECT id, filename, caption, sort_order AS sortOrder FROM images ORDER BY sort_order, id"
    )
    .all() as ImageRow[];
  return rows;
}

/** Fuegt ein Bild hinzu und liefert die neue Zeile. */
export function addImage(filename: string, caption: string | null): ImageRow {
  const result = getDb()
    .prepare("INSERT INTO images (filename, caption, sort_order) VALUES (?, ?, ?)")
    .run(filename, caption ?? null, 0);

  return {
    id: Number(result.lastInsertRowid),
    filename,
    caption: caption ?? null,
    sortOrder: 0,
  };
}

/** Loescht einen Bild-Eintrag inklusive Datei. */
export function deleteImage(id: number): boolean {
  const row = getDb().prepare("SELECT filename FROM images WHERE id = ?").get(id) as
    { filename: string } | undefined;

  if (!row) return false;

  getDb().prepare("DELETE FROM images WHERE id = ?").run(id);
  deleteImageFile(row.filename);
  return true;
}
