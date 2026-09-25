import { getImages } from "@/lib/images";
import GalleryManager from "@/components/GalleryManager";

export const dynamic = "force-dynamic";

/** Galerie-Verwaltung. */
export default function GalleryPage() {
  const images = getImages();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold">Galerie</h1>
      <GalleryManager initial={images} />
    </div>
  );
}
