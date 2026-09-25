/** Freier Bildfokus in Prozent (0–100), horizontal und vertikal. */
export interface ObjectPosition {
  x: number;
  y: number;
}

/** Keyword-Presets fuer die Abwaertskompatibilitaet gespeicherter Werte. */
const KEYWORDS: Record<string, ObjectPosition> = {
  center: { x: 50, y: 50 },
  top: { x: 50, y: 0 },
  bottom: { x: 50, y: 100 },
  left: { x: 0, y: 50 },
  right: { x: 100, y: 50 },
};

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, value));
}

function parsePercent(token: string): number | null {
  const match = token.match(/^(-?\d+(?:\.\d+)?)%$/);
  if (!match) return null;
  return clamp(Number(match[1]));
}

/**
 * Wandelt einen CSS-`object-position`-String in freie Prozentwerte um.
 * Keyword-Presets (center/top/bottom/left/right und Kombinationen) werden
 * fuer die Abwaertskompatibilitaet erkannt; ansonsten werden Prozentwerte
 * gelesen. Unparsebare Eingaben fallen auf die Mitte (50/50) zurueck.
 */
export function parseObjectPosition(value: string | undefined | null): ObjectPosition {
  const raw = (value ?? "").trim().toLowerCase();
  if (!raw || raw === "center") return { x: 50, y: 50 };

  const tokens = raw.split(/\s+/).filter(Boolean);

  // Ein- oder zweiteilige Keyword-Kombinationen ("top", "top left", ...).
  if (tokens.length >= 1 && tokens.length <= 2) {
    const positions = tokens.map((token) => KEYWORDS[token]);
    if (positions.every((position) => position !== undefined)) {
      let x = 50;
      let y = 50;
      for (const position of positions) {
        if (position.x !== 50) x = position.x;
        if (position.y !== 50) y = position.y;
      }
      return { x, y };
    }
  }

  // Prozentformen: "x%" oder "x% y%".
  if (tokens.length === 1) {
    const x = parsePercent(tokens[0]);
    if (x !== null) return { x, y: 50 };
  } else if (tokens.length === 2) {
    const x = parsePercent(tokens[0]);
    const y = parsePercent(tokens[1]);
    if (x !== null && y !== null) return { x, y };
  }

  return { x: 50, y: 50 };
}

/** Formatiert eine Position als CSS-`object-position`-String ("x% y%"). */
export function formatObjectPosition(position: ObjectPosition): string {
  return `${Math.round(clamp(position.x))}% ${Math.round(clamp(position.y))}%`;
}
