/**
 * GO-triggered workspace bootstrap — structure apply + persona context seeding.
 */

import { createClient } from "@/lib/supabase/server";
import type { BusinessCaseReview } from "./aiBusinessCaseReview";
import { extractRequirementsFromContent } from "./aiBaRequirements";
import { extractProductFromContent } from "./aiPmProduct";
import { analyseDeliveryForProject } from "./aiDeliveryPm";
import { analyseEngineerWorkspace } from "./aiEngineer";
import { analyseScrumWorkspace } from "./aiScrum";
import { analyseQaWorkspace } from "./aiQa";
import { analyseFounderContext } from "./aiFounder";
import {
  structureProjectFromBrief,
  type ProjectStructureDraft,
} from "./aiProjectStructuring";
import { queueArtifactReview } from "./artifactReviews";
import { upsertCharter } from "./charter";
import { getFounderContext } from "./founderContext";
import { emitPlatformEvent } from "./platformWebhooks";

export type BootstrapStatus = "pending" | "running" | "complete" | "partial" | "skipped";

export type PersonaBootstrapResult = {
  ok: boolean;
  error?: string;
};

export type ProjectBootstrapSummary = {
  structure?: {
    workstreams: number;
    tasks: number;
    raidItems: number;
    milestones: number;
    stakeholders: number;
    pendingApproval?: boolean;
  };
  personas: Record<string, PersonaBootstrapResult>;
  pendingArtifactReviews?: number;
};

export type BootstrapProjectInput = {
  projectId: string;
  projectName: string;
  brief: string;
  goal?: string | null;
  deliveryType?: string | null;
  timeline?: string | null;
  discoveryAnswers?: Record<string, string>;
  bcReport?: BusinessCaseReview | null;
  structureDraft?: ProjectStructureDraft | null;
  orgName?: string | null;
};

function buildBootstrapContent(
  brief: string,
  bcReport?: BusinessCaseReview | null,
  goal?: string | null,
): string {
  const parts = [brief.trim()];
  if (goal?.trim()) parts.push(`Goal: ${goal.trim()}`);
  if (bcReport) {
    parts.push(
      `Executive summary: ${bcReport.executiveSummary}`,
      `Recommendation: ${bcReport.recommendation} (${bcReport.recommendationConfidence}% confidence)`,
    );
    if (bcReport.recommendationReasons.length) {
      parts.push(`Rationale:\n${bcReport.recommendationReasons.map((r) => `- ${r}`).join("\n")}`);
    }
    if (bcReport.gaps.length) {
      parts.push(`Gaps:\n${bcReport.gaps.map((g) => `- ${g}`).join("\n")}`);
    }
    if (bcReport.initialRisks.length) {
      parts.push(`Initial risks:\n${bcReport.initialRisks.map((r) => `- ${r}`).join("\n")}`);
    }
  }
  return parts.filter(Boolean).join("\n\n");
}

function mergeRaidFromReport(
  draft: ProjectStructureDraft,
  bcReport?: BusinessCaseReview | null,
): ProjectStructureDraft {
  if (!bcReport?.raidSeed?.length) return draft;

  const existing = new Set(draft.raidItems.map((r) => r.title.trim().toLowerCase()));
  const extra = bcReport.raidSeed
    .filter((r) => !existing.has(r.title.trim().toLowerCase()))
    .map((r) => ({
      type: r.type,
      title: r.title,
      description: `Seeded from business case review (${r.severity} severity).`,
      severity:
        r.severity === "high"
          ? ("high" as const)
          : r.severity === "low"
            ? ("low" as const)
            : ("medium" as const),
    }));

  return { ...draft, raidItems: [...draft.raidItems, ...extra] };
}

async function updateBootstrapStatus(
  projectId: string,
  status: BootstrapStatus,
  summary?: ProjectBootstrapSummary,
): Promise<void> {
  const supabase = await createClient();
  const patch: Record<string, unknown> = {
    bootstrap_status: status,
  };
  if (summary) patch.bootstrap_summary = summary;
  if (status === "complete" || status === "partial") {
    patch.bootstrapped_at = new Date().toISOString();
  }

  await supabase.from("projects").update(patch).eq("id", projectId);
}

