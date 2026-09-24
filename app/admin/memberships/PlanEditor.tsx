"use client";

import { useState } from "react";
import { useTransition } from "react";
import type { Plan } from "@/lib/demo-data";
import { formatNaira } from "@/lib/site";
import { savePlan } from "./actions";

export default function PlanEditor({ plan }: { plan: Plan }) {
  const [price, setPrice] = useState(plan.price.toString());
  const [duration, setDuration] = useState(plan.duration_days.toString());
  const [description, setDescription] = useState(plan.description);
  const [active, setActive] = useState(plan.active);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onSave() {
    setError(null);
    start(async () => {
      try {
        await savePlan(plan.id, {
          price: Number(price) || 0,
          duration_days: Number(duration) || 30,
          description,
          active,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save plan.");
      }
    });
  }

  return (
    <div className="card-dark">
      {error && (
        <p className="mb-3 rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300">{error}</p>
      )}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl tracking-wider2 text-white">
          {plan.name.toUpperCase()}
        </h2>
        {plan.badge && <span className="badge bg-gold/15 text-gold">{plan.badge}</span>}
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="label-dark">Price (₦)</label>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input-dark"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Currently shown as {plan.price > 0 ? formatNaira(plan.price) : "Price on request"}
          </p>
        </div>
        <div>
          <label className="label-dark">Duration (days)</label>
          <input
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="input-dark"
          />
        </div>
        <div>
          <label className="label-dark">Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-dark"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-neutral-300">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 accent-[#D9A441]"
          />
          Plan is active (visible to the public)
        </label>
      </div>

      <button onClick={onSave} disabled={pending} className="btn-gold mt-6 w-full disabled:opacity-50">
        {pending ? "Saving…" : saved ? "✓ Saved" : "Save Changes"}
      </button>
    </div>
  );
}
