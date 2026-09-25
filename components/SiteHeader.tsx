import type { SiteContent, SectionId } from "@/content/default";

interface Props {
  content: SiteContent;
}

const NAV_ITEMS: { id: SectionId; label: string }[] = [
  { id: "story", label: "Story" },
  { id: "gallery", label: "Galerie" },
  { id: "schedule", label: "Ablauf" },
  { id: "rsvp", label: "Zu-/Absage" },
  { id: "map", label: "Anfahrt" },
  { id: "faq", label: "FAQ" },
];

/** Sticky-Kopfbereich mit Paarnamen und Anker-Navigation. */
export default function SiteHeader({ content }: Props) {
  const enabled = new Set<SectionId>(content.sections.filter((s) => s.enabled).map((s) => s.id));
  const items = NAV_ITEMS.filter((item) => enabled.has(item.id));

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
