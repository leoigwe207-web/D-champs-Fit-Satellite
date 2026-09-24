import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import PlanCard from "@/components/PlanCard";
import { getPlans } from "@/lib/content";
import { getSiteSettings } from "@/lib/settings";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Membership",
  description:
    "Monthly, quarterly and annual memberships at D'Champs Fit Satellite, Chevron Estate, Lagos.",
};

export default async function MembershipPage() {
  const plans = await getPlans();
  const s = await getSiteSettings();

  return (
    <>
      <section className="border-b border-neutral-800 bg-ink2/40 pt-16">
        <div className="container-page pb-14 pt-24 text-center">
          <SectionHeading eyebrow="Membership" title="Choose Your Commitment" center />
          <p className="mt-3 text-neutral-400">
            Prices are set by the gym and can change — always shown live here.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page grid max-w-5xl gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} />
          ))}
        </div>
      </section>

      <section className="section-pad bg-ink2/40">
        <div className="container-page max-w-3xl">
          <SectionHeading eyebrow="Questions" title="Before You Join" center />
          <div className="mt-8 space-y-4">
            {[
              {
                q: "How do I join?",
                a: "Pick a plan, create your account and pay online — your membership activates instantly and your QR code is ready at reception.",
              },
              {
                q: "What are the opening hours?",
                a: s.opening_hours,
              },
              {
                q: "Can I freeze or upgrade my plan?",
                a: "Yes — speak to reception or message us on WhatsApp and we'll sort it out.",
              },
              {
                q: "Do you offer personal training?",
                a: "Yes. Sessions are booked from your member dashboard after you join.",
              },
            ].map((f) => (
              <details key={f.q} className="card-dark group">
                <summary className="cursor-pointer font-display text-xl tracking-wider2 text-white marker:content-none">
                  {f.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-neutral-400">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
