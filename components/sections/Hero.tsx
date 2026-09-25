import type { SiteContent } from "@/content/default";
import type { ImageRow } from "@/lib/images";

/** Formatiert ein ISO-Datum (YYYY-MM-DD) als deutsches Langdatum. */
function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function Hero({ content, images }: { content: SiteContent; images: ImageRow[] }) {
  const background = images[0] ? `/api/uploads/${images[0].filename}` : null;

  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
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
        <p className="font-serif text-xl italic opacity-90 md:text-2xl">
          {formatDate(content.weddingDate)}
        </p>
        <h1 className="font-serif mt-4 text-5xl font-semibold leading-tight md:text-7xl">
          {content.coupleNames}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg md:text-xl">{content.heroSubtitle}</p>
        <a
          href="#rsvp"
          className="mt-10 inline-block rounded-full bg-accent px-8 py-3 text-sm font-medium uppercase tracking-widest text-white transition hover:opacity-90"
        >
          Zur Zu-/Absage
        </a>
      </div>
    </section>
  );
}
