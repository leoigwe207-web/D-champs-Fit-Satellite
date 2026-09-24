import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getMemberNotifications } from "@/lib/member-data";
import MemberNav from "./MemberNav";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const notifications = await getMemberNotifications();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-ink">
      <header className="sticky top-0 z-40 border-b border-neutral-800 bg-ink/95 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-gold font-display text-xl text-ink">D</span>
            <span className="font-display text-xl tracking-wider2 text-white">
              D&apos;CHAMPS <span className="text-gold">FIT</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-neutral-400 sm:block">
              Welcome back, <span className="font-semibold text-white">{user?.full_name}</span>
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="container-page flex gap-8 py-8 pb-32 lg:pb-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <MemberNav />
        </aside>
        <div className="min-w-0 flex-1">
          {children}
        </div>
      </div>

      {/* Mobile nav drawer (bottom sheet style) */}
      <div className="lg:hidden">
        <MemberNavMobile unread={unread} />
      </div>
    </div>
  );
}

function MemberNavMobile({ unread }: { unread: number }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-800 bg-ink2/95 backdrop-blur">
      <div className="grid grid-cols-5 text-center text-[10px] font-bold uppercase tracking-wider text-neutral-400">
        <MemberNavMobileLink href="/dashboard" label="Home" icon="⌂" />
        <MemberNavMobileLink href="/dashboard/qr" label="QR" icon="▣" />
        <MemberNavMobileLink href="/book" label="Book" icon="＋" />
        <MemberNavMobileLink href="/dashboard/attendance" label="Visits" icon="✓" />
        <MemberNavMobileLink href="/dashboard/notifications" label="Alerts" icon={unread > 0 ? `●${unread}` : "●"} />
      </div>
    </div>
  );
}

function MemberNavMobileLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <Link href={href} className="flex flex-col items-center gap-0.5 py-2.5 hover:text-gold">
      <span className="text-base leading-none">{icon}</span>
      {label}
    </Link>
  );
}
