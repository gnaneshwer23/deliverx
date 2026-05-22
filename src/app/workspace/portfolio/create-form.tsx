"use client";

import { useState } from "react";
import { Briefcase } from "lucide-react";
import { createPortfolioAction } from "./actions";

export function PortfolioCreateForm() {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    const res = await createPortfolioAction(formData);
    setSubmitting(false);
    if (res && "error" in res && res.error) setError(res.error);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Briefcase size={18} className="text-indigo-600" />
        <h2 className="text-lg font-semibold">Set up your portfolio</h2>
      </div>
      <p className="mb-6 text-sm text-slate-500">
        A portfolio groups programmes and delivers org-wide intelligence. Most
        organisations operate with a single portfolio.
      </p>

      <form action={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Portfolio name
          </label>
          <input
            name="name"
            required
            defaultValue="Default Portfolio"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Description (optional)
          </label>
          <textarea
            name="description"
            rows={2}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Org-wide delivery portfolio"
          />
        </div>
        {error ? (
          <p className="text-xs text-rose-600">{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-9 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create portfolio"}
        </button>
      </form>
    </div>
  );
}
