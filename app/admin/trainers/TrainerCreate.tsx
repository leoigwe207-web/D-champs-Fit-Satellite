"use client";

import { useState, useTransition } from "react";
import { createTrainer } from "./actions";

/**
 * Admin trainer creation form — final field set ONLY:
 * Trainer Name, Phone Number, Specialty, Availability, Active status.
 * No Image URL, no Biography, no Experience.
 */
const EMPTY = { name: "", phone: "", specialty: "", availability: "" };

export default function TrainerCreate() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [pending, start] = useTransition();

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-gold !px-4 !py-2 !text-sm">
        ＋ Add Trainer
      </button>
    );
  }

  return (
    <div className="card-dark w-full max-w-lg">
      <h3 className="font-display text-xl tracking-wider2 text-white">New Trainer</h3>
      {error && (
        <p className="mt-3 rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300">{error}</p>
      )}
      <div className="mt-3 grid gap-3">
        <input className="input-dark" placeholder="Trainer name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input-dark" placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="input-dark" placeholder="Specialty" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
        <input className="input-dark" placeholder="Availability (e.g. Monday - Friday, 7:00 AM - 5:00 PM)" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} />
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={() => setOpen(false)} className="btn-outline flex-1 !py-2 !text-sm">Cancel</button>
        <button
          onClick={() =>
            start(async () => {
              setError(null);
              try {
                await createTrainer(form);
                setOpen(false);
                setForm(EMPTY);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Could not add trainer.");
              }
            })
          }
          disabled={pending || form.name.trim().length < 2 || form.specialty.trim().length < 2}
          className="btn-gold flex-1 !py-2 !text-sm disabled:opacity-40"
        >
          {pending ? "Adding…" : "Add Trainer"}
        </button>
      </div>
    </div>
  );
}
