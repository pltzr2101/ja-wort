import type { SiteContent } from "@/content/default";

export default function Map({ content }: { content: SiteContent }) {
  return (
    <section id="map" className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="text-center font-serif text-4xl font-semibold md:text-5xl">
        {content.mapTitle}
      </h2>
      <div className="mx-auto mt-2 h-px w-16 bg-accent" />
      <p className="mt-6 text-center text-lg text-muted">{content.locationName}</p>
      <div className="mt-8 overflow-hidden rounded-lg border border-border shadow-sm">
        <iframe
          title="Karte der Location"
          src={content.mapEmbedUrl}
          className="h-[420px] w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
}
