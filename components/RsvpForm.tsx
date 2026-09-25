"use client";

import { useState } from "react";
import { getDictionary, type Locale } from "@/lib/i18n";

interface FormState {
  name: string;
  attending: "" | "yes" | "no";
  guests: string;
  additionalNames: string;
  hasChildren: "" | "yes" | "no";
  childrenAges: string;
  needsAccommodation: "" | "yes" | "no";
  note: string;
  website: string; // Honeypot – muss leer bleiben
}

const initialState: FormState = {
  name: "",
  attending: "",
  guests: "",
  additionalNames: "",
  hasChildren: "",
  childrenAges: "",
  needsAccommodation: "",
  note: "",
  website: "",
};

type Status = "idle" | "loading" | "success" | "error";

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30";
const labelClass = "mb-2 block text-sm font-medium text-muted";
const radioClass = "h-4 w-4 accent-[var(--accent)]";

/** RSVP-Formular mit bedingter Anzeige der Felder. */
export default function RsvpForm({ locale }: { locale: Locale }) {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const dict = getDictionary(locale).rsvp;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const attendingYes = form.attending === "yes";
  const guestsCount = Number(form.guests);
  const showAdditionalNames = attendingYes && Number.isFinite(guestsCount) && guestsCount > 1;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    const payload = {
      name: form.name,
      attending: form.attending,
      guests: attendingYes ? Number(form.guests) : null,
      additionalNames:
        attendingYes && showAdditionalNames ? form.additionalNames.trim() || null : null,
      hasChildren: attendingYes && form.hasChildren !== "" ? form.hasChildren === "yes" : null,
      childrenAges: attendingYes && form.hasChildren === "yes" ? form.childrenAges : null,
      needsAccommodation:
        attendingYes && form.needsAccommodation !== "" ? form.needsAccommodation === "yes" : null,
      note: form.note.trim() || null,
      website: form.website,
    };

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? dict.error);
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setError(dict.networkError);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-border bg-surface p-8 text-center">
        <h3 className="font-serif text-2xl font-semibold text-accent">{dict.success}</h3>
        <p className="mt-3 text-muted">{dict.successText}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6" noValidate>
      {/* Honeypot-Feld (fuer Menschen unsichtbar) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => set("website", e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="name" className={labelClass}>
          {dict.name} <span className="text-accent">*</span>
        </label>
        <input
          id="name"
          type="text"
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className={fieldClass}
          placeholder={dict.namePlaceholder}
        />
      </div>

      <div>
        <label htmlFor="attending" className={labelClass}>
          {dict.attending} <span className="text-accent">*</span>
        </label>
        <select
          id="attending"
          required
          value={form.attending}
          onChange={(e) => set("attending", e.target.value as FormState["attending"])}
          className={fieldClass}
        >
          <option value="" disabled>
            {dict.attendingPlaceholder}
          </option>
          <option value="yes">{dict.attendingYes}</option>
          <option value="no">{dict.attendingNo}</option>
        </select>
      </div>

      {attendingYes && (
        <>
          <div>
            <label htmlFor="guests" className={labelClass}>
              {dict.guests} <span className="text-accent">*</span>
            </label>
            <select
              id="guests"
              required
              value={form.guests}
              onChange={(e) => set("guests", e.target.value)}
              className={fieldClass}
            >
              <option value="" disabled>
                {dict.attendingPlaceholder}
              </option>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {showAdditionalNames && (
            <div>
              <label htmlFor="additionalNames" className={labelClass}>
                {dict.additionalNames}
              </label>
              <input
                id="additionalNames"
                type="text"
                value={form.additionalNames}
                onChange={(e) => set("additionalNames", e.target.value)}
                className={fieldClass}
                placeholder={dict.additionalNamesPlaceholder}
              />
            </div>
          )}

          <fieldset>
            <legend className={labelClass}>
              {dict.hasChildren} <span className="text-accent">*</span>
            </legend>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="hasChildren"
                  value="yes"
                  checked={form.hasChildren === "yes"}
                  onChange={() => set("hasChildren", "yes")}
                  className={radioClass}
                />
                {dict.yes}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="hasChildren"
                  value="no"
                  checked={form.hasChildren === "no"}
                  onChange={() => set("hasChildren", "no")}
                  className={radioClass}
                />
                {dict.no}
              </label>
            </div>
          </fieldset>

          {form.hasChildren === "yes" && (
            <div>
              <label htmlFor="childrenAges" className={labelClass}>
                {dict.childrenAges}
              </label>
              <input
                id="childrenAges"
                type="text"
                value={form.childrenAges}
                onChange={(e) => set("childrenAges", e.target.value)}
                className={fieldClass}
                placeholder={dict.childrenAgesPlaceholder}
              />
              <p className="mt-2 text-sm text-muted">{dict.childrenAgesHint}</p>
            </div>
          )}

          <fieldset>
            <legend className={labelClass}>{dict.accommodation}</legend>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="needsAccommodation"
                  value="yes"
                  checked={form.needsAccommodation === "yes"}
                  onChange={() => set("needsAccommodation", "yes")}
                  className={radioClass}
                />
                {dict.yes}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="needsAccommodation"
                  value="no"
                  checked={form.needsAccommodation === "no"}
                  onChange={() => set("needsAccommodation", "no")}
                  className={radioClass}
                />
                {dict.no}
              </label>
            </div>
          </fieldset>
        </>
      )}

      <div>
        <label htmlFor="note" className={labelClass}>
          {dict.note}
        </label>
        <textarea
          id="note"
          rows={3}
          value={form.note}
          onChange={(e) => set("note", e.target.value)}
          className={fieldClass}
          placeholder={dict.notePlaceholder}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-accent px-8 py-3 text-sm font-medium uppercase tracking-widest text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {status === "loading" ? dict.sending : dict.submit}
      </button>
    </form>
  );
}
