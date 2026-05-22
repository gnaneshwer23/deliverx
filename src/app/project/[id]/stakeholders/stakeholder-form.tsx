"use client";

import { useActionState } from "react";
import {
  createStakeholderAction,
  type ActionState,
} from "../traceability/actions";

const initial: ActionState = { ok: false };
const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-[#0F766E]/40 focus:border-[#0F766E] focus:ring-2";

export function StakeholderForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(createStakeholderAction, initial);

  return (
    <form action={action} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <input type="hidden" name="projectId" value={projectId} />
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Name</span>
        <input name="name" required className={`${inputClass} h-10`} />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Role</span>
        <input name="roleLabel" placeholder="Sponsor, PM, Legal…" className={`${inputClass} h-10`} />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Organisation</span>
        <input name="organisationName" className={`${inputClass} h-10`} />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Email</span>
        <input name="email" type="email" className={`${inputClass} h-10`} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Influence</span>
          <select name="influence" defaultValue="medium" className={`${inputClass} h-10`}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Interest</span>
          <select name="interest" defaultValue="medium" className={`${inputClass} h-10`}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Sentiment</span>
        <select name="sentiment" defaultValue="neutral" className={`${inputClass} h-10`}>
          <option value="champion">Champion</option>
          <option value="neutral">Neutral</option>
          <option value="skeptic">Skeptic</option>
          <option value="blocker">Blocker</option>
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Notes</span>
        <textarea name="notes" rows={2} className={inputClass} />
      </label>
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-emerald-700">Stakeholder added.</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Add stakeholder"}
      </button>
    </form>
  );
}
