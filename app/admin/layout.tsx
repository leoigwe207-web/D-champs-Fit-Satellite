import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import AdminNav from "./AdminNav";
import SignOutButton from "@/components/SignOutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-ink lg:flex">
      <aside className="hidden w-60 shrink-0 border-r border-neutral-800 bg-ink2/50 lg:block">
        <div className="sticky top-0 flex h-screen flex-col p-4">
          <Link href="/" className="mb-6 flex items-center gap-2 px-2">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-gold font-display text-xl text-ink">D</span>
            <span className="font-display text-xl tracking-wider2 text-white">
              D&apos;CHAMPS <span className="text-gold">ADMIN</span>
            </span>
          </Link>
          <AdminNav />
          <div className="mt-auto border-t border-neutral-800 pt-4">
            <p className="px-2 text-sm font-semibold text-white">{user?.full_name}</p>
            <p className="px-2 text-xs capitalize text-neutral-500">{user?.role ?? "admin"}</p>
            <div className="mt-3 px-2">
              <SignOutButton />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile topbar */}
      <div className="lg:hidden">
        <header className="sticky top-0 z-40 border-b border-neutral-800 bg-ink/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="font-display text-xl tracking-wider2 text-white">
              D&apos;CHAMPS <span className="text-gold">ADMIN</span>
            </Link>
            <SignOutButton />
          </div>
        </header>
        <div className="border-b border-neutral-800 bg-ink2/50 px-4 py-2">
          <AdminNav horizontal />
        </div>
      </div>

      <main className="min-w-0 flex-1 p-4 sm:p-8">{children}</main>
    </div>
  );
}
