import { describe, expect, it } from "vitest";
import { defaultContent } from "@/content/default";
import { mergeContent } from "@/lib/content";

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
