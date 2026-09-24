import Link from "next/link";
import type { Plan } from "@/lib/demo-data";
import { formatNaira } from "@/lib/site";

export default function PlanCard({ plan }: { plan: Plan }) {
  const highlighted = plan.badge !== null;
  return (
    <div
      className={`relative flex flex-col rounded-xl border p-7 transition ${
        highlighted
          ? "border-gold bg-ink2 shadow-gold"
          : "border-neutral-800 bg-ink2/60 hover:border-neutral-600"
      }`}
    >
      {plan.badge && (
        <span className="badge absolute -top-3 left-6 bg-gold text-ink">
          {plan.badge}
        </span>
      )}
      <h3 className="font-display text-3xl tracking-wider2 text-white">
        {plan.name.toUpperCase()}
      </h3>
      <p className="mt-1 text-sm text-neutral-400">{plan.duration_days}-day membership</p>

      <div className="mt-5">
        {plan.price > 0 ? (
          <>
            <span className="font-display text-5xl text-gold">
              {formatNaira(plan.price)}
            </span>
            <span className="ml-1 text-sm text-neutral-400">/{plan.duration_days} days</span>
          </>
        ) : (
          <span className="font-display text-3xl text-neutral-400">
            Price on request
          </span>
        )}
      </div>

      <p className="mt-4 text-sm text-neutral-300">{plan.description}</p>

      <ul className="mt-6 flex-1 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-neutral-300">
            <svg className="mt-0.5 shrink-0 text-gold" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            {f}
          </li>
        ))}
      </ul>

      <Link
        href={`/join?plan=${plan.slug}`}
        className={`mt-7 w-full ${highlighted ? "btn-gold" : "btn-outline"}`}
      >
        Join {plan.name}
      </Link>
    </div>
  );
}
