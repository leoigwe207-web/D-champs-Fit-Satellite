import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import PlanCard from "@/components/PlanCard";
import { getSiteSettings } from "@/lib/settings";
import {
  getPlans,
  getFacilities,
  getTestimonials,
} from "@/lib/content";
import { localPhoto } from "@/lib/photos";
import { SITE } from "@/lib/site";

export const revalidate = 60;

const facilityPhotos = [
  "gym-wide-a",
  "machines-row",
  "functional-rig",
  "building-turf",
  "cardio-floor",
];

export default async function HomePage() {
  const [s, plans, facilities, testimonials] = await Promise.all([
    getSiteSettings(),
    getPlans(),
    getFacilities(),
    getTestimonials(),
  ]);

  const hero = localPhoto("gym-wide-a");
  const facilityImageList = facilityPhotos
    .map((key) => localPhoto(key))
    .filter(Boolean);

  return (
    <div className="home-page">
      {/* ============================================================
          HERO
      ============================================================ */}
      <section className="home-hero">
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

        <div className="home-hero-overlay" />

        <div className="container-page home-hero-content">
          <p className="eyebrow">
            WELCOME TO D&apos;CHAMPS FIT SATELLITE
          </p>

          <h1 className="home-hero-title">
            BUILD A STRONGER
            <br />
            <span>YOU</span>
          </h1>

          <p className="home-hero-copy">
            {s.hero_sub}
          </p>

          <div className="home-hero-actions">
            <Link href="/join" className="btn-gold">
              Join Now
              <span>→</span>
            </Link>

            <a href="#facilities" className="btn-outline">
              Our Facilities
              <span>↓</span>
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================
          VALUE STRIP
      ============================================================ */}
      <section className="home-value-strip">
        <div className="container-page home-value-grid">
          <ValueItem
            icon="✦"
            title="Modern Equipment"
            text="State-of-the-art facilities"
          />

          <ValueItem
            icon="♙"
            title="Expert Training"
            text="Certified & experienced"
          />

          <ValueItem
            icon="▣"
            title="Flexible Memberships"
            text="Monthly, Quarterly & Annual"
          />

          <ValueItem
            icon="♧"
            title="Supportive Community"
            text="Train, grow, achieve together"
          />
        </div>
      </section>

      {/* ============================================================
          MEMBERSHIP PLANS
      ============================================================ */}
      <section className="home-section">
        <div className="container-page">
          <div className="home-section-heading-row">
            <SectionHeading
              eyebrow="OUR MEMBERSHIP PLANS"
              title="Choose the plan that fits your goals"
            />

            <Link href="/membership" className="home-view-link">
              View All Plans →
            </Link>
          </div>

          <div className="home-plans-grid">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          FACILITIES
      ============================================================ */}
      <section
        id="facilities"
        className="home-section home-facilities-section"
      >
        <div className="container-page">
          <div className="home-section-heading-row">
            <SectionHeading
              eyebrow="OUR FACILITIES"
              title="Everything you need for a complete fitness experience"
            />

            <Link href="/gallery" className="home-view-link">
              View All Facilities →
            </Link>
          </div>

          <div className="home-facilities-grid">
            {facilities.map((facility, index) => {
              const photo = facilityImageList[index];

              return (
                <Link
                  href="/gallery"
                  key={facility.id}
                  className="home-facility-card"
                >
                  {photo && (
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 90vw, 20vw"
                    />
                  )}

                  <div className="home-facility-overlay" />

                  <div className="home-facility-content">
                    <span>{facility.title}</span>
                    <small>{facility.description}</small>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          TESTIMONIALS
          IMPORTANT: NEVER INVENT REVIEWS.
      ============================================================ */}
      <section className="home-section home-testimonials">
        <div className="container-page">
          <SectionHeading
            eyebrow="WHAT OUR MEMBERS SAY"
            title="Real people. Real progress."
            center
          />

          {testimonials.length > 0 ? (
            <div className="home-testimonial-grid">
              {testimonials.map((testimonial) => (
                <figure
                  key={testimonial.id}
                  className="home-testimonial-card"
                >
                  <div className="text-gold text-lg">
                    {"★".repeat(
                      Math.max(
                        1,
                        Math.min(5, testimonial.rating)
                      )
                    )}
                  </div>

                  <blockquote>
                    “{testimonial.quote}”
                  </blockquote>

                  <figcaption>
                    <strong>{testimonial.name}</strong>

                    {testimonial.member_duration && (
                      <span>
                        {testimonial.member_duration}
                      </span>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="home-no-testimonials">
              <div className="home-no-testimonials-icon">
                💬
              </div>

              <h3>No testimonials yet</h3>

              <p>
                Be the first member to share your D&apos;Champs
                Fit experience.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          CONTACT / LOCATION
      ============================================================ */}
      <section className="home-contact-section">
        <div className="container-page home-contact-grid">
          <div>
            <p className="eyebrow">VISIT OUR GYM</p>

            <h2 className="home-contact-title">
              TRAIN AT
              <br />
              <span>D&apos;CHAMPS FIT</span>
            </h2>

            <div className="home-contact-details">
              <div>
                <strong>Location</strong>
                <p>
                  {SITE.address.line1},
                  <br />
                  {SITE.address.line2},
                  <br />
                  {SITE.address.city}
                </p>
              </div>

              <div>
                <strong>Call Us</strong>
                <p>
                  <a href={`tel:${SITE.phoneIntl}`}>
                    {SITE.phone}
                  </a>
                </p>
              </div>

              <div>
                <strong>Opening Hours</strong>
                <p>{SITE.openingHours}</p>
              </div>
            </div>

            <div className="home-contact-actions">
              <Link href="/contact" className="btn-gold">
                Contact Us →
              </Link>

              <a
                href={SITE.mapDirections}
                target="_blank"
                rel="noreferrer"
                className="btn-outline"
              >
                Get Directions
              </a>
            </div>
          </div>

          <div className="home-map">
            <iframe
              src={SITE.mapEmbed}
              title="D'Champs Fit Satellite location"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ValueItem({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="home-value-item">
      <div className="home-value-icon">{icon}</div>

      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}