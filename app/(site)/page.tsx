import { getContent } from "@/lib/content";
import { getImages } from "@/lib/images";
import { getLocale } from "@/lib/locale";
import SiteHeader from "@/components/SiteHeader";
import SectionRenderer from "@/components/SectionRenderer";
import SiteFooter from "@/components/SiteFooter";

export const dynamic = "force-dynamic";

/** Einseitige Hochzeits-Website mit allen Sektionen. */
export default async function Page() {
  const locale = await getLocale();
  const content = getContent(locale);
  const images = getImages();

  return (
    <>
      <SiteHeader content={content} locale={locale} />
      <main>
        <SectionRenderer content={content} images={images} locale={locale} />
      </main>
      <SiteFooter content={content} />
    </>
  );
}
