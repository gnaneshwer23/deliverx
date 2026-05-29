"use client";

import { useActionState } from "react";
import { updateMilestoneAction, type ActionState } from "./actions";
import type { MilestoneStatus } from "@/services/milestones";

const initial: ActionState = { ok: false };

export function MilestoneUpdateForm({
  projectId,
  milestoneId,
  confidenceScore,
  status,
}: {
  projectId: string;
  milestoneId: string;
  confidenceScore: number;
  status: MilestoneStatus;
}) {
  const [state, action, pending] = useActionState(updateMilestoneAction, initial);

  return (
    <form action={action} className="mt-3 flex flex-wrap items-end gap-2">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="id" value={milestoneId} />
      <label className="text-xs text-[#6B6B64]">
        Confidence
        <input
          name="confidenceScore"
          type="number"
          min={0}
          max={100}
          defaultValue={confidenceScore}
          className="ml-2 h-8 w-16 rounded border border-[#E4E4DC] px-2 text-sm"
        />
      </label>
      <label className="text-xs text-[#6B6B64]">
        Status
        <select name="status" defaultValue={status} className="ml-2 h-8 rounded border border-[#E4E4DC] px-2 text-sm">
          <option value="planned">Planned</option>
          <option value="at_risk">At risk</option>
          <option value="slipped">Slipped</option>
          <option value="completed">Completed</option>
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="h-8 rounded border border-[#1C4A2E] px-2 text-xs text-[#1C4A2E] disabled:opacity-60"
      >
        {pending ? "…" : "Update"}
      </button>
      {state.error ? <span className="text-xs text-red-600">{state.error}</span> : null}
    </form>
  );
}
