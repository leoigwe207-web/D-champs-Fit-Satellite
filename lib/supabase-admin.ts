import { createClient } from "@supabase/supabase-js";

/**
 * SERVER-ONLY Supabase admin client.
 *
 * IMPORTANT:
 * - Never import this file into client/browser components.
 * - Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 * - The service-role key bypasses Row Level Security.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase server environment variables.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
