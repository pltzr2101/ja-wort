"use client";

import { useRef, useState } from "react";
import type { ImageRow } from "@/lib/images";

interface Props {
  initial: ImageRow[];
}

/** Verwaltung der Galerie: Bilder hochladen und loeschen. */
export default function GalleryManager({ initial }: Props) {
  const [images, setImages] = useState<ImageRow[]>(initial);
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Bitte waehle eine Datei aus.");
      return;
    }

    setStatus("loading");
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("caption", caption);

    try {
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Upload fehlgeschlagen.");
        setStatus("idle");
        return;
      }

      const data = (await res.json()) as { image: ImageRow };
      setImages((prev) => [...prev, data.image]);
      setCaption("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      setError("Netzwerkfehler. Bitte versuche es erneut.");
    } finally {
      setStatus("idle");
    }
  }

  function move(from: number, to: number) {
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setImages(next);
    persistOrder(next);
  }

  async function persistOrder(list: ImageRow[]) {
    try {
      const res = await fetch("/api/uploads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: list.map((image) => image.id) }),
      });
      if (!res.ok) {
        setError("Umsortieren fehlgeschlagen.");
      }
    } catch {
      setError("Netzwerkfehler. Bitte versuche es erneut.");
    }
  }

  async function handleDelete(id: number) {
    setError(null);
    try {
      const res = await fetch("/api/uploads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        setError("Loeschen fehlgeschlagen.");
        return;
      }
      setImages((prev) => prev.filter((image) => image.id !== id));
    } catch {
      setError("Netzwerkfehler. Bitte versuche es erneut.");
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleUpload} className="rounded-xl border border-border bg-surface p-6">
        <h2 className="font-serif text-xl font-semibold">Bild hochladen</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div>
            <label htmlFor="file" className="mb-1 block text-sm font-medium text-muted">
              Bild (JPG, PNG oder WebP, max. 5 MB)
            </label>
            <input
              id="file"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
            />
          </div>
          <div>
            <label htmlFor="caption" className="mb-1 block text-sm font-medium text-muted">
              Bildunterschrift (optional)
            </label>
            <input
              id="caption"
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-full bg-accent px-6 py-2 text-sm font-medium uppercase tracking-widest text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {status === "loading" ? "Laedt hoch..." : "Hochladen"}
          </button>
        </div>
      </form>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {images.length === 0 ? (
        <p className="rounded-lg border border-border bg-surface px-6 py-10 text-center text-muted">
          Noch keine Bilder hochgeladen.
        </p>
      ) : (
        <>
          <p className="text-sm text-muted">
            Das <span className="font-medium">erste Bild</span> wird als Titelbild verwendet.
            Reihenfolge per Drag &amp; Drop oder mit den Pfeilen aendern.
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={() => setDraggedIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (draggedIndex !== null && draggedIndex !== index) {
                    move(draggedIndex, index);
                  }
                  setDraggedIndex(null);
                }}
                className={`overflow-hidden rounded-lg border border-border bg-surface ${
                  draggedIndex === index ? "opacity-50" : ""
                }`}
              >
                <img
                  src={`/api/uploads/${image.filename}`}
                  alt={image.caption ?? "Bild"}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="flex items-center justify-between gap-2 px-3 py-2">
                  {index === 0 && (
                    <span className="shrink-0 rounded bg-accent px-2 py-0.5 text-[10px] uppercase tracking-widest text-white">
                      Titelbild
                    </span>
                  )}
                  <span className="truncate text-xs text-muted">
                    {image.caption ?? image.filename}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, index - 1)}
                      disabled={index === 0}
                      className="rounded border border-border px-1.5 text-muted hover:text-foreground disabled:opacity-30"
                      aria-label="Nach oben"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, index + 1)}
                      disabled={index === images.length - 1}
                      className="rounded border border-border px-1.5 text-muted hover:text-foreground disabled:opacity-30"
                      aria-label="Nach unten"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(image.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Loeschen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
