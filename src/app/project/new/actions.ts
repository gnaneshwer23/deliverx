"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ProjectState = { ok: boolean; error?: string };

export async function createProjectDraftAction(
  _prev: ProjectState,
  formData: FormData,
): Promise<ProjectState> {
  const name = String(formData.get("project_name") ?? "").trim();
  const goal = String(formData.get("goal") ?? "").trim() || null;
  const deliveryType = String(formData.get("delivery_type") ?? "").trim() || null;
  const timeline = String(formData.get("timeline") ?? "").trim() || null;

  if (!name) return { ok: false, error: "Project name is required." };

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

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      organisation_id: profile.organisation_id,
      created_by: user.id,
      name,
      goal,
      delivery_type: deliveryType,
      timeline,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !project) {
    return { ok: false, error: error?.message ?? "Failed to create project." };
  }

  redirect(`/workspace/dashboard?welcome=${project.id}`);
}
