import { redirect } from "next/navigation";
import { isGuestGateEnabled } from "@/lib/auth";
import { getSessionKind } from "@/lib/server-auth";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import GateForm from "@/components/GateForm";
import LanguageToggle from "@/components/LanguageToggle";

export const dynamic = "force-dynamic";

/**
 * Anmeldeseite fuer Gaeste. Bereits Angemeldete werden weitergeleitet.
 * Ist das Gaeste-Gate deaktiviert (GUEST_GATE_ENABLED=false), wird direkt
 * auf die Website weitergeleitet, da hier keine Anmeldung noetig ist.
 */
export default async function GatePage() {
  if (!isGuestGateEnabled()) redirect("/");

  const kind = await getSessionKind();
  if (kind !== null) redirect("/");

  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <p className="text-muted">{dict.gate.subtitle}</p>
        <div className="mt-4 flex justify-center">
          <LanguageToggle locale={locale} />
        </div>
        <div className="mt-8">
          <GateForm locale={locale} />
        </div>
      </div>
    </main>
  );
}
