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

/** Schrift-Paarung eines Themes (Referenzen auf die next/font-Variablen). */
export interface ThemeFonts {
  display: string;
  body: string;
}

export interface Theme {
  id: ThemeId;
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
}

/**
 * Vorgefertigte Design-Token-Presets (Baukasten).
 *
 * Jedes Preset unterscheidet sich deutlich in Farbe UND Schrift, damit der
 * Unterschied beim Umschalten sofort sichtbar ist. `fonts.display`/`fonts.body`
 * referenzieren die im Root-Layout registrierten next/font-CSS-Variablen.
 */
export const themes: Record<ThemeId, Theme> = {
  romantic: {
    id: "romantic",
    name: "Romantik",
    colors: {
      accent: "#c2446b",
      accentSoft: "#f6dbe3",
      background: "#fdf6f7",
      foreground: "#3a2630",
      muted: "#96737e",
      surface: "#ffffff",
      border: "#f0d9df",
    },
    fonts: {
      display: "var(--font-display)",
      body: "var(--font-body-serif)",
    },
  },
  modern: {
    id: "modern",
    name: "Modern Minimal",
    colors: {
      accent: "#2563eb",
      accentSoft: "#dbeafe",
      background: "#ffffff",
      foreground: "#0f172a",
      muted: "#64748b",
      surface: "#f8fafc",
      border: "#e2e8f0",
    },
    fonts: {
      display: "var(--font-body)",
      body: "var(--font-body)",
    },
  },
  rustic: {
    id: "rustic",
    name: "Rustikal",
    colors: {
      accent: "#5f7a4d",
      accentSoft: "#e4ecdc",
      background: "#faf9f4",
      foreground: "#2e3528",
      muted: "#7a826f",
      surface: "#ffffff",
      border: "#e2e6d8",
    },
    fonts: {
      display: "var(--font-display)",
      body: "var(--font-body)",
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
    fonts: {
      display: "var(--font-display-alt)",
      body: "var(--font-body)",
    },
  },
};

export const themeIds: ThemeId[] = ["romantic", "modern", "rustic", "noir"];

/** Liefert ein Theme, mit Fallback auf "romantic" bei unbekannter ID. */
export function getTheme(id: ThemeId | string): Theme {
  return themes[id as ThemeId] ?? themes.romantic;
}
