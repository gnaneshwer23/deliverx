import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getScrumMissionControl } from "@/services/scrumDashboard";
import { MissionDashboardChrome } from "@/components/dx/mission-dashboard-chrome";
import { ScrumDashboardLayout } from "@/components/scrum/scrum-dashboard-layout";
import { ScrumMissionShell } from "@/components/scrum/scrum-mission-shell";
import { ScrumHealthKpiStrip } from "@/components/scrum/scrum-health-kpi-strip";
import { ScrumBurndownPanel } from "@/components/scrum/scrum-burndown-panel";
import {
  ScrumCeremoniesRow,
  ScrumImpedimentBoard,
} from "@/components/scrum/scrum-impediment-ceremonies";
import { PersonaAiSynthesis } from "@/components/dx/persona-ai-synthesis";
import { MissionControlNoProjectBanner } from "@/components/dx/mission-control-empty";
import { MissionBootstrapBanner } from "@/components/dx/mission-bootstrap-banner";
import { listPendingArtifactReviewsForPersona } from "@/services/artifactReviews";
import { getProjectBootstrapStatus } from "@/services/projectBootstrap";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import { hasBootstrapParitySummary } from "@/lib/bootstrap-checklist";
import {
  SCRUM_DAY_ONE_SUBTITLE,
  resolveScrumDashboardMode,
} from "@/lib/scrum-dashboard-mode";
import { PERSONA_REVIEW_LABELS, filterReviewsByProject } from "@/lib/approval/persona-reviews";
import { NextUpStrip } from "@/components/dx/next-up-strip";
import { buildMissionNextUpItems } from "@/lib/mission-next-up";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";
import {
  buildScrumHealthSynthesis,
} from "@/lib/scrum-health-kpis";
import { MissionHelmCopilotSlot } from "@/components/copilot/mission-helm-copilot-slot";
import { PersonaStandupTasks } from "@/components/tasks/persona-standup-tasks";
import { resolveWorkspaceOrgProjectId } from "@/lib/professional-workspace/project-context";

export const dynamic = "force-dynamic";

