"use client";

import { useState, useTransition } from "react";

const TYPES = [
  {
    value: "gym_announcement",
    label: "Gym Announcement",
  },
  {
    value: "new_membership_offer",
    label: "New Membership Offer",
  },
  {
    value: "holiday_hours",
    label: "Holiday Hours",
  },
  {
    value: "new_trainer",
    label: "New Trainer",
  },
];

type AnnouncementForm = {
  type:
    | "gym_announcement"
    | "new_membership_offer"
    | "holiday_hours"
    | "new_trainer";
  title: string;
  body: string;
};

export default function AnnouncementCreate() {
  const [form, setForm] = useState<AnnouncementForm>({
    type: "gym_announcement",
    title: "",
    body: "",
  });

  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setMessage(null);
    setError(null);

    if (!form.title.trim()) {
      setError("Please enter an announcement title.");
      return;
    }

    if (!form.body.trim()) {
      setError("Please enter an announcement message.");
      return;
    }

    startTransition(async () => {
      try {
        const { createAnnouncement } = await import("./actions");

        const result = await createAnnouncement(form);

        setForm({
          type: "gym_announcement",
          title: "",
          body: "",
        });

        setMessage(
          result.emailStatus === "sent"
            ? `✓ Published and emailed to ${result.emailCount} member${
                result.emailCount === 1 ? "" : "s"
              }.`
            : result.emailStatus === "not_configured"
              ? "✓ Published. Email service is not configured yet."
              : "✓ Published. The dashboard notification was created, but email delivery needs attention."
        );

        window.setTimeout(() => {
          setMessage(null);
        }, 5000);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Could not publish announcement."
        );
      }
    });
  }

  return (
    <div className="card-dark">
      <h2 className="font-display text-xl tracking-wider2 text-gold">
        NEW ANNOUNCEMENT
      </h2>

      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_2fr]">
        <select
          className="input-dark"
          value={form.type}
          disabled={pending}
          onChange={(e) =>
            setForm({
              ...form,
              type: e.target.value as AnnouncementForm["type"],
            })
          }
        >
          {TYPES.map((type) => (
            <option
              key={type.value}
              value={type.value}
            >
              {type.label}
            </option>
          ))}
        </select>

        <input
          className="input-dark"
          placeholder="Title"
          value={form.title}
          disabled={pending}
          maxLength={160}
          onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value,
            })
          }
        />

        <textarea
          className="input-dark sm:col-span-2"
          rows={4}
          placeholder="Message to members…"
          value={form.body}
          disabled={pending}
          maxLength={2000}
          onChange={(e) =>
            setForm({
              ...form,
              body: e.target.value,
            })
          }
        />
      </div>

      {error && (
        <p className="mt-3 rounded-md border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {message && (
        <p className="mt-3 rounded-md border border-green-900 bg-green-950/40 px-3 py-2 text-sm text-green-300">
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={
          pending ||
          !form.title.trim() ||
          !form.body.trim()
        }
        className="btn-gold mt-4 !px-5 !py-2 !text-sm disabled:opacity-40"
      >
        {pending ? "Publishing…" : "Publish Announcement"}
      </button>
    </div>
  );
}