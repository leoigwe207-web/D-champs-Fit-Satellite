import { getGallery } from "@/lib/content";
import GalleryManager from "./GalleryManager";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const photos = await getGallery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-white">GALLERY</h1>
        <p className="max-w-xl text-sm text-neutral-500">
          {photos.length} images shown on the public gallery. Until Supabase
          Storage is connected you can add images by URL; after connecting,
          upload straight from here.
        </p>
      </div>
      <GalleryManager photos={photos} />
    </div>
  );
}
