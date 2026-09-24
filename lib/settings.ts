import { SITE } from "./site";

export type SiteSettings = {
  brand_name: string;
  hero_headline: string;
  hero_sub: string;
  about_headline: string;
  about_text: string;
  opening_hours: string;
  phone: string;
  whatsapp: string;
  address_line1: string;
  address_line2: string;
  address_city: string;
  seo_title: string;
  seo_description: string;
  meta_updated_at?: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  brand_name: "D'Champs Fit",
  hero_headline: "Train Hard. Become More.",
  hero_sub:
    "A premium training environment built for strength, fitness and consistency.",
  about_headline: "Build Your Strongest Self",
  about_text:
    "D'Champs Fit Satellite is a premium gym in Chevron Estate, Satellite Town, Lagos — built on warm cream walls, dark flooring, a wood ceiling and blue-lit nights that make every session feel like an event. We combine modern equipment with coaching that keeps you accountable, so training here becomes the most consistent part of your week.",
  opening_hours: SITE.openingHours,
  phone: SITE.phone,
  whatsapp: SITE.whatsapp,
  address_line1: SITE.address.line1,
  address_line2: SITE.address.line2,
  address_city: SITE.address.city,
  seo_title: "D'Champs Fit Satellite — Gym in Satellite Town, Lagos",
  seo_description:
    "Premium gym in Chevron Estate, Satellite Town Lagos. Strength training, personal training, cardio and more. Monthly, quarterly and annual memberships.",
};

/**
 * Loads CMS-editable site settings. Falls back to DEFAULT_SETTINGS when
 * Supabase isn't configured or the table is missing — the site always renders.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { createClient } = await import("./supabase-server");
    const supabase = await createClient();
    if (!supabase) return DEFAULT_SETTINGS;
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (error || !data) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...data } as SiteSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}
