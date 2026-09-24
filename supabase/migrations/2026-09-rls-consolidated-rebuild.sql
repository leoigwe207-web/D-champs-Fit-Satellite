-- ════════════════════════════════════════════════════════════════════
-- D'CHAMPS FIT SATELLITE — Consolidated RLS & grants rebuild (2026-09)
-- Apply: Supabase Dashboard → SQL Editor → paste everything → Run.
--
-- Why this exists:
--   The live database drifted from supabase/schema.sql. The earlier
--   "public-read-grants" script aborted midway (missing is_staff()) and
--   Postgres rolled the whole batch back. Live state before this script:
--     • 6 public content tables unreadable (no SELECT grants/policies)
--     • profiles 42P17 infinite recursion (live current_role() helper
--       is not SECURITY DEFINER, and profile policies evaluate it)
--     • members could not update their own profile
--
-- This script is SELF-CONTAINED and IDEMPOTENT — safe to run twice.
-- Column names match the LIVE database exactly.
--
-- Least-privilege model (nothing weakened, Gallery untouched):
--   anon          → SELECT on 8 public content tables. ZERO writes.
--   member        → SELECT own rows (auth.uid()/user_id scoping);
--                   UPDATE only their own full_name + phone (column
--                   grants — role/email/id are unreachable). All other
--                   writes happen server-side via the service role.
--   staff/admin   → write public content via is_staff() policies.
--   service_role  → bypasses RLS/grants; used only by trusted server code.
--
-- NOTE: no client code path inserts into profiles/members/bookings/
-- memberships/payments/attendance (verified by code audit), so those
-- tables get NO INSERT grants — deny by default.
-- ════════════════════════════════════════════════════════════════════

-- ── 1. DROP ALL EXISTING POLICIES ON APP TABLES ─────────────────────
-- Done FIRST so (a) the drifted current_role() helper can be replaced
-- without dependency errors, and (b) no unknown-named drift policy can
-- collide with (or survive alongside) the correct policies below.
-- Postgres policy names on this database have drifted from schema.sql,
-- so this drops EVERY policy on the app tables dynamically, whatever
-- it is called, then recreates the full intended set in section 5.
do $$
declare r record;
begin
  for r in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'profiles', 'members', 'memberships', 'payments', 'attendance',
        'bookings', 'notifications', 'gallery', 'membership_plans',
        'training_services', 'trainers', 'testimonials', 'facilities',
        'announcements', 'site_settings'
      )
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- Policies recreated in section 5 (for reference):
--   profiles:   profiles select own · profiles update own
--   members:    member read own · staff write members
--   memberships:memberships read own
--   payments:   payments read own
--   attendance: attendance read own
--   bookings:   bookings read own · bookings staff update · bookings staff delete
--   notifications: notifications read own
--   gallery:    gallery public read · gallery admin write
--   membership_plans:   plans public read · plans admin write
--   training_services:  services public read · services admin write
--   trainers:   trainers public read · trainers admin write
--   testimonials: testimonials read · testimonials admin write
--   facilities: facilities public read · facilities admin write
--   announcements: announcements read · announcements admin write
--   site_settings: settings public read · settings admin write

-- The drifted, recursion-prone helper goes away entirely; the new
-- policies below never reference it. The drop is failure-safe: if some
-- unknown object still depends on the function, we skip the drop and
-- continue rather than aborting the whole migration (the leftover
-- function is inert — nothing references it anymore).
do $$
begin
  drop function if exists public.current_role();
exception when others then
  raise notice 'Skipped dropping public.current_role(): %', sqlerrm;
end $$;

-- ── 2. HELPER FUNCTIONS (SECURITY DEFINER → no policy recursion) ─────
create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()) in ('admin','staff'), false);
$$;

-- Resolves the caller's members row (payments/attendance/bookings key
-- on member_id). SECURITY DEFINER so evaluating it inside another
-- table's policy cannot recurse through members' own RLS.
create or replace function public.current_member_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select id from public.members where user_id = auth.uid() limit 1;
$$;

