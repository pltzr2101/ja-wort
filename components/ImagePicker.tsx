"use client";

import type { ImageRow } from "@/lib/images";

interface Props {
  images: ImageRow[];
  value: number | null | undefined;
  onChange: (imageId: number | null) => void;
}

/**
 * Visuelle Bildauswahl: zeigt alle Galerie-Bilder als kleine Thumbnails,
 * sodass man sofort sieht, welches Bild hinter einer "Bild"-Sektion steckt
 * (statt nur den kryptischen Dateinamen). Das aktuell gewaehlte Bild ist
 * hervorgehoben; ein Klick waehlt aus bzw. hebt die Auswahl auf.
 */
export default function ImagePicker({ images, value, onChange }: Props) {
  if (images.length === 0) {
    return (
      <p className="col-span-2 rounded-lg border border-border bg-background px-3 py-4 text-sm text-muted">
        Noch keine Bilder in der Galerie. Bitte zuerst unter „Galerie“ hochladen.
      </p>
    );
  }

  return (
    <div className="col-span-2 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
      {images.map((image) => {
        const selected = image.id === value;
        return (
          <button
            key={image.id}
            type="button"
            onClick={() => onChange(selected ? null : image.id)}
            aria-pressed={selected}
            title={image.caption ?? image.filename}
            className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition ${
              selected ? "border-accent ring-2 ring-accent/30" : "border-border hover:border-muted"
            }`}
          >
            <img
              src={`/api/uploads/${image.filename}`}
              alt={image.caption ?? "Bild"}
              className="h-full w-full object-cover"
            />
            {selected && (
              <span className="absolute inset-0 flex items-center justify-center bg-accent/20">
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-white">
                  gewählt
                </span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
