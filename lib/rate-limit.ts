/**
 * Einfacher In-Memory Fixed-Window-Rate-Limiter.
 * Fuer den Betrieb als einzelner Container (eine Instanz) ausreichend.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Liefert den ersten, getrimmten Eintrag einer Liste oder null (leer/fehlend). */
function firstValue(header: string | null): string | null {
  if (!header) return null;
  const value = header.split(",")[0]?.trim();
  return value ? value : null;
}

/**
 * Bestimmt einen stabilen Client-Schluessel aus den Forwarding-Headern.
 *
 * Vertrauensmodell: Die App laeuft hinter einem Reverse-Proxy (Cloudflare bzw.
 * LXC-Proxy), der `X-Forwarded-For` auf die Client-IP setzt – der erste
 * Eintrag ist daher der Client. Diese Header sind nur so vertrauenswuerdig wie
 * der vorgeschaltete Proxy: Wer den Container direkt (ohne Proxy) erreicht,
 * kann sie faelschen und damit das Rate-Limit umgehen. Fuer den vorgesehenen
 * Betrieb (nur ueber den Proxy erreichbar) ist das ausreichend.
 *
 * Leere Header-Werte werden uebersprungen, damit ein leerer `X-Forwarded-For`
 * nicht alle Clients in einem gemeinsamen Bucket zusammenfasst.
 */
export function clientKey(req: Request): string {
  return (
    firstValue(req.headers.get("x-forwarded-for")) ??
    firstValue(req.headers.get("x-real-ip")) ??
    firstValue(req.headers.get("cf-connecting-ip")) ??
    "unknown"
  );
}

/** Mindestabstand zwischen zwei automatischen Prune-Laeufen. */
const PRUNE_INTERVAL_MS = 10 * 60 * 1000; // 10 Minuten
let lastPruneAt = 0;

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; remaining: number } {
  const now = Date.now();

  // Abgelaufene Eintraege gelegentlich entfernen, damit die Map bei
  // dauerhaftem Betrieb nicht unbegrenzt waechst.
  if (now - lastPruneAt > PRUNE_INTERVAL_MS) {
    pruneBuckets();
    lastPruneAt = now;
  }

  const existing = buckets.get(key);

  if (!existing || now > existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (existing.count >= limit) {
    return { ok: false, remaining: 0 };
  }

  existing.count += 1;
  return { ok: true, remaining: limit - existing.count };
}

/** Entfernt abgelaufene Eintraege (optional, haelt den Speicher klein). */
export function pruneBuckets(): void {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}
