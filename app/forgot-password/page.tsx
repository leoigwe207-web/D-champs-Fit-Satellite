import type { Metadata } from "next";
import ForgotForm from "./ForgotForm";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your D'Champs Fit account password.",
};

export default function ForgotPasswordPage() {
  return (
    <section className="pt-16">
      <div className="mx-auto max-w-md px-5 pb-24 pt-16">
        <p className="eyebrow text-center">Account recovery</p>
        <h1 className="mt-2 text-center font-display text-5xl tracking-wide text-white">
          RESET PASSWORD
        </h1>
        <ForgotForm />
      </div>
    </section>
  );
}
