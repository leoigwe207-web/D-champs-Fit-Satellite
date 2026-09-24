"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AttendanceFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const [date, setDate] = useState(params.get("date") ?? new Date().toISOString().slice(0, 10));

  function apply(d: string) {
    setDate(d);
    router.push(`/admin/attendance?date=${d}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="date"
        value={date}
        onChange={(e) => apply(e.target.value)}
        className="input-dark w-auto [color-scheme:dark]"
      />
      <button
        onClick={() => router.push("/admin/attendance?range=all")}
        className="btn-outline !px-4 !py-2 !text-sm"
      >
        All records
      </button>
      <button
        onClick={() => apply(new Date().toISOString().slice(0, 10))}
        className="btn-gold !px-4 !py-2 !text-sm"
      >
        Today
      </button>
    </div>
  );
}
