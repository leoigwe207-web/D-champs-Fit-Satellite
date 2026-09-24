import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/auth";
import { isDemoMode } from "@/lib/env";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const BodySchema = z.object({
  plan_slug: z.enum(["monthly", "quarterly", "annual"]),
  full_name: z.string().min(3).max(120),
  phone: z.string().min(7).max(20),
  email: z.string().email().max(254),
  password: z.string().min(6).max(72),
});

export async function POST(req: Request) {
  // Abuse protection: account-creation/checkout endpoint is rate-limited per IP.
  const rl = rateLimit(`checkout:${clientIp(req)}`, 10, 60 * 10);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check your details — name, phone, email and a 6+ character password are required." },
        { status: 400 }
      );
    }
    const { plan_slug, full_name, phone, email, password } = parsed.data;

    // ── Demo mode: simulate a successful checkout (development only) ──
    if (isDemoMode() || !process.env.PAYSTACK_SECRET_KEY) {
      if (!isDemoMode()) {
        // Production without Paystack configured must NOT fake a checkout.
        return NextResponse.json(
          { error: "Online payment is not available right now — please contact reception." },
          { status: 503 }
        );
      }
      const params = new URLSearchParams({ reference: `DEMO-${Date.now()}`, demo: "1" });
      return NextResponse.json({
        authorization_url: `/join/success?${params.toString()}`,
        demo: true,
      });
    }

    const planResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/membership_plans?slug=eq.${plan_slug}&select=*`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
      }
    );
    const plans = (await planResponse.json()) as Array<{
      id: string;
      name: string;
      price: number;
      duration_days: number;
    }>;
    const plan = plans?.[0];
    if (!plan || plan.price <= 0) {
      return NextResponse.json(
        { error: "This plan is not available for online payment yet — please contact reception." },
        { status: 400 }
      );
    }

    // Create the account (or reuse an existing one for renewals).
    const adminClientModule = await import("@/lib/supabase-admin");
    const admin = adminClientModule.createAdminClient();
    if (!admin) throw new Error("Admin client unavailable");

    let userId: string | undefined;
    const { data: created } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, phone },
    });
    if (created?.user) {
      userId = created.user.id;
    } else {
      // Renewal / returning member: sign in to the existing account by
      // re-staging a payment for it. We never reveal whether an account
      // exists — the flow proceeds identically either way.
      const { data: existing } = await admin.auth.admin.listUsers();
      userId = existing?.users.find((u) => u.email === email)?.id;
      if (!userId) throw new Error("Could not prepare account");
    }

    // Ensure profile + member rows exist.
    await admin.from("profiles").upsert({
      id: userId,
      email,
      full_name,
      phone,
      role: "member",
    });
    const { data: member } = await admin
      .from("members")
      .upsert({ user_id: userId, status: "expired" }, { onConflict: "user_id" })
      .select("id")
      .single();

    // Stage a pending payment, then hand off to Paystack. The amount is
    // taken from the database plan (server-side), never from the client.
    const reference = `DCF-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    await admin.from("payments").insert({
      member_id: member?.id,
      plan_id: plan.id,
      plan_name: plan.name,
      amount: plan.price,
      method: "Paystack",
      reference,
      status: "pending",
    });

    const origin = new URL(req.url).origin;
    const callback_url = `${origin}/join/success`;

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(plan.price * 100), // kobo
        currency: process.env.PAYSTACK_CURRENCY ?? "NGN",
        reference,
        callback_url,
        metadata: {
          plan_slug,
          plan_id: plan.id,
          member_id: member?.id,
          user_id: userId,
          custom_fields: [
            { display_name: "Member", variable_name: "member", value: full_name },
            { display_name: "Plan", variable_name: "plan", value: plan.name },
          ],
        },
      }),
    });
    const paystack = await paystackRes.json();
    if (!paystack?.status || !paystack?.data?.authorization_url) {
      throw new Error(paystack?.message ?? "Paystack initialization failed");
    }

    return NextResponse.json({ authorization_url: paystack.data.authorization_url });
  } catch (e) {
    console.error("paystack initialize error", e);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 }
    );
  }
}
