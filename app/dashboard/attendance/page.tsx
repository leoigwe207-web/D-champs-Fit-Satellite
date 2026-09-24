import { getCurrentMember } from "@/lib/auth";
import { getMemberAttendance } from "@/lib/member-data";
import { formatDateTime } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function MemberAttendancePage() {
  const member = await getCurrentMember();
  const attendance = await getMemberAttendance();

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-3xl tracking-wide text-white">ATTENDANCE</h1>
        <p className="font-display text-2xl text-gold">{attendance.length} VISITS</p>
      </div>

      <div className="card-dark overflow-x-auto p-0">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-xs uppercase tracking-wider2 text-neutral-500">
              <th className="px-6 py-4 font-semibold">Date &amp; Time</th>
              <th className="px-6 py-4 font-semibold">Location</th>
              <th className="px-6 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((a) => (
              <tr key={a.id} className="border-b border-neutral-800/60">
                <td className="px-6 py-3.5 text-white">{formatDateTime(a.checkin_at)}</td>
                <td className="px-6 py-3.5 text-neutral-400">{a.location}</td>
                <td className="px-6 py-3.5">
                  <span className="badge bg-emerald-500/15 text-emerald-400">{a.status}</span>
                </td>
              </tr>
            ))}
            {attendance.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-neutral-500">
                  No visits yet — your first check-in will appear here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-neutral-500">
        Every scan of your member QR code at reception records a visit automatically.
        Member code: <span className="font-mono text-gold">{member?.member_code}</span>
      </p>
    </div>
  );
}
