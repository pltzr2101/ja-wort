"use client";

import { useRouter } from "next/navigation";
import { dict, LOCALES, type Locale } from "@/lib/i18n";

/**
 * Sprach-Umschalter (DE / 한국어). Setzt die Sprache ueber den Server
 * (Cookie) und laedt die Seite danach neu, damit alle Inhalte konsistent
 * in der gewaehlten Sprache gerendert werden.
 */
export default function LanguageToggle({ locale }: { locale: Locale }) {
  const router = useRouter();

  async function switchTo(next: Locale) {
    if (next === locale) return;
    await fetch("/api/lang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang: next }),
    });
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Sprache">
      {LOCALES.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => switchTo(lang)}
          aria-pressed={lang === locale}
          className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-widest transition ${
            lang === locale ? "bg-accent text-white" : "text-muted hover:text-foreground"
          }`}
        >
          {dict[lang].langName}
        </button>
      ))}
    </div>
  );
}
