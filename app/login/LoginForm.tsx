"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase-browser";

const Credentials = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(6).max(72),
});

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();

  const nextParam = params.get("next");

  const nextPath =
    nextParam &&
    nextParam.startsWith("/") &&
    !nextParam.startsWith("//")
      ? nextParam
      : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError(null);

    const parsed = Credentials.safeParse({
      email,
      password,
    });

    if (!parsed.success) {
      setError("Please enter a valid email and your password.");
      setLoading(false);
      return;
    }

    try {
      const sb = createClient();

      if (!sb) {
        setError("Authentication is not configured.");
        setLoading(false);
        return;
      }

      const { data, error: signInError } =
        await sb.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });

      if (signInError) {
        setError(
          signInError.status === 400 ||
            signInError.status === 401
            ? "Invalid email or password."
            : signInError.message
        );

        setLoading(false);
        return;
      }

      if (!data.user) {
        setError("Login failed. Please try again.");
        setLoading(false);
        return;
      }

      // Get the authenticated user's role from the database.
      const { data: profile, error: profileError } =
        await sb
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

      if (profileError) {
        console.error(
          "Profile lookup failed:",
          profileError
        );

        setError(
          "Your account was authenticated, but your profile could not be loaded."
        );

        await sb.auth.signOut();
        setLoading(false);
        return;
      }

      // Respect a safe internal redirect when one exists.
      if (nextPath) {
        router.push(nextPath);
        router.refresh();
        return;
      }

      // Admin → Admin dashboard
      if (profile.role === "admin") {
        router.push("/admin");
        router.refresh();
        return;
      }

      // Staff → Member dashboard for now.
      // We can create a dedicated staff dashboard later.
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong during login."
      );

      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-8 space-y-4"
    >
      {error && (
        <p className="rounded-md border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div>
        <label className="label-dark">
          Email
        </label>

        <input
          className="input-dark"
          type="email"
          required
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          placeholder="you@email.com"
          autoComplete="email"
          maxLength={254}
        />
      </div>

      <div>
        <label className="label-dark">
          Password
        </label>

        <input
          className="input-dark"
          type="password"
          required
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          placeholder="••••••••"
          autoComplete="current-password"
          maxLength={72}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-gold w-full disabled:opacity-50"
      >
        {loading ? "Logging in…" : "Log In"}
      </button>

      <div className="flex justify-between text-sm">
        <Link
          href="/forgot-password"
          className="text-neutral-400 hover:text-gold"
        >
          Forgot password?
        </Link>

        <Link
          href="/register"
          className="text-gold hover:underline"
        >
          Create account
        </Link>
      </div>
    </form>
  );
}