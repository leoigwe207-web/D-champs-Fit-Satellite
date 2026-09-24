# D'Champs Fit Satellite — Security & Operations Notes

Practical notes for running this site securely in production. The code-level
hardening (RLS, headers, CSP, rate limiting, validation, payment verification)
is implemented in the repo; this file covers what **must** be configured
outside the codebase.

## 1. Environment variables

| Variable | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | hosting + local | Public by design (anon key architecture) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | hosting + local | Public by design; protected by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Never in `NEXT_PUBLIC_*`, never committed. Bypasses RLS. |
| `PAYSTACK_SECRET_KEY` | **server only** | Never exposed to the client |
| `PAYSTACK_CURRENCY` | server only | Optional, defaults to `NGN` |

- `.env*` files are git-ignored. Keep it that way.
- Rotate any key that may ever have been shared, committed, or logged.
  **Deleting a file does not invalidate an already-exposed credential.**

## 2. Supabase project checklist

Run in order (Dashboard → SQL Editor):

1. `supabase/schema.sql` (fresh installs) **or**
   `supabase/migrations/2026-09-security-hardening.sql` (existing projects).
2. Public-read grants & policies (gallery/plans/services read via anon key):
   `supabase/migrations/2026-09-public-read-grants.sql` (existing projects).
   Without it, public pages silently fall back to bundled demo data.
2. Promote the owner account — this is the *only* supported way to become
   admin, and it requires SQL-editor access:
   ```sql
   update public.profiles set role = 'admin'
   where email = '<owner-account@example.com>';
   ```
   Members can never set their own role (RLS `with check` + column grants).
3. **Auth settings** (Dashboard → Authentication):
   - Set Site URL to the production domain.
   - Add the production domain to Redirect Allow-list — and nothing else.
   - Email confirmation **on** for signups.
   - Review Auth rate limits; tighten the SMTP email rate limit if abuse occurs.
4. **Database backups**: enable/disable per your Supabase plan. Verify backups
   exist *and* do a restore drill into a scratch project — an unverified
   backup is not a backup.
5. Storage: the `gallery` bucket is public (marketing images only). No member
   uploads exist; do not add any without private buckets + storage RLS.

## 3. Paystack checklist

- Webhook URL: `https://<your-domain>/api/paystack/webhook` (signature-verified).
- Test a real transaction end-to-end: initialize → pay → verify → membership
  active → renewal extends from expiry (not doubled).
- Membership activation requires the paid amount to cover the staged amount
  and the currency to match `PAYSTACK_CURRENCY`.

## 4. Hosting (Vercel or equivalent)

- HTTPS enforced (HSTS is sent by the app; confirm the host also redirects).
- Set all env vars above in the hosting project settings — production values.
- First deploy: verify headers with
  `curl -sI https://<your-domain>/ | grep -iE "content-security|strict-transport|x-frame|x-content|referrer|permissions"`.
- If a CSP violation appears in production, tighten the policy in
  `middleware.ts` — do not add broad `unsafe-*` sources.

## 5. What the code enforces (quick reference)

- **RLS**: every table has Row Level Security; private data is scoped by
  `auth.uid()`; role changes by members are impossible (policy + grants).
- **Authorization**: middleware route checks + per-action server guards
  (`lib/admin-guard.ts`) + database RLS. No frontend-only trust.
- **Payments**: webhook signatures (HMAC-SHA512, constant-time compare),
  server-side verification, idempotent activation, amount/currency checks.
- **Sessions**: Supabase session cookies with `secure` in production,
  `SameSite=Lax`; logout revokes the session server-side.
- **Rate limiting**: in-memory per-IP limits on checkout, verify, and booking
  endpoints; Supabase Auth provides per-account limits on login/signup/reset.
- **CSP**: nonce + `strict-dynamic` in production (permissive only in dev).

## 6. Reporting

If a vulnerability is found, contact the site owner directly. Do not open
public issues containing exploit details.
