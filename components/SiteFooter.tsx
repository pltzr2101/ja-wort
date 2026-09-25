import type { SiteContent } from "@/content/default";

export default function SiteFooter({ content }: { content: SiteContent }) {
  return (
    <footer className="border-t border-border px-6 py-10 text-center">
      <p className="font-serif text-2xl text-accent">{content.coupleNames}</p>
      <p className="mt-2 text-sm text-muted">
        {content.weddingDate} · {content.locationName}
      </p>
      <p className="mt-6 text-xs text-muted">Mit Liebe gemacht · Powered by JaWort</p>
    </footer>
  );
}
