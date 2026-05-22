"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { deleteStakeholderAction, type ActionState } from "../traceability/actions";

const initial: ActionState = { ok: false };

export function DeleteStakeholderButton({
  projectId,
  stakeholderId,
}: {
  projectId: string;
  stakeholderId: string;
}) {
  const [state, action, pending] = useActionState(deleteStakeholderAction, initial);

  return (
    <form action={action}>
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="id" value={stakeholderId} />
      <button
        type="submit"
        disabled={pending}
        title="Remove stakeholder"
        className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
      >
        <Trash2 size={14} />
      </button>
      {state.error ? <p className="mt-1 text-[10px] text-rose-600">{state.error}</p> : null}
    </form>
  );
}
