"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/lib/site";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authed, setAuthed] = useState(false);
  const pathname = usePathname();

  // Auth-aware chrome: a signed-in member on public pages (e.g. /book)
  // gets member navigation instead of the visitor "Join Now" flow.
  // Lightweight HEAD probe — no session data ever reaches the client.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/me", { method: "HEAD" })
      .then((r) => {
        if (!cancelled) setAuthed(r.ok);
      })
      .catch(() => {
        if (!cancelled) setAuthed(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-neutral-800/80 bg-ink/95 backdrop-blur"
          : "bg-gradient-to-b from-ink/80 to-transparent"
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between sm:h-20">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-gold font-display text-xl text-ink">
            D
          </span>
          <span className="font-display text-2xl tracking-wider2 text-white">
            D&apos;CHAMPS <span className="text-gold">FIT</span>
          </span>
        </Link>

        {authed ? (
          <>
            <div className="hidden items-center gap-7 lg:flex">
              <Link
                href="/dashboard"
                className="text-sm font-semibold uppercase tracking-wider text-neutral-300 transition hover:text-gold"
              >
                Dashboard
              </Link>
            </div>
            <div className="hidden lg:block">
              <Link href="/book" className="btn-gold !px-5 !py-2.5 !text-base">
                Book Training
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="hidden items-center gap-7 lg:flex">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-sm font-semibold uppercase tracking-wider transition hover:text-gold ${
                    pathname === l.href ? "text-gold" : "text-neutral-300"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="hidden lg:block">
              <Link href="/join" className="btn-gold !px-5 !py-2.5 !text-base">
                Join Now
              </Link>
            </div>
          </>
        )}

        <button
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral-700 text-white lg:hidden"
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          )}
        </button>
      </nav>

      {open && (
        <div className="border-t border-neutral-800 bg-ink/95 px-5 pb-6 pt-2 backdrop-blur lg:hidden">
          {authed ? (
            <>
              <Link
                href="/dashboard"
                className="block border-b border-neutral-800/60 py-3.5 font-display text-2xl tracking-wider2 text-white"
              >
                Dashboard
              </Link>
              <Link
                href="/book"
                className="block border-b border-neutral-800/60 py-3.5 font-display text-2xl tracking-wider2 text-white"
              >
                Book Training
              </Link>
            </>
          ) : (
            NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`block border-b border-neutral-800/60 py-3.5 font-display text-2xl tracking-wider2 ${
                  pathname === l.href ? "text-gold" : "text-white"
                }`}
              >
                {l.label}
              </Link>
            ))
          )}
          {!authed && (
            <Link href="/join" className="btn-gold mt-5 w-full">
              Join Now
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
