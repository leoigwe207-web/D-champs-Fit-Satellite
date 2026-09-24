-- ════════════════════════════════════════════════════════════════════
-- APPROVED & APPLIED (2026-09-23): seed the three membership plans.
-- INSERT ONLY — no schema change, no RLS/policy/grant change, deletes
-- nothing. Reversible: delete from public.membership_plans where slug
-- in ('monthly','quarterly','annual'); (only removes these 3 rows).
-- Existing rows are untouched: on conflict do nothing.
-- ═════════════════════════ membership_plans ═════════════════════════
insert into public.membership_plans
  (name, slug, price, duration_days, description, features, active, sort)
values
  ('Monthly', 'monthly', 0, 30,
   '30-day membership. Full access, no long commitment.',
   '["Full gym access","All equipment zones","Locker room access","Free fitness orientation"]'::text[],
   true, 1),
  ('Quarterly', 'quarterly', 0, 90,
   '90-day membership for a real training block.',
   '["Everything in Monthly","1 free fitness assessment","1 guest pass","Priority booking for trainers"]'::text[],
   true, 2),
  ('Annual', 'annual', 0, 365,
   'Annual membership — best value for consistent training.',
   '["Everything in Quarterly","2 guest passes monthly","Free gym merchandise","Nutrition guidance session"]'::text[],
   true, 3)
on conflict do nothing;
