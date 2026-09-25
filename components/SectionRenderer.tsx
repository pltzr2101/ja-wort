import type { SiteContent } from "@/content/default";
import type { Locale } from "@/lib/i18n";
import type { ImageRow } from "@/lib/images";
import Hero from "./sections/Hero";
import Countdown from "./sections/Countdown";
import Story from "./sections/Story";
import Gallery from "./sections/Gallery";
import Schedule from "./sections/Schedule";
import RsvpSection from "./sections/RsvpSection";
import Map from "./sections/Map";
import Faq from "./sections/Faq";
import ImageSection from "./sections/ImageSection";

interface Props {
  content: SiteContent;
  images: ImageRow[];
  locale: Locale;
}

/** Rendert alle aktivierten Sektionen in der konfigurierten Reihenfolge. */
export default function SectionRenderer({ content, images, locale }: Props) {
  const galleryImages = images.map((image) => ({
    src: `/api/uploads/${image.filename}`,
    caption: image.caption,
  }));

  return (
    <>
      {content.sections
        .filter((section) => section.enabled)
        .map((section) => {
          switch (section.type) {
            case "hero":
              return <Hero key={section.key} content={content} images={images} locale={locale} />;
            case "countdown":
              return <Countdown key={section.key} date={content.weddingDate} locale={locale} />;
            case "story":
              return <Story key={section.key} content={content} />;
            case "gallery":
              return <Gallery key={section.key} images={galleryImages} locale={locale} />;
            case "schedule":
              return <Schedule key={section.key} content={content} />;
            case "rsvp":
              return <RsvpSection key={section.key} content={content} locale={locale} />;
            case "map":
              return <Map key={section.key} content={content} locale={locale} />;
            case "faq":
              return <Faq key={section.key} content={content} />;
            case "image":
              return <ImageSection key={section.key} section={section} images={images} />;
            default:
              return null;
          }
        })}
    </>
  );
}
