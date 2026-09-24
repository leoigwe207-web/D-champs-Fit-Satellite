import { submitTestimonial } from "./actions";
import TestimonialForm from "./TestimonialForm";

export const dynamic = "force-dynamic";

export default function MemberTestimonialPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-white">
          SHARE YOUR EXPERIENCE
        </h1>
        <p className="mt-2 max-w-xl text-sm text-neutral-400">
          Tell other members what training at D&apos;Champs Fit has done for
          you. Submissions are reviewed by the gym before appearing on the
          website.
        </p>
      </div>

      <TestimonialForm onSubmit={submitTestimonial} />
    </div>
  );
}
