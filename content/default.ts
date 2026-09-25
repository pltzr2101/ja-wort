import type { ThemeId } from "@/lib/themes";

/** Unterstuetzte Sprachen der Website. */
export type Locale = "de" | "ko";

export const LOCALES: Locale[] = ["de", "ko"];

export type SectionType =
  | "hero"
  | "countdown"
  | "gallery"
  | "schedule"
  | "rsvp"
  | "map"
  | "faq"
  | "contact"
  | "image"
  | "text";

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
  /** Kontakt-Sektion: Titel, Name, Telefon/WhatsApp und E-Mail (pro Sprache). */
  contactTitle: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
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
  "contact",
];

/** Deutscher Standard-Titel/Text der Beispiel-Text-Sektion ("Story"). */
const DEFAULT_STORY_TITLE = "Unsere Geschichte";
const DEFAULT_STORY_TEXT =
  "Hier koennt ihr ein paar Worte ueber euch schreiben – wie ihr euch kennengelernt habt und warum ihr diesen Tag gemeinsam feiern moechtet.";

/**
 * Standard-Sektionen: die Singleton-Sektionen in kanonischer Reihenfolge plus
 * eine Beispiel-Text-Sektion (frueher "Story") direkt nach dem Countdown.
 * Titel und Text der Text-Sektion sind sprachabhaengig und werden als Parameter
 * uebergeben, damit DE und KO unterschiedliche Standardtexte haben koennen.
 */
export function defaultSections(
  storyTitle: string = DEFAULT_STORY_TITLE,
  storyText: string = DEFAULT_STORY_TEXT
): SiteSection[] {
  const singletons: SiteSection[] = sectionOrder.map((type) => ({
    key: type,
    type,
    // Die Kontakt-Sektion ist standardmaessig deaktiviert, bis Kontaktdaten
    // hinterlegt wurden (verhindert eine leere Sektion auf der Live-Seite).
    enabled: type !== "contact",
  }));

  return [
    singletons[0],
    singletons[1],
    {
      key: "text-story",
      type: "text",
      enabled: true,
      title: storyTitle,
      text: storyText,
    },
    ...singletons.slice(2),
  ];
}

/** Standard-Inhalte (Deutsch). Koennen im Admin-Bereich ueberschrieben werden. */
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
  faqTitle: "FAQ",
  faq: [
    { question: "Was ziehe ich an?", answer: "Festlich, aber bequem." },
    { question: "Wo kann ich parken?", answer: "Direkt am Schlossgarten." },
    { question: "Bis wann soll ich Bescheid geben?", answer: "Bitte bis zum 1. August 2026." },
  ],
  rsvpTitle: "Zu- oder Absage",
  rsvpSubtitle: "Bitte gebt uns bis zum 1. August 2026 Bescheid.",
  contactTitle: "Kontakt",
  contactName: "Julian",
  contactPhone: "",
  contactEmail: "",
  sections: defaultSections(),
};

/** Standard-Inhalte (Koreanisch). Koennen im Admin-Bereich ueberschrieben werden. */
export const defaultContentKo: SiteContent = {
  theme: "romantic",
  coupleNames: "Anna & Jonas",
  weddingDate: "2026-09-12",
  locationName: "무스터슈타트 성 정원",
  heroTitle: "결혼합니다!",
  heroSubtitle: "안나 & 요나스 · 2026년 9월 12일",
  heroObjectPosition: "center",
  scheduleTitle: "일정",
  schedule: [
    { time: "14:00", title: "예식", description: "무스터슈타트 구청" },
    { time: "15:30", title: "샴페인 리셉션", description: "성 정원" },
    { time: "18:00", title: "만찬 & 피로연", description: "연회장" },
  ],
  mapTitle: "오시는 길",
  mapEmbedUrl:
    "https://www.openstreetmap.org/export/embed.html?bbox=13.4049%2C52.5200%2C13.4290%2C52.5300&layer=mapnik&marker=52.5200%2C13.4050",
  faqTitle: "FAQ",
  faq: [
    { question: "무엇을 입으면 되나요?", answer: "격식 있으면서 편안하게 입어 주세요." },
    { question: "주차는 어디에 할 수 있나요?", answer: "성 정원 바로 옆에 주차장이 있습니다." },
    { question: "언제까지 회신하면 되나요?", answer: "2026년 8월 1일까지 부탁드립니다." },
  ],
  rsvpTitle: "참석 여부",
  rsvpSubtitle: "2026년 8월 1일까지 알려주세요.",
  contactTitle: "연락처",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  sections: defaultSections(
    "우리의 이야기",
    "두 분이 어떻게 만나게 되었는지, 그리고 이 날을 함께 축하하고 싶은 이유에 대해 몇 마디 적어 주세요."
  ),
};
