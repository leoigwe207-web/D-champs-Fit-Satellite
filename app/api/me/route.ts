import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

// ─────────────────────────────────────────────────────────────────────────────
// GET/HEAD /api/me — authenticated-session probe for UI chrome only.
//
// Returns 204 when a valid session exists, 401 otherwise. No user data is
// returned — clients only learn "signed in or not" so the public layout can
// show member navigation instead of the visitor "Join Now" flow (e.g. on
// /book). Authorization still lives server-side in middleware, RLS, and the
// API routes; this endpoint grants nothing.
// ─────────────────────────────────────────────────────────────────────────────
const NO_STORE = { headers: { "Cache-Control": "no-store" } };

export async function GET() {
  const user = await getCurrentUser();
  return user
    ? new NextResponse(null, { status: 204, ...NO_STORE })
    : new NextResponse(null, { status: 401, ...NO_STORE });
}

// The navbar/mobile bar probe with method: "HEAD" hits this handler.
export async function HEAD() {
  const user = await getCurrentUser();
  return user
    ? new NextResponse(null, { status: 204, ...NO_STORE })
    : new NextResponse(null, { status: 401, ...NO_STORE });
}
