"use server";

import { revalidatePath } from "next/cache";
import { createMilestone, updateMilestoneConfidence, type MilestoneStatus } from "@/services/milestones";

export type ActionState = { ok: boolean; error?: string };

export async function createMilestoneAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!projectId || !title) return { ok: false, error: "Title is required" };

  const confidence = Number(formData.get("confidenceScore") ?? 80);
  const status = String(formData.get("status") ?? "planned") as MilestoneStatus;

  try {
    await createMilestone({
      projectId,
      title,
      description: String(formData.get("description") ?? "") || undefined,
      targetDate: String(formData.get("targetDate") ?? "") || undefined,
      confidenceScore: Number.isFinite(confidence) ? confidence : 80,
      status,
    });
    revalidatePath(`/project/${projectId}/milestones`);
    revalidatePath(`/project/${projectId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create milestone" };
  }
}

export async function updateMilestoneAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") ?? "");
  const id = String(formData.get("id") ?? "");
  const confidence = Number(formData.get("confidenceScore"));
  const status = String(formData.get("status") ?? "") as MilestoneStatus | "";
  if (!id || !Number.isFinite(confidence)) {
    return { ok: false, error: "Confidence is required" };
  }

  try {
    await updateMilestoneConfidence(
      id,
      Math.max(0, Math.min(100, confidence)),
      status || undefined,
    );
    revalidatePath(`/project/${projectId}/milestones`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Update failed" };
  }
}
