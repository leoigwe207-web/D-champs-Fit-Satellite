"use server";

import { redirect } from "next/navigation";

export async function signOut() {
  const { createClient } = await import("./supabase-server");
  const sb = await createClient();
  if (sb) await sb.auth.signOut();
  redirect("/");
}
