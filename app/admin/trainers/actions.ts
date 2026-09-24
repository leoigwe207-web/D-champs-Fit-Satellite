"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin-guard";

/**
 * Trainer management — final schema-aligned implementation.
 *
 * Live `trainers` columns used here (after the approved
 * 2026-09-trainers-phone-availability migration):
 *   name, phone, specialty, availability, active, is_active
 *
 * `bio` and `photo_url` remain in the database for compatibility but are NOT
 * written or edited by this application anymore. `experience` is fully
 * removed — it never existed in the live table and its old insert failed
 * silently (42703).
 *
 * Every insert/update/delete checks the Supabase error and surfaces it to
 * the admin. The app's `active` convention is mirrored to `is_active` (both
 * columns exist live) so every reader agrees.
 */

const TrainerValues = z.object({
  name: z.string().trim().min(2, "Trainer name is required.").max(120),
  phone: z
    .string()
    .trim()
    .max(40)
    .refine(
      (v) => v === "" || /^[+()\-\s\d]{7,40}$/,
      "Invalid phone number."
    ),
  specialty: z.string().trim().min(2, "Specialty is required.").max(160),
  availability: z.string().trim().max(160),
  active: z.boolean(),
});

const Id = z.string().uuid();

export async function saveTrainer(
  id: string,
  values: {
    name: string;
    phone: string;
    specialty: string;
    availability: string;
    active: boolean;
  }
) {
  const admin = await assertAdmin();
  if (!admin) return;
  const trainerId = Id.parse(id);
  const parsed = TrainerValues.safeParse(values);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid trainer values");
  }

  const { error } = await admin
    .from("trainers")
    .update({
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      specialty: parsed.data.specialty,
      availability: parsed.data.availability || null,
      active: parsed.data.active,
      is_active: parsed.data.active,
    })
    .eq("id", trainerId);

  if (error) {
    console.error("Trainer update failed:", error);
    throw new Error(error.message);
  }
  revalidatePath("/admin/trainers");
  revalidatePath("/training");
  revalidatePath("/book");
}

export async function createTrainer(values: {
  name: string;
  phone: string;
  specialty: string;
  availability: string;
}) {
  const admin = await assertAdmin();
  if (!admin) return;
  const parsed = TrainerValues.safeParse({ ...values, active: true });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid trainer values");
  }

  const { data, error } = await admin
    .from("trainers")
    .insert({
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      specialty: parsed.data.specialty,
      availability: parsed.data.availability || null,
      active: true,
      is_active: true,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Trainer insert failed:", error);
    throw new Error(error?.message ?? "The trainer could not be created.");
  }
  revalidatePath("/admin/trainers");
  revalidatePath("/training");
  revalidatePath("/book");
}

/**
 * Deletes exactly one trainer. If a booking still references the trainer
 * (bookings.trainer_id FK), deletion is refused with a clear message —
 * related records are never cascade-deleted.
 */
export async function deleteTrainer(id: string) {
  const admin = await assertAdmin();
  if (!admin) return;
  const trainerId = Id.parse(id);

  const { data: ref, error: refError } = await admin
    .from("bookings")
    .select("id")
    .eq("trainer_id", trainerId)
    .limit(1);

  if (refError) {
    console.error("Trainer reference check failed:", refError);
    throw new Error(
      "Could not verify whether this trainer has bookings. Nothing was deleted."
    );
  }
  if (ref && ref.length > 0) {
    throw new Error(
      "This trainer has bookings attached, so they cannot be deleted. " +
        "Disable the trainer instead to remove them from the website."
    );
  }

  const { error } = await admin.from("trainers").delete().eq("id", trainerId);
  if (error) {
    console.error("Trainer delete failed:", error);
    throw new Error(error.message);
  }
  revalidatePath("/admin/trainers");
  revalidatePath("/training");
  revalidatePath("/book");
}
