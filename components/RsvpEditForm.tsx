"use client";

import { useState } from "react";
import type { RsvpRow } from "@/lib/rsvps";

interface FormState {
  name: string;
  attending: "" | "yes" | "no";
  guests: string;
  additionalNames: string;
  hasChildren: "" | "yes" | "no";
  childrenAges: string;
  needsAccommodation: "" | "yes" | "no";
  afterparty: "" | "yes";
  note: string;
}

/** Wandelt einen gespeicherten Wahrheitswert in die Form-Auswahl um. */
function boolToYesNo(value: boolean | null): "" | "yes" | "no" {
  if (value === null) return "";
  return value ? "yes" : "no";
}

/** Befuellt das Formular mit den bisherigen Werten einer Anmeldung. */
function toInitialState(rsvp: RsvpRow): FormState {
  return {
    name: rsvp.name,
    attending: rsvp.attending ? "yes" : "no",
    guests: rsvp.guests?.toString() ?? "",
    additionalNames: rsvp.additionalNames ?? "",
    hasChildren: boolToYesNo(rsvp.hasChildren),
    childrenAges: rsvp.childrenAges ?? "",
    needsAccommodation: boolToYesNo(rsvp.needsAccommodation),
    afterparty: rsvp.afterparty ? "yes" : "",
    note: rsvp.note ?? "",
  };
}

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30";
const labelClass = "mb-2 block text-sm font-medium text-muted";
const radioClass = "h-4 w-4 accent-[var(--accent)]";

interface Props {
  rsvp: RsvpRow;
  onCancel: () => void;
  onSaved: () => void;
}

/**
 * Modal zum Bearbeiten einer einzelnen Anmeldung (nur Admin). Spiegelbild des
 * oeffentlichen RSVP-Formulars, jedoch mit vorbelegten Werten und PATCH statt
 * POST. Die Afterparty-Angabe ist freiwillig (nur "Ja" oder leer).
 */
export default function RsvpEditForm({ rsvp, onCancel, onSaved }: Props) {
  const [form, setForm] = useState<FormState>(() => toInitialState(rsvp));
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

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
      id: rsvp.id,
      name: form.name,
      attending: form.attending,
      guests: attendingYes ? Number(form.guests) : null,
      additionalNames:
        attendingYes && showAdditionalNames ? form.additionalNames.trim() || null : null,
      hasChildren: attendingYes && form.hasChildren !== "" ? form.hasChildren === "yes" : null,
      childrenAges: attendingYes && form.hasChildren === "yes" ? form.childrenAges : null,
      needsAccommodation:
        attendingYes && form.needsAccommodation !== "" ? form.needsAccommodation === "yes" : null,
      afterparty: attendingYes && form.afterparty === "yes" ? true : null,
      note: form.note.trim() || null,
      website: "",
    };

    try {
      const res = await fetch("/api/rsvp", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Speichern fehlgeschlagen.");
        setStatus("error");
        return;
      }

      onSaved();
    } catch {
      setError("Netzwerkfehler. Bitte versuche es erneut.");
      setStatus("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Anmeldung von ${rsvp.name} bearbeiten`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold">Anmeldung bearbeiten</h2>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-2 text-muted transition hover:text-foreground"
            aria-label="Schliessen"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="edit-name" className={labelClass}>
              Vor- und Nachname <span className="text-accent">*</span>
            </label>
            <input
              id="edit-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="edit-attending" className={labelClass}>
              Zu- oder Absage <span className="text-accent">*</span>
            </label>
            <select
              id="edit-attending"
              required
              value={form.attending}
              onChange={(e) => set("attending", e.target.value as FormState["attending"])}
              className={fieldClass}
            >
              <option value="" disabled>
                Bitte wählen
              </option>
              <option value="yes">Zusage</option>
              <option value="no">Absage</option>
            </select>
          </div>

          {attendingYes && (
            <>
              <div>
                <label htmlFor="edit-guests" className={labelClass}>
                  Personenzahl <span className="text-accent">*</span>
                </label>
                <select
                  id="edit-guests"
                  required
                  value={form.guests}
                  onChange={(e) => set("guests", e.target.value)}
                  className={fieldClass}
                >
                  <option value="" disabled>
                    Bitte wählen
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
                  <label htmlFor="edit-additionalNames" className={labelClass}>
                    Vor- und Nachnamen der weiteren Personen
                  </label>
                  <input
                    id="edit-additionalNames"
                    type="text"
                    value={form.additionalNames}
                    onChange={(e) => set("additionalNames", e.target.value)}
                    className={fieldClass}
                  />
                </div>
              )}

              <fieldset>
                <legend className={labelClass}>
                  Sind Kinder unter den Personen? <span className="text-accent">*</span>
                </legend>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="edit-hasChildren"
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
                      name="edit-hasChildren"
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
                  <label htmlFor="edit-childrenAges" className={labelClass}>
                    Alter der Kinder
                  </label>
                  <input
                    id="edit-childrenAges"
                    type="text"
                    value={form.childrenAges}
                    onChange={(e) => set("childrenAges", e.target.value)}
                    className={fieldClass}
                  />
                </div>
              )}

              <fieldset>
                <legend className={labelClass}>Unterkunft-Hilfe benötigt?</legend>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="edit-needsAccommodation"
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
                      name="edit-needsAccommodation"
                      value="no"
                      checked={form.needsAccommodation === "no"}
                      onChange={() => set("needsAccommodation", "no")}
                      className={radioClass}
                    />
                    Nein
                  </label>
                </div>
              </fieldset>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.afterparty === "yes"}
                    onChange={(e) => set("afterparty", e.target.checked ? "yes" : "")}
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                  <span className="text-sm font-medium">Afterparty</span>
                </label>
              </div>
            </>
          )}

          <div>
            <label htmlFor="edit-note" className={labelClass}>
              Notiz
            </label>
            <textarea
              id="edit-note"
              rows={3}
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
              className={fieldClass}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-border px-6 py-2 text-sm font-medium uppercase tracking-widest text-muted transition hover:text-foreground"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-full bg-accent px-6 py-2 text-sm font-medium uppercase tracking-widest text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {status === "loading" ? "Speichert..." : "Speichern"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
