import type { SiteContent } from "@/content/default";
import { getDictionary, type Locale } from "@/lib/i18n";

/**
 * Kontakt-Sektion mit Name, Telefon/WhatsApp und E-Mail. Die Inhalte kommen
 * pro Sprache aus dem Content-Modell; ohne hinterlegte Daten rendert die
 * Sektion nichts (sie bleibt zusaetzlich in der Sektions-Verwaltung schaltbar).
 */
export default function Contact({ content, locale }: { content: SiteContent; locale: Locale }) {
  const dict = getDictionary(locale);
  const name = content.contactName.trim();
  const phone = content.contactPhone.trim();
  const email = content.contactEmail.trim();

  if (!name && !phone && !email) return null;

  const items: { href: string; label: string; value: string; external?: boolean }[] = [];
  if (phone) {
    items.push({ href: `tel:${phone}`, label: dict.contact.phone, value: phone });
    items.push({
      href: `https://wa.me/${phone.replace(/[^0-9]/g, "")}`,
      label: dict.contact.whatsapp,
      value: phone,
      external: true,
    });
  }
  if (email) {
    items.push({ href: `mailto:${email}`, label: dict.contact.email, value: email });
  }

  return (
    <section id="contact" className="bg-surface px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-serif text-4xl font-semibold md:text-5xl">{content.contactTitle}</h2>
        <div className="mx-auto mt-2 h-px w-16 bg-accent" />
        {name && <p className="mt-8 font-serif text-2xl text-accent">{name}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {items.map((item) => (
            <a
              key={`${item.label}-${item.value}`}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="flex min-w-[180px] flex-col items-center gap-1 rounded-lg border border-border bg-background px-6 py-4 transition hover:text-foreground"
            >
              <span className="text-xs uppercase tracking-widest text-muted">{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
