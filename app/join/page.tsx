import type { Metadata } from "next";
import { Suspense } from "react";
import JoinFlow from "./JoinFlow";
import { getPlans } from "@/lib/content";

export const metadata: Metadata = {
  title: "Join the Gym",
  description:
    "Join D'Champs Fit Satellite — choose a membership plan, create your account and start training.",
};

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string | string[] }>;
}) {
  const plans = await getPlans();
  const params = await searchParams;
  const initialSlug = Array.isArray(params.plan) ? params.plan[0] : params.plan;

  return (
    <section className="pt-16">
      <div className="container-page max-w-2xl pb-20 pt-12">
        <p className="eyebrow text-center">Membership</p>
        <h1 className="mt-2 text-center font-display text-5xl tracking-wide text-white">
          JOIN THE GYM
        </h1>
        <Suspense fallback={<div className="mt-10 min-h-80" aria-hidden="true" />}>
          <JoinFlow plans={plans} initialSlug={initialSlug} />
        </Suspense>
      </div>
    </section>
  );
}
