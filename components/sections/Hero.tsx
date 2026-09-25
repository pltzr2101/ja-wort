import type { SiteContent } from "@/content/default";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import type { ImageRow } from "@/lib/images";

/** Formatiert ein ISO-Datum (YYYY-MM-DD) als Langdatum in der Zielsprache. */
function formatDate(iso: string, locale: Locale): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function Hero({
  content,
  images,
  locale,
}: {
  content: SiteContent;
  images: ImageRow[];
  locale: Locale;
}) {
  const background = images[0] ? `/api/uploads/${images[0].filename}` : null;
  const dict = getDictionary(locale);

  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden md:min-h-[85vh]">
      {background && (
        <img
          src={background}
          alt=""
          style={{ objectPosition: content.heroObjectPosition }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div
        className={`absolute inset-0 ${
          background ? "bg-black/50" : "bg-gradient-to-b from-accent-soft to-background"
        }`}
      />
      <div
        className={`relative z-10 px-6 py-24 text-center ${
          background ? "text-white" : "text-foreground"
        }`}
      >
        {content.heroTitle.trim() !== "" && (
          <p className="text-xs font-medium uppercase tracking-[0.4em] opacity-80 md:text-sm">
            {content.heroTitle}
          </p>
        )}
        <p className="mt-4 font-serif text-xl italic opacity-90 md:text-2xl">
          {formatDate(content.weddingDate, locale)}
        </p>
        <h1 className="font-serif mt-4 text-5xl font-semibold leading-tight md:text-7xl">
          {content.coupleNames}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg md:text-xl">{content.heroSubtitle}</p>
        <a
          href="#rsvp"
          className="mt-10 inline-block rounded-full bg-accent px-8 py-3 text-sm font-medium uppercase tracking-widest text-white transition hover:opacity-90"
        >
          {dict.hero.cta}
        </a>
      </div>
    </section>
  );
}
