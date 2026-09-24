"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SuccessContent() {
  const params = useSearchParams();
  const reference = params.get("reference");
  const [status, setStatus] = useState<"verifying" | "ok" | "fail">("verifying");

  useEffect(() => {
    if (!reference) {
      setStatus("fail");
      return;
    }
    fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`)
      .then(async (r) => {
        const data = await r.json();
        setStatus(r.ok && data.verified ? "ok" : "fail");
      })
      .catch(() => setStatus("fail"));
  }, [reference]);

  return (
    <>
      {status === "verifying" && (
        <>
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-neutral-700 border-t-gold" />
          <h1 className="mt-6 font-display text-4xl tracking-wide text-white">
            VERIFYING PAYMENT…
          </h1>
        </>
      )}
      {status === "ok" && (
        <>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold font-display text-3xl text-ink">✓</div>
          <h1 className="mt-6 font-display text-4xl tracking-wide text-white">
            WELCOME TO THE GYM
          </h1>
          <p className="mt-3 text-neutral-400">
            Your payment was confirmed and your membership is now{" "}
            <span className="font-bold text-gold">ACTIVE</span>.
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            A confirmation has been sent to your email.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/dashboard" className="btn-gold">Go to My Dashboard</Link>
            <Link href="/dashboard/qr" className="btn-outline">Show My QR Code</Link>
          </div>
        </>
      )}
      {status === "fail" && (
        <>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-800 font-display text-3xl text-red-400">✕</div>
          <h1 className="mt-6 font-display text-4xl tracking-wide text-white">
            PAYMENT NOT CONFIRMED
          </h1>
          <p className="mt-3 text-neutral-400">
            We couldn&apos;t verify this payment yet. If you were debited, reception
            will confirm it shortly — or contact us on WhatsApp.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/join" className="btn-gold">Try Again</Link>
            <Link href="/contact" className="btn-outline">Contact Us</Link>
          </div>
        </>
      )}
    </>
  );
}
