"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser, getCurrentMember } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

/**
 * Member-submitted testimonials.
 *
 * Rules:
 *  - only authenticated members can submit
 *  - every submission lands as PENDING (approved=false / is_approved=false)
 *  - members can NEVER approve their own submission — approval happens only
 *    in Admin → Testimonials behind the admin guard
 *  - the live table has NOT NULL `message` plus nullable `quote`; both are
 *    written with the same content so either reader works
 */
const Submit = z.object({
  quote: z.string().trim().min(4, "Tell us a little more.").max(1000),
  member_duration: z.string().trim().max(80).optional(),
});

export async function submitTestimonial(values: {
  quote: string;
  member_duration?: string;
}) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Please log in to share your experience.");
  }

  // Members only — staff/admin manage testimonials, not submit them.
  if (user.role !== "member") {
    throw new Error("Only members can submit testimonials.");
  }

  const member = await getCurrentMember();

  if (!member || member.id === "demo-member") {
    throw new Error("Member record unavailable. Please contact reception.");
  }

  const parsed = Submit.safeParse(values);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid testimonial.");
  }

  const admin = createAdminClient();

  if (!admin) {
    throw new Error("Server configuration is incomplete.");
  }

  const displayName = user.full_name?.trim() || "D'Champs Fit member";

  const { error } = await admin.from("testimonials").insert({
    // `message` is NOT NULL live; `quote` mirrors it for the app readers.
    quote: parsed.data.quote,
    message: parsed.data.quote,
    name: displayName,
    member_duration: parsed.data.member_duration || null,
    rating: 5,
    approved: false,
    is_approved: false,
  });

  if (error) {
    console.error("Testimonial submission failed:", error);
    throw new Error("Your testimonial could not be submitted. Please try again.");
  }

  revalidatePath("/dashboard/testimonial");
  revalidatePath("/admin/testimonials");
}
