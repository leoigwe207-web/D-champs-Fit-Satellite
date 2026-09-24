import Link from "next/link";
import { getMemberBookings } from "@/lib/member-data";
import { formatDate, formatTime12h } from "@/lib/site";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400",
  confirmed: "bg-emerald-500/15 text-emerald-400",
  completed: "bg-blue-500/15 text-blue-400",
  cancelled: "bg-red-500/15 text-red-400",
};

export default async function MemberBookingsPage() {
  const bookings = await getMemberBookings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl tracking-wide text-white">BOOKINGS</h1>
        <Link href="/book" className="btn-gold !px-4 !py-2 !text-sm">＋ Book Training</Link>
      </div>

      <div className="card-dark overflow-x-auto p-0">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-xs uppercase tracking-wider2 text-neutral-500">
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Time</th>
              <th className="px-6 py-4 font-semibold">Service</th>
              <th className="px-6 py-4 font-semibold">Trainer</th>
              <th className="px-6 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-neutral-800/60">
                <td className="px-6 py-3.5 text-white">{formatDate(b.date)}</td>
                <td className="px-6 py-3.5 text-neutral-300">{formatTime12h(b.time)}</td>
                <td className="px-6 py-3.5 text-white">{b.service}</td>
                <td className="px-6 py-3.5 text-neutral-300">{b.trainer_name}</td>
                <td className="px-6 py-3.5">
                  <span className={`badge ${STATUS_STYLES[b.status] ?? "bg-neutral-700 text-neutral-300"}`}>
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-neutral-500">
                  No bookings yet.{" "}
                  <Link href="/book" className="text-gold hover:underline">Book your first session →</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
