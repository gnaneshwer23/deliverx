"use client";

import { useState } from "react";
import { createDependencyAction } from "../actions";

export type Selectable = { id: string; name: string };

export function DependencyForm({
  programmeId,
  sources,
  targets,
}: {
  programmeId: string;
  sources: Selectable[];
  targets: Selectable[];
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (sources.length === 0 || targets.length === 0) {
    return (
      <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
        Add projects to this programme and to the organisation before creating
        cross-project dependencies.
      </p>
    );
  }

  async function onSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    const res = await createDependencyAction(formData);
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
        className="inline-flex h-8 items-center justify-center rounded-md bg-indigo-600 px-3 text-xs font-medium text-white hover:bg-indigo-700"
      >
        + Add dependency
      </button>
    );
  }

  return (
    <form
      action={onSubmit}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <input type="hidden" name="programme_id" value={programmeId} />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Source project (in this programme)
          </label>
          <select
            name="source_project_id"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm"
          >
            {sources.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Target project
          </label>
          <select
            name="target_project_id"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm"
          >
            {targets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Type
          </label>
          <select
            name="dependency_type"
            defaultValue="depends_on"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm"
          >
            <option value="depends_on">depends on</option>
            <option value="blocks">blocks</option>
            <option value="shares_resource">shares resource with</option>
            <option value="data_handoff">hands off data to</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Severity
          </label>
          <select
            name="severity"
            defaultValue="medium"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm"
          >
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="critical">critical</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Description (optional)
          </label>
          <input
            name="description"
            placeholder="e.g. shared auth platform release blocks downstream rollout"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm"
          />
        </div>
      </div>
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-8 items-center justify-center rounded-md bg-indigo-600 px-3 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? "Adding…" : "Add dependency"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium text-slate-600 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
