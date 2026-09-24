"use client";

import { useState, useTransition } from "react";

export default function TestimonialForm({
  onSubmit,
}: {
  onSubmit: (values: { quote: string; member_duration?: string }) => Promise<void>;
}) {
  const [quote, setQuote] = useState("");
  const [duration, setDuration] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (state === "done") {
    return (
      <div className="card-dark text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold font-display text-3xl text-ink">✓</div>
        <h2 className="mt-4 font-display text-2xl tracking-wider2 text-white">THANK YOU</h2>
        <p className="mt-2 text-sm text-neutral-400">
          Your testimonial was submitted and is awaiting the gym&apos;s approval.
        </p>
      </div>
    );
  }

  return (
    <form
      className="card-dark space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          try {
            await onSubmit({ quote, member_duration: duration || undefined });
            setState("done");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
          }
        });
      }}
    >
      {error && (
        <p className="rounded-md border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">{error}</p>
      )}
      <div>
        <label className="label-dark">Your testimonial</label>
        <textarea
          rows={5}
          required
          minLength={4}
          maxLength={1000}
          className="input-dark"
          placeholder="What has training here meant for you?"
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
        />
        <p className="mt-1 text-xs text-neutral-500">{quote.length}/1000</p>
      </div>
      <div>
        <label className="label-dark">How long have you been a member? (optional)</label>
        <input
          className="input-dark"
          maxLength={80}
          placeholder="e.g. 8 months"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
      </div>
      <button type="submit" disabled={pending || quote.trim().length < 4} className="btn-gold w-full disabled:opacity-50">
        {pending ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}
