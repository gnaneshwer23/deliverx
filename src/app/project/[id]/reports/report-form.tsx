"use client";

import { useActionState } from "react";
import { createReportAction, type ActionState } from "../governance/actions";

const initial: ActionState = { ok: false };
const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-[#0F766E]/40 focus:border-[#0F766E] focus:ring-2";

export function ReportForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(createReportAction, initial);

  return (
    <form action={action} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <input type="hidden" name="projectId" value={projectId} />
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Title</span>
        <input name="title" required className={`${inputClass} h-10`} />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Report type</span>
        <select name="reportType" defaultValue="status" className={`${inputClass} h-10`}>
          <option value="status">Status</option>
          <option value="steerco">Steerco</option>
          <option value="weekly">Weekly</option>
          <option value="closure">Closure</option>
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Content</span>
        <textarea
          name="content"
          required
          rows={8}
          placeholder="Write or paste report content…"
          className={inputClass}
        />
      </label>
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-emerald-700">Report saved.</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Create report"}
      </button>
    </form>
  );
}
