import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import { getSiteSettings } from "@/lib/settings";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Find D'Champs Fit Satellite at Chevron Estate, Satellite Town, Lagos. Call 0810 489 1309 or message on WhatsApp.",
};

export default async function ContactPage() {
  const s = await getSiteSettings();

  return (
    <section className="pt-16">
      <div className="container-page pb-16 pt-16">
        <SectionHeading eyebrow="Visit us" title="Find D'Champs Fit" />

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div>
            <div className="card-dark">
              <h3 className="font-display text-2xl tracking-wider2 text-white">
                {s.brand_name} Satellite
              </h3>
              <p className="mt-3 leading-relaxed text-neutral-300">
                {s.address_line1}
                <br />
                {s.address_line2}
                <br />
                {s.address_city}
                <br />
                Nigeria
              </p>
              <p className="mt-4 text-lg font-semibold text-gold">{s.phone}</p>
              <p className="mt-4 text-sm text-neutral-400">🕒 {s.opening_hours}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a href={`tel:${SITE.phoneIntl}`} className="btn-gold !px-5 !py-2.5 !text-base">
                  Call
                </a>
                <a
                  href={`https://wa.me/${s.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-outline !px-5 !py-2.5 !text-base"
                >
                  WhatsApp
                </a>
                <a
                  href={SITE.mapDirections}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-outline !px-5 !py-2.5 !text-base"
                >
                  Get Directions
                </a>
              </div>
            </div>

            <div className="card-dark mt-5">
              <h4 className="font-display text-xl tracking-wider2 text-gold">
                Join or ask a question
              </h4>
              <p className="mt-2 text-sm text-neutral-400">
                The fastest way to reach us is WhatsApp — reception replies during
                opening hours. Membership questions?{" "}
                <a href="/membership" className="text-gold underline-offset-2 hover:underline">
                  See plans
                </a>
                .
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-neutral-800">
            <iframe
              title="D'Champs Fit Satellite location map"
              src={SITE.mapEmbed}
              className="h-[420px] w-full lg:h-full lg:min-h-[540px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
