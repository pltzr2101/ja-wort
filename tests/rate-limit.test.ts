import { describe, expect, it } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

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
