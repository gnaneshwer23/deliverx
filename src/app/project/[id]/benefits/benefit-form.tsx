"use client";

import { useActionState } from "react";
import { createBenefitAction, type ActionState } from "./actions";

const initial: ActionState = { ok: false };

const inputClass =
  "mt-1 w-full rounded-md border border-[#E4E4DC] bg-white px-3 text-sm outline-none focus:border-[#1C4A2E] focus:ring-2 focus:ring-[#1C4A2E]/20";

export function BenefitForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(createBenefitAction, initial);

  return (
    <form action={action} className={`mb-8 space-y-4 rounded-xl border border-[#E4E4DC] bg-[#F7F7F2] p-4`}>
      <input type="hidden" name="projectId" value={projectId} />
      <h2 className="text-sm font-semibold text-[#0D0D0B]">Add benefit hypothesis</h2>
      <label className="block">
        <span className="text-sm text-[#6B6B64]">Title</span>
        <input name="title" required className={`${inputClass} h-10`} />
      </label>
      <label className="block">
        <span className="text-sm text-[#6B6B64]">Description</span>
        <textarea name="description" rows={2} className={inputClass} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-[#6B6B64]">KPI name</span>
          <input name="kpiName" className={`${inputClass} h-10`} />
        </label>
        <label className="block">
          <span className="text-sm text-[#6B6B64]">Unit</span>
          <input name="unit" placeholder="%, $, days" className={`${inputClass} h-10`} />
        </label>
        <label className="block">
          <span className="text-sm text-[#6B6B64]">Baseline</span>
          <input name="baselineValue" type="number" step="any" className={`${inputClass} h-10`} />
        </label>
        <label className="block">
          <span className="text-sm text-[#6B6B64]">Target</span>
          <input name="targetValue" type="number" step="any" className={`${inputClass} h-10`} />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm text-[#6B6B64]">Current value</span>
          <input name="currentValue" type="number" step="any" className={`${inputClass} h-10`} />
        </label>
      </div>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-[#1C4A2E]">Benefit added.</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="h-9 rounded-md bg-[#1C4A2E] px-4 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Add benefit"}
      </button>
    </form>
  );
}
