import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import BookingForm from "./BookingForm";
import { getActiveTrainers, getServices } from "@/lib/content";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Book Training",
  description: "Book a personal training session at D'Champs Fit Satellite.",
};

export const dynamic = "force-dynamic";

export default async function BookPage() {
  // Server-side session check — the form already uses the same session via
  // /api/bookings; this only makes the page acknowledge the logged-in member
  // instead of presenting them with the visitor booking flow.
  const user = await getCurrentUser();

  const [trainers, services] = await Promise.all([getActiveTrainers(), getServices()]);

  return (
    <section className="pt-16">
      <div className="container-page max-w-2xl pb-24 pt-12">
        {user && (
          <div className="mb-6 flex flex-col items-center justify-between gap-3 rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 sm:flex-row">
            <p className="text-sm text-neutral-200">
              Logged in as{" "}
              <span className="font-semibold text-gold">{user.full_name}</span>
            </p>
            <Link href="/dashboard" className="btn-outline !py-2 !text-sm">
              ← Back to Dashboard
            </Link>
          </div>
        )}
        <SectionHeading eyebrow="Book a session" title="BOOK TRAINING" center />
        <p className="mt-3 text-center text-neutral-400">
          Pick a coach, a service and a time. Reception confirms your booking.
        </p>
        <Suspense>
          <BookingForm trainers={trainers} services={services} />
        </Suspense>
      </div>
    </section>
  );
}
