import { redirect } from "next/navigation";
import { getSessionKind } from "@/lib/server-auth";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import GateForm from "@/components/GateForm";
import LanguageToggle from "@/components/LanguageToggle";

export const dynamic = "force-dynamic";

/** Anmeldeseite fuer Gaeste. Bereits Angemeldete werden weitergeleitet. */
export default async function GatePage() {
  const kind = await getSessionKind();
  if (kind !== null) redirect("/");

  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-serif text-5xl font-semibold text-accent">{dict.gate.title}</h1>
        <p className="mt-3 text-muted">{dict.gate.subtitle}</p>
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
