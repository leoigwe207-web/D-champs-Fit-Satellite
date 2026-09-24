"use client";

import { useState, useTransition } from "react";
import type { Trainer } from "@/lib/demo-data";
import { deleteTrainer, saveTrainer } from "./actions";

/**
 * Admin trainer editor — final field set ONLY:
 * Trainer Name, Phone Number, Specialty, Availability, Active status,
 * Save, and Delete for existing trainers.
 * No Image URL, no Biography, no Experience.
 */
export default function TrainerEditor({ trainer }: { trainer: Trainer }) {
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [form, setForm] = useState({
    name: trainer.name,
    phone: trainer.phone ?? "",
    specialty: trainer.specialty,
    availability: trainer.availability ?? "",
    active: trainer.active,
  });
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="card-dark">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl tracking-wider2 text-white">{trainer.name}</h2>
        <span className={`badge ${trainer.active ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
          {trainer.active ? "Active" : "Disabled"}
        </span>
      </div>

      {error && (
        <p className="mt-3 rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300">{error}</p>
      )}
      {notice && (
        <p className="mt-3 rounded-md border border-amber-900 bg-amber-950/40 px-3 py-2 text-sm text-amber-200">{notice}</p>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label-dark">Trainer name</label>
          <input className="input-dark" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <label className="label-dark">Phone number</label>
          <input className="input-dark" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div>
          <label className="label-dark">Specialty</label>
          <input className="input-dark" value={form.specialty} onChange={(e) => set("specialty", e.target.value)} />
        </div>
        <div>
          <label className="label-dark">Availability</label>
          <input className="input-dark" value={form.availability} onChange={(e) => set("availability", e.target.value)} placeholder="e.g. Monday - Friday, 7:00 AM - 5:00 PM" />
        </div>
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm text-neutral-300">
        <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4 accent-[#D9A441]" />
        Active — visible on the website and bookable
      </label>

      <div className="mt-5 flex gap-2">
        <button
          onClick={() =>
            start(async () => {
              setError(null);
              setNotice(null);
              try {
                await saveTrainer(trainer.id, form);
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Could not save trainer.");
              }
            })
          }
          disabled={pending}
          className="btn-gold flex-1 disabled:opacity-50"
        >
          {pending ? "Saving…" : saved ? "✓ Saved" : "Save"}
        </button>
        {confirming ? (
          <>
            <button
              onClick={() =>
                start(async () => {
                  setError(null);
                  try {
                    await deleteTrainer(trainer.id);
                  } catch (e) {
                    setConfirming(false);
                    setError(e instanceof Error ? e.message : "Could not delete trainer.");
                  }
                })
              }
              disabled={pending}
              className="flex-1 rounded-md border border-red-900 bg-red-950/60 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-900/60 disabled:opacity-50"
            >
              {pending ? "Deleting…" : "Confirm delete"}
            </button>
            <button onClick={() => setConfirming(false)} disabled={pending} className="btn-outline !py-2 !text-sm">
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              setError(null);
              setNotice(
                trainer.active
                  ? "Tip: this trainer is Active. Deactivating (Save with Active off) hides them from the site while keeping their history."
                  : null
              );
              setConfirming(true);
            }}
            disabled={pending}
            className="btn-outline !border-red-900/70 !text-red-300"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
