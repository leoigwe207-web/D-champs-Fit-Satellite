import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/auth";
import { isDemoMode } from "@/lib/env";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const QuerySchema = z.object({
  reference: z
    .string()
    .min(6)
    .max(64)
    .regex(/^[A-Za-z0-9_-]+$/, "Invalid reference"),
});

export async function GET(req: Request) {
  // Abuse protection: verification endpoint is rate-limited per IP.
  const rl = rateLimit(`verify:${clientIp(req)}`, 30, 60);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  const parsed = QuerySchema.safeParse(
    Object.fromEntries(new URL(req.url).searchParams)
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }
  const reference = parsed.data.reference;

  // Demo mode is development-only (fail closed in production).
  if (isDemoMode() || !process.env.PAYSTACK_SECRET_KEY) {
    if (!isDemoMode()) {
      // Production without Paystack configured must NOT fake success.
      return NextResponse.json({ verified: false }, { status: 503 });
    }
    if (reference.startsWith("DEMO-")) {
      return NextResponse.json({ verified: true, demo: true });
    }
    return NextResponse.json({ verified: false });
  }

  try {
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY!}` } }
    );
    const result = await paystackRes.json();
    if (!result?.status || result?.data?.status !== "success") {
      return NextResponse.json({ verified: false, reason: result?.data?.gateway_response });
    }

    const { createAdminClient } = await import("@/lib/supabase-admin");
    const admin = createAdminClient();
    if (!admin) throw new Error("Admin client unavailable");

    const { activateMembership } = await import("@/lib/activation");
    const activation = await activateMembership(admin, {
      reference,
      id: result.data.id,
      paid_at: result.data.paid_at,
      amountMinor: result.data.amount,
      currency: result.data.currency,
      metadata: result.data.metadata ?? {},
    });

    if (!activation.ok) {
      return NextResponse.json(
        { verified: false, reason: "Payment could not be applied — contact reception." },
        { status: 400 }
      );
    }

    return NextResponse.json({ verified: true });
  } catch (e) {
    console.error("paystack verify error", e);
    return NextResponse.json({ verified: false }, { status: 500 });
  }
}
