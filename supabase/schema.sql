-- ════════════════════════════════════════════════════════════════════
-- D'CHAMPS FIT SATELLITE — Supabase schema
-- Run this whole file in: Supabase Dashboard → SQL Editor → New query
-- ════════════════════════════════════════════════════════════════════

-- ── ENUMS ────────────────────────────────────────────────────────────
create type member_status   as enum ('active', 'expired', 'suspended');
create type payment_status  as enum ('pending', 'successful', 'failed', 'refunded');
create type booking_status  as enum ('pending', 'confirmed', 'completed', 'cancelled');
create type app_role        as enum ('member', 'staff', 'admin');

-- ── PROFILES (1:1 with auth.users) ──────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text not null default '',
  phone       text,
  role        app_role not null default 'member',
  created_at  timestamptz not null default now()
);

-- Auto-create a profile for every new auth user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── MEMBERS ─────────────────────────────────────────────────────────
create table public.members (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references auth.users(id) on delete cascade,
  member_code  text not null unique,
  status       member_status not null default 'expired',
  plan_id      uuid references public.membership_plans(id),
  plan_name    text,
  plan_slug    text,
  end_date     date,
  created_at   timestamptz not null default now()
);

-- Auto member code DCF-YYYY-NNNN
create or replace function public.set_member_code()
returns trigger
language plpgsql
as $$
begin
  if new.member_code is null or new.member_code = '' then
    new.member_code := 'DCF-' || to_char(now(), 'YYYY') || '-' ||
      lpad((floor(random() * 9000) + 1000)::text, 4, '0');
  end if;
  return new;
end;
$$;

create trigger trg_member_code
  before insert on public.members
  for each row execute function public.set_member_code();

-- ── MEMBERSHIP PLANS ────────────────────────────────────────────────
create table public.membership_plans (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  slug           text not null unique,
  duration_days  int  not null,
  price          numeric(12,2) not null default 0,
  description    text not null default '',
  features       text[] not null default '{}',
  badge          text,
  active         boolean not null default true,
  sort           int not null default 0
);

-- ── PAYMENTS ────────────────────────────────────────────────────────
create table public.payments (
  id                      uuid primary key default gen_random_uuid(),
  member_id               uuid references public.members(id) on delete set null,
  plan_id                 uuid references public.membership_plans(id),
  plan_name               text,
  amount                  numeric(12,2) not null default 0,
  method                  text not null default 'Paystack',
  reference               text not null unique,
  paystack_transaction_id text,
  status                  payment_status not null default 'pending',
  paid_at                 timestamptz,
  created_at              timestamptz not null default now()
);

-- ── ATTENDANCE ──────────────────────────────────────────────────────
create table public.attendance (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references public.members(id) on delete cascade,
  checkin_at  timestamptz not null default now(),
  location    text not null default 'Chevron Estate — Main Entrance',
  status      text not null default 'Checked in'
);
create index idx_attendance_member on public.attendance(member_id, checkin_at desc);
create index idx_attendance_day    on public.attendance(checkin_at);

-- ── TRAINERS ────────────────────────────────────────────────────────
create table public.trainers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  specialty   text not null default '',
  bio         text not null default '',
  experience  text not null default '',
  photo_url   text,
  active      boolean not null default true
);

-- ── TRAINING SERVICES ───────────────────────────────────────────────
create table public.training_services (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  icon        text not null default 'dumbbell',
  active      boolean not null default true,
  sort        int not null default 0
);

-- ── BOOKINGS ────────────────────────────────────────────────────────
create table public.bookings (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references public.members(id) on delete cascade,
  trainer_id  uuid references public.trainers(id),
  service     text not null,
  date        date not null,
  time        text not null,
  status      booking_status not null default 'pending',
  notes       text,
  created_at  timestamptz not null default now()
);
create index idx_bookings_date on public.bookings(date);

-- ── GALLERY ─────────────────────────────────────────────────────────
create table public.gallery (
  id          uuid primary key default gen_random_uuid(),
  title       text,
  image_url   text not null,
  category    text not null default 'gym',
  is_featured boolean not null default false,
  created_at  timestamptz not null default now(),
  src         text,
  alt         text not null default 'D''Champs Fit',
  caption     text,
  featured    boolean not null default false,
  sort        int not null default 0,
  media_type  text not null default 'image',
  mime_type   text,
  storage_path text,
  file_name   text,
  file_size   bigint
);

-- ── TESTIMONIALS ────────────────────────────────────────────────────
create table public.testimonials (
  id              uuid primary key default gen_random_uuid(),
  quote           text not null,
  name            text not null,
  member_duration text,
  rating          int not null default 5 check (rating between 1 and 5),
  approved        boolean not null default false,
  created_at      timestamptz not null default now()
);

