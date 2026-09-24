import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import PlanCard from "@/components/PlanCard";
import { getSiteSettings } from "@/lib/settings";
import { getPlans, getFacilities, getServices, getTestimonials } from "@/lib/content";
import { localPhoto } from "@/lib/photos";
import { SITE } from "@/lib/site";

export const revalidate = 60;

export default async function HomePage() {
  const [s, plans, facilities, services, testimonials] =
    await Promise.all([
      getSiteSettings(),
      getPlans(),
      getFacilities(),
      getServices(),
      getTestimonials(),
    ]);

  // Site imagery comes ONLY from the bundled static photos — never from
  // CMS gallery uploads. Gallery media appears exclusively on /gallery
  // and in the admin gallery manager.
  const hero = localPhoto("gym-wide-a");
  const aboutPhoto = localPhoto("gym-floor-c");
  const mural = localPhoto("mural-wall");
  const outdoor = localPhoto("building-turf");
  const ctaPhoto = localPhoto("bench-area");

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[92svh] items-end overflow-hidden">
        {hero && (
          <Image
            src={hero.src}
            alt={hero.alt}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 photo-overlay" />
        <div className="container-page relative pb-20 pt-40 sm:pb-28">
          <p className="fade-up eyebrow">📍 Satellite Town, Lagos</p>
          <h1 className="fade-up fade-up-1 mt-3 max-w-4xl font-display text-6xl leading-[0.95] tracking-wide text-white sm:text-8xl">
            {s.hero_headline.split(".")[0]}.
            <br />
            {s.hero_headline.split(".")[1] ?? "Become More"}.
          </h1>
          <p className="fade-up fade-up-2 mt-5 max-w-xl text-lg text-neutral-300">
            {s.hero_sub}
          </p>
          <p className="fade-up fade-up-2 mt-1 text-sm text-neutral-400">
            D&apos;Champs Fit Satellite — {s.address_line1}, {s.address_line2}, Lagos.
          </p>
          <div className="fade-up fade-up-3 mt-8 flex flex-wrap gap-4">
            <Link href="/join" className="btn-gold">Join the Gym</Link>
            <Link href="/membership" className="btn-outline">View Membership</Link>
          </div>
        </div>
      </section>

      {/* MARQUEE RIBBON */}
      <div className="overflow-hidden border-y border-neutral-800 bg-ink2 py-3">
        <div className="animate-marquee flex whitespace-nowrap">
          {[0, 1].map((i) => (
            <span key={i} className="font-display text-xl tracking-[0.3em] text-gold/80">
              STRENGTH · CONDITIONING · CONSISTENCY · COMMUNITY · STRENGTH · CONDITIONING · CONSISTENCY · COMMUNITY ·&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* QUICK VALUE */}
      <section className="section-pad">
        <div className="container-page grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Modern Equipment",
              body: "A wide range of strength and functional training equipment.",
              icon: "🏋🏽",
            },
            {
              title: "Personal Training",
              body: "Coaching for members who want structured guidance.",
              icon: "🎯",
            },
            {
              title: "Fitness Community",
              body: "A focused environment built around consistency.",
              icon: "🤝",
            },
            {
              title: "Open Daily",
              body: s.opening_hours,
              icon: "🕒",
            },
          ].map((v) => (
            <div key={v.title} className="card-dark">
              <div className="text-3xl">{v.icon}</div>
              <h3 className="mt-3 font-display text-2xl tracking-wider2 text-white">
                {v.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="section-pad bg-ink2/40">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          {aboutPhoto && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image
                src={aboutPhoto.src}
                alt={aboutPhoto.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          )}
          <div>
            <SectionHeading eyebrow="About the gym" title="Build Your Strongest Self" />
            <p className="mt-5 leading-relaxed text-neutral-300">{s.about_text}</p>
            <div className="mt-10 grid grid-cols-3 gap-6">
              {[
                { n: "01", label: "STRENGTH" },
                { n: "02", label: "CONDITIONING" },
                { n: "03", label: "CONSISTENCY" },
              ].map((item) => (
                <div key={item.n}>
                  <div className="font-display text-5xl text-gold">{item.n}</div>
                  <div className="mt-1 font-display text-lg tracking-wider2 text-white">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FACILITIES */}
      <section className="section-pad">
        <div className="container-page">
          <SectionHeading eyebrow="Facilities" title="Everything You Need to Train" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map((f, i) => (
              <div
                key={f.id}
                className="card-dark group relative overflow-hidden"
              >
                <span className="font-display text-6xl text-neutral-800 transition group-hover:text-gold/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-display text-2xl tracking-wider2 text-white">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-sm text-neutral-400">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIGNATURE MURAL SECTION */}
      <section className="relative overflow-hidden">
        {mural && (
          <Image
            src={mural.src}
            alt={mural.alt}
            fill
            className="object-cover"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-ink/70" />
        <div className="container-page relative py-28 text-center sm:py-40">
          <h2 className="font-display text-6xl leading-[0.95] tracking-wide text-white sm:text-8xl">
            YOUR ONLY
            <br />
            LIMIT IS <span className="text-gold">YOU.</span>
          </h2>
          <p className="mt-8 font-display text-2xl tracking-[0.35em] text-neutral-300">
            TRAIN. EAT. SLEEP. <span className="text-gold">CONQUER.</span>
          </p>
        </div>
      </section>

      {/* TRAINING PREVIEW */}
      <section className="section-pad">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Training" title="Train With Purpose" />
            <Link href="/training" className="btn-ghost">All services →</Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {services.map((sv) => (
              <div key={sv.id} className="card-dark">
                <h3 className="font-display text-xl tracking-wider2 text-gold">
                  {sv.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-400">{sv.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUTDOOR SPACE */}
      <section className="section-pad bg-ink2/40">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Outdoor space" title="More Room to Move" />
            <p className="mt-5 leading-relaxed text-neutral-300">
              Beyond the main floor, D&apos;Champs Fit includes an outdoor training
              space with turf — extra room to move, breathe and finish what the
              weights started.
            </p>
            <Link href="/gallery" className="btn-outline mt-7">See the Gallery</Link>
          </div>
          {outdoor && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image
                src={outdoor.src}
                alt={outdoor.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          )}
        </div>
      </section>

      {/* MEMBERSHIP PREVIEW */}
      <section className="section-pad bg-ink2/40">
        <div className="container-page">
          <SectionHeading
            eyebrow="Membership"
            title="Choose Your Commitment"
            center
          />
          <p className="mt-3 text-center text-neutral-400">
            Monthly · Quarterly · Annual
          </p>
          <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-3">
            {plans.map((p) => (
              <PlanCard key={p.id} plan={p} />
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — approved member reviews only (rendered only when at
          least one exists so the live site never shows an empty section) */}
      {testimonials.length > 0 && (
      <section className="section-pad">
        <div className="container-page">
          <SectionHeading
            eyebrow="Testimonials"
            title="What Our Members Say"
            center
          />
          <div className="mx-auto mt-10 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.id}
                className="card-dark flex flex-col justify-between rounded-xl"
              >
                <div>
                  <div className="text-gold" aria-label={`${t.rating} out of 5 stars`}>
                    {"★".repeat(Math.max(1, Math.min(5, t.rating)))}
                    <span className="text-neutral-700">{"★".repeat(5 - Math.max(1, Math.min(5, t.rating)))}</span>
                  </div>
                  <blockquote className="mt-3 text-sm leading-relaxed text-neutral-300">
                    “{t.quote}”
                  </blockquote>
                </div>
                <figcaption className="mt-5 border-t border-neutral-800 pt-4">
                  <p className="font-display text-lg tracking-wider2 text-white">{t.name}</p>
                  {t.member_duration && (
                    <p className="mt-0.5 text-xs uppercase tracking-wider text-gold/80">
                      {t.member_duration}
                    </p>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* FINAL CTA */}
      <section className="relative overflow-hidden">
        {ctaPhoto && (
          <Image
            src={ctaPhoto.src}
            alt="Inside D'Champs Fit"
            fill
            className="object-cover"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-ink/75" />
        <div className="container-page relative py-24 text-center sm:py-32">
          <h2 className="font-display text-5xl leading-none tracking-wide text-white sm:text-7xl">
            READY TO START?
          </h2>
          <p className="mt-2 font-display text-3xl tracking-wider2 text-gold sm:text-4xl">
            YOUR NEXT LEVEL STARTS HERE.
          </p>
          <Link href="/join" className="btn-gold mt-8">Join D&apos;Champs Fit</Link>
        </div>
      </section>
    </>
  );
}
