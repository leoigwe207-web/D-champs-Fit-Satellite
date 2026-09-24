"use client";

import { useTransition } from "react";
import type { Testimonial } from "@/lib/demo-data";
import { toggleTestimonial, deleteTestimonial } from "./actions";

export default function TestimonialCard({
  testimonial,
}: {
  testimonial: Testimonial;
}) {
  const [pending, start] = useTransition();
  const isDemo = testimonial.id.startsWith("ts");

  return (
    <div className={`card-dark ${testimonial.approved ? "" : "border-amber-800/60"}`}>
      <div className="text-gold">{"★".repeat(testimonial.rating)}</div>
      <blockquote className="mt-2 text-sm leading-relaxed text-neutral-300">
        “{testimonial.quote}”
      </blockquote>
      <p className="mt-3 text-sm">
        <span className="font-semibold text-white">{testimonial.name}</span>
        {testimonial.member_duration && (
          <span className="text-neutral-500"> · {testimonial.member_duration}</span>
        )}
      </p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className={`badge ${testimonial.approved ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
          {testimonial.approved ? "Published" : "Pending approval"}
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={pending || isDemo}
            title={isDemo ? "Available once Supabase is connected" : undefined}
            onClick={() => start(() => toggleTestimonial(testimonial.id, !testimonial.approved))}
            className="rounded border border-gold px-3 py-1 text-xs font-bold uppercase text-gold hover:bg-gold/10 disabled:opacity-30"
          >
            {pending ? "…" : testimonial.approved ? "Unpublish" : "Approve"}
          </button>
          {/* Reject: permanently remove a pending submission. */}
          {!testimonial.approved && (
            <button
              disabled={pending || isDemo}
              title="Reject and permanently remove this submission"
              onClick={() => start(() => deleteTestimonial(testimonial.id))}
              className="rounded border border-red-900 px-3 py-1 text-xs font-bold uppercase text-red-400 hover:bg-red-950/40 disabled:opacity-30"
            >
              Reject
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
