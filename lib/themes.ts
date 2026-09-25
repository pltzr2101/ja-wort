export type ThemeId = "romantic" | "modern" | "rustic" | "noir";

export interface ThemeColors {
  accent: string;
  accentSoft: string;
  background: string;
  foreground: string;
  muted: string;
  surface: string;
  border: string;
}

export interface Theme {
  id: ThemeId;
  name: string;
  colors: ThemeColors;
}

/** Vorgefertigte Farb-Presets (Baukasten). Nur Farben, keine Layouts. */
export const themes: Record<ThemeId, Theme> = {
  romantic: {
    id: "romantic",
    name: "Romantik",
    colors: {
      accent: "#b76e79",
      accentSoft: "#f3d9d4",
      background: "#fdf8f5",
      foreground: "#3d2c2c",
      muted: "#8a7272",
      surface: "#ffffff",
      border: "#eadcd8",
    },
  },
  modern: {
    id: "modern",
    name: "Modern Minimal",
    colors: {
      accent: "#1a1a1a",
      accentSoft: "#e5e5e5",
      background: "#ffffff",
      foreground: "#111111",
      muted: "#6b6b6b",
      surface: "#f7f7f7",
      border: "#e2e2e2",
    },
  },
  rustic: {
    id: "rustic",
    name: "Rustikal",
    colors: {
      accent: "#a47148",
      accentSoft: "#e8d8c3",
      background: "#faf6ef",
      foreground: "#3f3328",
      muted: "#8a7a68",
      surface: "#ffffff",
      border: "#e4d8c6",
    },
  },
  noir: {
    id: "noir",
    name: "Noir",
    colors: {
      accent: "#d4af37",
      accentSoft: "#3a3a3a",
      background: "#121212",
      foreground: "#f5f0e6",
      muted: "#a8a8a8",
      surface: "#1e1e1e",
      border: "#2e2e2e",
    },
  },
};

export const themeIds: ThemeId[] = ["romantic", "modern", "rustic", "noir"];

/** Liefert ein Theme, mit Fallback auf "romantic" bei unbekannter ID. */
export function getTheme(id: ThemeId | string): Theme {
  return themes[id as ThemeId] ?? themes.romantic;
}