-- anon needs EXECUTE on is_staff(): public-read policy expressions
-- evaluate it during anonymous queries. It only reveals the CALLER's
-- own staff status (reads the caller's own profile row) — nothing else.
revoke execute on function public.is_staff() from public;
grant execute on function public.is_staff() to anon, authenticated, service_role;
revoke execute on function public.current_member_id() from public;
grant execute on function public.current_member_id() to authenticated, service_role;

-- ── 3. ENABLE RLS ON EVERY APPLICATION TABLE ─────────────────────────
alter table public.profiles          enable row level security;
alter table public.members           enable row level security;
alter table public.memberships       enable row level security;
alter table public.payments          enable row level security;
alter table public.attendance        enable row level security;
alter table public.bookings          enable row level security;
alter table public.notifications     enable row level security;
alter table public.gallery           enable row level security;
alter table public.membership_plans  enable row level security;
alter table public.training_services enable row level security;
alter table public.trainers          enable row level security;
alter table public.testimonials      enable row level security;
alter table public.facilities        enable row level security;
alter table public.announcements     enable row level security;
alter table public.site_settings     enable row level security;

-- ── 4. TABLE + COLUMN GRANTS (least privilege) ───────────────────────
-- Public content: read-only. No INSERT/UPDATE/DELETE granted — content
-- writes are staff-only via RLS policies; the staff UI itself uses the
-- service role, which bypasses grants.
grant select on public.gallery,
  public.membership_plans,
  public.training_services,
  public.trainers,
  public.testimonials,
  public.facilities,
  public.announcements,
  public.site_settings
  to anon, authenticated;

-- Member-visible tables: SELECT for authenticated users; RLS scopes
-- every role to its own rows.
grant select on public.profiles,
  public.members,
  public.memberships,
  public.payments,
  public.attendance,
  public.bookings,
  public.notifications
  to authenticated;

-- profiles: members may update ONLY their own full_name + phone.
-- id, email and role are managed by the signup trigger / staff (service
-- role). The column grant is what makes role escalation impossible.
revoke update on public.profiles from anon, authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- Everything else: deny writes outright (no grants). These revokes are
-- idempotent no-ops where no grant exists, and repair any drift where
-- one does.
revoke insert, update, delete on public.members      from anon, authenticated;
revoke insert, update, delete on public.memberships  from anon, authenticated;
revoke insert, update, delete on public.payments     from anon, authenticated;
revoke insert, update, delete on public.attendance   from anon, authenticated;
revoke insert, update, delete on public.bookings     from anon, authenticated;
revoke insert, update, delete on public.notifications from anon, authenticated;
revoke insert, update, delete, truncate on public.gallery,
  public.membership_plans, public.training_services, public.trainers,
  public.testimonials, public.facilities, public.announcements,
  public.site_settings
  from anon, authenticated;

-- ── 5. RLS POLICIES ──────────────────────────────────────────────────

-- PROFILES ─ read/update own + staff. Role changes are impossible:
-- the update grant excludes the role column, and the WITH CHECK pins
-- ownership. (No insert policy: signup trigger runs as definer.)
create policy "profiles select own" on public.profiles for select
  using (auth.uid() = id or public.is_staff());
create policy "profiles update own" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- MEMBERS ─ own row; staff manage everyone.
create policy "member read own" on public.members for select
  using (auth.uid() = user_id or public.is_staff());
create policy "staff write members" on public.members for all
  using (public.is_staff()) with check (public.is_staff());

-- MEMBERSHIPS ─ read own only (keys on user_id). No write policy:
-- activation/extension happens via the service role.
create policy "memberships read own" on public.memberships for select
  using (auth.uid() = user_id or public.is_staff());

-- PAYMENTS ─ read own only. Live table has both user_id (authoritative)
-- and legacy member_id; matching either keeps old rows readable.
create policy "payments read own" on public.payments for select
  using (auth.uid() = user_id
         or member_id = public.current_member_id()
         or public.is_staff());

-- ATTENDANCE ─ read own only. Rows are written by the service role
-- (staff QR check-in); members can never create or alter them.
create policy "attendance read own" on public.attendance for select
  using (auth.uid() = user_id
         or member_id = public.current_member_id()
         or public.is_staff());

-- BOOKINGS ─ read own; update/delete staff-only.
create policy "bookings read own" on public.bookings for select
  using (auth.uid() = user_id
         or member_id = public.current_member_id()
         or public.is_staff());
create policy "bookings staff update" on public.bookings for update
  using (public.is_staff()) with check (public.is_staff());
create policy "bookings staff delete" on public.bookings for delete
  using (public.is_staff());

-- NOTIFICATIONS ─ read own only.
create policy "notifications read own" on public.notifications for select
  using (auth.uid() = user_id or public.is_staff());

-- PUBLIC CONTENT ─ anon read; staff write. Visibility predicates
-- preserved exactly as designed (nothing weakened).
create policy "gallery public read" on public.gallery for select using (true);
create policy "gallery admin write" on public.gallery for all
  using (public.is_staff()) with check (public.is_staff());

create policy "plans public read" on public.membership_plans for select
  using (active = true or is_active = true or public.is_staff());
create policy "plans admin write" on public.membership_plans for all
  using (public.is_staff()) with check (public.is_staff());

create policy "services public read" on public.training_services for select
  using (active = true or is_active = true or public.is_staff());
create policy "services admin write" on public.training_services for all
  using (public.is_staff()) with check (public.is_staff());

create policy "trainers public read" on public.trainers for select
  using (active = true or is_active = true or public.is_staff());
create policy "trainers admin write" on public.trainers for all
  using (public.is_staff()) with check (public.is_staff());

create policy "testimonials read" on public.testimonials for select
  using (approved = true or is_approved = true or public.is_staff());
create policy "testimonials admin write" on public.testimonials for all
  using (public.is_staff()) with check (public.is_staff());

create policy "facilities public read" on public.facilities for select using (true);
create policy "facilities admin write" on public.facilities for all
  using (public.is_staff()) with check (public.is_staff());

create policy "announcements read" on public.announcements for select
  using (is_published = true or public.is_staff());
create policy "announcements admin write" on public.announcements for all
  using (public.is_staff()) with check (public.is_staff());

create policy "settings public read" on public.site_settings for select using (true);
create policy "settings admin write" on public.site_settings for all
  using (public.is_staff()) with check (public.is_staff());

-- ── 6. STORAGE: gym-assets bucket ────────────────────────────────────
-- Public READ (gallery media is served to visitors); staff-only
-- insert/delete; NO update policy → nobody can overwrite a file.
-- Anon and ordinary members: zero write access.
--
-- Pre-flight finding: the live database carries SIX policies on
-- storage.objects — the three correct ones from the v2 migration plus
-- three drifted "Admins can … gym assets" policies gated on
-- private.is_admin() (a helper this project's code never calls; admin
-- uploads actually run through the service role). ALL SIX are dropped
-- below before recreating the final set. gym-assets is the ONLY bucket
-- in this project (verified via the Storage API), so nothing else can
-- lose access. service_role bypasses RLS entirely, so the application's
-- upload/delete paths are unaffected by any of this.
insert into storage.buckets (id, name, public)
values ('gym-assets', 'gym-assets', true)
on conflict (id) do nothing;

-- Drifted admin policies (private.is_admin) — removed:
drop policy if exists "Admins can delete gym assets" on storage.objects;
drop policy if exists "Admins can update gym assets" on storage.objects;
drop policy if exists "Admins can upload gym assets" on storage.objects;
-- Earlier staff set — recreated below:
drop policy if exists "storage public read"  on storage.objects;
drop policy if exists "storage staff write"  on storage.objects;
drop policy if exists "storage staff delete" on storage.objects;

create policy "storage public read" on storage.objects for select
  using (bucket_id = 'gym-assets');
create policy "storage staff write" on storage.objects for insert
  with check (bucket_id = 'gym-assets' and public.is_staff());
create policy "storage staff delete" on storage.objects for delete
  using (bucket_id = 'gym-assets' and public.is_staff());
