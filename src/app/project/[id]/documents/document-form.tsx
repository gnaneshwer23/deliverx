"use client";

import { useActionState } from "react";
import { createDocumentAction, type ActionState } from "../governance/actions";

const initial: ActionState = { ok: false };
const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-[#0F766E]/40 focus:border-[#0F766E] focus:ring-2";

export function DocumentForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(createDocumentAction, initial);

  return (
    <form action={action} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <input type="hidden" name="projectId" value={projectId} />
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Title</span>
        <input name="title" required className={`${inputClass} h-10`} />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Type</span>
        <select name="docType" defaultValue="general" className={`${inputClass} h-10`}>
          <option value="general">General</option>
          <option value="business_case">Business case</option>
          <option value="spec">Specification</option>
          <option value="contract">Contract</option>
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Content</span>
        <textarea name="contentText" rows={5} className={inputClass} />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">File URL (optional)</span>
        <input name="fileUrl" type="url" placeholder="https://…" className={`${inputClass} h-10`} />
      </label>
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-emerald-700">Document added.</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Add document"}
      </button>
    </form>
  );
}
