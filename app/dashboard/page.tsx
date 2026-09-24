import Link from "next/link";
import { getCurrentUser, getCurrentMember } from "@/lib/auth";
import { getMemberAttendance, getMemberBookings, getMemberNotifications } from "@/lib/member-data";
import { getPublicAnnouncements } from "@/lib/content";
import { formatDate, formatDateTime, formatTime12h } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const [user, member, attendance, bookings, notifications, announcements] =
    await Promise.all([
      getCurrentUser(),
      getCurrentMember(),
      getMemberAttendance(),
      getMemberBookings(),
      getMemberNotifications(),
      getPublicAnnouncements(),
    ]);

  const visits = attendance.length;
  const lastVisit = attendance[0]?.checkin_at;
  const upcoming = bookings
    .filter((b) => b.status === "pending" || b.status === "confirmed")
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
  const unread = notifications.filter((n) => !n.read);

  const isActive = member?.status === "active";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide text-white">
          WELCOME BACK, {user?.full_name?.split(" ")[0]?.toUpperCase()}
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Member code: <span className="font-mono text-gold">{member?.member_code}</span>
        </p>
      </div>

      {unread.length > 0 && (
        <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
          <p className="text-sm font-semibold text-gold">
            🔔 {unread.length} new notification{unread.length > 1 ? "s" : ""}
          </p>
          {unread.slice(0, 2).map((n) => (
            <p key={n.id} className="mt-1 text-sm text-neutral-300">
              <span className="font-semibold text-white">{n.title}</span> — {n.body}
            </p>
          ))}
          <Link href="/dashboard/notifications" className="mt-2 inline-block text-xs font-bold uppercase tracking-wider text-gold hover:underline">
            View all
          </Link>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        {/* Membership card */}
        <div className="card-dark flex flex-col">
          <p className="text-xs font-bold uppercase tracking-wider2 text-neutral-500">Membership</p>
          <h3 className="mt-2 font-display text-3xl tracking-wider2 text-white">
            {(member?.plan_name ?? "None").toUpperCase()}
          </h3>
          <span className={`badge mt-2 w-fit ${isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
            {isActive ? "● Active" : member?.status ?? "No membership"}
          </span>
          <p className="mt-3 text-sm text-neutral-400">
            Expires: <span className="text-white">{formatDate(member?.end_date)}</span>
          </p>
          <Link href="/dashboard/membership" className="btn-gold mt-auto pt-0 !mt-5 !py-2.5 !text-base">
            Renew Membership
          </Link>
        </div>

        {/* Attendance card */}
        <div className="card-dark flex flex-col">
          <p className="text-xs font-bold uppercase tracking-wider2 text-neutral-500">Attendance</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-5xl text-gold">{visits}</span>
            <span className="font-display text-xl text-neutral-400">VISITS</span>
          </div>
          <p className="mt-3 text-sm text-neutral-400">
            Last visit: <span className="text-white">{lastVisit ? formatDateTime(lastVisit) : "—"}</span>
          </p>
          <Link href="/dashboard/attendance" className="btn-outline mt-auto !mt-5 !py-2.5 !text-base">
            View History
          </Link>
        </div>

        {/* Booking card */}
        <div className="card-dark flex flex-col">
          <p className="text-xs font-bold uppercase tracking-wider2 text-neutral-500">Next session</p>
          {upcoming ? (
            <>
              <h3 className="mt-2 font-display text-2xl tracking-wider2 text-white">
                {upcoming.service}
              </h3>
              <p className="mt-1 text-sm text-neutral-400">
                {formatDate(upcoming.date)} · {formatTime12h(upcoming.time)}
              </p>
              <p className="mt-1 text-sm text-gold">{upcoming.trainer_name}</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-neutral-400">No upcoming sessions.</p>
          )}
          <Link href="/dashboard/bookings" className="btn-outline mt-auto !mt-5 !py-2.5 !text-base">
            View Bookings
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: "/dashboard/qr", label: "My QR Code" },
          { href: "/book", label: "Book Training" },
          { href: "/dashboard/payments", label: "Payment History" },
          { href: "/dashboard/profile", label: "Profile" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="rounded-xl border border-neutral-800 bg-ink2/60 px-4 py-5 text-center font-display text-lg tracking-wider2 text-white transition hover:border-gold hover:text-gold"
          >
            {a.label}
          </Link>
        ))}
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="card-dark">
          <h3 className="font-display text-2xl tracking-wider2 text-gold">GYM ANNOUNCEMENTS</h3>
          <div className="mt-4 space-y-4">
            {announcements.map((a) => (
              <div key={a.id} className="border-l-2 border-gold/50 pl-4">
                <p className="text-xs uppercase tracking-wider2 text-neutral-500">
                  {a.type.replace(/_/g, " ")} · {formatDate(a.created_at)}
                </p>
                <p className="font-semibold text-white">{a.title}</p>
                <p className="text-sm text-neutral-400">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
