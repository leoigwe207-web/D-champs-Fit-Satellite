import crypto from "crypto";
import { NextResponse } from "next/server";

function signaturesMatch(expectedHex: string, received: string | null): boolean {
  if (!received) return false;
  const a = Buffer.from(expectedHex, "utf8");
  const b = Buffer.from(received, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!secret) return NextResponse.json({ ignored: true });

  // Verify the webhook signature (constant-time) before trusting the payload.
  const hash = crypto.createHmac("sha512", secret).update(raw).digest("hex");
  if (!signaturesMatch(hash, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: {
    event: string;
    data: {
      reference?: string;
      status?: string;
      id?: number;
      paid_at?: string;
      amount?: number;
      currency?: string;
      metadata?: Record<string, unknown>;
    };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  // Sanity-check the fields we rely on before processing.
  const { reference, id, status } = event.data;
  if (!reference || typeof id !== "number" || status !== "success") {
    return NextResponse.json({ error: "Unsupported payload" }, { status: 400 });
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase-admin");
    const admin = createAdminClient();
    if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 500 });

    const { data: payment } = await admin
      .from("payments")
      .select("id, status")
      .eq("reference", reference)
      .single();
    if (!payment || payment.status === "successful") {
      // Unknown or already-processed payment — nothing to do.
      return NextResponse.json({ received: true });
    }

    // Reuse the same idempotent, amount-verified activation path as
    // /api/paystack/verify.
    const { activateMembership } = await import("@/lib/activation");
    await activateMembership(admin, {
      reference,
      id,
      paid_at: event.data.paid_at,
      amountMinor: event.data.amount,
      currency: event.data.currency,
      metadata: event.data.metadata ?? {},
    });
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("webhook error", e);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
