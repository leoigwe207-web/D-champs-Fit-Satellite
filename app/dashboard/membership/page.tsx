import Link from "next/link";
import { getCurrentMember } from "@/lib/auth";
import { getMemberPayments } from "@/lib/member-data";
import { formatDate } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function MemberMembershipPage() {
  const member = await getCurrentMember();
  const payments = await getMemberPayments();
  const lastPayment = payments[0];
  const isActive = member?.status === "active";

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl tracking-wide text-white">MEMBERSHIP</h1>

      <div className="card-dark">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider2 text-neutral-500">Current plan</p>
            <h2 className="mt-1 font-display text-4xl tracking-wider2 text-white">
              {(member?.plan_name ?? "None").toUpperCase()}
            </h2>
          </div>
          <span className={`badge ${isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
            {isActive ? "● Active" : (member?.status ?? "no membership")}
          </span>
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wider2 text-neutral-500">Member code</dt>
            <dd className="mt-1 font-mono text-gold">{member?.member_code}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider2 text-neutral-500">Started</dt>
            <dd className="mt-1 text-white">{formatDate(lastPayment?.created_at)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider2 text-neutral-500">Expires</dt>
            <dd className="mt-1 text-white">{formatDate(member?.end_date)}</dd>
          </div>
        </dl>
        <Link href="/join" className="btn-gold mt-7 w-full sm:w-auto">Renew Membership</Link>
      </div>

      <div className="card-dark">
        <h3 className="font-display text-xl tracking-wider2 text-gold">HOW RENEWAL WORKS</h3>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-neutral-400">
          <li>Choose your plan on the membership page.</li>
          <li>Pay securely with Paystack (card or transfer).</li>
          <li>Your membership activates instantly and extends from the current expiry.</li>
        </ol>
      </div>
    </div>
  );
}
