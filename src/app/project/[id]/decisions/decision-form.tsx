"use client";

import { useActionState } from "react";
import { createDecisionAction, type ActionState } from "../governance/actions";

const initial: ActionState = { ok: false };
const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-[#0F766E]/40 focus:border-[#0F766E] focus:ring-2";

export function DecisionForm({
  projectId,
  meetings,
}: {
  projectId: string;
  meetings: Array<{ id: string; title: string }>;
}) {
  const [state, action, pending] = useActionState(createDecisionAction, initial);

  return (
    <form action={action} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <input type="hidden" name="projectId" value={projectId} />
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Title</span>
        <input name="title" required className={`${inputClass} h-10`} />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Context</span>
        <textarea name="context" rows={3} className={inputClass} />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Outcome</span>
        <textarea name="outcome" rows={2} className={inputClass} />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Linked meeting</span>
        <select name="meetingId" defaultValue="" className={`${inputClass} h-10`}>
          <option value="">None</option>
          {meetings.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Status</span>
        <select name="status" defaultValue="proposed" className={`${inputClass} h-10`}>
          <option value="proposed">Proposed</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="superseded">Superseded</option>
        </select>
      </label>
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-emerald-700">Decision recorded.</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Add decision"}
      </button>
    </form>
  );
}
