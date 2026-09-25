import { defaultContent, type SiteContent } from "@/content/default";
import { getDb } from "./db";

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
    sections: Array.isArray(override.sections) ? override.sections : base.sections,
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
