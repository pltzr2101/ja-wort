import type { SiteContent } from "@/content/default";
import type { Locale } from "@/lib/i18n";
import RsvpForm from "@/components/RsvpForm";

export default function RsvpSection({ content, locale }: { content: SiteContent; locale: Locale }) {
  return (
    <section id="rsvp" className="bg-surface px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center font-serif text-4xl font-semibold md:text-5xl">
          {content.rsvpTitle}
        </h2>
        <div className="mx-auto mt-2 h-px w-16 bg-accent" />
        <p className="mt-6 text-center text-lg text-muted">{content.rsvpSubtitle}</p>
        <div className="mt-12">
          <RsvpForm locale={locale} />
        </div>
      </div>
    </section>
  );
}
