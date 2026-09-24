-- ════════════════════════════════════════════════════════════════════
-- APPROVED — NOT YET APPLIED (run in Supabase Dashboard → SQL Editor).
-- Adds dedicated phone/availability columns to public.trainers.
--
-- The application code is ALREADY written for these columns (dedicated
-- phone/availability fields, no bio folding). It is fully deployable once
-- this runs — until then the admin trainer form will error on save with
-- the real Postgres message instead of storing values.
--
-- INSERT/UPDATE/DELETE: none. RLS/policies/grants: unchanged.
-- Reversible: alter table public.trainers drop column phone, drop column availability;
-- No existing data is modified.
-- ════════════════════════════════════════════════════════════════════
alter table public.trainers add column if not exists phone text;
alter table public.trainers add column if not exists availability text;
