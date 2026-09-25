import { NextRequest, NextResponse } from "next/server";
import { requireGuest } from "@/lib/api";
import { getDb } from "@/lib/db";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { rsvpSchema } from "@/lib/validation";

/** Nimmt eine RSVP-Antwort entgegen (nur angemeldete Gaeste). */
export async function POST(req: NextRequest) {
  const limit = rateLimit(`rsvp:${clientKey(req)}`, 10, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte versuche es spaeter erneut." },
      { status: 429 }
    );
  }

  if (!requireGuest(req)) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Ungueltige Anfrage." }, { status: 400 });
  }

  // Honeypot: Bots fuellen versteckte Felder aus – Antwort still akzeptieren.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Bitte ueberpruefe deine Eingaben.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  getDb()
    .prepare(
      `INSERT INTO rsvps
        (name, attending, guests, has_children, children_ages, needs_accommodation, note)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      data.name,
      data.attending === "yes" ? 1 : 0,
      data.guests ?? null,
      data.hasChildren === null || data.hasChildren === undefined ? null : data.hasChildren ? 1 : 0,
      data.childrenAges ?? null,
      data.needsAccommodation === null || data.needsAccommodation === undefined
        ? null
        : data.needsAccommodation
          ? 1
          : 0,
      data.note ?? null
    );

  return NextResponse.json({ ok: true });
}
