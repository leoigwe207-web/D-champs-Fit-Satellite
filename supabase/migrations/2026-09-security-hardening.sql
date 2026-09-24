-- ════════════════════════════════════════════════════════════════════
-- D'CHAMPS FIT SATELLITE — Security hardening migration (2026-09)
-- Apply to an EXISTING deployment: Supabase Dashboard → SQL Editor.
-- (Fresh installations get the same rules from supabase/schema.sql.)
--
-- 1. Privilege escalation fix: members could previously update their own
--    profiles.role to 'admin'. Now blocked by RLS with check + column grants.
-- 2. Members may insert only their own member row, never modify membership
--    records (status/plan/end_date) of anyone.
-- 3. Notifications: members can only flip their own `read` flag.
-- 4. Extra hardening recommended by the Supabase security advisor.
-- ════════════════════════════════════════════════════════════════════

-- ── 1. PROFILES: block self-service role changes ─────────────────────
drop policy if exists "update own profile" on public.profiles;

create policy "update own profile" on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = public.current_role());

revoke update on public.profiles from anon, authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- ── 2. MEMBERS: own-row insert only; membership writes stay staff-only ──
drop policy if exists "member insert own row" on public.members;
create policy "member insert own row" on public.members
  for insert with check (auth.uid() = user_id);

-- ── 3. NOTIFICATIONS: members may only mark their own as read ────────
drop policy if exists "notifications mark read" on public.notifications;
create policy "notifications mark read" on public.notifications for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

revoke update on public.notifications from anon, authenticated;
grant update (read) on public.notifications to authenticated;

-- ── 4. Extra hardening ───────────────────────────────────────────────
-- Ensure all schemas users can reach are exposed (Supabase advisor item).
alter database default privileges in schema public grant usage
  on schema public to anon, authenticated;

-- SECURITY DEFINER helpers: current_role/current_member_id are only used
-- in policies for logged-in members, so anon never needs them. is_staff()
-- IS evaluated inside public-read RLS policies (plans, services, trainers,
-- testimonials), so anon + authenticated MUST keep EXECUTE on it — it only
-- reveals whether the CALLER's own uid is staff, so granting it is safe.
revoke execute on function public.current_role() from anon;
revoke execute on function public.current_member_id() from anon;
grant execute on function public.is_staff() to anon, authenticated;

-- Deny direct trigger access (defense in depth; not callable via PostgREST).
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.set_member_code() from anon, authenticated;

-- ════════════════════════════════════════════════════════════════════
-- HOW TO PROMOTE THE FIRST ADMIN (run as the service connection / SQL editor)
--   update public.profiles set role = 'admin'
--   where email = '<owner-account@example.com>';
-- Members can never do this themselves — it requires SQL-editor access.
-- ════════════════════════════════════════════════════════════════════
