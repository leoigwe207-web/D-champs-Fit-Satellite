import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

/**
 * STAFF QR CHECK-IN (scanner: /admin/attendance/scan).
 *
 * This logic previously lived at /api/bookings, which broke two flows at
 * once: the scanner called /api/attendance/check-in and got a 404, while
 * the /book form posted to /api/bookings and got check-in authorization
 * errors ("Authentication required." / "You are not authorized to check
 * members in."). The handler moved here unchanged apart from the
 * attendance column fix: the live column is check_in_method (not
 * checkin_method), so inserts previously failed with PGRST204.
 */
const CheckInSchema = z.object({
  qrToken: z.string().trim().min(16).max(128),
});

function getLagosDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export async function POST(request: Request) {
  try {
    // ----------------------------------------------------------
    // 1. Authenticate the person operating the scanner
    // ----------------------------------------------------------
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    // ----------------------------------------------------------
    // 2. Only admin/staff can scan members
    // ----------------------------------------------------------
    if (user.role !== "admin" && user.role !== "staff") {
      return NextResponse.json(
        { error: "You are not authorized to check members in." },
        { status: 403 }
      );
    }

    // ----------------------------------------------------------
    // 3. Validate request
    // ----------------------------------------------------------
    const body = await request.json();

    const parsed = CheckInSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid QR code." },
        { status: 400 }
      );
    }

    // ----------------------------------------------------------
    // 4. Create privileged server client
    // ----------------------------------------------------------
    const supabase = createAdminClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Server configuration is incomplete." },
        { status: 500 }
      );
    }

    // ----------------------------------------------------------
    // 5. Find the member by the random QR token
    // ----------------------------------------------------------
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select(
        `
        id,
        user_id,
        member_code,
        status,
        plan_name,
        end_date,
        profiles (
          full_name,
          email,
          phone
        )
        `
      )
      .eq("qr_token", parsed.data.qrToken)
      .maybeSingle();

    if (memberError) {
      console.error("Member lookup failed:", memberError);

      return NextResponse.json(
        { error: "Unable to verify this QR code." },
        { status: 500 }
      );
    }

    if (!member) {
      return NextResponse.json(
        { error: "Invalid or unrecognized member QR code." },
        { status: 404 }
      );
    }

    // ----------------------------------------------------------
    // 6. Check membership status
    // ----------------------------------------------------------
    const today = getLagosDate();

    if (
      member.status !== "active" ||
      (member.end_date && member.end_date < today)
    ) {
      return NextResponse.json(
        {
          error: "Membership is not active.",
          member: {
            memberCode: member.member_code,
            name:
              (
                member.profiles as {
                  full_name?: string | null;
                } | null
              )?.full_name ?? "Member",
            status: member.status,
            endDate: member.end_date,
          },
        },
        { status: 403 }
      );
    }

    // ----------------------------------------------------------
    // 7. Prevent duplicate check-in for the same day
    // ----------------------------------------------------------
    const startOfDay = `${today}T00:00:00+01:00`;

    const tomorrow = new Date(`${today}T00:00:00+01:00`);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const endOfDay = tomorrow.toISOString();

    const { data: existingCheckIn, error: duplicateError } =
      await supabase
        .from("attendance")
        .select("id, checkin_at")
        .eq("member_id", member.id)
        .gte("checkin_at", startOfDay)
        .lt("checkin_at", endOfDay)
        .limit(1)
        .maybeSingle();

    if (duplicateError) {
      console.error(
        "Duplicate check-in lookup failed:",
        duplicateError
      );

      return NextResponse.json(
        { error: "Unable to verify today's attendance." },
        { status: 500 }
      );
    }

    if (existingCheckIn) {
      const profile =
        (member.profiles as {
          full_name?: string | null;
        } | null) ?? null;

      return NextResponse.json(
        {
          error: "Member has already checked in today.",
          alreadyCheckedIn: true,
          member: {
            memberCode: member.member_code,
            name: profile?.full_name ?? "Member",
            checkinAt: existingCheckIn.checkin_at,
          },
        },
        { status: 409 }
      );
    }

    // ----------------------------------------------------------
    // 8. Record attendance
    // ----------------------------------------------------------
    const { data: attendance, error: attendanceError } =
      await supabase
        .from("attendance")
        .insert({
          user_id: member.user_id,
          member_id: member.id,
          check_in_method: "qr",
          location: "Chevron Estate — Main Entrance",
          status: "Checked in",
        })
        .select("id, checkin_at")
        .single();

    if (attendanceError) {
      console.error(
        "Attendance insert failed:",
        attendanceError
      );

      return NextResponse.json(
        { error: "Check-in could not be recorded." },
        { status: 500 }
      );
    }

    const profile =
      (member.profiles as {
        full_name?: string | null;
      } | null) ?? null;

    // ----------------------------------------------------------
    // 9. Success
    // ----------------------------------------------------------
    return NextResponse.json({
      success: true,
      message: "Check-in successful.",
      member: {
        memberCode: member.member_code,
        name: profile?.full_name ?? "Member",
        plan: member.plan_name,
        status: member.status,
      },
      attendance: {
        id: attendance.id,
        checkinAt: attendance.checkin_at,
      },
    });
  } catch (error) {
    console.error("Attendance check-in error:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
