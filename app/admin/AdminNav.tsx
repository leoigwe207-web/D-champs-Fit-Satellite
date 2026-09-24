"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/members", label: "Members", icon: "👥" },
  { href: "/admin/memberships", label: "Memberships", icon: "₦" },
  { href: "/admin/payments", label: "Payments", icon: "💳" },
  { href: "/admin/attendance", label: "Attendance", icon: "✓" },
  { href: "/admin/attendance/scan", label: "Scan QR", icon: "▣" },
  { href: "/admin/bookings", label: "Bookings", icon: "📅" },
  { href: "/admin/trainers", label: "Trainers", icon: "🏋" },
  { href: "/admin/gallery", label: "Gallery", icon: "🖼" },
  { href: "/admin/testimonials", label: "Testimonials", icon: "★" },
  { href: "/admin/announcements", label: "Announcements", icon: "📣" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  if (href === "/admin/attendance") {
    return (
      pathname === "/admin/attendance" ||
      pathname === "/admin/attendance/"
    );
  }

  if (href === "/admin/attendance/scan") {
    return pathname.startsWith("/admin/attendance/scan");
  }

  return pathname.startsWith(href);
}

export default function AdminNav({
  horizontal = false,
}: {
  horizontal?: boolean;
}) {
  const pathname = usePathname();

  if (horizontal) {
    return (
      <div className="flex gap-1 overflow-x-auto">
        {LINKS.map((link) => {
          const active = isActive(pathname, link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
                active
                  ? "bg-gold text-ink"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <nav className="space-y-0.5">
      {LINKS.map((link) => {
        const active = isActive(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-semibold transition ${
              active
                ? "bg-gold/15 text-gold"
                : "text-neutral-400 hover:bg-ink hover:text-white"
            }`}
          >
            <span className="w-5 text-center text-xs">
              {link.icon}
            </span>

            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}