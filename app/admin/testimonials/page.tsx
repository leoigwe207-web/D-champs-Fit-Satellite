import { getAllTestimonials } from "@/lib/content";
import TestimonialCard from "./TestimonialCard";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const testimonials = await getAllTestimonials();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-white">TESTIMONIALS</h1>
        <p className="max-w-xl text-sm text-neutral-500">
          Members submit these from their dashboard. Only testimonials you
          approve appear on the website — members can never approve their own.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {testimonials.map((t) => (
          <TestimonialCard key={t.id} testimonial={t} />
        ))}
        {testimonials.length === 0 && (
          <p className="card-dark text-neutral-500">No testimonials yet.</p>
        )}
      </div>
    </div>
  );
}
