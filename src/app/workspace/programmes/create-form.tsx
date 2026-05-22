"use client";

import { useState } from "react";
import { createProgrammeAction } from "./actions";

const STATUSES = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export function ProgrammeCreateForm({
  portfolioId,
}: {
  portfolioId: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  async function onSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    const res = await createProgrammeAction(formData);
    setSubmitting(false);
    if (res && "error" in res && res.error) {
      setError(res.error);
      return;
    }
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700"
      >
        + New programme
      </button>
    );
  }

  return (
    <form
      action={onSubmit}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <input type="hidden" name="portfolio_id" value={portfolioId} />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Programme name
          </label>
          <input
            name="name"
            required
            placeholder="e.g. NHS Digital Rollout"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Status
          </label>
          <select
            name="status"
            defaultValue="active"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Strategic goal (optional)
          </label>
          <textarea
            name="strategic_goal"
            rows={2}
            placeholder="What outcome does this programme exist to deliver?"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-9 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create programme"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
