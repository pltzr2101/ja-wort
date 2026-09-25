import { describe, expect, it } from "vitest";
import { escapeCsvCell } from "@/lib/csv";

describe("escapeCsvCell", () => {
  it("setzt normale Werte in Anführungszeichen", () => {
    expect(escapeCsvCell("Anna")).toBe('"Anna"');
  });

  it("verdoppelt Anführungszeichen im Wert", () => {
    expect(escapeCsvCell('Sa"id')).toBe('"Sa""id"');
  });

  it("neutralisiert Formel-Trigger mit einem Hochkomma", () => {
    expect(escapeCsvCell("=HYPERLINK(...)")).toBe('"\'=HYPERLINK(...)"');
    expect(escapeCsvCell("+1+2")).toBe('"\'+1+2"');
    expect(escapeCsvCell("-2+3")).toBe('"\'-2+3"');
    expect(escapeCsvCell("@cmd")).toBe('"\'@cmd"');
  });

  it("neutralisiert Tabulator und Wagenrücklauf am Anfang", () => {
    expect(escapeCsvCell("\t=1")).toBe('"\'\t=1"');
    expect(escapeCsvCell("\r=1")).toBe('"\'\r=1"');
  });

  it("laesst harmlose Werte unveraendert (kein falsches Hochkomma)", () => {
    expect(escapeCsvCell("Anna & Jonas")).toBe('"Anna & Jonas"');
    expect(escapeCsvCell("1. August")).toBe('"1. August"');
    expect(escapeCsvCell("")).toBe('""');
  });
});
