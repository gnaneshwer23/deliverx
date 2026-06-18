"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ProjectStructureDraft } from "@/services/aiProjectStructuring";
import {
  parseBusinessCaseReviewJson,
  type BusinessCaseReview,
} from "@/services/aiBusinessCaseReview";
import { saveBusinessCaseReview } from "@/services/businessCaseReview";
import { bootstrapProjectWorkspaces } from "@/services/projectBootstrap";
import { emitPlatformEvent } from "@/services/platformWebhooks";

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
  const brief = String(formData.get("brief") ?? "").trim();
  const bcReportRaw = String(formData.get("bc_report") ?? "").trim();
  const bcGoAccepted = formData.get("bc_go_accepted") === "true";
  const discoveryAnswersRaw = String(formData.get("discovery_answers") ?? "").trim();
  const publish = formData.get("publish") === "on";

  if (!name) return { ok: false, error: "Project name is required." };

  let bcReport: BusinessCaseReview | null = null;
  if (bcReportRaw) {
    try {
      bcReport = parseBusinessCaseReviewJson(bcReportRaw);
    } catch {
      return { ok: false, error: "Invalid business case report." };
    }

    if (!bcGoAccepted) {
      return {
        ok: false,
        error: "Accept the GO recommendation before creating a project from a reviewed business case.",
      };
    }

    if (bcReport.recommendation === "no_go") {
      return {
        ok: false,
        error: "No-Go business cases cannot proceed through the sponsor gateway.",
      };
    }
  }

  let discoveryAnswers: Record<string, string> | undefined;
  if (discoveryAnswersRaw) {
    try {
      discoveryAnswers = JSON.parse(discoveryAnswersRaw) as Record<string, string>;
    } catch {
      return { ok: false, error: "Invalid discovery answers." };
    }
  }

  let aiDraft: ProjectStructureDraft | null = null;
  if (aiDraftRaw) {
    try {
      aiDraft = JSON.parse(aiDraftRaw) as ProjectStructureDraft;
    } catch {
      return { ok: false, error: "Invalid AI structure draft." };
    }
  }

  const shouldBootstrap = bcGoAccepted && Boolean(brief);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id, organisations(name)")
    .single();

  if (!profile?.organisation_id) {
    return { ok: false, error: "Create an organisation first." };
  }

  const orgName =
    (profile.organisations as { name?: string } | null)?.name ?? null;

  const insert: Record<string, unknown> = {
    organisation_id: profile.organisation_id,
    created_by: user.id,
    name,
    goal,
    delivery_type: deliveryType,
    timeline,
    status: publish ? "active" : "draft",
    published_at: publish ? new Date().toISOString() : null,
    bootstrap_status: shouldBootstrap ? "running" : "skipped",
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

  if (bcGoAccepted) {
    void emitPlatformEvent(String(profile.organisation_id), "project.go_accepted", {
      projectId: project.id,
      projectName: name,
      recommendation: bcReport?.recommendation ?? "go",
      deliveryType,
      source: "business_case_gateway",
    }).catch(() => undefined);
  }

  if (bcReport) {
    try {
      await saveBusinessCaseReview({
        briefExcerpt: brief || name,
        report: bcReport,
        projectId: project.id,
        goDecision: "accepted",
      });
    } catch (err) {
      return {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : "Project created but business case audit failed to save.",
      };
    }
  }

  if (shouldBootstrap) {
    try {
      await bootstrapProjectWorkspaces({
        projectId: project.id,
        projectName: name,
        brief,
        goal,
        deliveryType,
        timeline,
        discoveryAnswers,
        bcReport,
        structureDraft: aiDraft,
        orgName,
      });
      revalidatePath("/workspace/dashboard");
      revalidatePath("/workspace/tasks");
      revalidatePath("/workspace/founder");
      revalidatePath("/workspace/product");
      revalidatePath("/workspace/ba");
      revalidatePath("/workspace/pm-mission");
      revalidatePath("/workspace/engineer");
      revalidatePath("/workspace/scrum-mission");
      revalidatePath("/workspace/qa");
    } catch (err) {
      return {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : "Project created but workspace bootstrap failed. Retry from the project overview.",
      };
    }
  } else if (aiDraft) {
    const { applyProjectStructure } = await import("@/services/applyProjectStructure");
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
