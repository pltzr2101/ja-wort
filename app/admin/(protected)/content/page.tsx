import { getContent } from "@/lib/content";
import ContentForm from "@/components/ContentForm";

export const dynamic = "force-dynamic";

/** Inhalts-Editor (Baukasten). */
export default function ContentPage() {
  const content = getContent();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold">Inhalte bearbeiten</h1>
      <ContentForm initial={content} />
    </div>
  );
}
