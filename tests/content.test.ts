import { describe, expect, it } from "vitest";
import { defaultContent } from "@/content/default";
import { mergeContent, normalizeSections } from "@/lib/content";

describe("mergeContent", () => {
  it("behaelt Defaults bei leerem Override", () => {
    const merged = mergeContent(defaultContent, {});
    expect(merged).toEqual(defaultContent);
  });

  it("ueberschreibt einfache Felder", () => {
    const merged = mergeContent(defaultContent, { coupleNames: "Lisa & Tom" });
    expect(merged.coupleNames).toBe("Lisa & Tom");
    expect(merged.schedule).toEqual(defaultContent.schedule);
  });

  it("ersetzt Arrays, wenn sie gueltig sind", () => {
    const schedule = [{ time: "15:00", title: "Trauung", description: "Kirche" }];
    const merged = mergeContent(defaultContent, { schedule });
    expect(merged.schedule).toEqual(schedule);
  });

  it("ignoriert ungueltige Arrays (kein Array)", () => {
    const merged = mergeContent(defaultContent, {
      schedule: "kaputt" as unknown as never,
      faq: 42 as unknown as never,
    });
    expect(merged.schedule).toEqual(defaultContent.schedule);
    expect(merged.faq).toEqual(defaultContent.faq);
  });
});

describe("normalizeSections", () => {
  it("migriert das alte Shape { id, enabled }", () => {
    const sections = normalizeSections([
      { id: "gallery", enabled: true },
      { id: "map", enabled: false },
    ]);
    expect(sections.find((s) => s.type === "gallery")?.enabled).toBe(true);
    expect(sections.find((s) => s.type === "map")?.enabled).toBe(false);
    // Fehlende Singleton-Sektionen werden ergaenzt.
    expect(sections.find((s) => s.type === "hero")).toBeDefined();
    expect(sections.find((s) => s.type === "rsvp")).toBeDefined();
  });

  it("erhaelt die Reihenfolge und erlaubt mehrere Bild-Sektionen", () => {
    const sections = normalizeSections([
      { key: "map", type: "map", enabled: true },
      { key: "img-1", type: "image", enabled: true, imageId: 1 },
      { key: "img-2", type: "image", enabled: true, imageId: 2 },
      { key: "gallery", type: "gallery", enabled: true },
    ]);
    // Relative Reihenfolge der uebergebenen Sektionen bleibt erhalten,
    // fehlende Singleton-Sektionen werden hinten ergaenzt.
    expect(sections.slice(0, 4).map((s) => s.type)).toEqual(["map", "image", "image", "gallery"]);
    expect(sections.filter((s) => s.type === "image")).toHaveLength(2);
  });

  it("vergibt eindeutige Keys fuer Bild-Sektionen ohne key", () => {
    const sections = normalizeSections([
      { type: "image", enabled: true, imageId: 1 },
      { type: "image", enabled: true, imageId: 2 },
    ]);
    const keys = sections.filter((s) => s.type === "image").map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("toleriert kaputte Eingaben", () => {
    expect(normalizeSections("kaputt" as unknown)).toEqual(defaultContent.sections);
    expect(normalizeSections([{ bogus: true }])).toEqual(defaultContent.sections);
  });

  it("erhaelt objectPosition/objectFit fuer Bild-Sektionen", () => {
    const sections = normalizeSections([
      {
        key: "img-1",
        type: "image",
        enabled: true,
        imageId: 1,
        objectPosition: "top",
        objectFit: "contain",
      },
    ]);
    const image = sections.find((s) => s.type === "image");
    expect(image?.objectPosition).toBe("top");
    expect(image?.objectFit).toBe("contain");
  });

  it("verwirft ungueltige objectFit-Werte", () => {
    const sections = normalizeSections([
      { key: "img-1", type: "image", enabled: true, imageId: 1, objectFit: "bogus" },
    ]);
    const image = sections.find((s) => s.type === "image");
    expect(image?.objectFit).toBeUndefined();
  });
});
