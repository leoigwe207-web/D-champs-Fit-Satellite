import { getPlans } from "@/lib/content";
import PlanEditor from "./PlanEditor";

export const dynamic = "force-dynamic";

export default async function AdminMembershipsPage() {
  const plans = await getPlans();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-white">MEMBERSHIPS</h1>
        <p className="max-w-xl text-sm text-neutral-500">
          Set your real prices here — the website and checkout always show what
          you save. Changes appear on the site immediately.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((p) => (
          <PlanEditor key={p.id} plan={p} />
        ))}
      </div>
    </div>
  );
}
