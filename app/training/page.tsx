import Link from "next/link";
import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import { getServices } from "@/lib/content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Training",
  description:
    "Personal training, weight loss, muscle building, fitness assessment and nutrition guidance at D'Champs Fit Satellite, Lagos.",
};

export default async function TrainingPage() {
  const services = await getServices();

  return (
    <>
      <section className="border-b border-neutral-800 bg-ink2/40 pt-16">
        <div className="container-page pb-14 pt-24">
          <SectionHeading eyebrow="Services" title="Train With Purpose" />
          <p className="mt-3 max-w-2xl text-neutral-400">
            Structured coaching for every goal — whether it&apos;s your first
            session or your five-hundredth.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((sv, i) => (
            <div key={sv.id} className="card-dark">
              <span className="font-display text-5xl text-neutral-800">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-display text-2xl tracking-wider2 text-white">{sv.title}</h3>
              <p className="mt-2 text-sm text-neutral-400">{sv.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-pad bg-ink2/40">
        <div className="container-page text-center">
          <SectionHeading eyebrow="Personal training" title="Ready to Train With a Coach?" center />
          <p className="mx-auto mt-3 max-w-xl text-neutral-400">
            One-on-one coaching is available — book a session and reception will
            match you with the right trainer for your goal.
          </p>
          <Link href="/book" className="btn-gold mt-7">Book a Session</Link>
        </div>
      </section>
    </>
  );
}
