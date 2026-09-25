import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { isSecureRequest, requireAnySession } from "@/lib/api";
import { createSession } from "@/lib/session";

function reqWithCookies(cookies: Record<string, string>): NextRequest {
  const header = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
  return new NextRequest("http://localhost/api/rsvp", {
    headers: { cookie: header },
  });
}

describe("isSecureRequest", () => {
  it("erkennt HTTPS ueber X-Forwarded-Proto", () => {
    const req = new Request("http://localhost/api", {
      headers: { "x-forwarded-proto": "https" },
    });
    expect(isSecureRequest(req)).toBe(true);
  });

  it("erkennt HTTP ueber X-Forwarded-Proto", () => {
    const req = new Request("http://localhost/api", {
      headers: { "x-forwarded-proto": "http" },
    });
    expect(isSecureRequest(req)).toBe(false);
  });

  it("nimmt den ersten Wert bei mehreren Protos", () => {
    const req = new Request("http://localhost/api", {
      headers: { "x-forwarded-proto": "https, http" },
    });
    expect(isSecureRequest(req)).toBe(true);
  });

  it("faellt ohne Header auf das URL-Protokoll zurueck", () => {
    expect(isSecureRequest(new Request("https://example.com"))).toBe(true);
    expect(isSecureRequest(new Request("http://example.com"))).toBe(false);
  });

  it("liefert false bei ungueltiger URL", () => {
    expect(isSecureRequest(new Request("http://localhost", { headers: {} }))).toBe(false);
  });
});

describe("requireAnySession", () => {
  it("akzeptiert eine gueltige Gast-Session", () => {
    expect(requireAnySession(reqWithCookies({ guest_session: createSession("guest") }))).toBe(true);
  });

  it("akzeptiert eine gueltige Admin-Session (RSVP als Admin)", () => {
    expect(requireAnySession(reqWithCookies({ admin_session: createSession("admin") }))).toBe(true);
  });

  it("lehnt fehlende Cookies ab", () => {
    expect(requireAnySession(reqWithCookies({}))).toBe(false);
  });

  it("lehnt ungueltige/manipulierte Cookies ab", () => {
    expect(requireAnySession(reqWithCookies({ guest_session: "nonsense" }))).toBe(false);
    expect(requireAnySession(reqWithCookies({ admin_session: "evil.123.abcdef" }))).toBe(false);
  });
});
