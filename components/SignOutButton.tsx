"use client";

import { signOut } from "@/lib/signout";

export default function SignOutButton() {
  return (
    <button
      onClick={async () => {
        await signOut();
        window.location.href = "/";
      }}
      className="rounded-md border border-neutral-700 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-300 transition hover:border-gold hover:text-gold"
    >
      Sign out
    </button>
  );
}
