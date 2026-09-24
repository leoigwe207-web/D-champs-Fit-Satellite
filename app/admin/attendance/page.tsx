import { getAdminAttendance } from "@/lib/admin-data";
import { formatDateTime } from "@/lib/site";
import AttendanceFilter from "./AttendanceFilter";

export const dynamic = "force-dynamic";

export default async function AdminAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; range?: string }>;
}) {
  const params = await searchParams;
  const date = params.date ?? new Date().toISOString().slice(0, 10);
  const rows = await getAdminAttendance(params.range === "all" ? undefined : date);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-white">ATTENDANCE</h1>
          <p className="text-sm text-neutral-500">
            <span className="font-display text-2xl text-gold">{rows.length}</span>{" "}
            check-ins {params.range === "all" ? "recorded" : `on ${date}`}
          </p>
        </div>
        <AttendanceFilter />
      </div>

      <div className="card-dark overflow-x-auto p-0">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-xs uppercase tracking-wider2 text-neutral-500">
              <th className="px-5 py-4 font-semibold">Member</th>
              <th className="px-5 py-4 font-semibold">Time</th>
              <th className="px-5 py-4 font-semibold">Location</th>
              <th className="px-5 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-neutral-800/60">
                <td className="px-5 py-3.5">
                  <p className="font-semibold text-white">{r.member_name}</p>
                  <p className="font-mono text-xs text-gold">{r.member_code}</p>
                </td>
                <td className="px-5 py-3.5 text-neutral-300">{formatDateTime(r.checkin_at)}</td>
                <td className="px-5 py-3.5 text-neutral-400">{r.location}</td>
                <td className="px-5 py-3.5">
                  <span className="badge bg-emerald-500/15 text-emerald-400">{r.status}</span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-neutral-500">
                  No check-ins for this day yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
