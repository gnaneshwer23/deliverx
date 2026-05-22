"use client";

import { useActionState } from "react";
import { submitStandupAction, type ActionState } from "../traceability/actions";
import type { StandupRow } from "@/services/traceability";

const initial: ActionState = { ok: false };
const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-[#0F766E]/40 focus:border-[#0F766E] focus:ring-2";

export function StandupForm({
  projectId,
  existing,
}: {
  projectId: string;
  existing: StandupRow | null;
}) {
  const [state, action, pending] = useActionState(submitStandupAction, initial);

  return (
    <form action={action} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <input type="hidden" name="projectId" value={projectId} />
      <p className="text-xs font-semibold uppercase text-slate-400">
        {existing ? "Update today's standup" : "Submit today's standup"}
      </p>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Yesterday</span>
        <textarea
          name="yesterday"
          rows={3}
          defaultValue={existing?.yesterday ?? ""}
          className={inputClass}
          placeholder="What did you complete?"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Today</span>
        <textarea
          name="today"
          rows={3}
          required
          defaultValue={existing?.today ?? ""}
          className={inputClass}
          placeholder="What will you work on?"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Blockers</span>
        <textarea
          name="blockers"
          rows={2}
          defaultValue={existing?.blockers ?? ""}
          className={inputClass}
          placeholder="Anything blocking progress?"
        />
      </label>
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      {state.ok ? (
        <p className="text-sm text-emerald-700">Standup saved for today.</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62] disabled:opacity-60"
      >
        {pending ? "Saving…" : existing ? "Update standup" : "Submit standup"}
      </button>
    </form>
  );
}
