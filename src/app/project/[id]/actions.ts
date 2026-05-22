"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { onProjectClose } from "@/services/memory";

export type ExtractResult =
  | { ok: true; insights: number; playbookId: string; skipped?: boolean }
  | { ok: false; error: string };

export type ProjectStatus =
  | "draft"
  | "active"
  | "paused"
  | "completed"
  | "archived";

export type StatusResult = { ok: true } | { ok: false; error: string };

export async function extractInsightsAction(
  projectId: string,
): Promise<ExtractResult> {
  try {
    const { insights, playbook, skipped } = await onProjectClose(projectId, {
      force: true,
    });
    revalidatePath(`/project/${projectId}`);
    revalidatePath("/workspace/memory");
    revalidatePath("/workspace/playbooks");
    return {
      ok: true,
      insights: insights.length,
      playbookId: playbook.id,
      skipped,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Extraction failed",
    };
  }
}

export async function updateProjectStatusAction(
  projectId: string,
  status: ProjectStatus,
): Promise<StatusResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { data: project } = await supabase
    .from("projects")
    .select("status")
    .eq("id", projectId)
    .single();

  if (!project) return { ok: false, error: "Project not found" };

  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId);

  if (error) return { ok: false, error: error.message };

  if (status === "completed" && project.status !== "completed") {
    try {
      await onProjectClose(projectId);
      revalidatePath("/workspace/memory");
      revalidatePath("/workspace/playbooks");
    } catch {
      /* closure is best-effort; status update still succeeded */
    }
  }

  revalidatePath(`/project/${projectId}`);
  revalidatePath("/workspace/projects");
  revalidatePath("/workspace/dashboard");
  return { ok: true };
}
