"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  type FaqItem,
  type Locale,
  type ScheduleItem,
  type SiteContent,
  type SiteSection,
} from "@/content/default";
import { LOCALES } from "@/lib/i18n";
import type { ImageRow } from "@/lib/images";
import { themeIds, themes } from "@/lib/themes";
import ImageFocusControl from "./ImageFocusControl";
import ImagePicker from "./ImagePicker";

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30";
const labelClass = "mb-1 block text-sm font-medium text-muted";

// Eindeutige Sektions-Keys ohne `crypto.randomUUID()`. `crypto.randomUUID` ist
// nur in Secure Contexts (HTTPS/localhost) verfuegbar und wuerde bei direktem
// HTTP-Zugriff auf den Container (z. B. http://192.168.1.67:…) fehlschlagen.
let imageSectionCounter = 0;
function newImageSection(): SiteSection {
  imageSectionCounter += 1;
  return {
    key: `img-${Date.now().toString(36)}-${imageSectionCounter.toString(36)}`,
    type: "image",
    enabled: true,
    imageId: null,
    caption: "",
    objectPosition: "center",
    objectFit: "cover",
  };
}

let textSectionCounter = 0;
function newTextSection(): SiteSection {
  textSectionCounter += 1;
  return {
    key: `text-${Date.now().toString(36)}-${textSectionCounter.toString(36)}`,
    type: "text",
    enabled: true,
    title: "",
    text: "",
  };
}

interface Props {
  initialDe: SiteContent;
  initialKo: SiteContent;
  images: ImageRow[];
}

/** URL eines Galerie-Bildes (oder null, wenn das Bild nicht existiert). */
function imageUrl(images: ImageRow[], imageId: number | null | undefined): string | null {
  if (imageId == null) return null;
  const image = images.find((item) => item.id === imageId);
  return image ? `/api/uploads/${image.filename}` : null;
}

