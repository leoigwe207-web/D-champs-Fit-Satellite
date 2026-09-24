"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertStaff } from "@/lib/admin-guard";

const Status = z.enum(["pending", "confirmed", "completed", "cancelled"]);
const Id = z.string().uuid();

export async function setBookingStatus(bookingId: string, status: string) {
  const admin = await assertStaff();
  if (!admin) return; // demo mode

  const parsed = z.object({ bookingId: Id, status: Status }).parse({
    bookingId,
    status,
  });

  const { data: booking } = await admin
    .from("bookings")
    .select("id, member_id, service, date, time, members(user_id)")
    .eq("id", parsed.bookingId)
    .single();

  await admin
    .from("bookings")
    .update({ status: parsed.status })
    .eq("id", parsed.bookingId);

  const userId = (booking?.members as { user_id?: string } | null)?.user_id;
  if (userId) {
    const messages: Record<string, string> = {
      confirmed: `Your ${booking?.service} session on ${booking?.date} at ${booking?.time} has been confirmed.`,
      completed: `Your ${booking?.service} session is complete — great work!`,
      cancelled: `Your ${booking?.service} session on ${booking?.date} was cancelled. Contact reception to rebook.`,
    };
    await admin.from("notifications").insert({
      user_id: userId,
      title: `Booking ${parsed.status}`,
      body: messages[parsed.status] ?? `Your booking is now ${parsed.status}.`,
    });
  }

  revalidatePath("/admin/bookings");
}
