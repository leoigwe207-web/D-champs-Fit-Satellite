/**
 * DEMO MODE content — used whenever Supabase is not configured yet.
 * The gym owner later edits all of this from the Admin dashboard (CMS),
 * which writes to the same tables in Supabase.
 */

export type Plan = {
  id: string;
  name: string;
  slug: "monthly" | "quarterly" | "annual";
  duration_days: number;
  price: number;
  description: string;
  features: string[];
  badge: string | null;
  active: boolean;
  sort: number;
};

// Prices are PLACEHOLDERS — the gym owner sets real prices in Admin → Memberships.
export const DEMO_PLANS: Plan[] = [
  {
    id: "plan-monthly",
    name: "Monthly",
    slug: "monthly",
    duration_days: 30,
    price: 0,
    description: "30-day membership. Full access, no long commitment.",
    features: [
      "Full gym access",
      "All equipment zones",
      "Locker room access",
      "Free fitness orientation",
    ],
    badge: null,
    active: true,
    sort: 1,
  },
  {
    id: "plan-quarterly",
    name: "Quarterly",
    slug: "quarterly",
    duration_days: 90,
    price: 0,
    description: "90-day membership for a real training block.",
    features: [
      "Everything in Monthly",
      "1 free fitness assessment",
      "1 guest pass",
      "Priority booking for trainers",
    ],
    badge: "Popular",
    active: true,
    sort: 2,
  },
  {
    id: "plan-annual",
    name: "Annual",
    slug: "annual",
    duration_days: 365,
    price: 0,
    description: "365-day membership. The full-year commitment.",
    features: [
      "Everything in Quarterly",
      "Quarterly fitness assessments",
      "2 guest passes per quarter",
      "Member-only offers",
    ],
    badge: "Best Value",
    active: true,
    sort: 3,
  },
];

export type FacilityItem = {
  id: string;
  title: string;
  description: string;
  sort: number;
};

export const DEMO_FACILITIES: FacilityItem[] = [
  { id: "f1", title: "Strength", description: "Machines, racks and benches.", sort: 1 },
  { id: "f2", title: "Free Weights", description: "Dumbbells and free-weight equipment.", sort: 2 },
  { id: "f3", title: "Cable", description: "Cable and functional training stations.", sort: 3 },
  { id: "f4", title: "Cardio", description: "Cycling and cardiovascular equipment.", sort: 4 },
  { id: "f5", title: "Functional", description: "Open training space.", sort: 5 },
];

export type TrainingService = {
  id: string;
  title: string;
  description: string;
  icon: string;
  sort: number;
};

export const DEMO_SERVICES: TrainingService[] = [
  { id: "s1", title: "Personal Training", description: "One-on-one coaching.", icon: "dumbbell", sort: 1 },
  { id: "s2", title: "Weight Loss", description: "Goal-focused fitness programs.", icon: "flame", sort: 2 },
  { id: "s3", title: "Muscle Building", description: "Strength and hypertrophy focused training.", icon: "muscle", sort: 3 },
  { id: "s4", title: "Fitness Assessment", description: "Baseline assessment and progress tracking.", icon: "chart", sort: 4 },
  { id: "s5", title: "Nutrition Guidance", description: "Basic nutrition support around training goals.", icon: "leaf", sort: 5 },
];

export type Trainer = {
  id: string;
  name: string;
  phone?: string | null;
  specialty: string;
  availability?: string | null;
  // Legacy DB columns kept for compatibility — NOT edited or displayed by
  // the application anymore.
  bio?: string | null;
  photo_url?: string | null;
  active: boolean;
};

// No invented trainers — real coach profiles are added by the gym owner in
// Admin → Trainers and then appear on the site and booking flow.
export const DEMO_TRAINERS: Trainer[] = [];

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  member_duration: string | null;
  rating: number;
  approved: boolean;
};

// No invented reviews — testimonials are collected from real members and
// approved by the gym owner in Admin → Testimonials before they appear.
export const DEMO_TESTIMONIALS: Testimonial[] = [];

export type Announcement = {
  id: string;
  type: string;
  title: string;
  body: string;
  created_at: string;
};

export const DEMO_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "a1",
    type: "gym_announcement",
    title: "Welcome to D'Champs Fit Satellite",
    body: "Our new digital platform is live — join, pay and check in with your member QR code.",
    created_at: "2026-09-01T08:00:00Z",
  },
];

export const BOOKING_TIMES = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "16:00", "17:00", "18:00", "19:00", "20:00", "21:00",
] as const;
