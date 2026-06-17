/**
 * BA Mission Control dashboard aggregator.
 */

import { createClient } from "@/lib/supabase/server";
import { listProjectsForOrg } from "./portfolio";
import { getOrgGovernanceStats } from "./governance";
import {
  buildCrossRoleImpact,
  buildGuidedTasks,
  buildStakeholderConnections,
  computeDeliveryImpact,
  computeTraceabilityScore,
  type CrossRoleImpact,
  type GuidedTask,
} from "./baRequirementEngine";
import {
  buildTraceabilityMatrix,
  getBaProjectContext,
  getRequirementStats,
  type BaProjectContext,
} from "./baRequirements";

export type BaMissionControl = {
  userName: string | null;
  primaryProject: { id: string; name: string } | null;
  projects: Array<{ id: string; name: string; status: string }>;
  kpis: {
    extracted: number;
    approved: number;
    pendingClarification: number;
    stakeholderReviewsPending: number;
    storiesReady: number;
    traceabilityScore: number;
    deliveryImpact: "Low" | "Medium" | "High";
    deliveryImpactTone: "green" | "amber" | "red";
  };
  aiSummary: string;
  guidedTasks: GuidedTask[];
  stakeholderConnections: ReturnType<typeof buildStakeholderConnections>;
  crossRoleImpact: CrossRoleImpact[];
  context: BaProjectContext | null;
  traceabilityPreview: Awaited<ReturnType<typeof buildTraceabilityMatrix>>;
  orgTotals: {
    totalRequirements: number;
    totalProjects: number;
  };
};

export async function getBaMissionControl(
  projectId?: string,
): Promise<BaMissionControl> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("name, role, organisation_id")
    .maybeSingle();

  const projects = await listProjectsForOrg().catch(() => []);
  const active = projects.filter((p) => p.status === "active");
  const primary =
    active.find((p) => p.id === projectId) ??
    active[0] ??
    projects[0] ??
    null;

  let stats = {
    extracted: 0,
    approved: 0,
    pendingClarification: 0,
    openClarifications: 0,
    stakeholderReviewsPending: 0,
    storiesReady: 0,
    linkedTasks: 0,
    clarifications: [] as Awaited<
      ReturnType<typeof getRequirementStats>
    >["clarifications"],
  };
  let context: BaProjectContext | null = null;
  let traceabilityPreview: Awaited<ReturnType<typeof buildTraceabilityMatrix>> = [];
  let aiSummary =
    "Upload a business case or charter, then run AI requirement extraction to populate your mission control.";

  if (primary) {
    const [projectStats, projectContext, matrix] = await Promise.all([
      getRequirementStats(primary.id).catch(() => null),
      getBaProjectContext(primary.id).catch(() => null),
      buildTraceabilityMatrix(primary.id).catch(() => []),
    ]);

    if (projectStats) {
      stats = {
        extracted: projectStats.extracted,
        approved: projectStats.approved,
        pendingClarification: projectStats.pendingClarification,
        openClarifications: projectStats.openClarifications,
        stakeholderReviewsPending: projectStats.stakeholderReviewsPending,
        storiesReady: projectStats.storiesReady,
        linkedTasks: projectStats.linkedTasks,
        clarifications: projectStats.clarifications,
      };
    }
    context = projectContext;
    traceabilityPreview = matrix.slice(0, 6);

    const ctxSummary = projectContext?.business_context?.aiSummary;
    if (typeof ctxSummary === "string" && ctxSummary.trim()) {
      aiSummary = ctxSummary;
    } else if (stats.openClarifications > 0) {
      aiSummary = `Your highest priority is resolving ${stats.openClarifications} open clarification${stats.openClarifications === 1 ? "" : "s"} before sprint planning.${stats.pendingClarification > 0 ? ` Engineering may be blocked on ${stats.pendingClarification} requirement${stats.pendingClarification === 1 ? "" : "s"}.` : ""}`;
    } else if (stats.extracted > 0) {
      aiSummary = `${stats.approved} of ${stats.extracted} requirements approved · ${stats.storiesReady} stories ready for handoff.`;
    }
  }

  const governance = await getOrgGovernanceStats().catch(() => ({
    pendingDecisions: 0,
    openRisks: 0,
  }));

  const requirementsReadiness =
    stats.extracted > 0 ? Math.round((stats.approved / stats.extracted) * 100) : 0;

  const traceScore = computeTraceabilityScore({
    requirements: stats.extracted,
    approvedRequirements: stats.approved,
    stories: stats.storiesReady,
    linkedTasks: stats.linkedTasks,
  });

  const impact = computeDeliveryImpact(
    stats.openClarifications,
    stats.clarifications.filter((c) => c.blocks?.toLowerCase().includes("engineer")).length,
  );

  let orgTotalRequirements = 0;
  for (const p of active.slice(0, 10)) {
    try {
      const s = await getRequirementStats(p.id);
      orgTotalRequirements += s.extracted;
    } catch {
      /* skip */
    }
  }

  return {
    userName: profile?.name ?? user?.email ?? null,
    primaryProject: primary ? { id: primary.id, name: primary.name } : null,
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status ?? "active",
    })),
    kpis: {
      extracted: stats.extracted,
      approved: stats.approved,
      pendingClarification: stats.pendingClarification,
      stakeholderReviewsPending: stats.stakeholderReviewsPending,
      storiesReady: stats.storiesReady,
      traceabilityScore: traceScore,
      deliveryImpact: impact.label,
      deliveryImpactTone: impact.tone,
    },
    aiSummary,
    guidedTasks: buildGuidedTasks(stats.clarifications),
    stakeholderConnections: buildStakeholderConnections({
      clarificationsOpen: stats.openClarifications,
      storiesReady: stats.storiesReady,
      requirementsApproved: stats.approved,
      requirementsTotal: stats.extracted,
    }),
    crossRoleImpact: buildCrossRoleImpact({
      storiesReady: stats.storiesReady,
      requirementsReadiness,
      openClarifications: stats.openClarifications,
      pendingDecisions: governance.pendingDecisions,
    }),
    context,
    traceabilityPreview,
    orgTotals: {
      totalRequirements: orgTotalRequirements,
      totalProjects: active.length,
    },
  };
}
