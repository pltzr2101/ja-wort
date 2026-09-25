import type { CSSProperties } from "react";
import { redirect } from "next/navigation";
import { getContent } from "@/lib/content";
import { getTheme } from "@/lib/themes";
import { getSessionKind } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

/**
 * Layout fuer die oeffentliche Hochzeits-Seite.
 * - Gaeste-Gate: ohne gueltige Session wird auf /gate weitergeleitet.
 * - Setzt die Theme-Farben als CSS-Variablen auf dem Seiten-Wrapper.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const kind = await getSessionKind();
  if (kind === null) redirect("/gate");

  const content = getContent();
  const theme = getTheme(content.theme);

  const vars = {
    "--accent": theme.colors.accent,
    "--accent-soft": theme.colors.accentSoft,
    "--background": theme.colors.background,
    "--foreground": theme.colors.foreground,
    "--muted": theme.colors.muted,
    "--surface": theme.colors.surface,
    "--border": theme.colors.border,
    "--display-font": theme.fonts.display,
    "--body-font": theme.fonts.body,
  } as CSSProperties;

  return (
    <div style={vars} className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
