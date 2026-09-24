"use server";

import { getCurrentUser } from "./auth";
import { isDemoMode } from "./env";
import { createAdminClient } from "./supabase-admin";

/**
 * Shared authorization guard for all admin/staff server actions.
 *
 * Every admin mutation MUST call this (or assertAdmin) before touching the
 * database. Authorization is enforced:
 *   1. here (server-side role read from the authenticated session), and
 *   2. in the database by RLS (service-role writes stay narrow and all
 *      caller-owned data paths are policy-checked).
 *
 * Demo mode returns a null client: actions become no-ops in development
 * without Supabase. In production an unauthenticated or non-staff caller
 * is always rejected — never defaulted.
 */
/** Returns the admin client, or null in dev-only demo mode (callers no-op). */
export async function assertStaff(): Promise<ReturnType<typeof createAdminClient> | null> {
  if (isDemoMode()) return null; // dev-only demo mode: nothing to persist
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    throw new Error("Unauthorized");
  }
  return createAdminClient();
}

/** Returns the admin client, or null in dev-only demo mode (callers no-op). */
export async function assertAdmin(): Promise<ReturnType<typeof createAdminClient> | null> {
  if (isDemoMode()) return null; // dev-only demo mode: nothing to persist
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return createAdminClient();
}
