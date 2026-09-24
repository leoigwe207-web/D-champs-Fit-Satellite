import { getMemberPayments } from "@/lib/member-data";
import { formatDate, formatNaira } from "@/lib/site";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  successful: "bg-emerald-500/15 text-emerald-400",
  pending: "bg-amber-500/15 text-amber-400",
  failed: "bg-red-500/15 text-red-400",
  refunded: "bg-blue-500/15 text-blue-400",
};

export default async function MemberPaymentsPage() {
  const payments = await getMemberPayments();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl tracking-wide text-white">PAYMENT HISTORY</h1>

      <div className="card-dark overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-xs uppercase tracking-wider2 text-neutral-500">
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Plan</th>
              <th className="px-6 py-4 font-semibold">Amount</th>
              <th className="px-6 py-4 font-semibold">Method</th>
              <th className="px-6 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-neutral-800/60">
                <td className="px-6 py-3.5 text-white">{formatDate(p.created_at)}</td>
                <td className="px-6 py-3.5 text-neutral-300">{p.plan_name}</td>
                <td className="px-6 py-3.5 font-semibold text-gold">{formatNaira(p.amount)}</td>
                <td className="px-6 py-3.5 text-neutral-400">{p.method}</td>
                <td className="px-6 py-3.5">
                  <span className={`badge ${STATUS_STYLES[p.status] ?? "bg-neutral-700 text-neutral-300"}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-neutral-500">
                  No payments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
