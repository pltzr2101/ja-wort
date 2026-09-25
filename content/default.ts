import type { ThemeId } from "@/lib/themes";

export type SectionId =
  "hero" | "countdown" | "story" | "gallery" | "schedule" | "rsvp" | "map" | "faq";

export interface ScheduleItem {
  time: string;
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SectionToggle {
  id: SectionId;
  enabled: boolean;
}

export interface SiteContent {
  theme: ThemeId;
  coupleNames: string;
  weddingDate: string; // ISO-Datum, z. B. "2026-09-12"
  locationName: string;
  heroTitle: string;
  heroSubtitle: string;
  storyTitle: string;
  storyText: string;
  scheduleTitle: string;
  schedule: ScheduleItem[];
  mapTitle: string;
  mapEmbedUrl: string;
  faqTitle: string;
  faq: FaqItem[];
  rsvpTitle: string;
  rsvpSubtitle: string;
  sections: SectionToggle[];
}

/** Kanonische Reihenfolge der Sektionen. */
export const sectionOrder: SectionId[] = [
  "hero",
  "countdown",
  "story",
  "gallery",
  "schedule",
  "rsvp",
  "map",
  "faq",
];

/** Standard-Inhalte. Koennen im Admin-Bereich ueberschrieben werden. */
export const defaultContent: SiteContent = {
  theme: "romantic",
  coupleNames: "Anna & Jonas",
  weddingDate: "2026-09-12",
  locationName: "Schlossgarten Musterstadt",
  heroTitle: "Wir heiraten!",
  heroSubtitle: "Anna & Jonas · 12. September 2026",
  storyTitle: "Unsere Geschichte",
  storyText:
    "Hier koennt ihr ein paar Worte ueber euch schreiben – wie ihr euch kennengelernt habt und warum ihr diesen Tag gemeinsam feiern moechtet.",
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
  sections: sectionOrder.map((id) => ({ id, enabled: true })),
};
