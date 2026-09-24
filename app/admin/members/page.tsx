import { getAdminMembers } from "@/lib/admin-data";
import { formatDate } from "@/lib/site";
import MemberRowActions from "./MemberRowActions";
import MemberSearch from "./MemberSearch";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400",
  expired: "bg-red-500/15 text-red-400",
  suspended: "bg-amber-500/15 text-amber-400",
};

export default async function AdminMembersPage() {
  const members = await getAdminMembers();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-white">MEMBERS</h1>
          <p className="text-sm text-neutral-500">{members.length} registered</p>
        </div>
        <MemberSearch />
      </div>

      <div className="card-dark overflow-x-auto p-0">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-xs uppercase tracking-wider2 text-neutral-500">
              <th className="px-5 py-4 font-semibold">Member</th>
              <th className="px-5 py-4 font-semibold">Code</th>
              <th className="px-5 py-4 font-semibold">Plan</th>
              <th className="px-5 py-4 font-semibold">Expires</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} data-member-row className="border-b border-neutral-800/60 hover:bg-ink2/50">
                <td className="px-5 py-3.5">
                  <p className="font-semibold text-white">{m.full_name}</p>
                  <p className="text-xs text-neutral-500">{m.email} · {m.phone}</p>
                </td>
                <td className="px-5 py-3.5 font-mono text-xs text-gold">{m.member_code}</td>
                <td className="px-5 py-3.5 text-neutral-300">{m.plan_name ?? "—"}</td>
                <td className="px-5 py-3.5 text-neutral-300">{formatDate(m.end_date)}</td>
                <td className="px-5 py-3.5">
                  <span className={`badge ${STATUS_STYLES[m.status] ?? ""}`}>{m.status}</span>
                </td>
                <td className="px-5 py-3.5">
                  <MemberRowActions memberId={m.id} status={m.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
