"use client";

import { useTransition } from "react";
import { suspendMember, reactivateMember } from "./actions";

export default function MemberRowActions({
  memberId,
  status,
}: {
  memberId: string;
  status: string;
}) {
  const [pending, start] = useTransition();
  const isDemo = memberId.startsWith("m-");

  return (
    <div className="flex justify-end gap-2">
      {status === "suspended" || status === "expired" ? (
        <button
          disabled={pending || isDemo}
          title={isDemo ? "Available once Supabase is connected" : undefined}
          onClick={() => start(() => reactivateMember(memberId))}
          className="rounded border border-emerald-700 px-2.5 py-1 text-xs font-bold uppercase text-emerald-400 transition hover:bg-emerald-500/10 disabled:opacity-30"
        >
          {pending ? "…" : "Reactivate"}
        </button>
      ) : (
        <button
          disabled={pending || isDemo}
          title={isDemo ? "Available once Supabase is connected" : undefined}
          onClick={() => start(() => suspendMember(memberId))}
          className="rounded border border-amber-700 px-2.5 py-1 text-xs font-bold uppercase text-amber-400 transition hover:bg-amber-500/10 disabled:opacity-30"
        >
          {pending ? "…" : "Suspend"}
        </button>
      )}
    </div>
  );
}
