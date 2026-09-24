import { getAdminBookings } from "@/lib/admin-data";
import { formatDate, formatTime12h } from "@/lib/site";
import BookingRowActions from "./BookingRowActions";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400",
  confirmed: "bg-emerald-500/15 text-emerald-400",
  completed: "bg-blue-500/15 text-blue-400",
  cancelled: "bg-red-500/15 text-red-400",
};

export default async function AdminBookingsPage() {
  const bookings = await getAdminBookings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-white">BOOKINGS</h1>
        <p className="text-sm text-neutral-500">{bookings.length} total</p>
      </div>

      <div className="card-dark overflow-x-auto p-0">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-xs uppercase tracking-wider2 text-neutral-500">
              <th className="px-5 py-4 font-semibold">Date</th>
              <th className="px-5 py-4 font-semibold">Time</th>
              <th className="px-5 py-4 font-semibold">Member</th>
              <th className="px-5 py-4 font-semibold">Trainer</th>
              <th className="px-5 py-4 font-semibold">Service</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-neutral-800/60">
                <td className="px-5 py-3.5 text-white">{formatDate(b.date)}</td>
                <td className="px-5 py-3.5 text-neutral-300">{formatTime12h(b.time)}</td>
                <td className="px-5 py-3.5 font-semibold text-white">{b.member_name}</td>
                <td className="px-5 py-3.5 text-neutral-300">{b.trainer_name}</td>
                <td className="px-5 py-3.5 text-neutral-300">{b.service}</td>
                <td className="px-5 py-3.5">
                  <span className={`badge ${STATUS_STYLES[b.status] ?? ""}`}>{b.status}</span>
                </td>
                <td className="px-5 py-3.5">
                  <BookingRowActions bookingId={b.id} status={b.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
