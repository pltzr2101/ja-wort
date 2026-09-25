import { cookies } from "next/headers";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n";

/**
 * Liest die bevorzugte Sprache aus dem Cookie. Unbekannte Werte fallen auf
 * "de" zurueck. Diese Funktion ist server-only, da sie auf `next/headers`
 * angewiesen ist; sie darf nicht in Client-Komponenten importiert werden.
 */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return value === "ko" ? "ko" : "de";
}
