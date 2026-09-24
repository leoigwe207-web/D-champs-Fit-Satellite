import { DEMO_ATTENDANCE, DEMO_BOOKINGS, DEMO_PAYMENTS } from "./member-data";
import { isDemoMode } from "./env";

export type AdminMember = {
  id: string;
  member_code: string;
  full_name: string;
  email: string;
  phone: string;
  status: "active" | "expired" | "suspended";
  plan_name: string | null;
  end_date: string | null;
  created_at: string;
};

export type AdminStats = {
  total_members: number;
  active_members: number;
  expired_members: number;
  suspended_members: number;
  todays_attendance: number;
  monthly_revenue: number;
  upcoming_bookings: number;
  pending_testimonials: number;
};

export const DEMO_ADMIN_MEMBERS: AdminMember[] = [
  ["DCF-2026-0001", "Demo Member", "demo@dchampsfit.ng", "0810 489 1309", "active", "Quarterly", "2026-12-15"],
  ["DCF-2026-0002", "John Doe", "john@example.com", "0803 111 2233", "active", "Monthly", "2026-10-02"],
  ["DCF-2026-0003", "Jane Smith", "jane@example.com", "0805 222 3344", "active", "Annual", "2027-06-11"],
  ["DCF-2026-0004", "David Cole", "david@example.com", "0807 333 4455", "expired", "Monthly", "2026-08-30"],
  ["DCF-2026-0005", "Amara Eze", "amara@example.com", "0809 444 5566", "active", "Quarterly", "2026-11-20"],
  ["DCF-2026-0006", "Femi Ade", "femi@example.com", "0811 555 6677", "suspended", "Monthly", "2026-09-28"],
].map(([code, name, email, phone, status, plan, end], i) => ({
  id: `m-${i + 1}`,
  member_code: code,
  full_name: name,
  email,
  phone,
  status: status as AdminMember["status"],
  plan_name: plan,
  end_date: end,
  created_at: new Date(2026, 0, 5 + i * 23).toISOString(),
}));

export function demoStats(): AdminStats {
  return {
    total_members: 6,
    active_members: 4,
    expired_members: 1,
    suspended_members: 1,
    todays_attendance: 47,
    monthly_revenue: 0,
    upcoming_bookings: DEMO_BOOKINGS.filter(
      (b) => b.status === "pending" || b.status === "confirmed"
    ).length,
    pending_testimonials: 2,
  };
}

async function getSB() {
  const { createClient } = await import("./supabase-server");
  return createClient();
}

/**
 * IMPORTANT:
 * Demo data is only returned when the app is explicitly in demo mode.
 * If Supabase is configured, database errors are NOT converted into fake data.
 */

export async function getAdminStats(): Promise<AdminStats> {
  const sb = await getSB();

  if (!sb) {
    throw new Error("Supabase is not configured.");
  }

  // Use the local Lagos calendar date.
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    membersRes,
    attendanceRes,
    paymentsRes,
    bookingsRes,
    testimonialsRes,
  ] = await Promise.all([
    sb
      .from("members")
      .select("status"),

    sb
      .from("attendance")
      .select("id")
      .gte(
        "checkin_at",
        `${today}T00:00:00+01:00`
      )
      .lt(
        "checkin_at",
        `${today}T23:59:59+01:00`
      ),

    sb
      .from("payments")
      .select("amount")
      .eq("status", "successful")
      .gte(
        "created_at",
        monthStart.toISOString()
      ),

    sb
      .from("bookings")
      .select("id")
      .in("status", [
        "pending",
        "confirmed",
      ]),

    sb
      .from("testimonials")
      .select("id")
      .eq("approved", false),
  ]);

  if (membersRes.error) {
    throw membersRes.error;
  }

  if (attendanceRes.error) {
    throw attendanceRes.error;
  }

  if (paymentsRes.error) {
    throw paymentsRes.error;
  }

  if (bookingsRes.error) {
    throw bookingsRes.error;
  }

  if (testimonialsRes.error) {
    throw testimonialsRes.error;
  }

  const members = membersRes.data ?? [];

  return {
    total_members: members.length,

    active_members: members.filter(
      (member) => member.status === "active"
    ).length,

    expired_members: members.filter(
      (member) => member.status === "expired"
    ).length,

    suspended_members: members.filter(
      (member) => member.status === "suspended"
    ).length,

    todays_attendance:
      attendanceRes.data?.length ?? 0,

    // Payment work is intentionally left alone.
    monthly_revenue:
      (paymentsRes.data ?? []).reduce(
        (sum, payment) =>
          sum + Number(payment.amount ?? 0),
        0
      ),

    upcoming_bookings:
      bookingsRes.data?.length ?? 0,

    pending_testimonials:
      testimonialsRes.data?.length ?? 0,
  };
}

