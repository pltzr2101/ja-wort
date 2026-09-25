import { getContent } from "@/lib/content";
import { getImages } from "@/lib/images";
import SiteHeader from "@/components/SiteHeader";
import SectionRenderer from "@/components/SectionRenderer";
import SiteFooter from "@/components/SiteFooter";

export const dynamic = "force-dynamic";

/** Einseitige Hochzeits-Website mit allen Sektionen. */
export default function Page() {
  const content = getContent();
  const images = getImages();

  return (
    <>
      <SiteHeader content={content} />
      <main>
        <SectionRenderer content={content} images={images} />
      </main>
      <SiteFooter content={content} />
    </>
  );
}
