import { getRsvps } from "@/lib/rsvps";
import RsvpTable from "@/components/RsvpTable";

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

      <RsvpTable initial={rsvps} />
    </div>
  );
}
