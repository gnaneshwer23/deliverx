"use client";

import { useActionState } from "react";
import { updateBenefitCurrentAction, type ActionState } from "./actions";

const initial: ActionState = { ok: false };

export function BenefitCurrentForm({
  projectId,
  benefitId,
  currentValue,
}: {
  projectId: string;
  benefitId: string;
  currentValue: number | null;
}) {
  const [state, action, pending] = useActionState(updateBenefitCurrentAction, initial);

  return (
    <form action={action} className="mt-3 flex flex-wrap items-end gap-2">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="id" value={benefitId} />
      <label className="text-xs text-[#6B6B64]">
        Update current
        <input
          name="currentValue"
          type="number"
          step="any"
          defaultValue={currentValue ?? undefined}
          required
          className="ml-2 h-8 w-24 rounded border border-[#E4E4DC] px-2 text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="h-8 rounded border border-[#1C4A2E] px-2 text-xs text-[#1C4A2E] disabled:opacity-60"
      >
        {pending ? "…" : "Save"}
      </button>
      {state.error ? <span className="text-xs text-red-600">{state.error}</span> : null}
    </form>
  );
}
