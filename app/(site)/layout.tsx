import type { CSSProperties } from "react";
import { redirect } from "next/navigation";
import { isGuestGateEnabled } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { getTheme } from "@/lib/themes";
import { getSessionKind } from "@/lib/server-auth";
import { getLocale } from "@/lib/locale";

export const dynamic = "force-dynamic";

/**
 * Layout fuer die oeffentliche Hochzeits-Seite.
 * - Gaeste-Gate: ohne gueltige Session wird auf /gate weitergeleitet –
 *   jedoch nur, wenn das Gate aktiv ist (GUEST_GATE_ENABLED != "false").
 * - Setzt die Theme-Farben als CSS-Variablen auf dem Seiten-Wrapper.
 * - In der koreanischen Sprachvariante wird die Schrift auf die
 *   koreanische Font-Variable umgestellt.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  if (isGuestGateEnabled()) {
    const kind = await getSessionKind();
    if (kind === null) redirect("/gate");
  }

  const locale = await getLocale();
  const content = getContent(locale);
  const theme = getTheme(content.theme);

  const displayFont = locale === "ko" ? "var(--font-ko)" : theme.fonts.display;
  const bodyFont = locale === "ko" ? "var(--font-ko)" : theme.fonts.body;

  const vars = {
    "--accent": theme.colors.accent,
    "--accent-soft": theme.colors.accentSoft,
    "--background": theme.colors.background,
    "--foreground": theme.colors.foreground,
    "--muted": theme.colors.muted,
    "--surface": theme.colors.surface,
    "--border": theme.colors.border,
    "--display-font": displayFont,
    "--body-font": bodyFont,
  } as CSSProperties;

  return (
    <div style={vars} className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