export async function bootstrapProjectWorkspaces(
  input: BootstrapProjectInput,
): Promise<ProjectBootstrapSummary> {
  const summary: ProjectBootstrapSummary = { personas: {} };

  await updateBootstrapStatus(input.projectId, "running");

  try {
    const content = buildBootstrapContent(input.brief, input.bcReport, input.goal);

    await upsertCharter({
      projectId: input.projectId,
      title: `${input.projectName} — business case`,
      content,
      extractedGoals: input.goal ? [input.goal] : input.bcReport?.recommendationReasons?.slice(0, 3),
      scopeSummary: input.bcReport?.executiveSummary ?? input.goal ?? undefined,
    });

    let draft = input.structureDraft;
    if (!draft) {
      draft = await structureProjectFromBrief({
        brief: input.brief,
        projectName: input.projectName,
        deliveryType: input.deliveryType,
        goal: input.goal,
        discoveryAnswers: input.discoveryAnswers,
      });
    }
    draft = mergeRaidFromReport(draft, input.bcReport);

    await queueArtifactReview({
      projectId: input.projectId,
      entityType: "structure_bundle",
      title: "Delivery structure from business case",
      summary: `${draft.workstreams.length} workstreams, ${draft.tasks.length} tasks, ${draft.raidItems.length} RAID items — approve to apply.`,
      source: "bootstrap",
      payload: { draft },
    });

    summary.structure = {
      workstreams: draft.workstreams.length,
      tasks: draft.tasks.length,
      raidItems: draft.raidItems.length,
      milestones: draft.milestones.length,
      stakeholders: draft.stakeholders.length,
      pendingApproval: true,
    };

    const founderCtx = await getFounderContext().catch(() => null);

    const personaJobs: Array<{ key: string; run: () => Promise<unknown> }> = [
      {
        key: "ba",
        run: () =>
          extractRequirementsFromContent({
            projectId: input.projectId,
            projectName: input.projectName,
            projectType: input.deliveryType,
            content,
            requireApproval: true,
          }),
      },
      {
        key: "product",
        run: () =>
          extractProductFromContent({
            projectId: input.projectId,
            projectName: input.projectName,
            productType: input.deliveryType,
            content,
            requireApproval: true,
          }),
      },
      {
        key: "pm",
        run: () =>
          analyseDeliveryForProject({
            projectId: input.projectId,
            projectName: input.projectName,
            projectType: input.deliveryType,
            extraContent: content,
          }),
      },
      {
        key: "engineer",
        run: () =>
          analyseEngineerWorkspace({
            projectId: input.projectId,
            projectName: input.projectName,
            extraContent: content,
          }),
      },
      {
        key: "scrum",
        run: () =>
          analyseScrumWorkspace({
            projectId: input.projectId,
            projectName: input.projectName,
            extraContent: content,
          }),
      },
      {
        key: "qa",
        run: () =>
          analyseQaWorkspace({
            projectId: input.projectId,
            projectName: input.projectName,
            extraContent: content,
          }),
      },
      {
        key: "founder",
        run: () =>
          analyseFounderContext({
            orgName: input.orgName ?? undefined,
            companyType: founderCtx?.company_type,
            businessGoals: founderCtx?.business_goals,
            extraContent: content,
          }),
      },
    ];

    const results = await Promise.allSettled(personaJobs.map((job) => job.run()));

    results.forEach((result, index) => {
      const key = personaJobs[index].key;
      if (result.status === "fulfilled") {
        summary.personas[key] = { ok: true };
      } else {
        summary.personas[key] = {
          ok: false,
          error: result.reason instanceof Error ? result.reason.message : "Bootstrap failed",
        };
      }
    });

    summary.pendingArtifactReviews = 3;

    const failed = Object.values(summary.personas).filter((p) => !p.ok).length;
    const status: BootstrapStatus = failed === 0 ? "complete" : "partial";
    await updateBootstrapStatus(input.projectId, status, summary);

    const supabase = await createClient();
    const { data: projectRow } = await supabase
      .from("projects")
      .select("organisation_id, name")
      .eq("id", input.projectId)
      .maybeSingle();

    if (projectRow?.organisation_id) {
      void emitPlatformEvent(String(projectRow.organisation_id), "project.bootstrap_complete", {
        projectId: input.projectId,
        projectName: input.projectName,
        status,
        personaCount: Object.keys(summary.personas).length,
        failedPersonas: failed,
        source: "sponsor_gateway",
      }).catch(() => undefined);
    }

    return summary;
  } catch (err) {
    summary.personas.bootstrap = {
      ok: false,
      error: err instanceof Error ? err.message : "Structure bootstrap failed",
    };
    await updateBootstrapStatus(input.projectId, "partial", summary);
    throw err;
  }
}

export async function getProjectBootstrapStatus(projectId: string): Promise<{
  status: BootstrapStatus;
  summary: ProjectBootstrapSummary;
  bootstrappedAt: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("bootstrap_status, bootstrap_summary, bootstrapped_at")
    .eq("id", projectId)
    .single();

  if (error || !data) {
    return { status: "pending", summary: { personas: {} }, bootstrappedAt: null };
  }

  return {
    status: (data.bootstrap_status as BootstrapStatus) ?? "pending",
    summary: (data.bootstrap_summary as ProjectBootstrapSummary) ?? { personas: {} },
    bootstrappedAt: data.bootstrapped_at as string | null,
  };
}
