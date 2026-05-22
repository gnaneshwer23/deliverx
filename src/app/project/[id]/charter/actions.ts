"use server";

import { revalidatePath } from "next/cache";
import { upsertCharter } from "@/services/charter";
import { extractCharterFields } from "@/services/aiCharterAlignment";
import { computeProjectAlignment } from "@/services/alignment";

export type ActionState = { ok: boolean; error?: string };

function revalidateCharter(projectId: string) {
  revalidatePath(`/project/${projectId}`);
  revalidatePath(`/project/${projectId}/charter`);
  revalidatePath("/workspace/dashboard");
}

export async function saveCharterAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const extractWithAi = formData.get("extractWithAi") === "on";

  if (!projectId || !content) {
    return { ok: false, error: "Charter content is required." };
  }

  try {
    let goals: string[] = [];
    let successCriteria: string[] = [];
    let scopeSummary = "";
    let charterTitle = title || "Project charter";

    if (extractWithAi) {
      const extracted = await extractCharterFields(content);
      if (extracted) {
        goals = extracted.goals;
        successCriteria = extracted.successCriteria;
        scopeSummary = extracted.scopeSummary;
        charterTitle = title || extracted.title;
      }
    }

    await upsertCharter({
      projectId,
      title: charterTitle,
      content,
      extractedGoals: goals,
      successCriteria,
      scopeSummary,
    });

    revalidateCharter(projectId);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to save charter",
    };
  }
}

export async function scoreAlignmentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") ?? "");
  if (!projectId) return { ok: false, error: "Missing project." };

  try {
    await computeProjectAlignment(projectId, { source: "manual" });
    revalidateCharter(projectId);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Alignment scoring failed",
    };
  }
}
