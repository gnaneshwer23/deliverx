"use server";

import { revalidatePath } from "next/cache";
import {
  assignProjectToProgramme,
  createDependency,
  createProgramme,
  deleteDependency,
  ensureDefaultPortfolio,
} from "@/services/portfolio";

export async function createProgrammeAction(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name is required" };

  const portfolioFromForm =
    ((formData.get("portfolio_id") as string) || "").trim() || null;

  let portfolioId = portfolioFromForm;
  if (!portfolioId) {
    const portfolio = await ensureDefaultPortfolio();
    portfolioId = portfolio.id;
  }

  const strategicGoal =
    ((formData.get("strategic_goal") as string) || "").trim() || null;
  const status =
    (formData.get("status") as
      | "planning"
      | "active"
      | "paused"
      | "completed"
      | "cancelled") ?? "active";

  try {
    await createProgramme({
      portfolioId,
      name,
      strategicGoal,
      status,
    });
    revalidatePath("/workspace/programmes");
    revalidatePath("/workspace/portfolio");
    return { ok: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to create programme",
    };
  }
}

export async function assignProjectAction(formData: FormData) {
  const projectId = formData.get("project_id") as string;
  const programmeId =
    ((formData.get("programme_id") as string) || "").trim() || null;
  if (!projectId) return { error: "Project required" };

  try {
    await assignProjectToProgramme(projectId, programmeId);
    revalidatePath("/workspace/programmes");
    if (programmeId) revalidatePath(`/workspace/programmes/${programmeId}`);
    return { ok: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to assign project",
    };
  }
}

export async function createDependencyAction(formData: FormData) {
  const source = formData.get("source_project_id") as string;
  const target = formData.get("target_project_id") as string;
  const type =
    (formData.get("dependency_type") as
      | "blocks"
      | "depends_on"
      | "shares_resource"
      | "data_handoff") ?? "depends_on";
  const severity =
    (formData.get("severity") as "low" | "medium" | "high" | "critical") ??
    "medium";
  const description =
    ((formData.get("description") as string) || "").trim() || null;
  const programmeId = formData.get("programme_id") as string | null;

  if (!source || !target) return { error: "Source and target are required" };
  if (source === target) {
    return { error: "Source and target must be different projects" };
  }

  try {
    await createDependency({
      sourceProjectId: source,
      targetProjectId: target,
      dependencyType: type,
      severity,
      description,
    });
    if (programmeId) revalidatePath(`/workspace/programmes/${programmeId}`);
    revalidatePath("/workspace/pmo");
    return { ok: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to create dependency",
    };
  }
}

export async function deleteDependencyAction(formData: FormData) {
  const id = formData.get("id") as string;
  const programmeId = formData.get("programme_id") as string | null;
  if (!id) return { error: "Dependency id required" };
  try {
    await deleteDependency(id);
    if (programmeId) revalidatePath(`/workspace/programmes/${programmeId}`);
    revalidatePath("/workspace/pmo");
    return { ok: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to delete dependency",
    };
  }
}
