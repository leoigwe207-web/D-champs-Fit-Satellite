import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  robots: { index: false },
};

export default function TermsPage() {
  return (
    <section className="pt-16">
      <div className="container-page max-w-2xl pb-20 pt-16">
        <h1 className="font-display text-5xl tracking-wide text-white">TERMS &amp; CONDITIONS</h1>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-neutral-400">
          <div>
            <h2 className="font-display text-2xl tracking-wider2 text-white">Membership</h2>
            <p className="mt-2">
              Memberships run for the duration of the chosen plan (30, 90 or 365
              days) from the date of payment. Membership is personal and
              non-transferable.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl tracking-wider2 text-white">Payments</h2>
            <p className="mt-2">
              Payments are processed securely by Paystack. Membership activates
              immediately after a successful payment and expires automatically at
              the end of the plan duration.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl tracking-wider2 text-white">Conduct</h2>
            <p className="mt-2">
              Members are expected to train safely, re-rack weights, and respect
              staff and other members. We may suspend membership for misconduct.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl tracking-wider2 text-white">Contact</h2>
            <p className="mt-2">
              Questions about these terms: {SITE.phone} or WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
