import {
  defaultContent,
  sectionOrder,
  type SectionType,
  type SiteContent,
  type SiteSection,
} from "@/content/default";
import { getDb } from "./db";

const SECTION_TYPES: SectionType[] = [...sectionOrder, "image"];

function isSectionType(value: unknown): value is SectionType {
  return typeof value === "string" && SECTION_TYPES.includes(value as SectionType);
}

/** Standard-Sektionen (jede Singleton-Sektion genau einmal, aktiviert). */
function defaultSections(): SiteSection[] {
  return sectionOrder.map((type) => ({ key: type, type, enabled: true }));
}

/**
 * Normalisiert eine Sektions-Liste in das aktuelle Shape.
 *
 * Migriert abwaertskompatibel das alte Shape `{ id, enabled }[]` nach
 * `{ key, type, enabled }`. Singleton-Sektionen werden dedupliziert und bei
 * Fehlen wieder ergaenzt; `key`s werden bei Bedarf eindeutig gemacht. Damit
 * bleibt die Seite auch mit alten/kaputten DB-Daten immer renderbar.
 */
export function normalizeSections(input: unknown): SiteSection[] {
  if (!Array.isArray(input)) return defaultSections();

  const result: SiteSection[] = [];
  const seenSingleton = new Set<SectionType>();
  const usedKeys = new Set<string>();
  let counter = 0;

  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const raw = item as Record<string, unknown>;

    const type = isSectionType(raw.type) ? raw.type : isSectionType(raw.id) ? raw.id : null;
    if (!type) continue;

    if (type !== "image") {
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
    result.push(section);
  }

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
  return {
    ...base,
    ...override,
    schedule: Array.isArray(override.schedule) ? override.schedule : base.schedule,
    faq: Array.isArray(override.faq) ? override.faq : base.faq,
    sections: normalizeSections(
      Array.isArray(override.sections) ? override.sections : base.sections
    ),
  };
}

/** Liest die aktuellen Inhalte (Defaults + DB-Ueberschreibungen). */
export function getContent(): SiteContent {
  try {
    const row = getDb().prepare("SELECT value_json FROM content WHERE key = 'site'").get() as
      { value_json: string } | undefined;

    if (!row) return defaultContent;

    const parsed = JSON.parse(row.value_json) as Partial<SiteContent>;
    return mergeContent(defaultContent, parsed);
  } catch {
    return defaultContent;
  }
}

/** Speichert die Inhalte als JSON in der DB (Upsert). */
export function saveContent(content: SiteContent): void {
  getDb()
    .prepare(
      `INSERT INTO content (key, value_json) VALUES ('site', ?)
       ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = CURRENT_TIMESTAMP`
    )
    .run(JSON.stringify(content));
}