-- ── FACILITIES (CMS-editable) ───────────────────────────────────────
create table public.facilities (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  sort        int not null default 0
);

-- ── ANNOUNCEMENTS ───────────────────────────────────────────────────
create table public.announcements (
  id         uuid primary key default gen_random_uuid(),
  type       text not null default 'gym_announcement',
  title      text not null,
  body       text not null default '',
  created_at timestamptz not null default now()
);

-- ── NOTIFICATIONS ───────────────────────────────────────────────────
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  body       text not null default '',
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_notifications_user on public.notifications(user_id, created_at desc);

-- ── SITE SETTINGS (single row, id = 1) ──────────────────────────────
create table public.site_settings (
  id              int primary key default 1 check (id = 1),
  brand_name      text not null default 'D''Champs Fit',
  hero_headline   text not null default 'Train Hard. Become More.',
  hero_sub        text not null default 'A premium training environment built for strength, fitness and consistency.',
  about_headline  text not null default 'Build Your Strongest Self',
  about_text      text not null default '',
  opening_hours   text not null default 'Mon–Sat: 7:00 AM – 9:00 PM · Sun: Closed',
  phone           text not null default '0810 489 1309',
  whatsapp        text not null default '2348104891309',
  address_line1   text not null default 'Chevron Estate',
  address_line2   text not null default 'Satellite Town',
  address_city    text not null default 'Lagos 102102',
  seo_title       text not null default 'D''Champs Fit Satellite — Gym in Satellite Town, Lagos',
  seo_description text not null default 'Premium gym in Chevron Estate, Satellite Town Lagos.',
  updated_at      timestamptz not null default now()
);

-- ── STORAGE BUCKET (gallery + trainer photos) ───────────────────────
insert into storage.buckets (id, name, public)
values ('gym-assets', 'gym-assets', true)
on conflict (id) do nothing;

-- ════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════════
alter table public.profiles          enable row level security;
alter table public.members           enable row level security;
alter table public.membership_plans  enable row level security;
alter table public.payments          enable row level security;
alter table public.attendance        enable row level security;
alter table public.trainers          enable row level security;
alter table public.training_services enable row level security;
alter table public.bookings          enable row level security;
alter table public.gallery           enable row level security;
alter table public.testimonials      enable row level security;
alter table public.facilities        enable row level security;
alter table public.announcements     enable row level security;
alter table public.notifications     enable row level security;
alter table public.site_settings     enable row level security;

-- Helper: current user's role
create or replace function public.current_role()
returns app_role
language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Helper: current user's member row id
create or replace function public.current_member_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select id from public.members where user_id = auth.uid();
$$;

-- Helper: is admin/staff
create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()) in ('admin','staff'), false);
$$;

-- ── PROFILES ────────────────────────────────────────────────────────
create policy "read own profile"       on public.profiles for select using (auth.uid() = id or public.is_staff());
-- Members may update only their own row, and may NOT change their own role
-- (privilege-escalation guard: with check rejects any role change).
create policy "update own profile"     on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = public.current_role());

-- Column-level hardening: even with the policy above, members can only set
-- these columns. email/id/role are managed by the trigger and staff (service
-- role bypasses these grants).
revoke update on public.profiles from anon, authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- Public-read content tables: anon + authenticated must be able to SELECT
-- (RLS policies decide visibility; without these grants even the public
-- gallery page gets "permission denied").
grant select on public.gallery,
  public.membership_plans,
  public.training_services,
  public.trainers,
  public.testimonials,
  public.facilities,
  public.announcements,
  public.site_settings
  to anon, authenticated;

-- ── MEMBERS: members see only their own row; staff see all ─────────
create policy "member read own"        on public.members for select using (auth.uid() = user_id or public.is_staff());
-- A member may create their own (expired) member row; all other writes are
-- staff-only (membership status/plan changes flow through the service role).
create policy "member insert own row"  on public.members for insert with check (auth.uid() = user_id);
create policy "staff write members"    on public.members for all using (public.is_staff()) with check (public.is_staff());

-- ── PLANS: public read, admin write ─────────────────────────────────
create policy "plans public read"      on public.membership_plans for select using (active = true or public.is_staff());
create policy "plans admin write"      on public.membership_plans for all using (public.is_staff()) with check (public.is_staff());

-- ── PAYMENTS: own only; write via service-role (webhook) only ──────
create policy "payments read own"      on public.payments for select using (member_id = public.current_member_id() or public.is_staff());

-- ── ATTENDANCE: own only ────────────────────────────────────────────
create policy "attendance read own"    on public.attendance for select using (member_id = public.current_member_id() or public.is_staff());
create policy "attendance staff write" on public.attendance for insert with check (public.is_staff());

