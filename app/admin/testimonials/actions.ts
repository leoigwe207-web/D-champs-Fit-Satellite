"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin-guard";

const Toggle = z.object({ id: z.string().uuid(), approved: z.boolean() });
const Delete = z.object({ id: z.string().uuid() });

/**
 * Approve / unpublish a member-submitted testimonial.
 * The live table has both `approved` and `is_approved`; the app convention
 * is `approved`, and both are written to the same value so any reader
 * agrees. Members can never approve their own submission — approval only
 * happens here, behind the admin guard.
 */
export async function toggleTestimonial(id: string, approved: boolean) {
  const admin = await assertAdmin();
  if (!admin) return;
  const parsed = Toggle.parse({ id, approved });
  const { error } = await admin
    .from("testimonials")
    .update({ approved: parsed.approved, is_approved: parsed.approved })
    .eq("id", parsed.id);
  if (error) {
    console.error("Testimonial update failed:", error);
    throw new Error(error.message);
  }
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

/** Permanently removes a rejected (or any) testimonial. */
export async function deleteTestimonial(id: string) {
  const admin = await assertAdmin();
  if (!admin) return;
  const parsed = Delete.parse({ id });
  const { error } = await admin.from("testimonials").delete().eq("id", parsed.id);
  if (error) {
    console.error("Testimonial delete failed:", error);
    throw new Error(error.message);
  }
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}
