import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client.
 * Uses the project's publishable key and URL.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables.");
  }

  return createBrowserClient(url, key, {
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
  });
}
