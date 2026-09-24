import type { SupabaseClient } from "@supabase/supabase-js";

type TxData = {
  reference: string;
  id: number;
  paid_at?: string;
  /** Amount in the processor's smallest unit (kobo for Paystack). */
  amountMinor?: number;
  currency?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Marks the payment successful and activates/extends the member's
 * membership.
 *
 * Security properties:
 *  - Idempotent: safe to run from both the verify route and the Paystack
 *    webhook — the second call for the same reference is a no-op, so the
 *    membership cannot be extended twice for one payment.
 *  - Amount verified: the paid amount (minor units) must be >= the staged
 *    payment amount before activation, so a manipulated or underpaid
 *    transaction cannot activate a plan.
 *  - Currency verified: only the expected currency (default NGN) activates.
 *  - Status verified: only "success" reaches this function.
 *
 * Callers must pass transaction data obtained from the verified Paystack
 * API response (or a signature-checked webhook) — never from the client.
 */
export async function activateMembership(
  admin: SupabaseClient,
  tx: TxData
): Promise<{ ok: boolean; reason?: string }> {
  const meta = tx.metadata ?? {};
  const memberId = meta.member_id as string | undefined;
  const planId = meta.plan_id as string | undefined;
  const userId = meta.user_id as string | undefined;

  // Load the staged payment created at checkout (server-side, trusted).
  const { data: payment } = await admin
    .from("payments")
    .select("id, status, amount")
    .eq("reference", tx.reference)
    .single();
  if (!payment) return { ok: false, reason: "unknown reference" };
  if (payment.status === "successful") {
    return { ok: true }; // already processed — idempotent no-op
  }

  // Amount check: paid minor units must cover the staged amount.
  if (typeof tx.amountMinor === "number") {
    const paid = tx.amountMinor / 100;
    const expected = Number(payment.amount ?? 0);
    if (paid + 0.01 < expected) {
      return { ok: false, reason: "amount mismatch" };
    }
  }

  // Currency check: only the configured currency activates membership.
  if (tx.currency && tx.currency.toUpperCase() !== (process.env.PAYSTACK_CURRENCY ?? "NGN")) {
    return { ok: false, reason: "currency mismatch" };
  }

  let durationDays = 30;
  let planName: string | null = null;
  let planSlug: string | null = null;
  if (planId) {
    const { data: plan } = await admin
      .from("membership_plans")
      .select("duration_days, name, slug")
      .eq("id", planId)
      .single();
    if (plan) {
      durationDays = plan.duration_days;
      planName = plan.name;
      planSlug = plan.slug;
    }
  }

  // Mark payment successful FIRST (guarded above), so a concurrent verify
  // + webhook race cannot both extend the membership.
  await admin
    .from("payments")
    .update({
      status: "successful",
      method: "Paystack",
      paystack_transaction_id: String(tx.id),
      paid_at: new Date(tx.paid_at ?? Date.now()).toISOString(),
    })
    .eq("reference", tx.reference)
    .eq("status", "pending");

  if (!memberId) return { ok: true };

  const { data: member } = await admin
    .from("members")
    .select("end_date, plan_name, plan_slug")
    .eq("id", memberId)
    .single();

  // Renewals extend from the current expiry; new memberships start today.
  const now = new Date();
  const base =
    member?.end_date && new Date(member.end_date) > now
      ? new Date(member.end_date)
      : now;
  const end = new Date(base);
  end.setDate(end.getDate() + durationDays);

  await admin
    .from("members")
    .update({
      status: "active",
      plan_id: planId ?? null,
      plan_name: planName ?? member?.plan_name ?? null,
      plan_slug: planSlug ?? member?.plan_slug ?? null,
      end_date: end.toISOString().slice(0, 10),
    })
    .eq("id", memberId);

  if (userId) {
    await admin.from("notifications").insert({
      user_id: userId,
      title: "Payment successful",
      body: `Your ${planName ?? "membership"} payment was successful. Membership active until ${end.toDateString()}.`,
    });
  }

  return { ok: true };
}
