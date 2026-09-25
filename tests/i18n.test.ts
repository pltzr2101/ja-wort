import { describe, expect, it } from "vitest";
import { getDictionary, LOCALES } from "@/lib/i18n";

/** Sammelt alle Blatt-Strings eines verschachtelten Woerterbuchs. */
function collectStrings(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      out[path] = value;
    } else if (value && typeof value === "object") {
      Object.assign(out, collectStrings(value as Record<string, unknown>, path));
    }
  }
  return out;
}

describe("i18n", () => {
  it("stellt alle unterstuetzten Sprachen bereit", () => {
    expect(LOCALES).toContain("de");
    expect(LOCALES).toContain("ko");
  });

  it("liefert fuer jede Sprache vollstaendige, nicht-leere Uebersetzungen", () => {
    for (const locale of LOCALES) {
      const strings = collectStrings(getDictionary(locale) as unknown as Record<string, unknown>);
      expect(Object.keys(strings).length).toBeGreaterThan(0);
      for (const [path, value] of Object.entries(strings)) {
        expect(value.trim(), `Leerer Eintrag fuer ${locale}.${path}`).not.toBe("");
      }
    }
  });

  it("hat identische Schluessel-Struktur in DE und KO", () => {
    const de = collectStrings(getDictionary("de") as unknown as Record<string, unknown>);
    const ko = collectStrings(getDictionary("ko") as unknown as Record<string, unknown>);
    expect(Object.keys(ko).sort()).toEqual(Object.keys(de).sort());
  });

  it("uebersetzt zentrale RSVP-Beschriftungen wirklich (nicht nur kopiert)", () => {
    const de = getDictionary("de");
    const ko = getDictionary("ko");
    // Mindestens eine zentrale Beschriftung muss sich unterscheiden.
    expect(ko.rsvp.submit).not.toBe(de.rsvp.submit);
    expect(ko.rsvp.attending).not.toBe(de.rsvp.attending);
  });
});
