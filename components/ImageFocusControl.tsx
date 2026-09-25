"use client";

import { useState } from "react";
import { formatObjectPosition, parseObjectPosition } from "@/lib/object-position";

interface Props {
  /** URL des betroffenen Bildes (oder null, wenn keins gewaehlt ist). */
  imageSrc: string | null;
  /** Aktueller CSS-`object-position`-String. */
  value: string;
  onChange: (value: string) => void;
  /** Tailwind-Aspect-Klasse fuer die Desktop-Vorschau. */
  desktopAspectClass?: string;
  /** Tailwind-Aspect-Klasse fuer die Mobile-Vorschau. */
  mobileAspectClass?: string;
  label?: string;
}

/**
 * Bildfokus-Editor: Live-Vorschau mit Mobil-/Desktop-Umschalter und einem
 * vertikalen Slider (oben/unten). Horizontal bleibt der Fokus fest mittig
 * (50 %). Schreibt weiterhin einen CSS-`object-position`-String.
 */
export default function ImageFocusControl({
  imageSrc,
  value,
  onChange,
  desktopAspectClass = "aspect-[2/1]",
  mobileAspectClass = "aspect-[3/4]",
  label,
}: Props) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const { y } = parseObjectPosition(value);

  const aspectClass = viewport === "desktop" ? desktopAspectClass : mobileAspectClass;
  const activeClass = "bg-accent text-white";
  const inactiveClass = "text-muted hover:text-foreground";

  return (
    <div className="rounded-lg border border-border bg-background p-4">
      {label && <p className="mb-3 text-sm font-medium text-muted">{label}</p>}

      <div className="mb-3 inline-flex gap-1 rounded-lg border border-border p-1">
        <button
          type="button"
          onClick={() => setViewport("desktop")}
          className={`rounded-md px-3 py-1 text-xs font-medium transition ${
            viewport === "desktop" ? activeClass : inactiveClass
          }`}
          aria-pressed={viewport === "desktop"}
        >
          Desktop
        </button>
        <button
          type="button"
          onClick={() => setViewport("mobile")}
          className={`rounded-md px-3 py-1 text-xs font-medium transition ${
            viewport === "mobile" ? activeClass : inactiveClass
          }`}
          aria-pressed={viewport === "mobile"}
        >
          Mobil
        </button>
      </div>

      <div className={`relative overflow-hidden rounded-lg border border-border ${aspectClass}`}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: formatObjectPosition({ x: 50, y }) }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted">
            Kein Bild gewählt
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-sm text-muted">
          <span>Oben/Unten</span>
          <span>{y} %</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={y}
          onChange={(event) =>
            onChange(formatObjectPosition({ x: 50, y: Number(event.target.value) }))
          }
          className="w-full accent-[var(--accent)]"
          aria-label="Bildfokus oben/unten"
        />
      </div>
    </div>
  );
}
