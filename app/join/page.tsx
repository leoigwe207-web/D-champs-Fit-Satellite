import type { Metadata } from "next";
import { Suspense } from "react";
import JoinFlow from "./JoinFlow";
import { getPlans } from "@/lib/content";

export const metadata: Metadata = {
  title: "Join the Gym",
  description:
    "Join D'Champs Fit Satellite — choose a membership plan, create your account and start training.",
};

export default async function JoinPage() {
  const plans = await getPlans();
  return (
    <section className="pt-16">
      <div className="container-page max-w-2xl pb-20 pt-12">
        <p className="eyebrow text-center">Membership</p>
        <h1 className="mt-2 text-center font-display text-5xl tracking-wide text-white">
          JOIN THE GYM
        </h1>
        <Suspense>
          <JoinFlow plans={plans} />
        </Suspense>
      </div>
    </section>
  );
}
