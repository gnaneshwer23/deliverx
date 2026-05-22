"use client";

import { useState } from "react";
import { assignProjectAction } from "../actions";

export type AssignableProject = {
  id: string;
  name: string;
  status: string;
};

export function AssignProjectForm({
  programmeId,
  unassigned,
}: {
  programmeId: string;
  unassigned: AssignableProject[];
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (unassigned.length === 0) {
    return (
      <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
        All projects are assigned to a programme.
      </p>
    );
  }

  async function onSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    const res = await assignProjectAction(formData);
    setSubmitting(false);
    if (res && "error" in res && res.error) setError(res.error);
  }

  return (
    <form action={onSubmit} className="flex items-end gap-2">
      <input type="hidden" name="programme_id" value={programmeId} />
      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-slate-600">
          Add project to programme
        </label>
        <select
          name="project_id"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {unassigned.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} {p.status ? `· ${p.status}` : ""}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-9 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? "Adding…" : "Add"}
      </button>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </form>
  );
}
