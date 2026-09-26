import { getDb } from "./db";

export interface RsvpRow {
  id: number;
  name: string;
  attending: boolean;
  guests: number | null;
  additionalNames: string | null;
  hasChildren: boolean | null;
  childrenAges: string | null;
  needsAccommodation: boolean | null;
  afterparty: boolean | null;
  note: string | null;
  createdAt: string;
}

/** Bearbeitbare Felder einer Anmeldung (ohne id/createdAt). */
export type RsvpUpdate = Omit<RsvpRow, "id" | "createdAt">;

interface RawRow {
  id: number;
  name: string;
  attending: number;
  guests: number | null;
  additional_names: string | null;
  has_children: number | null;
  children_ages: string | null;
  needs_accommodation: number | null;
  afterparty: number | null;
  note: string | null;
  created_at: string;
}

function toBool(value: number | null): boolean | null {
  if (value === null) return null;
  return value === 1;
}

/** Liefert alle Anmeldungen, neueste zuerst. */
export function getRsvps(): RsvpRow[] {
  const rows = getDb()
    .prepare(
      `SELECT id, name, attending, guests, additional_names, has_children, children_ages,
              needs_accommodation, afterparty, note, created_at
       FROM rsvps ORDER BY id DESC`
    )
    .all() as RawRow[];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    attending: toBool(row.attending) ?? false,
    guests: row.guests,
    additionalNames: row.additional_names,
    hasChildren: toBool(row.has_children),
    childrenAges: row.children_ages,
    needsAccommodation: toBool(row.needs_accommodation),
    afterparty: toBool(row.afterparty),
    note: row.note,
    createdAt: row.created_at,
  }));
}

/** Loescht eine Anmeldung. Liefert false, wenn nicht vorhanden. */
export function deleteRsvp(id: number): boolean {
  const result = getDb().prepare("DELETE FROM rsvps WHERE id = ?").run(id);
  return result.changes > 0;
}

/** Aktualisiert eine Anmeldung. Liefert false, wenn nicht vorhanden. */
export function updateRsvp(id: number, data: RsvpUpdate): boolean {
  const result = getDb()
    .prepare(
      `UPDATE rsvps SET
        name = ?, attending = ?, guests = ?, additional_names = ?,
        has_children = ?, children_ages = ?, needs_accommodation = ?,
        afterparty = ?, note = ?
       WHERE id = ?`
    )
    .run(
      data.name,
      data.attending ? 1 : 0,
      data.guests ?? null,
      data.additionalNames ?? null,
      data.hasChildren === null ? null : data.hasChildren ? 1 : 0,
      data.childrenAges ?? null,
      data.needsAccommodation === null ? null : data.needsAccommodation ? 1 : 0,
      data.afterparty === null ? null : data.afterparty ? 1 : 0,
      data.note ?? null,
      id
    );
  return result.changes > 0;
}
