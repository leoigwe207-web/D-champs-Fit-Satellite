import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser, getCurrentMember } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

/**
 * Member training-session bookings.
 *
 * Previously this route contained the STAFF QR CHECK-IN logic, so member
 * booking submissions were answered with check-in errors ("Authentication
 * required." / "You are not authorized to check members in."). The check-in
 * handler now lives at /api/attendance/check-in (its only caller, the
 * scanner page, already points there) and this route does what its path
 * says: create a booking row for the authenticated member.
 *
 * Authorization model (unchanged security posture):
 *   - session is resolved server-side via cookies (getCurrentUser)
 *   - the member row is resolved server-side from the session (getCurrentMember)
 *   - the insert goes through the service role; RLS stays intact
 *   - user_id / member_id are ALWAYS taken from the session, never the body
 */
const BookingSchema = z.object({
  // Optional: when no trainers exist yet the form sends an empty value and
  // reception assigns one later (trainer_id is a nullable FK).
  trainer_id: z.union([z.string().uuid("Unknown trainer."), z.literal("")]).optional(),
  service: z.string().trim().min(2).max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date."),
  // Live table columns are booking_date/booking_time (NOT NULL); the legacy
  // date/time columns are also written so existing dashboard reads keep
  // working. Hours restricted to the gym's opening window 06:00–21:00.
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid time.").refine(
    (t) => t >= "06:00" && t <= "21:00",
    "Bookings are available between 06:00 and 21:00."
  ),
});

export async function POST(request: Request) {
  try {
    // ------------------------------------------------------------
    // 1. Authenticate
    // ------------------------------------------------------------
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Please log in to book a training session.",
          loginUrl: "/login?next=/book",
        },
        { status: 401 }
      );
    }

    // ------------------------------------------------------------
    // 2. Resolve the caller's own member record server-side
    // ------------------------------------------------------------
    const member = await getCurrentMember();

    if (!member || member.id === "demo-member") {
      return NextResponse.json(
        { error: "Member record unavailable. Please contact reception." },
        { status: 403 }
      );
    }

    // ------------------------------------------------------------
    // 3. Validate request (trainer/service/date/time)
    // ------------------------------------------------------------
    const parsed = BookingSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid booking." },
        { status: 400 }
      );
    }

    const { trainer_id, service, date, time } = parsed.data;

    // ------------------------------------------------------------
    // 4. Privileged client + referenced-row checks
    // ------------------------------------------------------------
    const supabase = createAdminClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Server configuration is incomplete." },
        { status: 500 }
      );
    }

    if (trainer_id) {
      const { data: trainer } = await supabase
        .from("trainers")
        .select("id")
        .eq("id", trainer_id)
        .maybeSingle();

      if (!trainer) {
        return NextResponse.json(
          { error: "Unknown trainer." },
          { status: 400 }
        );
      }
    }

    // ------------------------------------------------------------
    // 5. Create the booking — ownership comes from the session
    // ------------------------------------------------------------
    const { data: booking, error: insertError } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        member_id: member.id,
        trainer_id: trainer_id || null,
        // Canonical live columns (NOT NULL in the database):
        booking_date: date,
        booking_time: time,
        // Legacy nullable columns kept in sync for existing dashboard reads.
        service,
        date,
        time,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Booking insert failed:", insertError);
      return NextResponse.json(
        { error: "Booking could not be created. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, bookingId: booking.id });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
