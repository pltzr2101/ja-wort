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

/**
 * Setzt die Reihenfolge der Galerie-Bilder neu. `orderedIds` enthaelt alle
 * Bild-IDs in der gewuenschchten Reihenfolge; deren `sort_order` wird in einer
 * Transaktion auf den jeweiligen Index gesetzt. Unbekannte IDs werden ignoriert.
 * Liefert `false`, wenn die Liste leer ist.
 */
export function reorderImages(orderedIds: number[]): boolean {
  if (orderedIds.length === 0) return false;

  const db = getDb();
  const update = db.prepare("UPDATE images SET sort_order = ? WHERE id = ?");
  const apply = db.transaction((ids: number[]) => {
    ids.forEach((id, index) => update.run(index, id));
  });
  apply(orderedIds);
  return true;
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
