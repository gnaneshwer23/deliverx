"use server";

import { revalidatePath } from "next/cache";
import { createBenefit, updateBenefitCurrent } from "@/services/benefits";

export type ActionState = { ok: boolean; error?: string };

export async function createBenefitAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!projectId || !title) return { ok: false, error: "Title is required" };

  try {
    await createBenefit({
      projectId,
      title,
      description: String(formData.get("description") ?? "") || undefined,
      kpiName: String(formData.get("kpiName") ?? "") || undefined,
      baselineValue: parseOptionalNumber(formData.get("baselineValue")),
      targetValue: parseOptionalNumber(formData.get("targetValue")),
      currentValue: parseOptionalNumber(formData.get("currentValue")),
      unit: String(formData.get("unit") ?? "") || undefined,
    });
    revalidatePath(`/project/${projectId}/benefits`);
    revalidatePath(`/project/${projectId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create benefit" };
  }
}

export async function updateBenefitCurrentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") ?? "");
  const id = String(formData.get("id") ?? "");
  const current = parseOptionalNumber(formData.get("currentValue"));
  if (!id || current == null) return { ok: false, error: "Current value is required" };

  try {
    await updateBenefitCurrent(id, current);
    revalidatePath(`/project/${projectId}/benefits`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Update failed" };
  }
}

function parseOptionalNumber(raw: FormDataEntryValue | null): number | undefined {
  const s = String(raw ?? "").trim();
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}
