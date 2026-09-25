import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api";
import { getDb } from "@/lib/db";

interface RsvpRow {
  name: string;
  attending: number;
  guests: number | null;
  additional_names: string | null;
  has_children: number | null;
  children_ages: string | null;
  needs_accommodation: number | null;
  note: string | null;
  created_at: string;
}

/** CSV-Export aller Anmeldungen (nur Admin). */
export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const rows = getDb()
    .prepare(
      `SELECT name, attending, guests, additional_names, has_children, children_ages,
              needs_accommodation, note, created_at
       FROM rsvps ORDER BY id DESC`
    )
    .all() as RsvpRow[];

  const header = [
    "Name",
    "Zusage",
    "Personenzahl",
    "Weitere Personen",
    "Kinder",
    "Alter der Kinder",
    "Unterkunft-Hilfe",
    "Notiz",
    "Eingegangen",
  ];

  const escape = (value: string): string => `"${value.replace(/"/g, '""')}"`;
  const lines = rows.map((row) =>
    [
      row.name,
      row.attending === 1 ? "Zusage" : "Absage",
      row.guests?.toString() ?? "",
      row.additional_names ?? "",
      row.has_children === null ? "" : row.has_children === 1 ? "Ja" : "Nein",
      row.children_ages ?? "",
      row.needs_accommodation === null ? "" : row.needs_accommodation === 1 ? "Ja" : "Nein",
      row.note ?? "",
      row.created_at,
    ]
      .map(escape)
      .join(";")
  );

  const csv = `\uFEFF${[header.map(escape).join(";"), ...lines].join("\n")}`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="anmeldungen.csv"',
    },
  });
}
