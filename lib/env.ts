/**
 * Central environment helpers.
 *
 * Demo mode is ONLY allowed in development when Supabase
 * is not configured.
 *
 * Production must always fail closed:
 * no fake login, no fake payments, no fake data.
 */

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function isDemoMode(): boolean {
  return !isSupabaseConfigured() && !isProduction();
}