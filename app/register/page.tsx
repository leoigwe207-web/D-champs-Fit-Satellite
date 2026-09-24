import type { Metadata } from "next";
import { Suspense } from "react";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your D'Champs Fit member account.",
};

export default function RegisterPage() {
  return (
    <section className="pt-16">
      <div className="mx-auto max-w-md px-5 pb-24 pt-16">
        <p className="eyebrow text-center">Join us</p>
        <h1 className="mt-2 text-center font-display text-5xl tracking-wide text-white">
          CREATE ACCOUNT
        </h1>
        <Suspense>
          <RegisterForm />
        </Suspense>
      </div>
    </section>
  );
}
