import type { SiteSection } from "@/content/default";

interface Props {
  section: SiteSection;
}

/**
 * Frei platzierbare "Text"-Sektion: optional mit Ueberschrift, ansonsten nur
 * Fliesstext. Rendert nichts, wenn weder Titel noch Text gesetzt sind.
 */
export default function TextSection({ section }: Props) {
  const title = (section.title ?? "").trim();
  const text = (section.text ?? "").trim();
  if (!title && !text) return null;

  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center">
      {title && (
        <>
          <h2 className="font-serif text-4xl font-semibold md:text-5xl">{title}</h2>
          <div className="mx-auto mt-2 h-px w-16 bg-accent" />
        </>
      )}
      {text && (
        <p
          className={`whitespace-pre-line text-lg leading-relaxed text-muted ${title ? "mt-8" : ""}`}
        >
          {text}
        </p>
      )}
    </section>
  );
}
