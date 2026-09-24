import Link from "next/link";
import {
  getAdminStats,
  getAdminBookings,
  getAdminAttendance,
} from "@/lib/admin-data";
import { formatDate, formatNaira, formatTime12h } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [stats, bookings, attendance] = await Promise.all([
  getAdminStats(),
  getAdminBookings(),
  getAdminAttendance(
    new Date().toISOString().slice(0, 10)
  ),
]);
  const upcoming = bookings
    .filter((b) => b.status === "pending" || b.status === "confirmed")
    .slice(0, 6);

  const cards = [
    { label: "Total Members", value: stats.total_members.toString(), href: "/admin/members", color: "text-white" },
    { label: "Active Members", value: stats.active_members.toString(), href: "/admin/members", color: "text-emerald-400" },
    { label: "Expired Members", value: stats.expired_members.toString(), href: "/admin/members", color: "text-red-400" },
    { label: "Today's Attendance", value: stats.todays_attendance.toString(), href: "/admin/attendance", color: "text-gold" },
    { label: "Monthly Revenue", value: formatNaira(stats.monthly_revenue), href: "/admin/payments", color: "text-gold" },
    { label: "Upcoming Bookings", value: stats.upcoming_bookings.toString(), href: "/admin/bookings", color: "text-white" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl tracking-wide text-white">DASHBOARD</h1>
        <p className="text-sm text-neutral-500">D&apos;Champs Fit Satellite — control center</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="card-dark transition hover:border-gold/50">
            <p className="text-xs font-bold uppercase tracking-wider2 text-neutral-500">{c.label}</p>
            <p className={`mt-2 font-display text-5xl ${c.color}`}>{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-dark">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl tracking-wider2 text-white">UPCOMING BOOKINGS</h2>
            <Link href="/admin/bookings" className="text-xs font-bold uppercase tracking-wider text-gold hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {upcoming.map((b) => (
              <div key={b.id} className="flex items-center justify-between border-b border-neutral-800/60 pb-3 text-sm last:border-0">
                <div>
                  <p className="font-semibold text-white">{b.member_name}</p>
                  <p className="text-xs text-neutral-400">
                    {b.service} · {b.trainer_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white">{formatDate(b.date)}</p>
                  <p className="text-xs text-neutral-400">{formatTime12h(b.time)}</p>
                </div>
              </div>
            ))}
            {upcoming.length === 0 && (
              <p className="py-6 text-center text-sm text-neutral-500">No upcoming bookings.</p>
            )}
          </div>
        </div>

        <div className="card-dark">
  <div className="flex items-center justify-between">
    <h2 className="font-display text-2xl tracking-wider2 text-white">
      TODAY&apos;S CHECK-INS
    </h2>

    <Link
      href="/admin/attendance"
      className="text-xs font-bold uppercase tracking-wider text-gold hover:underline"
    >
      View all
    </Link>
  </div>

  <div className="mt-4 space-y-3">
    {attendance.slice(0, 8).map((record) => (
      <div
        key={record.id}
        className="flex items-center justify-between border-b border-neutral-800/60 pb-3 last:border-0"
      >
        <div>
          <p className="font-semibold text-white">
            {record.member_name}
          </p>

          <p className="font-mono text-xs text-gold">
            {record.member_code}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-white">
            {formatTime12h(
              new Date(record.checkin_at).toTimeString().slice(0, 5)
            )}
          </p>

          <p className="text-xs text-neutral-500">
            {record.location}
          </p>
        </div>
      </div>
    ))}

    {attendance.length === 0 && (
      <p className="py-6 text-center text-sm text-neutral-500">
        No check-ins today yet.
      </p>
    )}
  </div>
</div>
      </div>
    </div>
  );
}
