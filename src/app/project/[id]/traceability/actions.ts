"use server";

import { revalidatePath } from "next/cache";
import {
  createStakeholder,
  deleteStakeholder,
  upsertStandup,
  type StakeholderLevel,
  type StakeholderSentiment,
} from "@/services/traceability";

export type ActionState = { ok: boolean; error?: string };

function revalidateTraceability(projectId: string) {
  revalidatePath(`/project/${projectId}/stakeholders`);
  revalidatePath(`/project/${projectId}/standups`);
  revalidatePath(`/project/${projectId}/traceability`);
  revalidatePath(`/project/${projectId}`);
  revalidatePath("/workspace/standups");
  revalidatePath("/workspace/dashboard");
}

export async function createStakeholderAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") ?? "");
  const name = String(formData.get("name") ?? "");

  if (!projectId || !name.trim()) {
    return { ok: false, error: "Name is required." };
  }

  try {
    await createStakeholder({
      projectId,
      name,
      roleLabel: String(formData.get("roleLabel") ?? ""),
      organisationName: String(formData.get("organisationName") ?? ""),
      email: String(formData.get("email") ?? ""),
      influence: String(formData.get("influence") ?? "medium") as StakeholderLevel,
      interest: String(formData.get("interest") ?? "medium") as StakeholderLevel,
      sentiment: String(formData.get("sentiment") ?? "neutral") as StakeholderSentiment,
      notes: String(formData.get("notes") ?? ""),
    });
    revalidateTraceability(projectId);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to add stakeholder",
    };
  }
}

export async function deleteStakeholderAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") ?? "");
  const id = String(formData.get("id") ?? "");

  if (!projectId || !id) {
    return { ok: false, error: "Missing stakeholder." };
  }

  try {
    await deleteStakeholder(id);
    revalidateTraceability(projectId);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to remove stakeholder",
    };
  }
}

export async function submitStandupAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") ?? "");
  const yesterday = String(formData.get("yesterday") ?? "");
  const today = String(formData.get("today") ?? "");
  const blockers = String(formData.get("blockers") ?? "");

  if (!projectId || !today.trim()) {
    return { ok: false, error: "Today's plan is required." };
  }

  try {
    await upsertStandup({ projectId, yesterday, today, blockers });
    revalidateTraceability(projectId);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to save standup",
    };
  }
}
