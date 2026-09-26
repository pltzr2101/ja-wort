import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getDb } from "@/lib/db";
import { getRsvps, updateRsvp } from "@/lib/rsvps";

describe("rsvps (DB)", () => {
  beforeEach(() => {
    getDb().prepare("DELETE FROM rsvps").run();
  });

  afterEach(() => {
    getDb().prepare("DELETE FROM rsvps").run();
  });

  it("migriert die additional_names- und afterparty-Spalte und liest sie zurueck", () => {
    const db = getDb();
    const columns = db.prepare("PRAGMA table_info(rsvps)").all() as { name: string }[];
    expect(columns.some((c) => c.name === "additional_names")).toBe(true);
    expect(columns.some((c) => c.name === "afterparty")).toBe(true);

    db.prepare(
      `INSERT INTO rsvps
        (name, attending, guests, additional_names, has_children, children_ages, needs_accommodation, afterparty, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run("Max Mustermann", 1, 3, "Anna Musterfrau, Ben Beispiel", 0, null, 0, 1, null);

    const rows = getRsvps();
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Max Mustermann");
    expect(rows[0].additionalNames).toBe("Anna Musterfrau, Ben Beispiel");
    expect(rows[0].afterparty).toBe(true);
  });

  it("aktualisiert eine Anmeldung und liest die Aenderungen zurueck", () => {
    const db = getDb();
    db.prepare(
      `INSERT INTO rsvps
        (name, attending, guests, additional_names, has_children, children_ages, needs_accommodation, afterparty, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run("Max Mustermann", 1, 2, null, 0, null, 0, null, null);

    const id = db.prepare("SELECT id FROM rsvps").get() as { id: number };

    const ok = updateRsvp(id.id, {
      name: "Max Muster",
      attending: true,
      guests: 3,
      additionalNames: "Anna Musterfrau",
      hasChildren: true,
      childrenAges: "2 und 5",
      needsAccommodation: true,
      afterparty: true,
      note: "Vegetarisch",
    });
    expect(ok).toBe(true);

    const [row] = getRsvps();
    expect(row.name).toBe("Max Muster");
    expect(row.attending).toBe(true);
    expect(row.guests).toBe(3);
    expect(row.hasChildren).toBe(true);
    expect(row.childrenAges).toBe("2 und 5");
    expect(row.needsAccommodation).toBe(true);
    expect(row.afterparty).toBe(true);
    expect(row.note).toBe("Vegetarisch");
  });

  it("liefert false, wenn die zu aktualisierende Anmeldung fehlt", () => {
    const ok = updateRsvp(9999, {
      name: "Niemand",
      attending: false,
      guests: null,
      additionalNames: null,
      hasChildren: null,
      childrenAges: null,
      needsAccommodation: null,
      afterparty: null,
      note: null,
    });
    expect(ok).toBe(false);
  });
});
