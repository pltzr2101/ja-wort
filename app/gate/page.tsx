import { redirect } from "next/navigation";
import { getSessionKind } from "@/lib/server-auth";
import GateForm from "@/components/GateForm";

export const dynamic = "force-dynamic";

/** Anmeldeseite fuer Gaeste. Bereits Angemeldete werden weitergeleitet. */
export default async function GatePage() {
  const kind = await getSessionKind();
  if (kind !== null) redirect("/");

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-serif text-5xl font-semibold text-accent">JaWort</h1>
        <p className="mt-3 text-muted">Bitte gib das Passwort ein, um die Seite zu sehen.</p>
        <div className="mt-8">
          <GateForm />
        </div>
      </div>
    </main>
  );
}
