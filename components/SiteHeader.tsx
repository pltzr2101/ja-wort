import type { SectionType, SiteContent } from "@/content/default";

interface Props {
  content: SiteContent;
}

/** Anker-Navigation fuer die Singleton-Sektionen (ohne Hero/Bild). */
const NAV_LABELS: Partial<Record<SectionType, string>> = {
  story: "Story",
  gallery: "Galerie",
  schedule: "Ablauf",
  rsvp: "Zu-/Absage",
  map: "Anfahrt",
  faq: "FAQ",
};

/** Sticky-Kopfbereich mit Paarnamen und Anker-Navigation. */
export default function SiteHeader({ content }: Props) {
  const items = content.sections
    .filter((section) => section.enabled && NAV_LABELS[section.type] !== undefined)
    .map((section) => ({ id: section.type, label: NAV_LABELS[section.type] as string }));

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
              Logout
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
