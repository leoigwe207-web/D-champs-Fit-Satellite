import { getCurrentMember } from "./auth";

export type AttendanceRow = {
  id: string;
  checkin_at: string;
  location: string;
  status: string;
};

export type PaymentRow = {
  id: string;
  reference: string;
  plan_name: string;
  amount: number;
  method: string;
  status: "successful" | "pending" | "failed" | "refunded";
  created_at: string;
};

export type BookingRow = {
  id: string;
  date: string;
  time: string;
  service: string;
  trainer_name: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
};

export type NotificationRow = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  read: boolean;
};

function daysAgo(n: number, hour = 7, minute = 30): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const DEMO_ATTENDANCE: AttendanceRow[] = Array.from({ length: 24 }, (_, i) => ({
  id: `att-${i + 1}`,
  checkin_at: daysAgo(Math.floor(i * 1.6), 6 + (i % 12), (i * 13) % 60),
  location: "Chevron Estate — Main Entrance",
  status: "Checked in",
})).concat({
  id: "att-today",
  checkin_at: daysAgo(0, 6, 42),
  location: "Chevron Estate — Main Entrance",
  status: "Checked in",
});

export const DEMO_PAYMENTS: PaymentRow[] = [
  {
    id: "pay-1",
    reference: "DCF-DEMO-0093",
    plan_name: "Quarterly",
    amount: 0,
    method: "Paystack (Card)",
    status: "successful",
    created_at: daysAgo(75, 18, 4),
  },
];

export const DEMO_BOOKINGS: BookingRow[] = [
  {
    id: "bk-1",
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    time: "18:00",
    service: "Personal Training",
    trainer_name: "Trainer TBC",
    status: "confirmed",
  },
  {
    id: "bk-2",
    date: new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10),
    time: "07:00",
    service: "Fitness Assessment",
    trainer_name: "Trainer TBC",
    status: "completed",
  },
];

export const DEMO_NOTIFICATIONS: NotificationRow[] = [
  {
    id: "n1",
    title: "Booking confirmed",
    body: "Your training session has been confirmed.",
    created_at: daysAgo(1, 12, 0),
    read: false,
  },
  {
    id: "n2",
    title: "Your membership expires in 7 days",
    body: "Renew from your dashboard to keep training without interruption.",
    created_at: daysAgo(2, 9, 0),
    read: false,
  },
  {
    id: "n3",
    title: "Payment successful",
    body: "We received your membership payment. Thank you!",
    created_at: daysAgo(75, 18, 5),
    read: true,
  },
];

async function getSB() {
  const { createClient } = await import("./supabase-server");
  return createClient();
}

export async function getMemberAttendance(): Promise<AttendanceRow[]> {
  const member = await getCurrentMember();
  if (!member) return [];
  if (member.id === "demo-member") return DEMO_ATTENDANCE;
  try {
    const sb = await getSB();
    if (!sb) return [];
    const { data } = await sb
      .from("attendance")
      .select("id, checkin_at, location, status")
      .eq("member_id", member.id)
      .order("checkin_at", { ascending: false })
      .limit(200);
    return (data as unknown as AttendanceRow[]) ?? [];
  } catch {
    return [];
  }
}

export async function getMemberPayments(): Promise<PaymentRow[]> {
  const member = await getCurrentMember();
  if (!member) return [];
  if (member.id === "demo-member") return DEMO_PAYMENTS;
  try {
    const sb = await getSB();
    if (!sb) return [];
    const { data } = await sb
      .from("payments")
      .select("id, reference, plan_name, amount, method, status, created_at")
      .eq("member_id", member.id)
      .order("created_at", { ascending: false });
    return (data as unknown as PaymentRow[]) ?? [];
  } catch {
    return [];
  }
}

export async function getMemberBookings(): Promise<BookingRow[]> {
  const member = await getCurrentMember();
  if (!member) return [];
  if (member.id === "demo-member") return DEMO_BOOKINGS;
  try {
    const sb = await getSB();
    if (!sb) return [];
    // `bookings` has no trainer_name column — join through the FK and map it.
    const { data, error } = await sb
      .from("bookings")
      .select("id, date, time, service, status, trainers(name)")
      .eq("member_id", member.id)
      .order("date", { ascending: false });
    if (error || !data) return [];
    return data.map((row: Record<string, unknown>) => ({
      id: String(row.id),
      date: String(row.date),
      time: String(row.time),
      service: String(row.service),
      status: row.status as BookingRow["status"],
      trainer_name:
        ((row.trainers as Record<string, unknown> | null)?.name as string) ?? null,
    }));
  } catch {
    return [];
  }
}

export async function getMemberNotifications(): Promise<NotificationRow[]> {
  const member = await getCurrentMember();

  if (!member) return [];

  if (member.id === "demo-member") {
    return DEMO_NOTIFICATIONS;
  }

  try {
    const sb = await getSB();

    if (!sb) return [];

    // ----------------------------------------------------------
    // 1. Get personal notifications
    // ----------------------------------------------------------
    const { data: personalData, error: personalError } =
      await sb
        .from("notifications")
        .select("id, title, body, created_at, read")
        .eq("user_id", member.user_id)
        .order("created_at", { ascending: false })
        .limit(50);

    if (personalError) {
      console.error(
        "Member notifications query failed:",
        personalError
      );
    }

    const personalNotifications =
      (personalData as unknown as NotificationRow[]) ?? [];

    // ----------------------------------------------------------
    // 2. Get published gym announcements
    // ----------------------------------------------------------
    const { data: announcementData, error: announcementError } =
      await sb
        .from("announcements")
        .select("id, title, message, created_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(50);

    if (announcementError) {
      console.error(
        "Announcement notification query failed:",
        announcementError
      );
    }

    const announcementNotifications: NotificationRow[] =
      (announcementData ?? []).map((announcement) => ({
        id: `announcement-${announcement.id}`,
        title: String(announcement.title),
        body: String(announcement.message),
        created_at: String(announcement.created_at),
        read: false,
      }));

    // ----------------------------------------------------------
    // 3. Merge with ONE source of truth per item.
    //
    // createAnnouncement() both inserts the announcement AND creates one
    // notification row per member with the same title/body. Merging both
    // sources naively rendered every announcement twice. The real
    // notification row wins (it is the record deletion acts on); an
    // announcement is only shown when no notification row carries the same
    // title+body. The same key also collapses any repeated send of the
    // same title+body to the same member.
    // ----------------------------------------------------------
    const normalize = (s: string) =>
      s.trim().toLowerCase().replace(/\s+/g, " ");

    const unique = new Map<string, NotificationRow>();

    for (const notification of personalNotifications) {
      unique.set(
        `${normalize(notification.title)}|${normalize(notification.body)}`,
        notification
      );
    }

    for (const announcement of announcementNotifications) {
      const key = `${normalize(announcement.title)}|${normalize(announcement.body)}`;

      if (!unique.has(key)) {
        unique.set(key, announcement);
      }
    }

    return Array.from(unique.values())
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )
      .slice(0, 50);
  } catch (error) {
    console.error(
      "Failed to load member notifications:",
      error
    );

    return [];
  }
}