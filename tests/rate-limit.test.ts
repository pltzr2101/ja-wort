import { describe, expect, it } from "vitest";
import { clientKey, pruneBuckets, rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("erlaubt Anfragen bis zum Limit", () => {
    const key = `test-${Math.random()}`;
    expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    expect(rateLimit(key, 3, 60_000).ok).toBe(true);
  });

  it("blockiert Anfragen ueber dem Limit", () => {
    const key = `test-${Math.random()}`;
    rateLimit(key, 2, 60_000);
    rateLimit(key, 2, 60_000);
    expect(rateLimit(key, 2, 60_000).ok).toBe(false);
  });

  it("setzt das Fenster nach Ablauf zurueck", () => {
    const key = `test-${Math.random()}`;
    rateLimit(key, 1, 10);
    // Fenster (10 ms) abwarten, dann sollte wieder erlaubt sein.
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(rateLimit(key, 1, 10).ok).toBe(true);
        resolve();
      }, 20);
    });
  });

  it("behandelt verschiedene Keys unabhaengig", () => {
    expect(rateLimit(`a-${Math.random()}`, 1, 60_000).ok).toBe(true);
    expect(rateLimit(`b-${Math.random()}`, 1, 60_000).ok).toBe(true);
  });
});

describe("clientKey", () => {
  it("nutzt den ersten Eintrag von X-Forwarded-For", () => {
    const req = new Request("http://localhost/api", {
      headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" },
    });
    expect(clientKey(req)).toBe("203.0.113.7");
  });

  it("faellt auf X-Real-IP zurueck", () => {
    const req = new Request("http://localhost/api", {
      headers: { "x-real-ip": "198.51.100.2" },
    });
    expect(clientKey(req)).toBe("198.51.100.2");
  });

  it("faellt auf CF-Connecting-IP zurueck", () => {
    const req = new Request("http://localhost/api", {
      headers: { "cf-connecting-ip": "192.0.2.9" },
    });
    expect(clientKey(req)).toBe("192.0.2.9");
  });

  it("ueberspringt leere Header-Werte", () => {
    const req = new Request("http://localhost/api", {
      headers: { "x-forwarded-for": " , ", "x-real-ip": "198.51.100.2" },
    });
    expect(clientKey(req)).toBe("198.51.100.2");
  });

  it("liefert unknown ohne identifizierenden Header", () => {
    expect(clientKey(new Request("http://localhost/api"))).toBe("unknown");
  });
});

describe("pruneBuckets", () => {
  it("entfernt abgelaufene Eintraege und behaelt aktive", () => {
    const activeKey = `keep-${Math.random()}`;
    const expiredKey = `drop-${Math.random()}`;

    rateLimit(activeKey, 1, 60_000); // aktiv (Fenster weit in der Zukunft)
    rateLimit(expiredKey, 1, 1); // laeuft sofort ab

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        pruneBuckets();
        // Aktiver Eintrag bleibt: naechster Call ueber dem Limit -> blockiert.
        expect(rateLimit(activeKey, 1, 60_000).ok).toBe(false);
        // Abgelaufener Eintrag wurde entfernt: naechster Call wieder erlaubt.
        expect(rateLimit(expiredKey, 1, 60_000).ok).toBe(true);
        resolve();
      }, 20);
    });
  });
});
