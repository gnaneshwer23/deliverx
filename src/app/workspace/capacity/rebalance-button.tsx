"use client";

import { useActionState } from "react";
import { applyRebalanceAction, type ActionState } from "./actions";
import type { RebalanceSuggestion } from "@/services/capacity";

const initial: ActionState = { ok: false };

export function RebalanceButton({ suggestion }: { suggestion: RebalanceSuggestion }) {
  const [state, action, pending] = useActionState(applyRebalanceAction, initial);

  return (
    <form action={action} className="mt-2">
      <input type="hidden" name="id" value={suggestion.id} />
      <input type="hidden" name="fromUserId" value={suggestion.fromUserId} />
      <input type="hidden" name="fromName" value={suggestion.fromName} />
      <input type="hidden" name="toUserId" value={suggestion.toUserId} />
      <input type="hidden" name="toName" value={suggestion.toName} />
      <input type="hidden" name="reason" value={suggestion.reason} />
      <input type="hidden" name="taskCount" value={suggestion.taskCount} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs font-medium text-[#1C4A2E] underline disabled:opacity-60"
      >
        {pending ? "Applying…" : "Apply rebalance"}
      </button>
      {state.ok && state.moved != null ? (
        <p className="mt-1 text-xs text-[#1C4A2E]">Moved {state.moved} task(s).</p>
      ) : null}
      {state.error ? <p className="mt-1 text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}
