import {
  defaultContent,
  defaultContentKo,
  defaultSections,
  sectionOrder,
  type Locale,
  type SectionType,
  type SiteContent,
  type SiteSection,
} from "@/content/default";
import { getDb } from "./db";

/** DB-Key eines Sprach-Inhaltssatzes. */
function rowKey(locale: Locale): string {
  return `site:${locale}`;
}

/** Standard-Inhaltssatz fuer eine Sprache (Fallback ohne DB-Daten). */
export function defaultForLocale(locale: Locale): SiteContent {
  return locale === "ko" ? defaultContentKo : defaultContent;
}

const SECTION_TYPES: SectionType[] = [...sectionOrder, "image", "text"];

function isSectionType(value: unknown): value is SectionType {
  return typeof value === "string" && SECTION_TYPES.includes(value as SectionType);
}

/**
 * Loest den Roh-Typ einer Sektion auf. Der alte Singleton-Typ "story" wird
 * dabei auf die wiederholbare Text-Sektion "text" migriert.
 */
function resolveType(raw: Record<string, unknown>): SectionType | null {
  const candidate =
    typeof raw.type === "string" ? raw.type : typeof raw.id === "string" ? raw.id : null;
  if (candidate === "story") return "text";
  return isSectionType(candidate) ? candidate : null;
}

/**
 * Normalisiert eine Sektions-Liste in das aktuelle Shape.
 *
 * Migriert abwaertskompatibel das alte Shape `{ id, enabled }[]` nach
 * `{ key, type, enabled }` sowie den alten "story"-Singleton in eine
 * "text"-Sektion (Titel/Text kommen aus den optionalen Legacy-Argumenten).
 * Singleton-Sektionen werden dedupliziert und bei Fehlen wieder ergaenzt;
 * `key`s werden bei Bedarf eindeutig gemacht. Damit bleibt die Seite auch mit
 * alten/kaputten DB-Daten immer renderbar.
 */
export function normalizeSections(
  input: unknown,
  legacyStoryTitle?: string,
  legacyStoryText?: string
): SiteSection[] {
  if (!Array.isArray(input)) return defaultSections();

  const result: SiteSection[] = [];
  const seenSingleton = new Set<SectionType>();
  const usedKeys = new Set<string>();
  let counter = 0;

  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const raw = item as Record<string, unknown>;

    const rawType =
      typeof raw.type === "string" ? raw.type : typeof raw.id === "string" ? raw.id : null;
    const type = resolveType(raw);
    if (!type) continue;

    if (type !== "image" && type !== "text") {
      if (seenSingleton.has(type)) continue;
      seenSingleton.add(type);
    }

    let key = typeof raw.key === "string" && raw.key.trim() !== "" ? raw.key.trim() : "";
    if (key === "" || usedKeys.has(key)) {
      do {
        key = `${type}-${counter++}`;
      } while (usedKeys.has(key));
    }
    usedKeys.add(key);

    const section: SiteSection = {
      key,
      type,
      enabled: raw.enabled !== false,
    };
    if (typeof raw.imageId === "number") section.imageId = raw.imageId;
    if (typeof raw.caption === "string") section.caption = raw.caption;
    if (typeof raw.objectPosition === "string") section.objectPosition = raw.objectPosition;
    if (raw.objectFit === "cover" || raw.objectFit === "contain") section.objectFit = raw.objectFit;
    if (type === "text") {
      const title =
        typeof raw.title === "string"
          ? raw.title
          : rawType === "story"
            ? legacyStoryTitle
            : undefined;
      if (title !== undefined) section.title = title;
      const text =
        typeof raw.text === "string" ? raw.text : rawType === "story" ? legacyStoryText : undefined;
      if (text !== undefined) section.text = text;
    }
    result.push(section);
  }

  // Eine (kaputte) Liste ohne einzige gueltige Sektion faellt vollstaendig auf
  // die Standard-Sektionen zurueck – konsistent zum Nicht-Array-Fall.
  if (result.length === 0) return defaultSections();

  for (const type of sectionOrder) {
    if (!seenSingleton.has(type)) {
      result.push({ key: type, type, enabled: true });
    }
  }

  return result;
}

