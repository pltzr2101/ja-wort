import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST as rsvpPost } from "@/app/api/rsvp/route";
import { GET as uploadGet } from "@/app/api/uploads/[filename]/route";
import { getDb } from "@/lib/db";

const ORIGINAL_GATE = process.env.GUEST_GATE_ENABLED;

function restoreGate() {
  if (ORIGINAL_GATE === undefined) delete process.env.GUEST_GATE_ENABLED;
  else process.env.GUEST_GATE_ENABLED = ORIGINAL_GATE;
}

function rsvpRequest(ip: string): NextRequest {
  return new NextRequest("http://localhost/api/rsvp", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify({ name: "Max Mustermann", attending: "no", website: "" }),
  });
}

describe("RSVP bei deaktiviertem Gaeste-Gate", () => {
  afterEach(() => {
    restoreGate();
    getDb().prepare("DELETE FROM rsvps").run();
  });

  it("akzeptiert eine Antwort ohne Session, wenn das Gate deaktiviert ist", async () => {
    process.env.GUEST_GATE_ENABLED = "false";
    const res = await rsvpPost(rsvpRequest("10.0.0.11"));
    expect(res.status).toBe(200);
  });

  it("verlangt weiterhin eine Session, wenn das Gate aktiv ist", async () => {
    process.env.GUEST_GATE_ENABLED = "true";
    const res = await rsvpPost(rsvpRequest("10.0.0.12"));
    expect(res.status).toBe(401);
  });
});

describe("Bilder bei deaktiviertem Gaeste-Gate", () => {
  // Ein formal gueltiger, aber nicht existierender Dateiname: Der Session-Check
  // (401) muss vor der Datei-Prüfung (404) greifen, damit der Test den
  // Unterschied zwischen "Gate an" und "Gate aus" sichtbar macht.
  const missing = `${"f".repeat(32)}.jpg`;

  afterEach(() => {
    restoreGate();
  });

  it("liefert Bilder ohne Session aus, wenn das Gate deaktiviert ist", async () => {
    process.env.GUEST_GATE_ENABLED = "false";
    const res = await uploadGet(new NextRequest("http://localhost/api/uploads/x"), {
      params: Promise.resolve({ filename: missing }),
    });
    // Kein 401 mehr: Session-Check wurde uebersprungen, nur die Datei fehlt.
    expect(res.status).toBe(404);
  });

  it("verlangt weiterhin eine Session, wenn das Gate aktiv ist", async () => {
    process.env.GUEST_GATE_ENABLED = "true";
    const res = await uploadGet(new NextRequest("http://localhost/api/uploads/x"), {
      params: Promise.resolve({ filename: missing }),
    });
    expect(res.status).toBe(401);
  });
});
