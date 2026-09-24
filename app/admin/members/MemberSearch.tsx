"use client";

import { useEffect, useState } from "react";

export default function MemberSearch() {
  const [q, setQ] = useState("");

  useEffect(() => {
    const rows = document.querySelectorAll<HTMLElement>("[data-member-row]");
    const needle = q.trim().toLowerCase();
    rows.forEach((row) => {
      row.style.display =
        !needle || row.textContent?.toLowerCase().includes(needle)
          ? ""
          : "none";
    });
  }, [q]);

  return (
    <input
      value={q}
      onChange={(e) => setQ(e.target.value)}
      placeholder="Search name, email, code…"
      className="input-dark max-w-xs"
    />
  );
}
