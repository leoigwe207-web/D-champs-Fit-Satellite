"use client";

import { useTransition } from "react";
import { deleteAnnouncement } from "./actions";

export default function AnnouncementRow({
  id,
  title,
  body,
  type,
  created_at,
}: {
  id: string;
  title: string;
  body: string;
  type: string;
  created_at: string;
}) {
  const [pending, start] = useTransition();
  const isDemo = id.startsWith("a") && id.length <= 3;

  return (
    <div className="card-dark flex items-start justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-wider2 text-neutral-500">
          {type.replace(/_/g, " ")} · {created_at}
        </p>
        <p className="mt-0.5 font-semibold text-white">{title}</p>
        <p className="text-sm text-neutral-400">{body}</p>
      </div>
      <button
        disabled={pending || isDemo}
        title={isDemo ? "Available once Supabase is connected" : undefined}
        onClick={() => start(() => deleteAnnouncement(id))}
        className="shrink-0 text-xs font-bold uppercase text-red-400 hover:underline disabled:opacity-30"
      >
        Delete
      </button>
    </div>
  );
}
