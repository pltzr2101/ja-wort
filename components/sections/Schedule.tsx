import type { SiteContent } from "@/content/default";

export default function Schedule({ content }: { content: SiteContent }) {
  return (
    <section id="schedule" className="bg-surface px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center font-serif text-4xl font-semibold md:text-5xl">
          {content.scheduleTitle}
        </h2>
        <div className="mx-auto mt-2 h-px w-16 bg-accent" />
        <ol className="mt-12 space-y-0">
          {content.schedule.map((item) => (
            <li
              key={`${item.time}-${item.title}`}
              className="relative flex gap-6 border-l border-border pb-8 pl-6 last:pb-0"
            >
              <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-accent" />
              <span className="w-20 shrink-0 font-serif text-xl text-accent">{item.time}</span>
              <div>
                <h3 className="text-lg font-medium">{item.title}</h3>
                <p className="mt-1 text-muted">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
