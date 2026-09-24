"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Trainer, TrainingService } from "@/lib/demo-data";

const TIMES = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "16:00", "17:00", "18:00", "19:00", "20:00", "21:00",
];

export default function BookingForm({
  trainers,
  services,
}: {
  trainers: Trainer[];
  services: TrainingService[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [trainerId, setTrainerId] = useState(params.get("trainer") ?? trainers[0]?.id ?? "");
  const [service, setService] = useState(services[0]?.title ?? "Personal Training");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("18:00");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const trainer = trainers.find((t) => t.id === trainerId);

  // Earliest selectable date = today.
  const today = new Date().toISOString().slice(0, 10);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainer_id: trainerId, service, date, time }),
      });
      const data = await res.json();
      // Not logged in: send the visitor to login and return them here
      // afterwards (loginUrl carries ?next=/book) instead of leaving a
      // dead-end error in the public booking flow.
      if (res.status === 401 && data.loginUrl) {
        router.push(data.loginUrl);
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Could not create booking");
      setState("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="card-dark mt-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold font-display text-3xl text-ink">✓</div>
        <h2 className="mt-4 font-display text-3xl tracking-wider2 text-white">BOOKING REQUESTED</h2>
        <p className="mt-2 text-sm text-neutral-400">
          {service}
          {trainer ? (
            <>
              {" "}with <span className="text-gold">{trainer.name}</span>
            </>
          ) : null}{' '}
          — {date} at {time}. You&apos;ll see it in your dashboard; reception confirms shortly.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/dashboard/bookings" className="btn-gold">View My Bookings</Link>
          <Link href="/dashboard" className="btn-outline">Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card-dark mt-10 space-y-5">
      {error && (
        <p className="rounded-md border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">{error}</p>
      )}
      {trainers.length > 0 ? (
        <div>
          <label className="label-dark">Trainer</label>
          <div className="grid gap-2 sm:grid-cols-3">
            {trainers.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setTrainerId(t.id)}
                className={`rounded-lg border p-3 text-left transition ${
                  trainerId === t.id
                    ? "border-gold bg-gold/10"
                    : "border-neutral-800 hover:border-neutral-600"
                }`}
              >
                <p className="font-display text-lg tracking-wider2 text-white">{t.name}</p>
                <p className="text-xs text-gold">{t.specialty}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="rounded-md border border-neutral-800 bg-ink px-4 py-3 text-sm text-neutral-400">
          Trainer will be assigned by reception based on your goal and schedule.
        </p>
      )}

      <div>
        <label className="label-dark">Service</label>
        <select className="input-dark" value={service} onChange={(e) => setService(e.target.value)}>
          {services.map((s) => (
            <option key={s.id} value={s.title}>{s.title}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-dark">Date</label>
          <input
            type="date"
            required
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-dark [color-scheme:dark]"
          />
        </div>
        <div>
          <label className="label-dark">Time</label>
          <select className="input-dark" value={time} onChange={(e) => setTime(e.target.value)}>
            {TIMES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={state === "loading" || !date}
        className="btn-gold w-full disabled:opacity-50"
      >
        {state === "loading" ? "Booking…" : "Confirm Booking"}
      </button>
      <p className="text-center text-xs text-neutral-500">
        Bookings are free to schedule — any session fees are settled at the gym.
      </p>
    </form>
  );
}
