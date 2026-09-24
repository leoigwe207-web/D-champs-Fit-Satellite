export type GalleryPhoto = {
  id: string;
  src: string;
  alt: string;
  category:
    | "gym"
    | "equipment"
    | "facility"
    | "exterior"
    | "training";
  caption?: string;
  featured?: boolean;
  media_type?: "image" | "video";
  mime_type?: string | null;
  storage_path?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  /** True for bundled static assets — not deletable via Supabase. */
  isLocal?: boolean;
};

export const GALLERY_CATEGORIES = [
  "all",
  "gym",
  "equipment",
  "facility",
  "exterior",
  "training",
] as const;

const PHOTO_MAP: Record<string, string> = {
  // ── EXTERIOR ──────────────────────────────────────────────────────
  "Screenshot-2026-09-10-012332.webp": "dchamps-sign", // D'Champs Fit sign
  "Screenshot-2026-09-10-012419.webp": "building-turf", // building + green turf
  "Screenshot-2026-09-10-013028.webp": "palm-greenery", // palm tree + grass

  // ── GYM (interiors) ───────────────────────────────────────────────
  "Screenshot-2026-09-10-012048.webp": "gym-wide-a",
  "Screenshot-2026-09-10-012110.webp": "gym-floor-b",
  "Screenshot-2026-09-10-012136.webp": "strength-corner",
  "Screenshot-2026-09-10-012211.webp": "functional-rig",
  "Screenshot-2026-09-10-012237.webp": "machines-row",
  "Screenshot-2026-09-10-012259.webp": "cardio-floor",
  "Screenshot-2026-09-10-012357.webp": "mural-wall",
  "Screenshot-2026-09-10-012630.webp": "gym-floor-c",
  "Screenshot-2026-09-10-012819.webp": "your-limit-wall",
  "Screenshot-2026-09-10-012903.webp": "bench-area",
};

const META: Record<string, { alt: string; category: GalleryPhoto["category"]; caption: string }> = {
  "dchamps-sign": {
    alt: "D'Champs Fit sign on the building exterior",
    category: "exterior",
    caption: "D'Champs Fit",
  },
  "building-turf": {
    alt: "D'Champs Fit building exterior with green turf",
    category: "exterior",
    caption: "The facility from outside",
  },
  "palm-greenery": {
    alt: "Palm tree and greenery outside D'Champs Fit",
    category: "exterior",
    caption: "Greenery around the gym",
  },
  "gym-wide-a": {
    alt: "D'Champs Fit gym floor with warm cream walls and blue ceiling lighting",
    category: "gym",
    caption: "The main floor",
  },
  "gym-floor-b": {
    alt: "D'Champs Fit training floor",
    category: "gym",
    caption: "Space to move",
  },
  "strength-corner": {
    alt: "Strength training corner with rack and bench",
    category: "gym",
    caption: "Strength corner",
  },
  "functional-rig": {
    alt: "Functional training rig at D'Champs Fit",
    category: "gym",
    caption: "Functional training",
  },
  "machines-row": {
    alt: "Row of strength machines at D'Champs Fit",
    category: "gym",
    caption: "Strength machines",
  },
  "cardio-floor": {
    alt: "Cardio area with ceiling lights at D'Champs Fit",
    category: "gym",
    caption: "Cardio floor",
  },
  "mural-wall": {
    alt: "Colorful mural wall inside D'Champs Fit",
    category: "gym",
    caption: "The mural wall",
  },
  "gym-floor-c": {
    alt: "Wide view of the gym interior",
    category: "gym",
    caption: "Room to train",
  },
  "your-limit-wall": {
    alt: "\"Your only limit is you\" wall inside the gym",
    category: "gym",
    caption: "Your only limit is you",
  },
  "bench-area": {
    alt: "Bench press area at D'Champs Fit",
    category: "gym",
    caption: "Bench press area",
  },
};

/**
 * Local photos bundled with the site (from the gym's real photography).
 * When Supabase is configured, the CMS gallery table takes precedence.
 */
export const LOCAL_PHOTOS: GalleryPhoto[] = Object.entries(PHOTO_MAP).map(
  ([file, key]) => ({
    id: key,
    src: `/images/${encodeURIComponent(file)}`,
    alt: META[key].alt,
    category: META[key].category,
    caption: META[key].caption,
    featured: key === "gym-wide-a",
    isLocal: true,
  })
);

export function localPhoto(key: string): GalleryPhoto | undefined {
  return LOCAL_PHOTOS.find((p) => p.id === key);
}
