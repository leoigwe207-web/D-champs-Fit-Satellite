"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileActionBar() {
  const pathname = usePathname();

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/join")
  ) {
    return null;
  }

  return (
    <div className="mobile-site-nav">
      <Link
        href="/"
        className={`mobile-site-nav-item ${
          pathname === "/" ? "active" : ""
        }`}
      >
        <span>⌂</span>
        Home
      </Link>

      <Link
        href="/membership"
        className={`mobile-site-nav-item ${
          pathname.startsWith("/membership") ? "active" : ""
        }`}
      >
        <span>▣</span>
        Memberships
      </Link>

      <Link
        href="/gallery"
        className={`mobile-site-nav-item ${
          pathname.startsWith("/gallery") ? "active" : ""
        }`}
      >
        <span>▧</span>
        Gallery
      </Link>

      <Link
        href="/contact"
        className={`mobile-site-nav-item ${
          pathname.startsWith("/contact") ? "active" : ""
        }`}
      >
        <span>⌕</span>
        Contact
      </Link>
    </div>
  );
}
