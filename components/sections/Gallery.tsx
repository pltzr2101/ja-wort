"use client";

import { useState } from "react";
import { getDictionary, type Locale } from "@/lib/i18n";

export interface GalleryImage {
  src: string;
  caption: string | null;
}

/** Bildergalerie mit einfachem Lightbox-Dialog. */
export default function Gallery({ images, locale }: { images: GalleryImage[]; locale: Locale }) {
  const [selected, setSelected] = useState<number | null>(null);
  const dict = getDictionary(locale);

  if (images.length === 0) return null;

  return (
    <section id="gallery" className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="text-center font-serif text-4xl font-semibold md:text-5xl">
        {dict.gallery.title}
      </h2>
      <div className="mx-auto mt-2 h-px w-16 bg-accent" />
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setSelected(index)}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg"
          >
            <img
              src={image.src}
              alt={image.caption ?? "Hochzeitsbild"}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {selected !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-full max-w-4xl">
            <img
              src={images[selected].src}
              alt={images[selected].caption ?? "Hochzeitsbild"}
              className="max-h-[85vh] w-auto rounded-lg object-contain"
            />
            {images[selected].caption && (
              <p className="mt-4 text-center text-white">{images[selected].caption}</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
