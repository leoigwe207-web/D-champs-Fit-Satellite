# D'CHAMPS FIT SATELLITE

**Complete Gym Website + Membership Management MVP**
Chevron Estate, Satellite Town, Lagos · 0810 489 1309

The website acquires customers. The membership system converts them. The payment
system collects revenue. The QR system tracks attendance. The dashboard runs
operations. The CMS lets the gym owner maintain the website.

---

## Quick start (Demo Mode — no keys needed)

```bash
npm install
npm run dev
```

Open http://localhost:3000 — the **entire product works with seeded demo data**:
public site, join flow, member dashboard, QR code, admin dashboard, CMS.
Connect Supabase/Paystack later by filling `.env` (see below).

| Area | URL |
|---|---|
| Public site | `/` · `/about` · `/membership` · `/training` · `/gallery` · `/contact` |
| Join flow | `/join` (plan → account → review → Paystack) |
| Member dashboard | `/dashboard` (+ membership, attendance, QR, bookings, payments, profile) |
| Admin control center | `/admin` (+ members, memberships, payments, attendance, bookings, trainers, gallery, testimonials, announcements, settings) |

---

## Going live — 3 steps

### 1. Supabase (database, auth, storage)

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor** → paste the whole of [`supabase/schema.sql`](supabase/schema.sql) → Run.
   This creates all tables, Row Level Security, triggers and seed data.
3. **Project Settings → API** → copy values into `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # server-only, never expose
```

4. In **Authentication → URL Configuration**, add your production URL as a
   redirect URL (used by password reset).

### 2. Paystack (payments)

1. Get keys from [dashboard.paystack.com](https://dashboard.paystack.com/#/settings/developers).
2. Add to `.env.local`:

```bash
PAYSTACK_SECRET_KEY=sk_test_...   # or sk_live_... in production
```

3. In Paystack → **Settings → API Keys & Webhooks**, set the webhook URL to:
   `https://your-domain.com/api/paystack/webhook`

Payment flow: initialize (server) → Paystack checkout → callback to
`/join/success` → server-side **verify** → membership becomes **ACTIVE**. The
webhook independently confirms events (HMAC-SHA512 verified, idempotent), so a
closed tab cannot cause a paid-but-inactive member.

### 3. Deploy on Vercel

Push to GitHub, import the repo at [vercel.com](https://vercel.com), add all four
environment variables (plus `NEXT_PUBLIC_SITE_URL=https://your-domain.com`), deploy.

**First admin:** sign up at `/register`, then in Supabase
(`Authentication → Users`) find that user, and set their role in the `profiles`
table:

```sql
update public.profiles set role = 'admin' where email = 'owner@dchampsfit.ng';
```

---

## ⚠️ Membership prices

Prices are **intentionally left blank**. They are example numbers, not confirmed
D'Champs Fit prices. Set the real ones in **Admin → Memberships** — the website
and checkout always read them live from the database. Nothing is hard-coded.

---

## What's inside

- **Public website** — hero, value props, about, facilities, mural brand
  section, outdoor space, trainers, testimonials, contact + Google Maps,
  all CMS-editable content with real gym photography.
- **Join flow** — 3-step checkout (plan → account → review → Paystack → auto-ACTIVE).
- **Member dashboard** — membership card, attendance, bookings, payment history,
  profile, unique **QR code** for reception check-in, notifications, announcements.
- **Admin dashboard** — stats (members, revenue, attendance), member
  suspend/reactivate, plan pricing editor, payments, attendance log with date
  filter, booking confirm/cancel, trainer manager, gallery manager, testimonial
  approval, announcements, full website CMS (hero/about/hours/contact/SEO).
- **Security** — Supabase auth, role-based access (member/staff/admin), protected
  routes via middleware, RLS on every table, server-side payment verification,
  zod input validation, secrets server-only.
- **SEO** — editable metadata, sitemap, robots, Open Graph, LocalBusiness JSON-LD.

## Scripts

```bash
npm run dev        # develop on :3000
npm run build      # production build
npm run start      # serve production build
npm run typecheck  # tsc --noEmit
```

## Tech stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres, Auth,
Storage) · Paystack · Vercel. Fonts: Bebas Neue + Inter. Brand palette:
`#0B0B0B` ink, `#D9A441` gold, `#F1D99B` cream, `#2563EB` blue accent.
