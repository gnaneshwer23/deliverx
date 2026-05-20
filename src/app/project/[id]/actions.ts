"use server";

import { revalidatePath } from "next/cache";
import { onProjectClose } from "@/services/memory";

export type ExtractResult =
  | { ok: true; insights: number; playbookId: string }
  | { ok: false; error: string };

export async function extractInsightsAction(
  projectId: string,
): Promise<ExtractResult> {
  try {
    const { insights, playbook } = await onProjectClose(projectId);
    revalidatePath(`/project/${projectId}`);
    revalidatePath("/workspace/memory");
    revalidatePath("/workspace/playbooks");
    return { ok: true, insights: insights.length, playbookId: playbook.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Extraction failed",
    };
  }
}
