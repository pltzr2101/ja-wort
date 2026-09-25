import type { ThemeId } from "@/lib/themes";

/** Unterstuetzte Sprachen der Website. */
export type Locale = "de" | "ko";

export const LOCALES: Locale[] = ["de", "ko"];

export type SectionType =
  "hero" | "countdown" | "gallery" | "schedule" | "rsvp" | "map" | "faq" | "image" | "text";

export interface ScheduleItem {
  time: string;
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Eine (aktivierbare) Sektion der Website. Singleton-Sektionen (hero, gallery, ...)
 * haben eine eindeutige `key` gleich dem `type`; `image`- und `text`-Sektionen sind
 * beliebig oft vorhanden. Bild-Sektionen referenzieren ein Galerie-Bild ueber
 * `imageId`, Text-Sektionen tragen optional `title` und `text` direkt.
 */
export interface SiteSection {
  key: string;
  type: SectionType;
  enabled: boolean;
  imageId?: number | null;
  caption?: string;
  /** CSS object-position fuer die Bild-Sektion ("center" | "top" | ...). */
  objectPosition?: string;
  /** "cover" (zuschneiden) oder "contain" (komplett einpassen). */
  objectFit?: "cover" | "contain";
  /** Ueberschrift einer Text-Sektion (optional). */
  title?: string;
  /** Fliesstext einer Text-Sektion. */
  text?: string;
}

export interface SiteContent {
  theme: ThemeId;
  coupleNames: string;
  weddingDate: string; // ISO-Datum, z. B. "2026-09-12"
  locationName: string;
  heroTitle: string;
  heroSubtitle: string;
  heroObjectPosition: string; // CSS object-position fuer das Hero-Titelbild
  scheduleTitle: string;
  schedule: ScheduleItem[];
  mapTitle: string;
  mapEmbedUrl: string;
  faqTitle: string;
  faq: FaqItem[];
  rsvpTitle: string;
  rsvpSubtitle: string;
  sections: SiteSection[];
}

/** Kanonische Default-Reihenfolge der Singleton-Sektionen (ohne "image"/"text"). */
export const sectionOrder: SectionType[] = [
  "hero",
  "countdown",
  "gallery",
  "schedule",
  "rsvp",
  "map",
  "faq",
];

/**
 * Standard-Sektionen: die Singleton-Sektionen in kanonischer Reihenfolge plus
 * eine Beispiel-Text-Sektion (frueher "Story") direkt nach dem Countdown.
 */
export function defaultSections(): SiteSection[] {
  const singletons: SiteSection[] = sectionOrder.map((type) => ({
    key: type,
    type,
    enabled: true,
  }));

  return [
    singletons[0],
    singletons[1],
    {
      key: "text-story",
      type: "text",
      enabled: true,
      title: "Unsere Geschichte",
      text: "Hier koennt ihr ein paar Worte ueber euch schreiben – wie ihr euch kennengelernt habt und warum ihr diesen Tag gemeinsam feiern moechtet.",
    },
    ...singletons.slice(2),
  ];
}

/** Standard-Inhalte. Koennen im Admin-Bereich ueberschrieben werden. */
export const defaultContent: SiteContent = {
  theme: "romantic",
  coupleNames: "Anna & Jonas",
  weddingDate: "2026-09-12",
  locationName: "Schlossgarten Musterstadt",
  heroTitle: "Wir heiraten!",
  heroSubtitle: "Anna & Jonas · 12. September 2026",
  heroObjectPosition: "center",
  scheduleTitle: "Ablauf",
  schedule: [
    { time: "14:00", title: "Trauung", description: "Standesamt Musterstadt" },
    { time: "15:30", title: "Sektempfang", description: "Schlossgarten" },
    { time: "18:00", title: "Abendessen & Feier", description: "Festsaal" },
  ],
  mapTitle: "So findet ihr uns",
  mapEmbedUrl:
    "https://www.openstreetmap.org/export/embed.html?bbox=13.4049%2C52.5200%2C13.4290%2C52.5300&layer=mapnik&marker=52.5200%2C13.4050",
  faqTitle: "Haeufige Fragen",
  faq: [
    { question: "Was ziehe ich an?", answer: "Festlich, aber bequem." },
    { question: "Wo kann ich parken?", answer: "Direkt am Schlossgarten." },
    { question: "Bis wann soll ich Bescheid geben?", answer: "Bitte bis zum 1. August 2026." },
  ],
  rsvpTitle: "Zu- oder Absage",
  rsvpSubtitle: "Bitte gebt uns bis zum 1. August 2026 Bescheid.",
  sections: defaultSections(),
};
