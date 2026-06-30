/**
 * Invite accept — seed a role workspace from the project business case / charter.
 * Mirrors persona jobs in projectBootstrap.ts without re-running full GO bootstrap.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { AiConfigError } from "@/lib/ai/anthropic";
import { extractRequirementsFromContent } from "@/services/aiBaRequirements";
import { extractProductFromContent } from "@/services/aiPmProduct";
import { analyseDeliveryForProject } from "@/services/aiDeliveryPm";
import { analyseEngineerWorkspace } from "@/services/aiEngineer";
import { analyseScrumWorkspace } from "@/services/aiScrum";
import { analyseQaWorkspace } from "@/services/aiQa";
import { analyseFounderContext } from "@/services/aiFounder";
import { getRequirementStats } from "@/services/baRequirements";
import { getPmDeliveryContext } from "@/services/deliveryPmContext";
import { getPmProductContext } from "@/services/pmProduct";
import { getActiveCharter } from "@/services/charter";
import { getFounderContext } from "@/services/founderContext";
import { refreshProjectDashboards } from "@/lib/dashboard-refresh";
import type { PersonaHomeRole } from "@/config/role-home-routing";

export type BootstrapRoleWorkspaceResult = {
  role: string;
  seeded: boolean;
  skipped: boolean;
  reason?: string;
  error?: string;
};

async function loadProjectMeta(projectId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .select("id, name, delivery_type, organisation_id")
    .eq("id", projectId)
    .maybeSingle();

  if (error || !data) throw new Error("Project not found.");
  return data as {
    id: string;
    name: string;
    delivery_type: string | null;
    organisation_id: string;
  };
}

async function roleWorkspaceAlreadySeeded(
  projectId: string,
  role: string,
): Promise<boolean> {
  switch (role) {
    case "ba": {
      const stats = await getRequirementStats(projectId).catch(() => null);
      return (stats?.extracted ?? 0) > 0;
    }
    case "product_manager": {
      const ctx = await getPmProductContext(projectId).catch(() => null);
      return ctx?.extraction_status === "complete";
    }
    case "pm": {
      const ctx = await getPmDeliveryContext(projectId).catch(() => null);
      return ctx?.extraction_status === "complete";
    }
    case "executive": {
      const ctx = await getFounderContext().catch(() => null);
      return ctx?.extraction_status === "complete";
    }
    default:
      return false;
  }
}

async function runRoleSeed(input: {
  role: string;
  projectId: string;
  projectName: string;
  deliveryType: string | null;
  content: string;
}): Promise<void> {
  switch (input.role) {
    case "ba":
      await extractRequirementsFromContent({
        projectId: input.projectId,
        projectName: input.projectName,
        projectType: input.deliveryType,
        content: input.content,
        requireApproval: true,
      });
      return;
    case "product_manager":
      await extractProductFromContent({
        projectId: input.projectId,
        projectName: input.projectName,
        productType: input.deliveryType,
        content: input.content,
        requireApproval: true,
      });
      return;
    case "pm":
      await analyseDeliveryForProject({
        projectId: input.projectId,
        projectName: input.projectName,
        projectType: input.deliveryType,
        extraContent: input.content,
      });
      return;
    case "engineer":
      await analyseEngineerWorkspace({
        projectId: input.projectId,
        projectName: input.projectName,
        extraContent: input.content,
      });
      return;
    case "scrum_master":
      await analyseScrumWorkspace({
        projectId: input.projectId,
        projectName: input.projectName,
        extraContent: input.content,
      });
      return;
    case "qa":
      await analyseQaWorkspace({
        projectId: input.projectId,
        projectName: input.projectName,
        extraContent: input.content,
      });
      return;
    case "executive": {
      const founderCtx = await getFounderContext().catch(() => null);
      await analyseFounderContext({
        orgName: undefined,
        companyType: founderCtx?.company_type,
        businessGoals: founderCtx?.business_goals,
        extraContent: input.content,
      });
      return;
    }
    case "team_member":
      return;
    default:
      throw new Error(`Unsupported invite role: ${input.role}`);
  }
}

export async function bootstrapRoleWorkspace(input: {
  projectId: string;
  role: PersonaHomeRole | "team_member" | string;
}): Promise<BootstrapRoleWorkspaceResult> {
  const role = input.role;

  if (role === "team_member") {
    return { role, seeded: false, skipped: true, reason: "No role workspace for team_member." };
  }

  const charter = await getActiveCharter(input.projectId).catch(() => null);
  const content = charter?.content?.trim();
  if (!content) {
    return {
      role,
      seeded: false,
      skipped: true,
      reason: "No business case uploaded yet — workspace will populate when the PM adds one.",
    };
  }

  if (await roleWorkspaceAlreadySeeded(input.projectId, role)) {
    return {
      role,
      seeded: false,
      skipped: true,
      reason: "Role workspace already seeded for this project.",
    };
  }

  const project = await loadProjectMeta(input.projectId);

  try {
    await runRoleSeed({
      role,
      projectId: project.id,
      projectName: project.name,
      deliveryType: project.delivery_type,
      content,
    });
    refreshProjectDashboards(input.projectId);
    return { role, seeded: true, skipped: false };
  } catch (err) {
    if (err instanceof AiConfigError) {
      return {
        role,
        seeded: false,
        skipped: true,
        reason: "AI not configured — workspace will populate when OPENAI_API_KEY is set.",
      };
    }
    return {
      role,
      seeded: false,
      skipped: false,
      error: err instanceof Error ? err.message : "Role workspace bootstrap failed.",
    };
  }
}
