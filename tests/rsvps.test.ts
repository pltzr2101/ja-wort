import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getDb } from "@/lib/db";
import { getRsvps } from "@/lib/rsvps";

describe("rsvps (DB)", () => {
  beforeEach(() => {
    getDb().prepare("DELETE FROM rsvps").run();
  });

  afterEach(() => {
    getDb().prepare("DELETE FROM rsvps").run();
  });

  it("migriert die additional_names-Spalte und liest sie zurueck", () => {
    const db = getDb();
    const columns = db.prepare("PRAGMA table_info(rsvps)").all() as { name: string }[];
    expect(columns.some((c) => c.name === "additional_names")).toBe(true);

    db.prepare(
      `INSERT INTO rsvps
        (name, attending, guests, additional_names, has_children, children_ages, needs_accommodation, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run("Max Mustermann", 1, 3, "Anna Musterfrau, Ben Beispiel", 0, null, 0, null);

    const rows = getRsvps();
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Max Mustermann");
    expect(rows[0].additionalNames).toBe("Anna Musterfrau, Ben Beispiel");
  });
});
