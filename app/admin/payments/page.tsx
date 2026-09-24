import { getAdminPayments } from "@/lib/admin-data";
import { formatDate, formatNaira } from "@/lib/site";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  successful: "bg-emerald-500/15 text-emerald-400",
  pending: "bg-amber-500/15 text-amber-400",
  failed: "bg-red-500/15 text-red-400",
  refunded: "bg-blue-500/15 text-blue-400",
};

export default async function AdminPaymentsPage() {
  const payments = await getAdminPayments();
  const total = payments
    .filter((p) => p.status === "successful")
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-white">PAYMENTS</h1>
          <p className="text-sm text-neutral-500">
            Collected: <span className="font-bold text-gold">{formatNaira(total)}</span>
          </p>
        </div>
      </div>

      <div className="card-dark overflow-x-auto p-0">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-xs uppercase tracking-wider2 text-neutral-500">
              <th className="px-5 py-4 font-semibold">Transaction</th>
              <th className="px-5 py-4 font-semibold">Member</th>
              <th className="px-5 py-4 font-semibold">Plan</th>
              <th className="px-5 py-4 font-semibold">Amount</th>
              <th className="px-5 py-4 font-semibold">Method</th>
              <th className="px-5 py-4 font-semibold">Date</th>
              <th className="px-5 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-neutral-800/60">
                <td className="px-5 py-3.5 font-mono text-xs text-neutral-400">{p.reference}</td>
                <td className="px-5 py-3.5 font-semibold text-white">{p.member_name}</td>
                <td className="px-5 py-3.5 text-neutral-300">{p.plan_name}</td>
                <td className="px-5 py-3.5 font-semibold text-gold">{formatNaira(p.amount)}</td>
                <td className="px-5 py-3.5 text-neutral-400">{p.method}</td>
                <td className="px-5 py-3.5 text-neutral-300">{formatDate(p.created_at)}</td>
                <td className="px-5 py-3.5">
                  <span className={`badge ${STATUS_STYLES[p.status] ?? ""}`}>{p.status}</span>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-neutral-500">
                  No payments recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
