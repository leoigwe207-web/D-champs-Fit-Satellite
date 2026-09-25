"use client";

import { useState } from "react";
import Link from "next/link";
import type { Plan } from "@/lib/demo-data";
import { formatNaira } from "@/lib/site";

type Step = 1 | 2 | 3;

export default function JoinFlow({
  plans,
  initialSlug,
}: {
  plans: Plan[];
  initialSlug?: string;
}) {
  const [step, setStep] = useState<Step>(initialSlug ? 2 : 1);
  const [plan, setPlan] = useState<Plan | null>(
    plans.find((p) => p.slug === initialSlug) ?? null
  );
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function startCheckout() {
    if (!plan) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_slug: plan.slug,
          full_name: form.full_name,
          phone: form.phone,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start checkout");
      window.location.href = data.authorization_url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  const inputOk =
    form.full_name.trim().length > 2 &&
    /\S+@\S+\.\S+/.test(form.email) &&
    form.password.length >= 6 &&
    form.phone.trim().length >= 7;

  return (
    <div className="mt-10">
      {/* Stepper */}
      <ol className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider2">
        {["Plan", "Account", "Review"].map((label, i) => {
          const n = (i + 1) as Step;
          const state = step === n ? "current" : step > n ? "done" : "todo";
          return (
            <li key={label} className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full ${
                  state === "current"
                    ? "bg-gold text-ink"
                    : state === "done"
                    ? "bg-gold/20 text-gold"
                    : "border border-neutral-700 text-neutral-500"
                }`}
              >
                {state === "done" ? "✓" : n}
              </span>
              <span className={state === "todo" ? "text-neutral-500" : "text-white"}>
                {label}
              </span>
              {i < 2 && <span className="mx-1 h-px w-6 bg-neutral-700" />}
            </li>
          );
        })}
      </ol>

      {error && (
        <p className="mt-6 rounded-md border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {/* STEP 1 — choose plan */}
      {step === 1 && (
        <div className="mt-8 space-y-3">
          {plans.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setPlan(p);
                setStep(2);
              }}
              className={`flex w-full items-center justify-between rounded-xl border p-5 text-left transition ${
                plan?.id === p.id
                  ? "border-gold bg-ink2"
                  : "border-neutral-800 bg-ink2/60 hover:border-neutral-600"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-2xl tracking-wider2 text-white">
                    {p.name.toUpperCase()}
                  </span>
                  {p.badge && <span className="badge bg-gold/15 text-gold">{p.badge}</span>}
                </div>
                <p className="mt-0.5 text-sm text-neutral-400">
                  {p.duration_days}-day membership
                </p>
              </div>
              <span className="font-display text-2xl text-gold">
                {p.price > 0 ? formatNaira(p.price) : "On request"}
              </span>
            </button>
          ))}
          <p className="pt-2 text-center text-sm text-neutral-500">
            Already a member?{" "}
            <Link href="/login" className="text-gold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      )}

      {/* STEP 2 — account */}
      {step === 2 && (
        <div className="mt-8 space-y-4">
          <div>
            <label className="label-dark">Full name</label>
            <input className="input-dark" value={form.full_name} onChange={set("full_name")} placeholder="Ada Obi" autoComplete="name" />
          </div>
          <div>
            <label className="label-dark">Phone number</label>
            <input className="input-dark" value={form.phone} onChange={set("phone")} placeholder="0803 000 0000" inputMode="tel" autoComplete="tel" />
          </div>
          <div>
            <label className="label-dark">Email</label>
            <input className="input-dark" type="email" value={form.email} onChange={set("email")} placeholder="you@email.com" autoComplete="email" />
          </div>
          <div>
            <label className="label-dark">Password</label>
            <input className="input-dark" type="password" value={form.password} onChange={set("password")} placeholder="Minimum 6 characters" autoComplete="new-password" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(1)} className="btn-outline flex-1">Back</button>
            <button
              onClick={() => setStep(3)}
              disabled={!inputOk}
              className="btn-gold flex-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — review + pay */}
      {step === 3 && plan && (
        <div className="mt-8">
          <div className="card-dark">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-3xl tracking-wider2 text-white">
                  {plan.name.toUpperCase()}
                </h3>
                <p className="text-sm text-neutral-400">{plan.duration_days}-day membership</p>
              </div>
              <div className="text-right">
                <div className="font-display text-3xl text-gold">
                  {plan.price > 0 ? formatNaira(plan.price) : "On request"}
                </div>
              </div>
            </div>
            <hr className="my-4 border-neutral-800" />
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-neutral-500">Name</dt><dd className="text-white">{form.full_name}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Phone</dt><dd className="text-white">{form.phone}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Email</dt><dd className="text-white">{form.email}</dd></div>
            </dl>
            <p className="mt-4 rounded-md border border-neutral-800 bg-ink px-3 py-2 text-xs text-neutral-500">
              Payment is processed securely by Paystack. Your membership activates
              immediately after payment.
            </p>
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={() => setStep(2)} className="btn-outline flex-1">Back</button>
            <button onClick={startCheckout} disabled={loading} className="btn-gold flex-1 disabled:opacity-50">
              {loading ? "Redirecting…" : plan.price > 0 ? `Pay ${formatNaira(plan.price)}` : "Continue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