-- ── TRAINERS / SERVICES / FACILITIES / GALLERY: public read ─────────
create policy "trainers public read"   on public.trainers for select using (active = true or public.is_staff());
create policy "trainers admin write"   on public.trainers for all using (public.is_staff()) with check (public.is_staff());

create policy "services public read"   on public.training_services for select using (active = true or public.is_staff());
create policy "services admin write"   on public.training_services for all using (public.is_staff()) with check (public.is_staff());

create policy "facilities public read" on public.facilities for select using (true);
create policy "facilities admin write" on public.facilities for all using (public.is_staff()) with check (public.is_staff());

create policy "gallery public read"    on public.gallery for select using (true);
create policy "gallery admin write"    on public.gallery for all using (public.is_staff()) with check (public.is_staff());

-- ── TESTIMONIALS: approved are public; admin manages ───────────────
create policy "testimonials read"      on public.testimonials for select using (approved = true or public.is_staff());
create policy "testimonials admin write" on public.testimonials for all using (public.is_staff()) with check (public.is_staff());

-- ── ANNOUNCEMENTS: public read ──────────────────────────────────────
create policy "announcements read"     on public.announcements for select using (true);
create policy "announcements admin write" on public.announcements for all using (public.is_staff()) with check (public.is_staff());

-- ── BOOKINGS: member inserts own (pending), reads own; staff manage ─
create policy "bookings read own"      on public.bookings for select using (member_id = public.current_member_id() or public.is_staff());
create policy "bookings member insert" on public.bookings for insert with check (member_id = public.current_member_id() and status = 'pending');
create policy "bookings staff write"   on public.bookings for update using (public.is_staff()) with check (public.is_staff());
create policy "bookings staff delete"  on public.bookings for delete using (public.is_staff());

-- ── NOTIFICATIONS: own only; server writes via service role ────────
create policy "notifications read own" on public.notifications for select using (auth.uid() = user_id);
-- Members may only mark their own notifications read — they cannot change
-- user_id, title or body, and cannot insert or delete notifications.
create policy "notifications mark read" on public.notifications for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
revoke update on public.notifications from anon, authenticated;
grant update (read) on public.notifications to authenticated;

-- ── SITE SETTINGS: public read; admin write ────────────────────────
create policy "settings public read"   on public.site_settings for select using (true);
create policy "settings admin write"   on public.site_settings for all using (public.is_staff()) with check (public.is_staff());

-- ── STORAGE: public read gallery bucket; staff write ───────────────
create policy "storage public read"    on storage.objects for select using (bucket_id = 'gallery');
create policy "storage staff write"    on storage.objects for insert with check (bucket_id = 'gallery' and public.is_staff());
create policy "storage staff delete"   on storage.objects for delete using (bucket_id = 'gallery' and public.is_staff());

-- ════════════════════════════════════════════════════════════════════
-- SEED DATA (edit later in Admin → whatever)
-- ════════════════════════════════════════════════════════════════════

-- ⚠️ PRICES ARE PLACEHOLDERS — set real prices in Admin → Memberships.
insert into public.membership_plans (name, slug, duration_days, price, description, features, badge, sort) values
  ('Monthly',   'monthly',   30,  0, '30-day membership. Full access, no long commitment.',
   '{"Full gym access","All equipment zones","Locker room access","Free fitness orientation"}', null, 1),
  ('Quarterly', 'quarterly', 90,  0, '90-day membership for a real training block.',
   '{"Everything in Monthly","1 free fitness assessment","1 guest pass","Priority booking for trainers"}', 'Popular', 2),
  ('Annual',    'annual',   365,  0, '365-day membership. The full-year commitment.',
   '{"Everything in Quarterly","Quarterly fitness assessments","2 guest passes per quarter","Member-only offers"}', 'Best Value', 3);

insert into public.facilities (title, description, sort) values
  ('Strength',     'Machines, racks and benches.', 1),
  ('Free Weights', 'Dumbbells and free-weight equipment.', 2),
  ('Cable',        'Cable and functional training stations.', 3),
  ('Cardio',       'Cycling and cardiovascular equipment.', 4),
  ('Functional',   'Open training space.', 5);

insert into public.training_services (title, description, icon, sort) values
  ('Personal Training',  'One-on-one coaching.', 'dumbbell', 1),
  ('Weight Loss',        'Goal-focused fitness programs.', 'flame', 2),
  ('Muscle Building',    'Strength and hypertrophy focused training.', 'muscle', 3),
  ('Fitness Assessment', 'Baseline assessment and progress tracking.', 'chart', 4),
  ('Nutrition Guidance', 'Basic nutrition support around training goals.', 'leaf', 5);

-- Real trainer profiles are added by the gym owner in Admin → Trainers.
-- (No seed coaches: only genuine staff should appear on the website.)

insert into public.site_settings (id) values (1) on conflict (id) do nothing;
