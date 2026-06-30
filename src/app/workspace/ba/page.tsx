import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBaMissionControl } from "@/services/baDashboard";
import { MissionDashboardChrome } from "@/components/dx/mission-dashboard-chrome";
import { BaMissionShell } from "@/components/ba/ba-mission-shell";
import { BaDashboardLayout } from "@/components/ba/ba-dashboard-layout";
import { BaHandoffKpiStrip } from "@/components/ba/ba-handoff-kpi-strip";
import { BaTraceabilityMatrixPanel } from "@/components/ba/ba-traceability-matrix-panel";
import { BaClarificationQueue } from "@/components/ba/ba-clarification-queue";
import { BaRequirementsRegisterPanel } from "@/components/ba/ba-requirements-register-panel";
import { PersonaAiSynthesis } from "@/components/dx/persona-ai-synthesis";
import { MissionControlNoProjectBanner } from "@/components/dx/mission-control-empty";
import { listPendingArtifactReviewsForPersona } from "@/services/artifactReviews";
import { getProjectBootstrapStatus } from "@/services/projectBootstrap";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import { hasBootstrapParitySummary } from "@/lib/bootstrap-checklist";
import { BA_DAY_ONE_SUBTITLE, resolveBaDashboardMode } from "@/lib/ba-dashboard-mode";
import { filterReviewsByProject, PERSONA_REVIEW_LABELS } from "@/lib/approval/persona-reviews";
import { NextUpStrip } from "@/components/dx/next-up-strip";
import { buildMissionNextUpItems } from "@/lib/mission-next-up";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";
import { buildBaClarificationQueue } from "@/lib/ba-clarification-queue";
import { buildBaHandoffSynthesis } from "@/lib/ba-handoff-kpis";
import { getWorkspaceFlowSnapshot } from "@/services/workspaceFlowSnapshot";
import { getRequirementStats } from "@/services/baRequirements";
import { BaWorkspaceFlowShell } from "@/components/workspace-flow/ba-workspace-flow-shell";
import { dxClass } from "@/lib/dx-theme";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function BaMissionControlPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .maybeSingle();

  if (profile?.role !== "ba" && profile?.role !== "pm") {
    redirect("/workspace/dashboard");
  }

  const params = await searchParams;
  const [data, pendingReviews] = await Promise.all([
    getBaMissionControl(params.project),
    listPendingArtifactReviewsForPersona("ba").catch(() => []),
  ]);

  const projectId = data.primaryProject?.id;
  const projectPendingReviews = filterReviewsByProject(pendingReviews, projectId);
  let bootstrapSummary: ProjectBootstrapSummary | null = null;
  let hasBootstrapSummary = false;
  let flowSnapshot = null;
  let requirementsPreview: Awaited<ReturnType<typeof getRequirementStats>>["requirements"] = [];

  if (projectId) {
    const [bootstrap, snapshot, reqStats] = await Promise.all([
      getProjectBootstrapStatus(projectId).catch(() => null),
      getWorkspaceFlowSnapshot(projectId).catch(() => null),
      getRequirementStats(projectId).catch(() => null),
    ]);
    if (bootstrap && hasBootstrapParitySummary(bootstrap.summary)) {
      bootstrapSummary = bootstrap.summary;
      hasBootstrapSummary = true;
    }
    flowSnapshot = snapshot;
    requirementsPreview = reqStats?.requirements ?? [];
  }

  const serverBaMode = resolveBaDashboardMode({
    projectId,
    hasBootstrapSummary,
    pendingReviewCount: projectPendingReviews.length,
    pendingClarifications: data.kpis.pendingClarification,
    bridgeDismissed: false,
  });

  const baAccent = getMissionPersonaAccent("ba");
  const clarificationQueue = buildBaClarificationQueue(data.clarifications, projectId);
  const handoffSummary = buildBaHandoffSynthesis({
    projectName: data.primaryProject?.name,
    openClarifications: data.openClarifications,
    pendingClarification: data.kpis.pendingClarification,
    storiesReady: data.kpis.storiesReady,
    traceabilityScore: data.kpis.traceabilityScore,
    pendingReviewCount: projectPendingReviews.length,
    fallbackSummary: data.aiSummary,
  });

  const nextUpItems = buildMissionNextUpItems({
    personaId: "ba",
    primaryProject: data.primaryProject,
    hasProjects: data.projects.length > 0,
    pendingReviews,
    openClarifications: data.kpis.pendingClarification,
    guidedTaskTitle: data.guidedTasks[0]?.title,
    guidedTaskHref: data.primaryProject
      ? `/project/${data.primaryProject.id}/requirements`
      : undefined,
  });

  const dashboard = (
    <BaDashboardLayout
      aiSynthesis={
        <PersonaAiSynthesis
          title="What's blocking requirements reaching the team"
          summary={handoffSummary}
          accent={baAccent}
        />
      }
      kpiStrip={
        <BaHandoffKpiStrip
          data={data}
          openClarifications={data.openClarifications}
          pendingReviewCount={projectPendingReviews.length}
          projectId={projectId}
        />
      }
      traceabilityMatrix={
        <BaTraceabilityMatrixPanel rows={data.traceabilityPreview} projectId={projectId} />
      }
      clarificationQueue={<BaClarificationQueue items={clarificationQueue} />}
      footer={
        <BaRequirementsRegisterPanel requirements={requirementsPreview} projectId={projectId} />
      }
    />
  );

  return (
    <MissionDashboardChrome
      personaId="ba"
      header={{
        userName: data.userName,
        primaryProject: data.primaryProject,
        subtitle: serverBaMode === "day-one" ? BA_DAY_ONE_SUBTITLE : undefined,
      }}
    >
      <BaMissionShell
        projectId={projectId}
        hasBootstrapSummary={hasBootstrapSummary}
        pendingReviewCount={projectPendingReviews.length}
        pendingClarifications={data.kpis.pendingClarification}
        summary={bootstrapSummary}
      >
        <div className={dxClass.workspaceContent}>
          {data.projects.length === 0 ? <MissionControlNoProjectBanner persona="BA" /> : null}
          <NextUpStrip
            items={nextUpItems}
            personaLabel={PERSONA_REVIEW_LABELS.ba}
            personaId="ba"
          />
          {data.projects.length > 1 && data.primaryProject ? (
            <ProjectPicker
              projects={data.projects}
              currentId={data.primaryProject.id}
              accent={baAccent}
            />
          ) : null}
          {data.primaryProject && flowSnapshot ? (
            <Suspense fallback={null}>
              <BaWorkspaceFlowShell
                projectId={data.primaryProject.id}
                projectName={data.primaryProject.name}
                snapshot={flowSnapshot}
                storiesReady={data.kpis.storiesReady}
              >
                {dashboard}
              </BaWorkspaceFlowShell>
            </Suspense>
          ) : (
            dashboard
          )}
        </div>
      </BaMissionShell>
    </MissionDashboardChrome>
  );
}

function ProjectPicker({
  projects,
  currentId,
  accent,
}: {
  projects: Array<{ id: string; name: string; status: string }>;
  currentId: string;
  accent: ReturnType<typeof getMissionPersonaAccent>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {projects.slice(0, 8).map((p) => (
        <Link
          key={p.id}
          href={`/workspace/ba?project=${p.id}`}
          className={`inline-flex min-h-9 touch-manipulation items-center rounded-full border px-3.5 py-1.5 text-xs font-medium shadow-[var(--dx-shadow-sm)] transition ${
            p.id === currentId ? "" : "border-[var(--dx-rul)] text-[var(--dx-mut)] hover:border-[var(--dx-fnt)] hover:bg-white"
          }`}
          style={
            p.id === currentId
              ? { borderColor: accent.primary, backgroundColor: accent.bg, color: accent.text }
              : undefined
          }
        >
          {p.name}
        </Link>
      ))}
    </div>
  );
}
