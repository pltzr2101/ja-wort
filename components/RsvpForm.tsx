"use client";

import { useState } from "react";

interface FormState {
  name: string;
  attending: "" | "yes" | "no";
  guests: string;
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
export default function RsvpForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const attendingYes = form.attending === "yes";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    const payload = {
      name: form.name,
      attending: form.attending,
      guests: attendingYes ? Number(form.guests) : null,
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
        setError(data.error ?? "Etwas ist schiefgelaufen. Bitte versuche es erneut.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setError("Netzwerkfehler. Bitte versuche es erneut.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-border bg-surface p-8 text-center">
        <h3 className="font-serif text-2xl font-semibold text-accent">Vielen Dank!</h3>
        <p className="mt-3 text-muted">Deine Antwort wurde gespeichert. Wir freuen uns auf euch!</p>
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
          Vor- und Nachname <span className="text-accent">*</span>
        </label>
        <input
          id="name"
          type="text"
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className={fieldClass}
          placeholder="Vor- und Nachname"
        />
      </div>

      <div>
        <label htmlFor="attending" className={labelClass}>
          Zu- oder Absage <span className="text-accent">*</span>
        </label>
        <select
          id="attending"
          required
          value={form.attending}
          onChange={(e) => set("attending", e.target.value as FormState["attending"])}
          className={fieldClass}
        >
          <option value="" disabled>
            Bitte waehlen
          </option>
          <option value="yes">Ich/Wir kommen gerne</option>
          <option value="no">Ich/Wir muessen leider absagen</option>
        </select>
      </div>

      {attendingYes && (
        <>
          <div>
            <label htmlFor="guests" className={labelClass}>
              Personenzahl <span className="text-accent">*</span>
            </label>
            <select
              id="guests"
              required
              value={form.guests}
              onChange={(e) => set("guests", e.target.value)}
              className={fieldClass}
            >
              <option value="" disabled>
                Bitte waehlen
              </option>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <fieldset>
            <legend className={labelClass}>
              Sind Kinder unter den Personen? <span className="text-accent">*</span>
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
                Ja
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
                Nein
              </label>
            </div>
          </fieldset>

          {form.hasChildren === "yes" && (
            <div>
              <label htmlFor="childrenAges" className={labelClass}>
                Alter der Kinder
              </label>
              <input
                id="childrenAges"
                type="text"
                value={form.childrenAges}
                onChange={(e) => set("childrenAges", e.target.value)}
                className={fieldClass}
                placeholder="z. B. 2 und 5 Jahre"
              />
              <p className="mt-2 text-sm text-muted">
                Bitte gib hier das Alter der Kinder an, damit wir ggf. Hochstuehle und Kindermenues
                planen koennen.
              </p>
            </div>
          )}

          <fieldset>
            <legend className={labelClass}>
              Benoetigt ihr Unterstützung beim Finden einer passenden Unterkunft?
            </legend>
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
                Ja
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
                Nein
              </label>
            </div>
          </fieldset>
        </>
      )}

      <div>
        <label htmlFor="note" className={labelClass}>
          Nachricht oder Kontakt (optional)
        </label>
        <textarea
          id="note"
          rows={3}
          value={form.note}
          onChange={(e) => set("note", e.target.value)}
          className={fieldClass}
          placeholder="E-Mail oder Telefon fuer Rueckfragen, Essenswuensche, ..."
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
        {status === "loading" ? "Wird gesendet..." : "Absenden"}
      </button>
    </form>
  );
}
