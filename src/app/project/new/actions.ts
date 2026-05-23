"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ProjectStructureDraft } from "@/services/aiProjectStructuring";
import { applyProjectStructure } from "@/services/applyProjectStructure";

export type ProjectState = { ok: boolean; error?: string };

export async function createProjectDraftAction(
  _prev: ProjectState,
  formData: FormData,
): Promise<ProjectState> {
  const name = String(formData.get("project_name") ?? "").trim();
  const goal = String(formData.get("goal") ?? "").trim() || null;
  const deliveryType = String(formData.get("delivery_type") ?? "").trim() || null;
  const timeline = String(formData.get("timeline") ?? "").trim() || null;
  const playbookId = String(formData.get("playbook_id") ?? "").trim() || null;
  const aiDraftRaw = String(formData.get("ai_draft") ?? "").trim();
  const publish = formData.get("publish") === "on";

  if (!name) return { ok: false, error: "Project name is required." };

  let aiDraft: ProjectStructureDraft | null = null;
  if (aiDraftRaw) {
    try {
      aiDraft = JSON.parse(aiDraftRaw) as ProjectStructureDraft;
    } catch {
      return { ok: false, error: "Invalid AI structure draft." };
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .single();

  if (!profile?.organisation_id) {
    return { ok: false, error: "Create an organisation first." };
  }

  const insert: Record<string, unknown> = {
    organisation_id: profile.organisation_id,
    created_by: user.id,
    name,
    goal,
    delivery_type: deliveryType,
    timeline,
    status: publish ? "active" : "draft",
    published_at: publish ? new Date().toISOString() : null,
  };
  if (playbookId) insert.applied_playbook_id = playbookId;

  const { data: project, error } = await supabase
    .from("projects")
    .insert(insert)
    .select("id")
    .single();

  if (error || !project) {
    return { ok: false, error: error?.message ?? "Failed to create project." };
  }

  if (aiDraft) {
    try {
      await applyProjectStructure(project.id, aiDraft);
      revalidatePath("/workspace/dashboard");
      revalidatePath("/workspace/tasks");
    } catch (err) {
      return {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : "Project created but AI structure failed to apply.",
      };
    }
  }

  redirect(`/project/${project.id}`);
}
