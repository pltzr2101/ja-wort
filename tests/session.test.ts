import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createSession, verifySession } from "@/lib/session";

describe("session", () => {
  it("erstellt und verifiziert ein gueltiges Token", () => {
    const token = createSession("guest");
    const result = verifySession(token);
    expect(result).not.toBeNull();
    expect(result?.kind).toBe("guest");
  });

  it("unterscheidet guest- und admin-Tokens", () => {
    expect(verifySession(createSession("admin"))?.kind).toBe("admin");
    expect(verifySession(createSession("guest"))?.kind).toBe("guest");
  });

  it("lehnt manipulierte Signaturen ab", () => {
    const token = createSession("guest");
    const parts = token.split(".");
    const tampered = `${parts[0]}.${parts[1]}.deadbeef`;
    expect(verifySession(tampered)).toBeNull();
  });

  it("lehnt ungueltige/leere Token ab", () => {
    expect(verifySession(undefined)).toBeNull();
    expect(verifySession("")).toBeNull();
    expect(verifySession("nonsense")).toBeNull();
    expect(verifySession("evil.123.abcdef")).toBeNull();
  });

  it("lehnt unbekannte Session-Arten ab", () => {
    // Token mit gueltiger Signatur, aber unbekannter Art
    const payload = "superuser.123";
    const sig = createHmac("sha256", process.env.SESSION_SECRET as string)
      .update(payload)
      .digest("hex");
    expect(verifySession(`${payload}.${sig}`)).toBeNull();
  });
});
