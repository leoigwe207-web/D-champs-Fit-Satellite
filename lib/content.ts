import {
  DEMO_PLANS,
  DEMO_FACILITIES,
  DEMO_SERVICES,
  DEMO_ANNOUNCEMENTS,
  type Plan,
  type FacilityItem,
  type TrainingService,
  type Trainer,
  type Testimonial,
  type Announcement,
} from "./demo-data";
import { LOCAL_PHOTOS, type GalleryPhoto } from "./photos";

async function getSB() {
  const { createClient } = await import("./supabase-server");
  return createClient();
}

export async function getPlans(): Promise<Plan[]> {
  try {
    const sb = await getSB();
    if (!sb) return DEMO_PLANS;
    const { data, error } = await sb
      .from("membership_plans")
      .select("*")
      .eq("active", true)
      .order("sort");
    if (error || !data || data.length === 0) return DEMO_PLANS;
    return data as unknown as Plan[];
  } catch {
    return DEMO_PLANS;
  }
}

export async function getPlanBySlug(slug: string): Promise<Plan | null> {
  const plans = await getPlans();
  return plans.find((p) => p.slug === slug) ?? null;
}

export async function getFacilities(): Promise<FacilityItem[]> {
  try {
    const sb = await getSB();
    if (!sb) return DEMO_FACILITIES;
    const { data, error } = await sb.from("facilities").select("*").order("sort");
    if (error || !data || data.length === 0) return DEMO_FACILITIES;
    return data as unknown as FacilityItem[];
  } catch {
    return DEMO_FACILITIES;
  }
}

export async function getServices(): Promise<TrainingService[]> {
  try {
    const sb = await getSB();
    if (!sb) return DEMO_SERVICES;
    const { data, error } = await sb
      .from("training_services")
      .select("*")
      .eq("active", true)
      .order("sort");
    if (error || !data || data.length === 0) return DEMO_SERVICES;
    return data as unknown as TrainingService[];
  } catch {
    return DEMO_SERVICES;
  }
}

/**
 * ADMIN ONLY: every trainer row — active AND disabled — so the admin can
 * re-enable, edit or delete a trainer that is currently hidden from the
 * public site. Public pages use getActiveTrainers().
 */
export async function getTrainers(): Promise<Trainer[]> {
  try {
    const sb = await getSB();
    if (!sb) return [];
    const { data, error } = await sb
      .from("trainers")
      .select("*")
      .order("name");
    if (error || !data) return [];
    return data as unknown as Trainer[];
  } catch {
    return [];
  }
}

/** PUBLIC: active trainers only, for the booking flow and website display. */
export async function getActiveTrainers(): Promise<Trainer[]> {
  try {
    const sb = await getSB();
    if (!sb) return [];
    const { data, error } = await sb
      .from("trainers")
      .select("*")
      .eq("active", true)
      .order("name");
    if (error || !data) return [];
    return data as unknown as Trainer[];
  } catch {
    return [];
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const sb = await getSB();
    if (!sb) return [];
    const { data, error } = await sb
      .from("testimonials")
      .select("*")
      .eq("approved", true)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as unknown as Testimonial[];
  } catch {
    return [];
  }
}

/**
 * ADMIN ONLY: every testimonial row — approved AND pending — for the
 * moderation queue. The public homepage accessor above stays approved-only.
 */
export async function getAllTestimonials(): Promise<Testimonial[]> {
  try {
    const sb = await getSB();
    if (!sb) return [];
    const { data, error } = await sb
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as unknown as Testimonial[];
  } catch {
    return [];
  }
}

/**
 * Returns the COMPLETE gallery collection: the bundled static photos are
 * always the base — uploaded media (public.gallery rows) is ADDED on top.
 *
 * The old implementation swapped the whole collection for the database
 * rows alone, so a single upload made every existing item disappear
 * (and deleting it restored them). Uploads must never replace anything:
 * base photos + every gallery row, always.
 *
 * Ordering: DB rows come after the static photos, newest upload first
 * within the rows (the table has no sort_order column; `sort` is its
 * integer ordering field, `created_at` breaks ties newest-first).
 */
export async function getGallery(): Promise<GalleryPhoto[]> {
  const base: GalleryPhoto[] = LOCAL_PHOTOS.map((photo) => ({
    ...photo,
    media_type: "image" as const,
  }));

  try {
    const sb = await getSB();

    if (!sb) {
      return base;
    }

    const { data, error } = await sb
      .from("gallery")
      .select(
        "id, src, alt, category, caption, featured, media_type, mime_type, storage_path, file_name, file_size"
      )
      .order("sort", {
        ascending: true,
        nullsFirst: false,
      })
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Gallery query failed — serving base photos only:",
        error
      );

      return base;
    }

    if (!data || data.length === 0) {
      return base;
    }

    const rows: GalleryPhoto[] = data.map((row: Record<string, unknown>) => ({
      id: String(row.id),

      src: String(row.src),

      alt: String(
        row.alt ?? "D'Champs Fit"
      ),

      category:
        (row.category as GalleryPhoto["category"]) ??
        "gym",

      caption:
        typeof row.caption === "string"
          ? row.caption
          : undefined,

      featured: Boolean(row.featured),

      media_type:
        row.media_type === "video"
          ? "video"
          : "image",

      mime_type:
        typeof row.mime_type === "string"
          ? row.mime_type
          : null,

      storage_path:
        typeof row.storage_path === "string"
          ? row.storage_path
          : null,

      file_name:
        typeof row.file_name === "string"
          ? row.file_name
          : null,

      file_size:
        typeof row.file_size === "number"
          ? row.file_size
          : null,
    }));

    return [...base, ...rows];
  } catch (e) {
    console.error(
      "Gallery load failed — serving base photos only:",
      e
    );

    return base;
  }
}

export async function getPublicAnnouncements(): Promise<Announcement[]> {
  try {
    const sb = await getSB();

    if (!sb) {
      return DEMO_ANNOUNCEMENTS;
    }

    const { data, error } = await sb
      .from("announcements")
      .select(
        "id, title, message, is_published, created_at"
      )
      .eq("is_published", true)
      .order("created_at", {
        ascending: false,
      })
      .limit(20);

    if (error || !data) {
      console.error(
        "Announcements query failed:",
        error
      );

      return DEMO_ANNOUNCEMENTS;
    }

    return data.map((row) => ({
      id: String(row.id),

      type: "gym_announcement",

      title: String(row.title),

      body: String(row.message),

      created_at: String(row.created_at),
    }));
  } catch (error) {
    console.error(
      "Announcements load failed:",
      error
    );

    return DEMO_ANNOUNCEMENTS;
  }
}