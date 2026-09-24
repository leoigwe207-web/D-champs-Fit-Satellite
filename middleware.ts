import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/admin"];

// ─────────────────────────────────────────────────────────────────────────────
// Secure cookie options
// ─────────────────────────────────────────────────────────────────────────────
function cookieOptionsWithDefaults(
  options?: CookieOptions
): CookieOptions {
  return {
    ...options,
    secure: process.env.NODE_ENV === "production",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Content Security Policy
// ─────────────────────────────────────────────────────────────────────────────
function buildCsp(
  nonce: string,
  opts: { dev: boolean; loose: boolean }
): string {
  const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
    : "";

  const scriptSrc = opts.loose
    ? [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https:",
      ].join(" ")
    : [
        "'self'",
        `'nonce-${nonce}'`,
        "'strict-dynamic'",
        "'unsafe-inline'",
        ...(opts.dev ? ["'unsafe-eval'"] : []),
      ].join(" ");

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https: ${supabaseOrigin}`.trim(),
    "font-src 'self' data:",
    `connect-src 'self' ${supabaseOrigin} wss://*.supabase.co https://api.paystack.co`.trim(),
    "frame-src 'self' https://www.google.com https://maps.googleapis.com https://checkout.paystack.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://checkout.paystack.com",
    "upgrade-insecure-requests",
  ].join("; ");
}

// ─────────────────────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  const isDev = process.env.NODE_ENV === "development";

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const csp = buildCsp(nonce, {
    dev: isDev,
    loose: isDev && !configured,
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Security headers
  // ───────────────────────────────────────────────────────────────────────────
  const headers = new Headers({
    "Strict-Transport-Security":
      "max-age=31536000; includeSubDomains; preload",

    "X-Frame-Options": "DENY",

    "X-Content-Type-Options": "nosniff",

    "Referrer-Policy": "strict-origin-when-cross-origin",

    "Permissions-Policy":
      "camera=(self), microphone=(), geolocation=(), payment=(self)",

    "Content-Security-Policy": csp,
  });

  // Forward nonce to Next.js rendering
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const applyHeaders = (res: NextResponse): NextResponse => {
    headers.forEach((value, key) => {
      res.headers.set(key, value);
    });

    return res;
  };

  const path = request.nextUrl.pathname;

  const needsAuth = PROTECTED.some((protectedPath) =>
    path.startsWith(protectedPath)
  );

  // ───────────────────────────────────────────────────────────────────────────
  // If Supabase isn't configured
  // ───────────────────────────────────────────────────────────────────────────
  if (!configured) {
    // Production fails closed.
    if (needsAuth && !isDev) {
      const url = request.nextUrl.clone();

      url.pathname = "/login";
      url.search = "";

      return applyHeaders(NextResponse.redirect(url));
    }

    // Development-only demo mode
    return applyHeaders(
      NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Public routes don't need an auth round-trip
  // ───────────────────────────────────────────────────────────────────────────
  if (!needsAuth) {
    return applyHeaders(
      NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Supabase server client
  // ───────────────────────────────────────────────────────────────────────────
  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: cookieOptionsWithDefaults(),

      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: CookieOptions;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(
              name,
              value,
              cookieOptionsWithDefaults(options)
            );
          });
        },
      },
    }
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Verify authenticated user
  // ───────────────────────────────────────────────────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();

    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", path);

    return applyHeaders(NextResponse.redirect(url));
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ADMIN ROUTES — ADMIN ONLY
  // ───────────────────────────────────────────────────────────────────────────
  if (path.startsWith("/admin")) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Fail closed if profile lookup fails
    if (error || profile?.role !== "admin") {
      const url = request.nextUrl.clone();

      url.pathname = "/dashboard";
      url.search = "";

      return applyHeaders(NextResponse.redirect(url));
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Return protected response
  // ───────────────────────────────────────────────────────────────────────────
  return applyHeaders(response);
}

// ─────────────────────────────────────────────────────────────────────────────
// Middleware matcher
// ─────────────────────────────────────────────────────────────────────────────
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};