/** Formular zum Bearbeiten aller Inhalte (Baukasten), zweisprachig. */
export default function ContentForm({ initialDe, initialKo, images }: Props) {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("de");
  const [content, setContent] = useState<SiteContent>(initialDe);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  // Sprache oder Server-Daten synchron halten. `initialDe`/`initialKo` aendern
  // sich nach einem Speichern (router.refresh) oder nach einer Navigation;
  // dann muss der lokale Zustand auf den aktuellen Inhalt der Sprache gesetzt
  // werden (behebt u. a. das "Verschwinden" frisch gespeicherter Bild-Sektionen).
  // Anpassung waehrend des Renderns statt in einem Effekt (React-Doku-Muster
  // "state during render"), um kaskadierende Renders zu vermeiden.
  const [syncKey, setSyncKey] = useState({ locale, initialDe, initialKo });
  if (
    syncKey.locale !== locale ||
    syncKey.initialDe !== initialDe ||
    syncKey.initialKo !== initialKo
  ) {
    setSyncKey({ locale, initialDe, initialKo });
    setContent(locale === "de" ? initialDe : initialKo);
  }

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

  function moveFaq(index: number, direction: -1 | 1) {
    setContent((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.faq.length) return prev;
      const next = [...prev.faq];
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, faq: next };
    });
  }

  function toggleSection(key: string, enabled: boolean) {
    setContent((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.key === key ? { ...s, enabled } : s)),
    }));
  }

  function updateSection(key: string, patch: Partial<SiteSection>) {
    setContent((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.key === key ? { ...s, ...patch } : s)),
    }));
  }

  function removeSection(key: string) {
    setContent((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.key !== key),
    }));
  }

  function addImageSection() {
    setContent((prev) => ({
      ...prev,
      sections: [...prev.sections, newImageSection()],
    }));
  }

  function addTextSection() {
    setContent((prev) => ({
      ...prev,
      sections: [...prev.sections, newTextSection()],
    }));
  }

  function moveSection(from: number, to: number) {
    setContent((prev) => {
      const next = [...prev.sections];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { ...prev, sections: next };
    });
  }

  /** Uebernimmt den deutschen Inhalt als Ausgangsbasis fuer die Koreanisch-Fassung. */
  function copyFromDe() {
    setContent(initialDe);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch(`/api/content?locale=${locale}`, {
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
      // Router-Cache invalidieren, damit nach Ruecknavigation die frisch
      // gespeicherten Inhalte (inkl. neuer Bild-Sektionen) angezeigt werden.
      router.refresh();
    } catch {
      setError("Netzwerkfehler. Bitte versuche es erneut.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <section className="rounded-xl border border-border bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-serif text-xl font-semibold">Sprache</h2>
          <div className="flex items-center gap-2">
            {LOCALES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLocale(lang)}
                aria-pressed={lang === locale}
                className={`rounded-full px-4 py-2 text-sm font-medium uppercase tracking-widest transition ${
                  lang === locale ? "bg-accent text-white" : "text-muted hover:text-foreground"
                }`}
              >
                {lang === "de" ? "Deutsch" : "한국어"}
              </button>
            ))}
            {locale === "ko" && (
              <button
                type="button"
                onClick={copyFromDe}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition hover:text-foreground"
              >
                Aus Deutsch übernehmen
              </button>
            )}
          </div>
        </div>
        {locale === "ko" && (
          <p className="mt-3 text-sm text-muted">
            Theme, Titelbild-Fokus, Anordnung und Bild-Sektionen werden in beiden Sprachen geteilt
            und unter „Deutsch“ bearbeitet. Die Texte der Textblöcke werden pro Sprache gepflegt.
          </p>
        )}
      </section>

      {locale === "de" && (
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
          </div>
          <div className="mt-4">
            <ImageFocusControl
              imageSrc={imageUrl(images, images[0]?.id)}
              value={content.heroObjectPosition}
              onChange={(value) => setField("heroObjectPosition", value)}
              desktopAspectClass="aspect-[2/1]"
              mobileAspectClass="aspect-[3/4]"
              label="Bildfokus (Titelbild)"
            />
          </div>
        </section>
      )}

      {locale === "de" && (
        <section className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-xl font-semibold">Sektionen</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addTextSection}
                className="rounded-full bg-accent px-4 py-2 text-xs font-medium uppercase tracking-widest text-white hover:opacity-90"
              >
                + Text-Sektion
              </button>
              <button
                type="button"
                onClick={addImageSection}
                className="rounded-full bg-accent px-4 py-2 text-xs font-medium uppercase tracking-widest text-white hover:opacity-90"
              >
                + Bild-Sektion
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted">Reihenfolge mit den Pfeilen aendern.</p>
          <ul className="mt-4 space-y-2">
            {content.sections.map((section, index) => (
              <li
                key={section.key}
                className="rounded-lg border border-border bg-background px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveSection(index, index - 1)}
                      disabled={index === 0}
                      className="rounded border border-border px-2 text-muted hover:text-foreground disabled:opacity-30"
                      aria-label="Nach oben"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(index, index + 1)}
                      disabled={index === content.sections.length - 1}
                      className="rounded border border-border px-2 text-muted hover:text-foreground disabled:opacity-30"
                      aria-label="Nach unten"
                    >
                      ↓
                    </button>
                  </div>
                  <input
                    type="checkbox"
                    checked={section.enabled}
                    onChange={(e) => toggleSection(section.key, e.target.checked)}
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                  <span className="flex-1 text-sm font-medium">
                    {section.type === "image"
                      ? "Bild"
                      : section.type === "text"
                        ? "Text"
                        : section.type === "contact"
                          ? "Kontakt"
                          : section.type}
                  </span>
                  {(section.type === "image" || section.type === "text") && (
                    <button
                      type="button"
                      onClick={() => removeSection(section.key)}
                      className="shrink-0 rounded-lg border border-border px-3 text-muted hover:text-red-600"
                      aria-label="Sektion entfernen"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {section.type === "image" && (
                  <div className="mt-2 grid w-full gap-2">
                    <div className="grid gap-2 md:grid-cols-2">
                      <ImagePicker
                        images={images}
                        value={section.imageId}
                        onChange={(imageId) => updateSection(section.key, { imageId })}
                      />
                      <input
                        value={section.caption ?? ""}
                        onChange={(e) => updateSection(section.key, { caption: e.target.value })}
                        placeholder="Bildunterschrift"
                        className={fieldClass}
                      />
                    </div>
                    <select
                      value={section.objectFit ?? "cover"}
                      onChange={(e) =>
                        updateSection(section.key, {
                          objectFit: e.target.value as "cover" | "contain",
                        })
                      }
                      className={fieldClass}
                      aria-label="Darstellung"
                    >
                      <option value="cover">Darstellung: Zuschneiden</option>
                      <option value="contain">Darstellung: Komplett einpassen</option>
                    </select>
                    <ImageFocusControl
                      imageSrc={imageUrl(images, section.imageId)}
                      value={section.objectPosition ?? "center"}
                      onChange={(value) => updateSection(section.key, { objectPosition: value })}
                      desktopAspectClass="aspect-[16/9]"
                      mobileAspectClass="aspect-[3/4]"
                      label="Bildfokus"
                    />
                  </div>
                )}
                {section.type === "text" && (
                  <div className="mt-2 grid w-full gap-2">
                    <input
                      value={section.title ?? ""}
                      onChange={(e) => updateSection(section.key, { title: e.target.value })}
                      placeholder="Überschrift (optional)"
                      className={fieldClass}
                    />
                    <textarea
                      value={section.text ?? ""}
                      onChange={(e) => updateSection(section.key, { text: e.target.value })}
                      rows={4}
                      placeholder="Text"
                      className={fieldClass}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {locale === "ko" && (
        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="font-serif text-xl font-semibold">Textblöcke</h2>
          <p className="mt-2 text-sm text-muted">
            Die Texte der Textblöcke werden pro Sprache gepflegt. Anzahl und Reihenfolge werden
            unter „Deutsch“ festgelegt.
          </p>
          <div className="mt-4 space-y-4">
            {content.sections
              .filter((section) => section.type === "text")
              .map((section) => (
                <div
                  key={section.key}
                  className="rounded-lg border border-border bg-background p-4"
                >
                  <input
                    value={section.title ?? ""}
                    onChange={(e) => updateSection(section.key, { title: e.target.value })}
                    placeholder="Überschrift (optional)"
                    className={fieldClass}
                  />
                  <textarea
                    value={section.text ?? ""}
                    onChange={(e) => updateSection(section.key, { text: e.target.value })}
                    rows={4}
                    placeholder="Text"
                    className={`${fieldClass} mt-2`}
                  />
                </div>
              ))}
          </div>
        </section>
      )}

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
              <div className="flex items-start gap-2">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => moveFaq(index, -1)}
                    disabled={index === 0}
                    className="rounded-lg border border-border px-2 py-1 text-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Frage nach oben verschieben"
                    title="Nach oben"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFaq(index, 1)}
                    disabled={index === content.faq.length - 1}
                    className="rounded-lg border border-border px-2 py-1 text-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Frage nach unten verschieben"
                    title="Nach unten"
                  >
                    ▼
                  </button>
                </div>
                <div className="flex-1">
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

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="font-serif text-xl font-semibold">Kontakt</h2>
        <p className="mt-2 text-sm text-muted">
          Wird pro Sprache gepflegt (z. B. Deutsch = deine Daten, Koreanisch = Daten deiner
          Verlobten). Die Sektion lässt sich oben unter „Sektionen“ an- und abschalten.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="contactTitle" className={labelClass}>
              Titel
            </label>
            <input
              id="contactTitle"
              value={content.contactTitle}
              onChange={(e) => setField("contactTitle", e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="contactName" className={labelClass}>
              Name
            </label>
            <input
              id="contactName"
              value={content.contactName}
              onChange={(e) => setField("contactName", e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="contactPhone" className={labelClass}>
              Telefonnummer / WhatsApp
            </label>
            <input
              id="contactPhone"
              value={content.contactPhone}
              onChange={(e) => setField("contactPhone", e.target.value)}
              className={fieldClass}
              placeholder="+49 ..."
            />
          </div>
          <div>
            <label htmlFor="contactEmail" className={labelClass}>
              E-Mail-Adresse
            </label>
            <input
              id="contactEmail"
              value={content.contactEmail}
              onChange={(e) => setField("contactEmail", e.target.value)}
              className={fieldClass}
              placeholder="mail@example.com"
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
