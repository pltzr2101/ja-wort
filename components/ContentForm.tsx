"use client";

import { useState } from "react";
import {
  sectionOrder,
  type FaqItem,
  type ScheduleItem,
  type SectionId,
  type SiteContent,
} from "@/content/default";
import { themeIds, themes } from "@/lib/themes";

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30";
const labelClass = "mb-1 block text-sm font-medium text-muted";

interface Props {
  initial: SiteContent;
}

/** Formular zum Bearbeiten aller Inhalte (Baukasten). */
export default function ContentForm({ initial }: Props) {
  const [content, setContent] = useState<SiteContent>(initial);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setContent((prev) => ({ ...prev, [key]: value }));
  }

  function updateSchedule(index: number, patch: Partial<ScheduleItem>) {
    setContent((prev) => ({
      ...prev,
      schedule: prev.schedule.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  function updateFaq(index: number, patch: Partial<FaqItem>) {
    setContent((prev) => ({
      ...prev,
      faq: prev.faq.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  function toggleSection(id: SectionId, enabled: boolean) {
    setContent((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, enabled } : s)),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Speichern fehlgeschlagen.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setError("Netzwerkfehler. Bitte versuche es erneut.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="font-serif text-xl font-semibold">Design</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="theme" className={labelClass}>
              Theme
            </label>
            <select
              id="theme"
              value={content.theme}
              onChange={(e) => setField("theme", e.target.value as SiteContent["theme"])}
              className={fieldClass}
            >
              {themeIds.map((id) => (
                <option key={id} value={id}>
                  {themes[id].name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sections" className={labelClass}>
              Sektionen
            </label>
            <div className="flex flex-wrap gap-3 rounded-lg border border-border p-3">
              {sectionOrder.map((id) => {
                const enabled = content.sections.find((s) => s.id === id)?.enabled ?? true;
                return (
                  <label key={id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => toggleSection(id, e.target.checked)}
                      className="h-4 w-4 accent-[var(--accent)]"
                    />
                    {id}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="font-serif text-xl font-semibold">Grunddaten</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="coupleNames" className={labelClass}>
              Namen des Paares
            </label>
            <input
              id="coupleNames"
              value={content.coupleNames}
              onChange={(e) => setField("coupleNames", e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="weddingDate" className={labelClass}>
              Hochzeitsdatum
            </label>
            <input
              id="weddingDate"
              type="date"
              value={content.weddingDate}
              onChange={(e) => setField("weddingDate", e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="locationName" className={labelClass}>
              Name der Location
            </label>
            <input
              id="locationName"
              value={content.locationName}
              onChange={(e) => setField("locationName", e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="heroTitle" className={labelClass}>
              Hero-Titel
            </label>
            <input
              id="heroTitle"
              value={content.heroTitle}
              onChange={(e) => setField("heroTitle", e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="heroSubtitle" className={labelClass}>
            Hero-Untertitel
          </label>
          <input
            id="heroSubtitle"
            value={content.heroSubtitle}
            onChange={(e) => setField("heroSubtitle", e.target.value)}
            className={fieldClass}
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="font-serif text-xl font-semibold">Story</h2>
        <div className="mt-4">
          <label htmlFor="storyTitle" className={labelClass}>
            Titel
          </label>
          <input
            id="storyTitle"
            value={content.storyTitle}
            onChange={(e) => setField("storyTitle", e.target.value)}
            className={fieldClass}
          />
        </div>
        <div className="mt-4">
          <label htmlFor="storyText" className={labelClass}>
            Text
          </label>
          <textarea
            id="storyText"
            rows={5}
            value={content.storyText}
            onChange={(e) => setField("storyText", e.target.value)}
            className={fieldClass}
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold">Ablauf</h2>
          <button
            type="button"
            onClick={() =>
              setField("schedule", [...content.schedule, { time: "", title: "", description: "" }])
            }
            className="rounded-full bg-accent px-4 py-2 text-xs font-medium uppercase tracking-widest text-white hover:opacity-90"
          >
            + Eintrag
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {content.schedule.map((item, index) => (
            <div
              key={index}
              className="grid gap-2 rounded-lg border border-border p-4 md:grid-cols-[100px_1fr_1fr]"
            >
              <input
                value={item.time}
                onChange={(e) => updateSchedule(index, { time: e.target.value })}
                className={fieldClass}
                placeholder="14:00"
              />
              <input
                value={item.title}
                onChange={(e) => updateSchedule(index, { title: e.target.value })}
                className={fieldClass}
                placeholder="Titel"
              />
              <div className="flex gap-2">
                <input
                  value={item.description}
                  onChange={(e) => updateSchedule(index, { description: e.target.value })}
                  className={fieldClass}
                  placeholder="Beschreibung"
                />
                <button
                  type="button"
                  onClick={() =>
                    setField(
                      "schedule",
                      content.schedule.filter((_, i) => i !== index)
                    )
                  }
                  className="shrink-0 rounded-lg border border-border px-3 text-muted hover:text-red-600"
                  aria-label="Eintrag entfernen"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="font-serif text-xl font-semibold">Karte</h2>
        <div className="mt-4">
          <label htmlFor="mapTitle" className={labelClass}>
            Titel
          </label>
          <input
            id="mapTitle"
            value={content.mapTitle}
            onChange={(e) => setField("mapTitle", e.target.value)}
            className={fieldClass}
          />
        </div>
        <div className="mt-4">
          <label htmlFor="mapEmbedUrl" className={labelClass}>
            Karten-Embed-URL (OpenStreetMap oder Google Maps)
          </label>
          <input
            id="mapEmbedUrl"
            value={content.mapEmbedUrl}
            onChange={(e) => setField("mapEmbedUrl", e.target.value)}
            className={fieldClass}
            placeholder="https://www.openstreetmap.org/export/embed.html?..."
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold">FAQ</h2>
          <button
            type="button"
            onClick={() => setField("faq", [...content.faq, { question: "", answer: "" }])}
            className="rounded-full bg-accent px-4 py-2 text-xs font-medium uppercase tracking-widest text-white hover:opacity-90"
          >
            + Frage
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {content.faq.map((item, index) => (
            <div key={index} className="rounded-lg border border-border p-4">
              <input
                value={item.question}
                onChange={(e) => updateFaq(index, { question: e.target.value })}
                className={fieldClass}
                placeholder="Frage"
              />
              <div className="mt-2 flex gap-2">
                <textarea
                  value={item.answer}
                  onChange={(e) => updateFaq(index, { answer: e.target.value })}
                  className={fieldClass}
                  rows={2}
                  placeholder="Antwort"
                />
                <button
                  type="button"
                  onClick={() =>
                    setField(
                      "faq",
                      content.faq.filter((_, i) => i !== index)
                    )
                  }
                  className="shrink-0 rounded-lg border border-border px-3 text-muted hover:text-red-600"
                  aria-label="Frage entfernen"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="font-serif text-xl font-semibold">Zu-/Absage</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label htmlFor="rsvpTitle" className={labelClass}>
              Titel
            </label>
            <input
              id="rsvpTitle"
              value={content.rsvpTitle}
              onChange={(e) => setField("rsvpTitle", e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="rsvpSubtitle" className={labelClass}>
              Untertitel
            </label>
            <input
              id="rsvpSubtitle"
              value={content.rsvpSubtitle}
              onChange={(e) => setField("rsvpSubtitle", e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>
      </section>

      {status === "success" && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">Gespeichert.</p>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-accent px-8 py-3 text-sm font-medium uppercase tracking-widest text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {status === "loading" ? "Speichert..." : "Speichern"}
      </button>
    </form>
  );
}
