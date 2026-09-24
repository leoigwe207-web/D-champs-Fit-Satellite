// Site-wide constants — fallback values that also come from the CMS at runtime.
export const SITE = {
  name: "D'Champs Fit",
  fullName: "D'Champs Fit Satellite",
  tagline: "Train Hard. Become More.",
  area: "Satellite Town, Lagos",
  address: {
    line1: "Chevron Estate",
    line2: "Satellite Town",
    city: "Lagos 102102",
    country: "Nigeria",
  },
  phone: "0810 489 1309",
  phoneIntl: "+2348104891309",
  whatsapp: "2348104891309",
  email: "hello@dchampsfit.ng",
  instagram: "https://www.instagram.com/d_champsfit",
  facebook: "", // hidden until the gym's Facebook page is confirmed
  tiktok: "https://www.tiktok.com/@dchampsfit_satellite",
  openingHours: "Mon–Sat: 7:00 AM – 9:00 PM · Sun: Closed",
  mapEmbed:
    "https://www.google.com/maps?q=Chevron%20Estate%2C%20Satellite%20Town%2C%20Lagos&output=embed",
  mapDirections:
    "https://www.google.com/maps/dir/?api=1&destination=Chevron+Estate,+Satellite+Town,+Lagos",
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/membership", label: "Membership" },
  { href: "/training", label: "Training" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
] as const;

export const NAIRA = "₦";

export function formatNaira(amount: number): string {
  return `${NAIRA}${amount.toLocaleString("en-NG")}`;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime12h(time: string | null | undefined): string {
  if (!time) return "—";
  const [h, m] = time.split(":").map(Number);
  if (isNaN(h)) return time;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m ?? 0).padStart(2, "0")} ${suffix}`;
}
