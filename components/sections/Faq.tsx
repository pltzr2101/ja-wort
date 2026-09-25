import type { SiteContent } from "@/content/default";

/** FAQ als natives <details>-Akkordeon (kein JavaScript noetig). */
export default function Faq({ content }: { content: SiteContent }) {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <h2 className="text-center font-serif text-4xl font-semibold md:text-5xl">
        {content.faqTitle}
      </h2>
      <div className="mx-auto mt-2 h-px w-16 bg-accent" />
      <div className="mt-12 space-y-4">
        {content.faq.map((item) => (
          <details
            key={item.question}
            className="group rounded-lg border border-border bg-surface px-6 py-4"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
              {item.question}
              <span className="ml-4 text-accent transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-4 text-muted">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
