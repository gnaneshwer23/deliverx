"use server";

import { revalidatePath } from "next/cache";
import { applyRebalanceSuggestion, type RebalanceSuggestion } from "@/services/capacity";

export type ActionState = { ok: boolean; error?: string; moved?: number };

export async function applyRebalanceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const suggestion: RebalanceSuggestion = {
    id: String(formData.get("id") ?? ""),
    fromUserId: String(formData.get("fromUserId") ?? ""),
    fromName: String(formData.get("fromName") ?? ""),
    toUserId: String(formData.get("toUserId") ?? ""),
    toName: String(formData.get("toName") ?? ""),
    reason: String(formData.get("reason") ?? ""),
    taskCount: Number(formData.get("taskCount") ?? 1),
  };

  if (!suggestion.fromUserId || !suggestion.toUserId) {
    return { ok: false, error: "Invalid suggestion" };
  }

  try {
    const { moved } = await applyRebalanceSuggestion(suggestion);
    revalidatePath("/workspace/capacity");
    revalidatePath("/workspace/tasks");
    return { ok: true, moved };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Rebalance failed",
    };
  }
}
