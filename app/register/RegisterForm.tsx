"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase-browser";

// Client-side validation mirrors the server-side rules (zod + Supabase).
const RegisterDetails = z.object({
  full_name: z.string().trim().min(3).max(120),
  phone: z.string().trim().min(7).max(20).regex(/^[0-9+\-\s()]+$/, "Invalid phone"),
  email: z.string().trim().email().max(254),
  password: z.string().min(6).max(72),
});

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const parsed = RegisterDetails.safeParse(form);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setError(
        first?.path.includes("password")
          ? "Password must be at least 6 characters."
          : first?.path.includes("phone")
          ? "Please enter a valid phone number."
          : "Please check your details and try again."
      );
      setLoading(false);
      return;
    }

    const sb = createClient();
    if (!sb) {
      // Demo mode (dev only) — browse the dashboard.
      router.push("/dashboard");
      router.refresh();
      return;
    }
    const { error } = await sb.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { data: { full_name: parsed.data.full_name, phone: parsed.data.phone } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      {error && (
        <p className="rounded-md border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}
      <div>
        <label className="label-dark">Full name</label>
        <input className="input-dark" required minLength={3} maxLength={120} value={form.full_name} onChange={set("full_name")} placeholder="Ada Obi" autoComplete="name" />
      </div>
      <div>
        <label className="label-dark">Phone number</label>
        <input className="input-dark" required minLength={7} maxLength={20} value={form.phone} onChange={set("phone")} placeholder="0803 000 0000" inputMode="tel" autoComplete="tel" />
      </div>
      <div>
        <label className="label-dark">Email</label>
        <input className="input-dark" type="email" required value={form.email} onChange={set("email")} placeholder="you@email.com" autoComplete="email" maxLength={254} />
      </div>
      <div>
        <label className="label-dark">Password</label>
        <input className="input-dark" type="password" required minLength={6} maxLength={72} value={form.password} onChange={set("password")} placeholder="Minimum 6 characters" autoComplete="new-password" />
      </div>
      <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-50">
        {loading ? "Creating account…" : "Create Account"}
      </button>
      <p className="text-center text-sm text-neutral-400">
        Already have an account?{" "}
        <Link href="/login" className="text-gold hover:underline">Log in</Link>
      </p>
    </form>
  );
}
