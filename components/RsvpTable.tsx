"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { RsvpRow } from "@/lib/rsvps";

interface Props {
  initial: RsvpRow[];
}

/** Tabelle aller Anmeldungen mit Loesch-Funktion (rotes X + Bestaetigung). */
export default function RsvpTable({ initial }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<RsvpRow[]>(initial);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: number) {
    if (!window.confirm("Möchtest du diese Anmeldung wirklich löschen?")) return;
    setError(null);

    try {
      const res = await fetch("/api/rsvp", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        setError("Loeschen fehlgeschlagen.");
        return;
      }
      setRows((prev) => prev.filter((row) => row.id !== id));
      router.refresh();
    } catch {
      setError("Netzwerkfehler. Bitte versuche es erneut.");
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="rounded-lg border border-border bg-surface px-6 py-10 text-center text-muted">
          Noch keine Anmeldungen eingegangen.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Antwort</th>
                <th className="px-4 py-3 font-medium">Personen</th>
                <th className="px-4 py-3 font-medium">Kinder</th>
                <th className="px-4 py-3 font-medium">Unterkunft</th>
                <th className="px-4 py-3 font-medium">Notiz</th>
                <th className="px-4 py-3 font-medium">Eingegangen</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">Aktionen</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((rsvp) => (
                <tr key={rsvp.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{rsvp.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        rsvp.attending ? "font-medium text-green-600" : "font-medium text-red-600"
                      }
                    >
                      {rsvp.attending ? "Zusage" : "Absage"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{rsvp.guests ?? "–"}</td>
                  <td className="px-4 py-3">
                    {rsvp.hasChildren === null
                      ? "–"
                      : rsvp.hasChildren
                        ? `Ja (${rsvp.childrenAges || "Alter o. A."})`
                        : "Nein"}
                  </td>
                  <td className="px-4 py-3">
                    {rsvp.needsAccommodation === null
                      ? "–"
                      : rsvp.needsAccommodation
                        ? "Ja"
                        : "Nein"}
                  </td>
                  <td className="max-w-xs px-4 py-3">{rsvp.note ?? "–"}</td>
                  <td className="px-4 py-3 text-muted">{rsvp.createdAt}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleDelete(rsvp.id)}
                      className="rounded-lg border border-border px-2 text-red-600 transition hover:bg-red-50"
                      aria-label={`Anmeldung von ${rsvp.name} löschen`}
                      title="Löschen"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
