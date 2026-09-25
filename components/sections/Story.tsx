import type { SiteContent } from "@/content/default";

export default function Story({ content }: { content: SiteContent }) {
  return (
    <section id="story" className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h2 className="font-serif text-4xl font-semibold md:text-5xl">{content.storyTitle}</h2>
      <div className="mx-auto mt-2 h-px w-16 bg-accent" />
      <p className="mt-8 whitespace-pre-line text-lg leading-relaxed text-muted">
        {content.storyText}
      </p>
    </section>
  );
}
