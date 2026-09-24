import { createAdminClient } from "./supabase-admin";
import { isDemoMode, isSupabaseConfigured } from "./env";

export { isSupabaseConfigured };
export type AppUser = {
  id: string;
  email: string | null;
  full_name: string;
  phone: string | null;
  role: "member" | "staff" | "admin";
};

export type MemberRecord = {
  id: string;
  user_id: string;
  member_code: string;
  qr_token?: string | null;
  status: "active" | "expired" | "suspended";
  plan_name?: string | null;
  plan_slug?: string | null;
  end_date?: string | null;
};

/**
 * Demo identity: in development without Supabase configured, dashboard
 * routes show a demo member so the full experience is browsable.
 * SECURITY: in production (no Supabase configured) these are never served —
 * unauthenticated visitors are treated as logged out.
 */
export const DEMO_USER: AppUser = {
  id: "demo-user",
  email: "demo@dchampsfit.ng",
  full_name: "Demo Member",
  phone: "0810 489 1309",
  role: "member",
};

export const DEMO_MEMBER: MemberRecord = {
  id: "demo-member",
  user_id: "demo-user",
  member_code: "DCF-2026-0001",
  status: "active",
  plan_name: "Quarterly",
  plan_slug: "quarterly",
  end_date: "2026-12-15",
};

export async function getCurrentUser(): Promise<AppUser | null> {
  if (!isSupabaseConfigured()) return isDemoMode() ? DEMO_USER : null;
  try {
    const { createClient } = await import("./supabase-server");
    const sb = await createClient();
    if (!sb) return null;
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return null;
    const { data: profile } = await sb
      .from("profiles")
      .select("full_name, phone, role")
      .eq("id", user.id)
      .single();
    return {
      id: user.id,
      email: user.email ?? null,
      full_name: profile?.full_name ?? user.email?.split("@")[0] ?? "Member",
      phone: profile?.phone ?? null,
      role: (profile?.role as AppUser["role"]) ?? "member",
    };
  } catch {
    return null;
  }
}

/**
 * Column list used for every members read in this module.
 */
const MEMBER_COLUMNS =
  "id, user_id, member_code, qr_token, status, plan_name, plan_slug, end_date";

/**
 * Creates the missing member row for an authenticated user whose signup
 * never produced one (the live signup trigger only creates `profiles`).
 *
 * Guarantees:
 *  - member_code DCF-YYYY-NNNN, uniqueness-checked against the live
 *    table with retries — duplicates are impossible (unique index is
 *    the final arbiter; a collision triggers a new attempt)
 *  - qr_token: crypto.randomUUID() — the QR page and staff scanner
 *    both depend on it
 *  - existing rows are NEVER modified by this path
 */
async function ensureMemberRow(userId: string): Promise<MemberRecord | null> {
  const admin = createAdminClient();

  if (!admin) {
    console.error("Member backstop skipped: service client unavailable.");
    return null;
  }

  const year = new Date().getFullYear();

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = `DCF-${year}-${String(
      Math.floor(Math.random() * 9000) + 1000
    ).padStart(4, "0")}`;

    const { data: created, error } = await admin
      .from("members")
      .insert({
        user_id: userId,
        member_code: code,
        qr_token: crypto.randomUUID(),
        status: "expired",
      })
      .select(MEMBER_COLUMNS)
      .single();

    if (!error) return created as unknown as MemberRecord;

    if (error.code === "23505") {
      // Unique violation: either the member_code collided (retry with a
      // new number) or a concurrent request created the row first
      // (unique user_id) — read it back in that case.
      const { data: existing } = await admin
        .from("members")
        .select(MEMBER_COLUMNS)
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) return existing as unknown as MemberRecord;
      continue;
    }

    console.error("Member row creation failed:", error.message);
    return null;
  }

  return null;
}

export async function getCurrentMember(): Promise<MemberRecord | null> {
  if (!isSupabaseConfigured()) {
    return isDemoMode() ? DEMO_MEMBER : null;
  }

  const user = await getCurrentUser();

  if (!user) return null;

  try {
    const { createClient } = await import("./supabase-server");
    const sb = await createClient();

    if (!sb) return null;

    const { data, error } = await sb
      .from("members")
      .select(MEMBER_COLUMNS)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Member lookup failed:", error.message);
      return null;
    }

    if (data) {
      // Backfill ONLY a missing qr_token; the member code and every
      // other field of an existing row are never touched.
      if (!data.qr_token) {
        const admin = createAdminClient();
        const token = crypto.randomUUID();
        const { error: tokenError } = await admin
          ?.from("members")
          .update({ qr_token: token })
          .eq("user_id", user.id)
          .is("qr_token", null);

        if (!tokenError && admin) {
          data.qr_token = token;
        } else if (tokenError) {
          console.error("QR token backfill failed:", tokenError.message);
        }
      }

      return data as unknown as MemberRecord;
    }

    // Authenticated user without a member row — create one.
    return await ensureMemberRow(user.id);
  } catch (err) {
    console.error(
      "getCurrentMember failed:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}
