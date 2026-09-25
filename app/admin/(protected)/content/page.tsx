import { getContent } from "@/lib/content";
import { getImages } from "@/lib/images";
import ContentForm from "@/components/ContentForm";

export const dynamic = "force-dynamic";

/** Inhalts-Editor (Baukasten), zweisprachig (DE/KO). */
export default function ContentPage() {
  const contentDe = getContent("de");
  const contentKo = getContent("ko");
  const images = getImages();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold">Inhalte bearbeiten</h1>
      <ContentForm initialDe={contentDe} initialKo={contentKo} images={images} />
    </div>
  );
}
