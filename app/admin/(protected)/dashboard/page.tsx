import { getRsvps } from "@/lib/rsvps";

export const dynamic = "force-dynamic";

/** Uebersicht aller RSVP-Anmeldungen mit CSV-Export. */
export default function DashboardPage() {
  const rsvps = getRsvps();
  const attending = rsvps.filter((r) => r.attending).length;
  const declining = rsvps.filter((r) => !r.attending).length;
  const totalGuests = rsvps.reduce((sum, r) => sum + (r.attending ? (r.guests ?? 0) : 0), 0);

  const stats = [
    { label: "Anmeldungen", value: rsvps.length },
    { label: "Zusagen", value: attending },
    { label: "Absagen", value: declining },
    { label: "Gaeste gesamt", value: totalGuests },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-semibold">Anmeldungen</h1>
        <a
          href="/api/rsvp/export"
          className="rounded-full bg-accent px-6 py-2 text-sm font-medium uppercase tracking-widest text-white transition hover:opacity-90"
        >
          CSV exportieren
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-surface px-6 py-5">
            <div className="font-serif text-3xl font-semibold text-accent">{stat.value}</div>
            <div className="mt-1 text-sm text-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      {rsvps.length === 0 ? (
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
              </tr>
            </thead>
            <tbody>
              {rsvps.map((rsvp) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
