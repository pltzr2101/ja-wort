import { describe, expect, it } from "vitest";
import { formatObjectPosition, parseObjectPosition } from "@/lib/object-position";

describe("parseObjectPosition", () => {
  it("liefert Mitte bei leeren/unparsebaren Werten", () => {
    expect(parseObjectPosition(undefined)).toEqual({ x: 50, y: 50 });
    expect(parseObjectPosition(null)).toEqual({ x: 50, y: 50 });
    expect(parseObjectPosition("")).toEqual({ x: 50, y: 50 });
    expect(parseObjectPosition("center")).toEqual({ x: 50, y: 50 });
    expect(parseObjectPosition("voelliger-quatsch")).toEqual({ x: 50, y: 50 });
  });

  it("erkennt einzelne Keyword-Presets", () => {
    expect(parseObjectPosition("top")).toEqual({ x: 50, y: 0 });
    expect(parseObjectPosition("bottom")).toEqual({ x: 50, y: 100 });
    expect(parseObjectPosition("left")).toEqual({ x: 0, y: 50 });
    expect(parseObjectPosition("right")).toEqual({ x: 100, y: 50 });
  });

  it("erkennt Keyword-Kombinationen unabhaengig von der Reihenfolge", () => {
    expect(parseObjectPosition("top left")).toEqual({ x: 0, y: 0 });
    expect(parseObjectPosition("left top")).toEqual({ x: 0, y: 0 });
    expect(parseObjectPosition("bottom right")).toEqual({ x: 100, y: 100 });
    expect(parseObjectPosition("right bottom")).toEqual({ x: 100, y: 100 });
  });

  it("parst Prozentwerte", () => {
    expect(parseObjectPosition("50% 30%")).toEqual({ x: 50, y: 30 });
    expect(parseObjectPosition("25%")).toEqual({ x: 25, y: 50 });
  });

  it("clammpt Werte auf 0–100", () => {
    expect(parseObjectPosition("150% -20%")).toEqual({ x: 100, y: 0 });
    expect(parseObjectPosition("-5%")).toEqual({ x: 0, y: 50 });
  });
});

describe("formatObjectPosition", () => {
  it("formatiert auf ganze Prozentwerte", () => {
    expect(formatObjectPosition({ x: 50, y: 30 })).toBe("50% 30%");
    expect(formatObjectPosition({ x: 50, y: 0 })).toBe("50% 0%");
    expect(formatObjectPosition({ x: 50, y: 100 })).toBe("50% 100%");
  });

  it("rundet und clammpt", () => {
    expect(formatObjectPosition({ x: 50, y: 33.6 })).toBe("50% 34%");
    expect(formatObjectPosition({ x: 50, y: 150 })).toBe("50% 100%");
    expect(formatObjectPosition({ x: 50, y: -10 })).toBe("50% 0%");
  });
});