export default async function ScrumMissionControlPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .maybeSingle();

  if (
    profile?.role !== "scrum_master" &&
    profile?.role !== "pm" &&
    profile?.role !== "team_member"
  ) {
    redirect("/workspace/dashboard");
  }

  const params = await searchParams;
  const requestedProjectId = resolveWorkspaceOrgProjectId(params.project);
  const [data, pendingReviews] = await Promise.all([
    getScrumMissionControl(requestedProjectId ?? undefined),
    listPendingArtifactReviewsForPersona("scrum").catch(() => []),
  ]);

  const projectId = data.primaryProject?.id;
  const projectPendingReviews = filterReviewsByProject(pendingReviews, projectId);
  let bootstrapSummary: ProjectBootstrapSummary | null = null;
  let hasBootstrapSummary = false;

  if (projectId) {
    const bootstrap = await getProjectBootstrapStatus(projectId).catch(() => null);
    if (bootstrap && hasBootstrapParitySummary(bootstrap.summary)) {
      bootstrapSummary = bootstrap.summary;
      hasBootstrapSummary = true;
    }
  }

  const serverScrumMode = resolveScrumDashboardMode({
    projectId,
    hasBootstrapSummary,
    pendingReviewCount: projectPendingReviews.length,
    impedimentCount: data.impediments.length,
    blockedStories: data.overview.blockedStories,
    bridgeDismissed: false,
  });

  const scrumAccent = getMissionPersonaAccent("scrum");

  const burndownPoints = data.burndownPoints;

  const teamSummary = buildScrumHealthSynthesis({
    projectName: data.primaryProject?.name,
    impedimentCount: data.impediments.length,
    blockedStories: data.overview.blockedStories,
    completionPct: data.overview.completionPct,
    daysRemaining: data.overview.daysRemaining,
    impedimentTitle: data.impediments[0]?.title,
    fallbackSummary: data.aiSummary,
  });

  const nextUpItems = buildMissionNextUpItems({
    personaId: "scrum",
    primaryProject: data.primaryProject,
    hasProjects: data.projects.length > 0,
    pendingReviews,
    impediments: data.impediments.length,
    impedimentTitle: data.impediments[0]?.title,
    blockedTasks: data.overview.blockedStories,
    guidedTaskTitle: data.guidedTasks[0]?.title,
    guidedTaskHref: data.primaryProject ? `/project/${data.primaryProject.id}/scrum` : undefined,
  });

  const dashboard = (
    <ScrumDashboardLayout
      aiSynthesis={
        <PersonaAiSynthesis
          title="What's blocking the team as a unit"
          summary={teamSummary}
          accent={scrumAccent}
        />
      }
      kpiStrip={<ScrumHealthKpiStrip data={data} projectId={projectId} />}
      burndownPanel={
        <ScrumBurndownPanel
          points={burndownPoints}
          sprintLabel={data.overview.sprintLabel}
          plannedPoints={data.sprintHealth.plannedPoints}
          completedPoints={data.sprintHealth.completedPoints}
          usesFallback={data.dataSources.burndown === "fallback"}
        />
      }
      impedimentCeremonyRow={
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ScrumImpedimentBoard
            impediments={data.impediments}
            insight={data.impedimentInsight}
          />
          <ScrumCeremoniesRow
            projectId={projectId}
            ceremonies={data.ceremonies}
            standupBlockers={data.standupSummary.blockers}
          />
        </div>
      }
    />
  );

  return (
    <MissionDashboardChrome
      personaId="scrum"
      header={{
        userName: data.userName,
        primaryProject: data.primaryProject,
        subtitle: serverScrumMode === "day-one" ? SCRUM_DAY_ONE_SUBTITLE : undefined,
      }}
    >
      <ScrumMissionShell
        projectId={projectId}
        hasBootstrapSummary={hasBootstrapSummary}
        pendingReviewCount={projectPendingReviews.length}
        impedimentCount={data.impediments.length}
        blockedStories={data.overview.blockedStories}
        summary={bootstrapSummary}
      >
        <div className="space-y-4 p-6 md:p-8">
        {data.projects.length === 0 ? <MissionControlNoProjectBanner persona="Scrum" /> : null}
        <MissionBootstrapBanner
          personaId="scrum"
          projectId={data.primaryProject?.id}
          showFallback={data.dataSources.velocity === "fallback" || data.dataSources.burndown === "fallback"}
        />
        <NextUpStrip
          items={nextUpItems}
          personaLabel={PERSONA_REVIEW_LABELS.scrum}
          personaId="scrum"
        />
        <PersonaStandupTasks projectId={projectId} />
        {data.projects.length > 1 && data.primaryProject ? (
          <div className="flex flex-wrap gap-2">
            {data.projects.slice(0, 8).map((p) => (
              <Link
                key={p.id}
                href={`/workspace/scrum-mission?project=${p.id}`}
                className={`inline-flex min-h-9 touch-manipulation items-center rounded-full border px-3 py-1 text-xs font-medium ${
                  p.id === data.primaryProject?.id
                    ? ""
                    : "border-[#E4E4DC] text-[#6B6B64]"
                }`}
                style={
                  p.id === data.primaryProject?.id
                    ? {
                        borderColor: scrumAccent.primary,
                        backgroundColor: scrumAccent.bg,
                        color: scrumAccent.text,
                      }
                    : undefined
                }
              >
                {p.name}
              </Link>
            ))}
          </div>
        ) : null}
        {dashboard}
        <MissionHelmCopilotSlot personaId="scrum" projectId={data.primaryProject?.id} />
        </div>
      </ScrumMissionShell>
    </MissionDashboardChrome>
  );
}
