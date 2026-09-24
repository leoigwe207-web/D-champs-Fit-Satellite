export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import GalleryGrid from "@/components/GalleryGrid";
import { getGallery } from "@/lib/content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Inside D'Champs Fit Satellite — the gym floor, equipment, outdoor turf space and facility in Satellite Town, Lagos.",
};

export default async function GalleryPage() {
  const photos = await getGallery();

  return (
    <section className="pt-16">
      <div className="container-page pb-16 pt-16">
        <SectionHeading eyebrow="Gallery" title="Inside D'Champs Fit" center />
        <p className="mx-auto mt-3 max-w-xl text-center text-neutral-400">
          The actual facility — floor, equipment and outdoor space.
        </p>
        <div className="mt-10">
          <GalleryGrid photos={photos} />
        </div>
      </div>
    </section>
  );
}
