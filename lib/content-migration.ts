import Database from "better-sqlite3";
import { defaultContent, defaultContentKo, type SiteContent } from "@/content/default";

type JsonObject = Record<string, unknown>;

/**
 * Deutsch -> Koreanisch fuer Standard-Felder, die in der koreanischen Fassung
 * noch als deutscher Default stehen koennen (z. B. weil sie frueher ueber
 * "Aus Deutsch uebernehmen" kopiert wurden). Bereits individualisierte Werte
 * bleiben unangetastet.
 */
const STRING_TRANSLATIONS: Record<string, string> = {
  "Schlossgarten Musterstadt": defaultContentKo.locationName,
  "Wir heiraten!": defaultContentKo.heroTitle,
  "Anna & Jonas · 12. September 2026": defaultContentKo.heroSubtitle,
  Ablauf: defaultContentKo.scheduleTitle,
  "So findet ihr uns": defaultContentKo.mapTitle,
  "Zu- oder Absage": defaultContentKo.rsvpTitle,
  "Bitte gebt uns bis zum 1. August 2026 Bescheid.": defaultContentKo.rsvpSubtitle,
  Kontakt: defaultContentKo.contactTitle,
  // Legacy: Der FAQ-Titel war vor der Vereinheitlichung auf "FAQ" deutsch.
  "Haeufige Fragen": defaultContentKo.faqTitle,
  "Häufige Fragen": defaultContentKo.faqTitle,
};

const STRING_FIELDS: (keyof SiteContent)[] = [
  "locationName",
  "heroTitle",
  "heroSubtitle",
  "scheduleTitle",
  "mapTitle",
  "faqTitle",
  "rsvpTitle",
  "rsvpSubtitle",
  "contactTitle",
];

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Ersetzt in einer gespeicherten koreanischen Inhaltssatz-Fassung die noch
 * deutschen Standardwerte (Titel, Ablauf, FAQ, Story-Text) durch ihre
 * koreanischen Entsprechungen. Custom-Werte bleiben unveraendert.
 */
export function translateKoreanContent(parsed: Partial<SiteContent>): Partial<SiteContent> {
  const out: JsonObject = { ...(parsed as JsonObject) };

  for (const field of STRING_FIELDS) {
    const key = field as string;
    const value = out[key];
    if (typeof value === "string" && value in STRING_TRANSLATIONS) {
      out[key] = STRING_TRANSLATIONS[value];
    }
  }

  if (Array.isArray(out.schedule) && deepEqual(out.schedule, defaultContent.schedule)) {
    out.schedule = defaultContentKo.schedule;
  }
  if (Array.isArray(out.faq) && deepEqual(out.faq, defaultContent.faq)) {
    out.faq = defaultContentKo.faq;
  }

  const deStory = defaultContent.sections.find((section) => section.type === "text");
  const koStory = defaultContentKo.sections.find((section) => section.type === "text");
  if (Array.isArray(out.sections) && deStory && koStory) {
    out.sections = (out.sections as JsonObject[]).map((section) => {
      if (section.type !== "text") return section;
      const next = { ...section };
      if (next.title === deStory.title) next.title = koStory.title;
      if (next.text === deStory.text) next.text = koStory.text;
      return next;
    });
  }

  return out as Partial<SiteContent>;
}

/**
 * Uebersetzt die koreanische Inhaltszeile (key = "site:ko") in der Datenbank,
 * falls sie noch deutsche Standardwerte enthaelt. Idempotent: laeuft bei jedem
 * Start, schreibt aber nur, wenn sich tatsaechlich etwas geaendert hat.
 */
export function migrateKoreanContent(database: Database.Database): void {
  const row = database.prepare("SELECT value_json FROM content WHERE key = 'site:ko'").get() as
    { value_json: string } | undefined;
  if (!row) return;

  let parsed: unknown;
  try {
    parsed = JSON.parse(row.value_json);
  } catch {
    return;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return;

  const translated = JSON.stringify(translateKoreanContent(parsed as Partial<SiteContent>));
  if (translated === row.value_json) return;

  database
    .prepare(
      "UPDATE content SET value_json = ?, updated_at = CURRENT_TIMESTAMP WHERE key = 'site:ko'"
    )
    .run(translated);
}

/**
 * Bekannte deutsche Legacy-Werte mit ausgeschriebenen Umlauten (ae/oe/ue),
 * die in aelteren Datenbank-Staenden gespeichert sein koennen. Diese werden
 * durch die korrekte Schreibweise ersetzt; individualisierte Werte bleiben
 * unangetastet.
 */
const GERMAN_UMLAUT_FIXES: Record<string, string> = {
  // Der deutsche FAQ-Titel war vor der Vereinheitlichung auf "FAQ" deutsch.
  "Haeufige Fragen": "Häufige Fragen",
};

/** Alter deutscher Story-Text (ausgeschriebene Umlaute). */
const LEGACY_STORY_TEXT =
  "Hier koennt ihr ein paar Worte ueber euch schreiben – wie ihr euch kennengelernt habt und warum ihr diesen Tag gemeinsam feiern moechtet.";

/**
 * Ersetzt in einem gespeicherten deutschen Inhaltssatz ausgeschriebene Umlaute
 * in bekannten Legacy-Werten durch die korrekte Schreibweise.
 */
export function fixGermanUmlauts(parsed: Partial<SiteContent>): Partial<SiteContent> {
  const out: JsonObject = { ...(parsed as JsonObject) };

  for (const field of STRING_FIELDS) {
    const key = field as string;
    const value = out[key];
    if (typeof value === "string" && value in GERMAN_UMLAUT_FIXES) {
      out[key] = GERMAN_UMLAUT_FIXES[value];
    }
  }

  const deStoryText = defaultContent.sections.find((section) => section.type === "text")?.text;
  if (Array.isArray(out.sections) && deStoryText) {
    out.sections = (out.sections as JsonObject[]).map((section) => {
      if (section.type !== "text" || section.text !== LEGACY_STORY_TEXT) return section;
      return { ...section, text: deStoryText };
    });
  }

  return out as Partial<SiteContent>;
}

/**
 * Korrigiert die gespeicherte deutsche Inhaltszeile (key = "site:de"), falls
 * sie noch ausgeschriebene Umlaute enthaelt (z. B. den alten FAQ-Titel
 * "Haeufige Fragen"). Idempotent: laeuft bei jedem Start, schreibt aber nur,
 * wenn sich tatsaechlich etwas geaendert hat.
 */
export function migrateGermanUmlauts(database: Database.Database): void {
  const row = database.prepare("SELECT value_json FROM content WHERE key = 'site:de'").get() as
    { value_json: string } | undefined;
  if (!row) return;

  let parsed: unknown;
  try {
    parsed = JSON.parse(row.value_json);
  } catch {
    return;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return;

  const fixed = JSON.stringify(fixGermanUmlauts(parsed as Partial<SiteContent>));
  if (fixed === row.value_json) return;

  database
    .prepare(
      "UPDATE content SET value_json = ?, updated_at = CURRENT_TIMESTAMP WHERE key = 'site:de'"
    )
    .run(fixed);
}
