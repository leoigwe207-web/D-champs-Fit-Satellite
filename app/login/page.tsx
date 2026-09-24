import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Member Login",
  description: "Log in to your D'Champs Fit member account.",
};

export default function LoginPage() {
  return (
    <section className="pt-16">
      <div className="mx-auto max-w-md px-5 pb-24 pt-16">
        <p className="eyebrow text-center">Members</p>
        <h1 className="mt-2 text-center font-display text-5xl tracking-wide text-white">
          MEMBER LOGIN
        </h1>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </section>
  );
}
