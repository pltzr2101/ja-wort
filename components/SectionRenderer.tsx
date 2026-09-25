import { sectionOrder, type SectionId, type SiteContent } from "@/content/default";
import type { ImageRow } from "@/lib/images";
import Hero from "./sections/Hero";
import Countdown from "./sections/Countdown";
import Story from "./sections/Story";
import Gallery from "./sections/Gallery";
import Schedule from "./sections/Schedule";
import RsvpSection from "./sections/RsvpSection";
import Map from "./sections/Map";
import Faq from "./sections/Faq";

interface Props {
  content: SiteContent;
  images: ImageRow[];
}

/** Rendert alle aktivierten Sektionen in der konfigurierten Reihenfolge. */
export default function SectionRenderer({ content, images }: Props) {
  const enabled = new Set<SectionId>(
    content.sections.filter((section) => section.enabled).map((section) => section.id)
  );

  const galleryImages = images.map((image) => ({
    src: `/api/uploads/${image.filename}`,
    caption: image.caption,
  }));

  return (
    <>
      {sectionOrder.map((id) => {
        if (!enabled.has(id)) return null;

        switch (id) {
          case "hero":
            return <Hero key={id} content={content} images={images} />;
          case "countdown":
            return <Countdown key={id} date={content.weddingDate} />;
          case "story":
            return <Story key={id} content={content} />;
          case "gallery":
            return <Gallery key={id} images={galleryImages} />;
          case "schedule":
            return <Schedule key={id} content={content} />;
          case "rsvp":
            return <RsvpSection key={id} content={content} />;
          case "map":
            return <Map key={id} content={content} />;
          case "faq":
            return <Faq key={id} content={content} />;
          default:
            return null;
        }
      })}
    </>
  );
}
