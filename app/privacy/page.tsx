import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <section className="pt-16">
      <div className="container-page max-w-2xl pb-20 pt-16">
        <h1 className="font-display text-5xl tracking-wide text-white">PRIVACY POLICY</h1>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-neutral-400">
          <p>
            {SITE.fullName} (&ldquo;we&rdquo;, &ldquo;the gym&rdquo;) collects only the
            information needed to run your membership: your name, phone number,
            email, membership plan, payment status and gym attendance.
          </p>
          <div>
            <h2 className="font-display text-2xl tracking-wider2 text-white">How we use it</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>To manage your membership and renewals</li>
              <li>To process payments through Paystack (we never see or store your card details)</li>
              <li>To record check-ins when your member QR code is scanned</li>
              <li>To send membership, booking and gym announcements</li>
            </ul>
          </div>
          <div>
            <h2 className="font-display text-2xl tracking-wider2 text-white">Your rights</h2>
            <p className="mt-2">
              You can request a copy of your data or ask us to delete your account
              at any time — call {SITE.phone} or message us on WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
