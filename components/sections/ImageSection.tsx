import type { SiteSection } from "@/content/default";
import type { ImageRow } from "@/lib/images";

interface Props {
  section: SiteSection;
  images: ImageRow[];
}

/**
 * Frei platzierbare "Bild"-Sektion: ein einzelnes Galerie-Bild als
 * Full-Bleed-Element mit optionaler Bildunterschrift. Rendert nichts, wenn
 * kein Bild gewaehlt ist oder das referenzierte Bild nicht (mehr) existiert.
 */
export default function ImageSection({ section, images }: Props) {
  if (section.imageId == null) return null;
  const image = images.find((item) => item.id === section.imageId);
  if (!image) return null;

  const fit = section.objectFit ?? "cover";
  const position = section.objectPosition ?? "center";

  return (
    <section className="relative w-full overflow-hidden bg-surface">
      <img
        src={`/api/uploads/${image.filename}`}
        alt={section.caption ?? image.caption ?? "Bild"}
        loading="lazy"
        decoding="async"
        style={{ objectPosition: position }}
        className={`h-[50vh] w-full md:h-[90vh] ${
          fit === "contain" ? "object-contain" : "object-cover"
        }`}
      />
      {section.caption && (
        <div className="absolute inset-x-0 bottom-0 bg-black/40 px-6 py-4 text-center text-white">
          <p className="text-sm md:text-base">{section.caption}</p>
        </div>
      )}
    </section>
  );
}
