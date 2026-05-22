"use client";

import { useActionState } from "react";
import { createRaidAction, type ActionState } from "../governance/actions";
import type { RaidItemType } from "@/services/governance";

const initial: ActionState = { ok: false };

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-[#0F766E]/40 focus:border-[#0F766E] focus:ring-2";

export function RaidForm({
  projectId,
  defaultType = "risk",
}: {
  projectId: string;
  defaultType?: RaidItemType;
}) {
  const [state, action, pending] = useActionState(createRaidAction, initial);

  return (
    <form action={action} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <input type="hidden" name="projectId" value={projectId} />
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Type</span>
        <select name="type" defaultValue={defaultType} className={`${inputClass} h-10`}>
          <option value="risk">Risk</option>
          <option value="assumption">Assumption</option>
          <option value="issue">Issue</option>
          <option value="dependency">Dependency</option>
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Title</span>
        <input name="title" required className={`${inputClass} h-10`} />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Description</span>
        <textarea name="description" rows={2} className={inputClass} />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Severity</span>
        <select name="severity" defaultValue="medium" className={`${inputClass} h-10`}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Mitigation</span>
        <textarea name="mitigation" rows={2} className={inputClass} />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Due date</span>
        <input name="dueDate" type="date" className={`${inputClass} h-10`} />
      </label>
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-emerald-700">RAID item logged.</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Add item"}
      </button>
    </form>
  );
}
