"use client";

import { useEffect, useState } from "react";

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function diff(target: Date): Remaining | null {
  const ms = target.getTime() - Date.now();
  if (ms <= 0) return null;
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms % 86_400_000) / 3_600_000),
    minutes: Math.floor((ms % 3_600_000) / 60_000),
    seconds: Math.floor((ms % 60_000) / 1000),
  };
}

/** Live-Countdown bis zum Hochzeitstag (Client-Komponente). */
export default function Countdown({ date }: { date: string }) {
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    const target = new Date(`${date}T00:00:00`);
    const update = () => setRemaining(diff(target));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [date]);

  if (!remaining) {
    return <div className="mx-auto h-24 max-w-xl" aria-hidden />;
  }

  const units = [
    { value: remaining.days, label: "Tage" },
    { value: remaining.hours, label: "Stunden" },
    { value: remaining.minutes, label: "Minuten" },
    { value: remaining.seconds, label: "Sekunden" },
  ];

  return (
    <div className="mx-auto grid max-w-xl grid-cols-2 gap-4 sm:grid-cols-4">
      {units.map((unit) => (
        <div
          key={unit.label}
          className="rounded-xl border border-border bg-surface px-4 py-6 text-center"
        >
          <div className="font-serif text-4xl font-semibold text-accent">{unit.value}</div>
          <div className="mt-1 text-sm uppercase tracking-widest text-muted">{unit.label}</div>
        </div>
      ))}
    </div>
  );
}
