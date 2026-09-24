import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import { getSiteSettings } from "@/lib/settings";
import { localPhoto } from "@/lib/photos";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About",
  description:
    "D'Champs Fit Satellite — a premium gym in Chevron Estate, Satellite Town, Lagos.",
};

export default async function AboutPage() {
  const s = await getSiteSettings();

  // Site imagery comes ONLY from the bundled static photos — never from
  // CMS gallery uploads (those appear exclusively on /gallery and admin).
  const heroPhoto = localPhoto("strength-corner");
  const envPhoto = localPhoto("cardio-floor");
  const showcase = [
    "gym-wide-a",
    "gym-floor-b",
    "strength-corner",
    "functional-rig",
    "machines-row",
    "cardio-floor",
  ].flatMap((key) => {
    const photo = localPhoto(key);
    return photo ? [photo] : [];
  });

  return (
    <>
      <section className="relative flex min-h-[50svh] items-end overflow-hidden pt-16">
        {heroPhoto && (
          <>
            <Image src={heroPhoto.src} alt={heroPhoto.alt} fill className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 photo-overlay" />
          </>
        )}
        <div className="container-page relative pb-12 pt-32">
          <SectionHeading eyebrow="About D'Champs Fit" title="More Than a Gym" />
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          {envPhoto && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image src={envPhoto.src} alt={envPhoto.alt} fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
            </div>
          )}
          <div>
            <SectionHeading eyebrow="The environment" title={s.about_headline} />
            <p className="mt-5 leading-relaxed text-neutral-300">{s.about_text}</p>
            <p className="mt-4 leading-relaxed text-neutral-400">
              Warm cream walls. Dark flooring. A wood ceiling and blue LED light
              that turns an evening session into something worth posting. Mirrors
              on every wall so your form is always honest.
            </p>
          </div>
        </div>
      </section>

      <section className="section-pad bg-ink2/40">
        <div className="container-page grid gap-10 sm:grid-cols-3">
          {[
            { n: "01", label: "STRENGTH", body: "Barbells, machines, racks — everything needed to get genuinely strong." },
            { n: "02", label: "CONDITIONING", body: "Cardio zones and open space for work capacity that carries into life." },
            { n: "03", label: "CONSISTENCY", body: "Coaching, community and a facility you actually want to return to." },
          ].map((v) => (
            <div key={v.n} className="card-dark">
              <div className="font-display text-6xl text-gold">{v.n}</div>
              <h3 className="mt-2 font-display text-2xl tracking-wider2 text-white">{v.label}</h3>
              <p className="mt-2 text-sm text-neutral-400">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page">
          <SectionHeading eyebrow="Inside the gym" title="See For Yourself" center />
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {showcase.map((g) => (
              <div key={g.id} className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <Image src={g.src} alt={g.alt} fill className="object-cover transition duration-500 hover:scale-105" sizes="(max-width:640px) 50vw, 33vw" />
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/gallery" className="btn-outline">View Full Gallery</Link>
          </div>
        </div>
      </section>
    </>
  );
}
