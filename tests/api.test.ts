import { describe, expect, it } from "vitest";
import { isSecureRequest } from "@/lib/api";

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
