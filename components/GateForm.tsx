"use client";

import { useState } from "react";

/** Anmeldeformular fuer Gaeste (gemeinsames Passwort). */
export default function GateForm() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/gate/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Falsches Passwort.");
        setStatus("idle");
        return;
      }

      window.location.href = "/";
    } catch {
      setError("Netzwerkfehler. Bitte versuche es erneut.");
      setStatus("idle");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-muted">
          Passwort
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
          placeholder="••••••••"
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
        {status === "loading" ? "Bitte warten..." : "Eintreten"}
      </button>
    </form>
  );
}
