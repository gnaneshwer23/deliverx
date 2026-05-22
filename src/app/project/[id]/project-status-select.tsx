"use client";

import { useTransition } from "react";
import {
  updateProjectStatusAction,
  type ProjectStatus,
} from "./actions";

const STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

export function ProjectStatusSelect({
  projectId,
  current,
}: {
  projectId: string;
  current: ProjectStatus;
}) {
  const [isPending, startTransition] = useTransition();

  function onChange(next: ProjectStatus) {
    if (next === current) return;
    startTransition(async () => {
      await updateProjectStatusAction(projectId, next);
    });
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="text-slate-500">Status</span>
      <select
        value={current}
        disabled={isPending}
        onChange={(e) => onChange(e.target.value as ProjectStatus)}
        className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm font-medium text-slate-800 disabled:opacity-60"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}