/**
 * Merged die gespeicherten Inhalte ueber die Defaults (tief genug fuer
 * Arrays wie schedule/faq/sections). Unbekannte/beschaedigte Werte werden
 * ignoriert, damit die Seite nie kaputtgeht.
 */
export function mergeContent(base: SiteContent, override: Partial<SiteContent>): SiteContent {
  // Alte Daten koennen noch die top-level Story-Felder enthalten; diese werden
  // in die neue "text"-Sektion uebernommen und danach verworfen.
  const legacy = override as Partial<SiteContent> & {
    storyTitle?: unknown;
    storyText?: unknown;
  };
  const legacyStoryTitle = typeof legacy.storyTitle === "string" ? legacy.storyTitle : undefined;
  const legacyStoryText = typeof legacy.storyText === "string" ? legacy.storyText : undefined;

  const sections = normalizeSections(
    Array.isArray(override.sections) ? override.sections : base.sections,
    legacyStoryTitle,
    legacyStoryText
  );

  // Alte Story-Felder nicht in den persistierten Inhalt zurueckschreiben.
  const cleanOverride: Record<string, unknown> = { ...override };
  delete cleanOverride.storyTitle;
  delete cleanOverride.storyText;

  return {
    ...base,
    ...cleanOverride,
    schedule: Array.isArray(override.schedule) ? override.schedule : base.schedule,
    faq: Array.isArray(override.faq) ? override.faq : base.faq,
    sections,
  };
}

/**
 * Liest einen Sprach-Inhaltssatz (Defaults + DB-Ueberschreibungen).
 * Faellt auf die sprachabhaengigen Defaults zurueck, wenn nichts gespeichert
 * wurde.
 */
function readContent(locale: Locale): SiteContent {
  const fallback = defaultForLocale(locale);
  try {
    const row = getDb()
      .prepare("SELECT value_json FROM content WHERE key = ?")
      .get(rowKey(locale)) as { value_json: string } | undefined;

    if (!row) return fallback;

    const parsed = JSON.parse(row.value_json) as Partial<SiteContent>;
    return mergeContent(fallback, parsed);
  } catch {
    return fallback;
  }
}

/**
 * Uebernimmt die Sektions-Struktur aus dem deutschen Inhaltssatz und setzt nur
 * fuer Text-Sektionen (Titel/Text) die sprachabhaengigen Werte ein. So bleibt
 * Aufbau/Reihenfolge identisch, waehrend Textbloecke pro Sprache gepflegt
 * werden koennen. Fehlt in der Zielsprache eine Text-Sektion (z. B. neu in DE
 * angelegt), faellt sie auf den deutschen Text zurueck.
 */
function mergeTextSections(deSections: SiteSection[], localSections: SiteSection[]): SiteSection[] {
  return deSections.map((deSection) => {
    if (deSection.type !== "text") return deSection;
    const local = localSections.find(
      (section) => section.type === "text" && section.key === deSection.key
    );
    if (!local) return deSection;
    return {
      ...deSection,
      title: local.title,
      text: local.text,
    };
  });
}

/**
 * Liest die Inhalte fuer eine Sprache. Theme, Titelbild-Fokus und die
 * Sektions-Struktur sind sprachuebergreifend geteilt und kommen immer aus dem
 * deutschen Inhaltssatz; nur die Texte der Text-Sektionen sind pro Sprache
 * getrennt.
 */
export function getContent(locale: Locale = "de"): SiteContent {
  const content = readContent(locale);
  if (locale === "de") return content;

  const de = readContent("de");
  return {
    ...content,
    theme: de.theme,
    heroObjectPosition: de.heroObjectPosition,
    sections: mergeTextSections(de.sections, content.sections),
  };
}

/** Speichert einen Sprach-Inhaltssatz als JSON in der DB (Upsert). */
export function saveContent(content: SiteContent, locale: Locale = "de"): void {
  getDb()
    .prepare(
      `INSERT INTO content (key, value_json) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = CURRENT_TIMESTAMP`
    )
    .run(rowKey(locale), JSON.stringify(content));
}
