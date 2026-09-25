import type { SectionType, SiteContent } from "@/content/default";
import { getDictionary, type Locale } from "@/lib/i18n";
import LanguageToggle from "./LanguageToggle";

interface Props {
  content: SiteContent;
  locale: Locale;
}

/** Anker-Navigation fuer die Singleton-Sektionen (ohne Hero/Bild). */
const NAV_TYPES: SectionType[] = ["story", "gallery", "schedule", "rsvp", "map", "faq"];

/** Sticky-Kopfbereich mit Paarnamen, Sprach-Umschalter und Anker-Navigation. */
export default function SiteHeader({ content, locale }: Props) {
  const dict = getDictionary(locale);
  const items = content.sections
    .filter((section) => section.enabled && NAV_TYPES.includes(section.type))
    .map((section) => ({
      id: section.type,
      label: dict.nav[section.type as keyof typeof dict.nav],
    }));

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#" className="font-serif text-2xl font-semibold text-accent">
          {content.coupleNames}
        </a>
        <nav className="hidden items-center gap-6 md:flex">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-sm uppercase tracking-widest text-muted transition hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
          <form action="/api/gate/logout" method="post">
            <button
              type="submit"
              className="text-sm uppercase tracking-widest text-muted transition hover:text-foreground"
            >
              {dict.nav.logout}
            </button>
          </form>
        </nav>
        <div className="flex items-center gap-4">
          <LanguageToggle locale={locale} />
          <form action="/api/gate/logout" method="post" className="md:hidden">
            <button
              type="submit"
              className="text-sm uppercase tracking-widest text-muted transition hover:text-foreground"
            >
              {dict.nav.logout}
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
