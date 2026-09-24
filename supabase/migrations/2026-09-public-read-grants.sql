-- ════════════════════════════════════════════════════════════════════
-- D'CHAMPS FIT SATELLITE — Public-read grants & policies (2026-09, v2)
-- Apply to an EXISTING deployment: Supabase Dashboard → SQL Editor.
--
-- SELF-SUFFICIENT: creates the is_staff() helper first, because live
-- databases that drifted from supabase/schema.sql may not have it (that
-- is what aborted the first attempt with "function is_staff() does not
-- exist", rolling the whole batch back).
--
-- What this restores (RLS stays ENABLED on every table):
--   1. is_staff() helper + EXECUTE for anon/authenticated (needed inside
--      public-read policy expressions; leaks nothing but the caller's
--      own staff status).
--   2. Table-level SELECT grants for anon + authenticated.
--   3. The schema's intended RLS policies for public content.
--   4. gym-assets storage bucket + storage policies (staff-only writes).
--
-- Idempotent: safe to run more than once.
-- ════════════════════════════════════════════════════════════════════

-- 1. Helper used by the policy expressions below.
create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()) in ('admin','staff'), false);
$$;

grant execute on function public.is_staff() to anon, authenticated;

-- 2. Table-level SELECT grants (no data visible without these)
grant select on public.gallery,
  public.membership_plans,
  public.training_services,
  public.trainers,
  public.testimonials,
  public.facilities,
  public.announcements,
  public.site_settings
  to anon, authenticated;

-- 3. Row Level Security policies (skip if they already exist)
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'gallery' and policyname = 'gallery public read') then
    create policy "gallery public read" on public.gallery for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'gallery' and policyname = 'gallery admin write') then
    create policy "gallery admin write" on public.gallery for all using (public.is_staff()) with check (public.is_staff());
  end if;

  if not exists (select 1 from pg_policies where tablename = 'membership_plans' and policyname = 'plans public read') then
    create policy "plans public read" on public.membership_plans for select using (active = true or public.is_staff());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'membership_plans' and policyname = 'plans admin write') then
    create policy "plans admin write" on public.membership_plans for all using (public.is_staff()) with check (public.is_staff());
  end if;

  if not exists (select 1 from pg_policies where tablename = 'training_services' and policyname = 'services public read') then
    create policy "services public read" on public.training_services for select using (active = true or public.is_staff());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'training_services' and policyname = 'services admin write') then
    create policy "services admin write" on public.training_services for all using (public.is_staff()) with check (public.is_staff());
  end if;

  if not exists (select 1 from pg_policies where tablename = 'trainers' and policyname = 'trainers public read') then
    create policy "trainers public read" on public.trainers for select using (active = true or public.is_staff());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'trainers' and policyname = 'trainers admin write') then
    create policy "trainers admin write" on public.trainers for all using (public.is_staff()) with check (public.is_staff());
  end if;

  if not exists (select 1 from pg_policies where tablename = 'testimonials' and policyname = 'testimonials read') then
    create policy "testimonials read" on public.testimonials for select using (approved = true or public.is_staff());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'testimonials' and policyname = 'testimonials admin write') then
    create policy "testimonials admin write" on public.testimonials for all using (public.is_staff()) with check (public.is_staff());
  end if;

  if not exists (select 1 from pg_policies where tablename = 'facilities' and policyname = 'facilities public read') then
    create policy "facilities public read" on public.facilities for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'facilities' and policyname = 'facilities admin write') then
    create policy "facilities admin write" on public.facilities for all using (public.is_staff()) with check (public.is_staff());
  end if;

  if not exists (select 1 from pg_policies where tablename = 'announcements' and policyname = 'announcements read') then
    create policy "announcements read" on public.announcements for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'announcements' and policyname = 'announcements admin write') then
    create policy "announcements admin write" on public.announcements for all using (public.is_staff()) with check (public.is_staff());
  end if;

  if not exists (select 1 from pg_policies where tablename = 'site_settings' and policyname = 'settings public read') then
    create policy "settings public read" on public.site_settings for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'site_settings' and policyname = 'settings admin write') then
    create policy "settings admin write" on public.site_settings for all using (public.is_staff()) with check (public.is_staff());
  end if;
end $$;

-- 4. Storage: gym-assets bucket + public read, staff-only write/delete.
--    (Uploads land in gym-assets/gallery/<uuid>.<ext> and never overwrite.)
insert into storage.buckets (id, name, public)
values ('gym-assets', 'gym-assets', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'storage public read') then
    create policy "storage public read" on storage.objects for select using (bucket_id = 'gym-assets');
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'storage staff write') then
    create policy "storage staff write" on storage.objects for insert with check (bucket_id = 'gym-assets' and public.is_staff());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'storage staff delete') then
    create policy "storage staff delete" on storage.objects for delete using (bucket_id = 'gym-assets' and public.is_staff());
  end if;
end $$;
