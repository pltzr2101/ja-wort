import { afterEach, describe, expect, it } from "vitest";
import { isGuestGateEnabled, verifyGuestPassword } from "@/lib/auth";

const ORIGINAL_GATE = process.env.GUEST_GATE_ENABLED;
const ORIGINAL_GUEST = process.env.GUEST_PASSWORD;

describe("isGuestGateEnabled", () => {
  afterEach(() => {
    if (ORIGINAL_GATE === undefined) delete process.env.GUEST_GATE_ENABLED;
    else process.env.GUEST_GATE_ENABLED = ORIGINAL_GATE;
  });

  it("ist standardmaessig aktiv (ohne gesetzte Variable)", () => {
    delete process.env.GUEST_GATE_ENABLED;
    expect(isGuestGateEnabled()).toBe(true);
  });

  it("ist aktiv bei explizit gesetzter true", () => {
    process.env.GUEST_GATE_ENABLED = "true";
    expect(isGuestGateEnabled()).toBe(true);
  });

  it("ist deaktiviert bei false", () => {
    process.env.GUEST_GATE_ENABLED = "false";
    expect(isGuestGateEnabled()).toBe(false);
  });

  it("ist aktiv bei jedem anderen Wert als false", () => {
    process.env.GUEST_GATE_ENABLED = "0";
    expect(isGuestGateEnabled()).toBe(true);
  });
});

describe("verifyGuestPassword", () => {
  afterEach(() => {
    if (ORIGINAL_GUEST === undefined) delete process.env.GUEST_PASSWORD;
    else process.env.GUEST_PASSWORD = ORIGINAL_GUEST;
  });

  it("akzeptiert das gesetzte Gast-Passwort", () => {
    process.env.GUEST_PASSWORD = "geheim123";
    expect(verifyGuestPassword("geheim123")).toBe(true);
    expect(verifyGuestPassword("falsch")).toBe(false);
  });

  it("lehnt bei leerem Gast-Passwort alles ab", () => {
    delete process.env.GUEST_PASSWORD;
    expect(verifyGuestPassword("irgendwas")).toBe(false);
  });
});
