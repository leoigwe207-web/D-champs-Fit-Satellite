"use client";

import { useTransition } from "react";
import { setBookingStatus } from "./actions";

export default function BookingRowActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) {
  const [pending, start] = useTransition();
  const isDemo = bookingId.startsWith("bk-");

  if (status === "completed" || status === "cancelled") {
    return <span className="text-xs text-neutral-600">—</span>;
  }

  return (
    <div className="flex justify-end gap-2">
      {status === "pending" && (
        <button
          disabled={pending || isDemo}
          title={isDemo ? "Available once Supabase is connected" : undefined}
          onClick={() => start(() => setBookingStatus(bookingId, "confirmed"))}
          className="rounded border border-emerald-700 px-2.5 py-1 text-xs font-bold uppercase text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-30"
        >
          Confirm
        </button>
      )}
      <button
        disabled={pending || isDemo}
        onClick={() => start(() => setBookingStatus(bookingId, "completed"))}
        className="rounded border border-blue-700 px-2.5 py-1 text-xs font-bold uppercase text-blue-400 hover:bg-blue-500/10 disabled:opacity-30"
      >
        Complete
      </button>
      <button
        disabled={pending || isDemo}
        onClick={() => start(() => setBookingStatus(bookingId, "cancelled"))}
        className="rounded border border-red-700 px-2.5 py-1 text-xs font-bold uppercase text-red-400 hover:bg-red-500/10 disabled:opacity-30"
      >
        Cancel
      </button>
    </div>
  );
}
