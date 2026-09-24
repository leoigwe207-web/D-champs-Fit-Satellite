"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin-guard";

const Values = z.object({
  price: z.number().min(0).max(10_000_000),
  duration_days: z.number().int().min(1).max(3650),
  description: z.string().max(500),
  active: z.boolean(),
});

export async function savePlan(
  planId: string,
  values: { price: number; duration_days: number; description: string; active: boolean }
) {
  const admin = await assertAdmin();
  if (!admin) return; // demo mode — nothing to persist
  const parsed = Values.safeParse(values);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid plan values");

  // Real plan rows always carry UUID ids. A demo id (e.g. "plan-monthly",
  // used when the table had no rows) can never be persisted — fail loudly
  // instead of the ZodError crash (digest 742722734).
  if (!z.string().uuid().safeParse(planId).success) {
    throw new Error("This plan is not stored in the database yet — add it first.");
  }

  const { error } = await admin
    .from("membership_plans")
    .update(parsed.data)
    .eq("id", planId);
  if (error) {
    console.error("Plan update failed:", error);
    throw new Error(error.message);
  }
  revalidatePath("/admin/memberships");
  revalidatePath("/membership");
  revalidatePath("/");
}
