import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET as contentGet, PUT as contentPut } from "@/app/api/content/route";
import { defaultContent } from "@/content/default";
import { isSecureRequest, requireAnySession } from "@/lib/api";
import { getDb } from "@/lib/db";
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

function contentRequest(method: "GET" | "PUT", body: unknown, cookie?: string): NextRequest {
  return new NextRequest("http://localhost/api/content?locale=de", {
    method,
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie: `admin_session=${cookie}` } : {}),
    },
    ...(method === "PUT" ? { body: JSON.stringify(body) } : {}),
  });
}

describe("PUT /api/content", () => {
  afterEach(() => {
    getDb().prepare("DELETE FROM content").run();
  });

  it("lehnt Anfragen ohne Admin-Session ab", async () => {
    const res = await contentPut(contentRequest("PUT", defaultContent));
    expect(res.status).toBe(401);
  });

  it("speichert einen gueltigen Inhaltssatz", async () => {
    const admin = createSession("admin");
    const res = await contentPut(
      contentRequest("PUT", { ...defaultContent, heroTitle: "Neuer Titel" }, admin)
    );
    expect(res.status).toBe(200);

    const stored = await contentGet(contentRequest("GET", null, admin));
    const data = (await stored.json()) as { heroTitle?: string };
    expect(data.heroTitle).toBe("Neuer Titel");
  });

  it("lehnt ungueltige Inhalte mit 400 ab, statt sie zu speichern", async () => {
    const admin = createSession("admin");
    const res = await contentPut(contentRequest("PUT", { theme: "neon" }, admin));
    expect(res.status).toBe(400);

    const stored = await contentGet(contentRequest("GET", null, admin));
    const data = (await stored.json()) as { theme?: string };
    expect(data.theme).not.toBe("neon");
  });

  it("persistiert keine unbekannten Felder aus dem Body", async () => {
    const admin = createSession("admin");
    const res = await contentPut(
      contentRequest(
        "PUT",
        { ...defaultContent, hackerPayload: "<script>alert(1)</script>" },
        admin
      )
    );
    expect(res.status).toBe(200);

    const stored = await contentGet(contentRequest("GET", null, admin));
    const data = (await stored.json()) as Record<string, unknown>;
    expect(data).not.toHaveProperty("hackerPayload");
  });
});
