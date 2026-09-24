"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { createClient } from "@/lib/supabase-browser";

const Email = z.string().trim().email().max(254);

export default function ForgotForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Email.safeParse(email);
    if (!parsed.success) {
      setError("Please enter a valid email address.");
      return;
    }
    const sb = createClient();
    if (!sb) {
      // Demo mode (dev only, no Supabase configured).
      setSent(true);
      return;
    }
    const { error } = await sb.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/login`,
    });
    // Always show the same neutral confirmation — this page must not reveal
    // whether an account exists. Supabase handles token expiry and
    // single-use semantics for the reset link itself.
    if (error && error.status !== 429) setError(error.message);
    else setSent(true);
  }

  return sent ? (
    <p className="mt-8 rounded-md border border-gold/40 bg-gold/10 px-4 py-4 text-center text-sm text-cream">
      If an account exists for that email, a reset link is on its way. Check your inbox.
    </p>
  ) : (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      {error && (
        <p className="rounded-md border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">{error}</p>
      )}
      <div>
        <label className="label-dark">Email</label>
        <input className="input-dark" type="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
      </div>
      <button type="submit" className="btn-gold w-full">Send Reset Link</button>
      <p className="text-center text-sm">
        <Link href="/login" className="text-neutral-400 hover:text-gold">Back to login</Link>
      </p>
    </form>
  );
}