export async function getAdminMembers(): Promise<AdminMember[]> {
  if (isDemoMode()) return DEMO_ADMIN_MEMBERS;

  const sb = await getSB();

  if (!sb) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await sb
    .from("members")
    .select(
      "id, member_code, status, plan_name, end_date, created_at, profiles(full_name, email, phone)"
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw error;

  if (!data) return [];

  return data.map((row: Record<string, unknown>) => {
    const p =
      (row.profiles as Record<string, unknown> | null) ?? {};

    return {
      id: String(row.id),

      member_code:
        String(row.member_code ?? "—"),

      full_name:
        String(p.full_name ?? "—"),

      email:
        String(p.email ?? "—"),

      phone:
        String(p.phone ?? "—"),

      status:
        (row.status as AdminMember["status"]) ?? "expired",

      plan_name:
        (row.plan_name as string | null) ?? null,

      end_date:
        (row.end_date as string | null) ?? null,

      created_at:
        String(row.created_at ?? ""),
    };
  });
}

export async function getAdminPayments() {
  if (isDemoMode()) {
    return DEMO_PAYMENTS.map((p, i) => ({
      ...p,
      member_name:
        DEMO_ADMIN_MEMBERS[
          i % DEMO_ADMIN_MEMBERS.length
        ].full_name,
    }));
  }

  const sb = await getSB();

  if (!sb) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await sb
    .from("payments")
    .select(
      "id, reference, plan_name, amount, method, status, created_at, members(profiles(full_name))"
    )
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) throw error;

  if (!data) return [];

  return data.map((row: Record<string, unknown>) => {
    const m =
      (row.members as Record<string, unknown> | null) ?? {};

    const prof =
      (m.profiles as Record<string, unknown> | null) ?? {};

    return {
      id: String(row.id),

      reference:
        String(row.reference ?? "—"),

      plan_name:
        String(row.plan_name ?? "—"),

      amount:
        Number(row.amount ?? 0),

      method:
        String(row.method ?? "—"),

      status:
        row.status as
          | "successful"
          | "pending"
          | "failed"
          | "refunded",

      created_at:
        String(row.created_at ?? ""),

      member_name:
        String(prof.full_name ?? "—"),
    };
  });
}

export async function getAdminBookings() {
  if (isDemoMode()) {
    return DEMO_BOOKINGS.map((b, i) => ({
      ...b,
      member_name:
        DEMO_ADMIN_MEMBERS[
          i % DEMO_ADMIN_MEMBERS.length
        ].full_name,
    }));
  }

  const sb = await getSB();

  if (!sb) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await sb
    .from("bookings")
    .select(
      "id, date, time, service, status, members(profiles(full_name)), trainers(name)"
    )
    .order("date", { ascending: false })
    .limit(300);

  if (error) throw error;

  if (!data) return [];

  return data.map((row: Record<string, unknown>) => {
    const m =
      (row.members as Record<string, unknown> | null) ?? {};

    const prof =
      (m.profiles as Record<string, unknown> | null) ?? {};

    const trainer =
      (row.trainers as Record<string, unknown> | null) ?? {};

    return {
      id: String(row.id),

      date:
        String(row.date ?? ""),

      time:
        String(row.time ?? ""),

      service:
        String(row.service ?? ""),

      status:
        row.status as
          | "pending"
          | "confirmed"
          | "completed"
          | "cancelled",

      member_name:
        String(prof.full_name ?? "—"),

      trainer_name:
        String(trainer.name ?? "—"),
    };
  });
}

export async function getAdminAttendance(date?: string) {
  if (isDemoMode()) {
    const rows = DEMO_ATTENDANCE.map((a, i) => ({
      ...a,

      member_name:
        DEMO_ADMIN_MEMBERS[
          i % DEMO_ADMIN_MEMBERS.length
        ].full_name,

      member_code:
        DEMO_ADMIN_MEMBERS[
          i % DEMO_ADMIN_MEMBERS.length
        ].member_code,
    }));

    const selectedDate =
      date ??
      new Date().toISOString().slice(0, 10);

    return rows.filter(
      (r) =>
        r.checkin_at.slice(0, 10) === selectedDate
    );
  }

  const sb = await getSB();

  if (!sb) {
    throw new Error("Supabase is not configured.");
  }

  let query = sb
    .from("attendance")
    .select(
      "id, checkin_at, location, status, members(member_code, profiles(full_name))"
    )
    .order("checkin_at", { ascending: false })
    .limit(500);

  if (date) {
    query = query
      .gte(
        "checkin_at",
        `${date}T00:00:00`
      )
      .lte(
        "checkin_at",
        `${date}T23:59:59`
      );
  }

  const { data, error } = await query;

  if (error) throw error;

  if (!data) return [];

  return data.map((row: Record<string, unknown>) => {
    const m =
      (row.members as Record<string, unknown> | null) ?? {};

    const prof =
      (m.profiles as Record<string, unknown> | null) ?? {};

    return {
      id:
        String(row.id),

      checkin_at:
        String(row.checkin_at ?? ""),

      location:
        String(row.location ?? "—"),

      status:
        String(row.status ?? "Checked in"),

      member_name:
        String(prof.full_name ?? "—"),

      member_code:
        String(m.member_code ?? "—"),
    };
  });
}