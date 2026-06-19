import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEngineerMissionControl } from "@/services/engineerDashboard";
import { MissionDashboardChrome } from "@/components/dx/mission-dashboard-chrome";
import { DashboardPanelShell } from "@/components/dx/dashboard-panel-shell";
import {
  EngineerAiSummary,
  EngineerMissionOverview,
} from "@/components/engineer/engineer-mission-overview";
import {
  EngineerApiContractsPanel,
  EngineerArchitecturePanel,
  EngineerCicdPanel,
  EngineerCrossRolePanel,
  EngineerDebtPanel,
  EngineerDependenciesPanel,
  EngineerGuidedTasks,
  EngineerPrPanel,
  EngineerStakeholdersPanel,
  EngineerTraceabilityPanel,
} from "@/components/engineer/engineer-panels";
import { GitHubActivityPanel } from "@/components/engineer/github-activity-panel";
import { MissionControlNoProjectBanner } from "@/components/dx/mission-control-empty";
import { MissionPredictionKpis } from "@/components/prediction/mission-prediction-kpis";
import { CollaborativePanelsGrid } from "@/components/collaborative/collaborative-panels-grid";
import { getCollaborativeLoopSnapshot } from "@/services/collaborativeLoop";
import { listPendingArtifactReviewsForPersona } from "@/services/artifactReviews";
import { PERSONA_REVIEW_LABELS } from "@/lib/approval/persona-reviews";
import { NextUpStrip } from "@/components/dx/next-up-strip";
import { buildMissionNextUpItems } from "@/lib/mission-next-up";
import { MissionBootstrapBanner } from "@/components/dx/mission-bootstrap-banner";
import { EngineerMissionShell } from "@/components/engineer/engineer-mission-shell";
import { getProjectBootstrapStatus } from "@/services/projectBootstrap";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import { hasBootstrapParitySummary } from "@/lib/bootstrap-checklist";
import {
  ENGINEER_DAY_ONE_SUBTITLE,
  resolveEngineerDashboardMode,
} from "@/lib/engineer-dashboard-mode";
import { filterReviewsByProject } from "@/lib/approval/persona-reviews";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";

export const dynamic = "force-dynamic";

export default async function EngineerMissionControlPage({
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
    profile?.role !== "engineer" &&
    profile?.role !== "team_member" &&
    profile?.role !== "pm"
  ) {
    redirect("/workspace/dashboard");
  }

  const params = await searchParams;
  const [data, collaborativeLoop, pendingReviews] = await Promise.all([
    getEngineerMissionControl(params.project),
    getCollaborativeLoopSnapshot("engineer", params.project),
    listPendingArtifactReviewsForPersona("engineer").catch(() => []),
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

  const serverEngineerMode = resolveEngineerDashboardMode({
    projectId,
    hasBootstrapSummary,
    pendingReviewCount: projectPendingReviews.length,
    blockedStories: data.overview.blockedStories,
    bridgeDismissed: false,
  });

  const engineerAccent = getMissionPersonaAccent("engineer");

  const nextUpItems = buildMissionNextUpItems({
    personaId: "engineer",
    primaryProject: data.primaryProject,
    hasProjects: data.projects.length > 0,
    pendingReviews,
    blockedTasks: data.overview.blockedStories,
    blockedTaskTitle: data.guidedTasks[0]?.title,
    guidedTaskTitle: data.guidedTasks[0]?.title,
    guidedTaskHref: data.primaryProject
      ? `/project/${data.primaryProject.id}/engineering`
      : undefined,
  });

  return (
    <MissionDashboardChrome
      personaId="engineer"
      header={{
        userName: data.userName,
        primaryProject: data.primaryProject,
        subtitle: serverEngineerMode === "day-one" ? ENGINEER_DAY_ONE_SUBTITLE : undefined,
      }}
    >
      <EngineerMissionShell
        projectId={projectId}
        hasBootstrapSummary={hasBootstrapSummary}
        pendingReviewCount={projectPendingReviews.length}
        blockedStories={data.overview.blockedStories}
        summary={bootstrapSummary}
      >
        <div className="space-y-4 p-6 md:p-8">
          {data.projects.length === 0 ? <MissionControlNoProjectBanner persona="Engineering" /> : null}
          <MissionBootstrapBanner
            personaId="engineer"
            projectId={data.primaryProject?.id}
            showFallback={data.dataSources.architecture === "fallback"}
          />
          <NextUpStrip
            items={nextUpItems}
            personaLabel={PERSONA_REVIEW_LABELS.engineer}
            personaId="engineer"
          />

          {data.projects.length > 1 && data.primaryProject ? (
            <div className="flex flex-wrap gap-2">
              {data.projects.slice(0, 8).map((p) => (
                <Link
                  key={p.id}
                  href={`/workspace/engineer?project=${p.id}`}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    p.id === data.primaryProject?.id
                      ? ""
                      : "border-[#E4E4DC] text-[#6B6B64]"
                  }`}
                  style={
                    p.id === data.primaryProject?.id
                      ? {
                          borderColor: engineerAccent.primary,
                          backgroundColor: engineerAccent.bg,
                          color: engineerAccent.text,
                        }
                      : undefined
                  }
                >
                  {p.name}
                </Link>
              ))}
            </div>
          ) : null}

        <EngineerMissionOverview data={data} />
        {data.primaryProject ? (
          <MissionPredictionKpis projectId={data.primaryProject.id} />
        ) : null}
        <EngineerAiSummary summary={data.aiSummary} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DashboardPanelShell panelId="guided-tasks" title="Guided tasks">
            <EngineerGuidedTasks tasks={data.guidedTasks} />
          </DashboardPanelShell>
          <DashboardPanelShell panelId="dependencies" title="Dependencies">
            <EngineerDependenciesPanel
              dependencies={data.dependencies}
              insight={data.dependencyInsight}
            />
          </DashboardPanelShell>
        </div>

        <DashboardPanelShell panelId="traceability" title="Traceability">
          <EngineerTraceabilityPanel rows={data.traceability} />
        </DashboardPanelShell>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DashboardPanelShell panelId="architecture" title="Architecture">
            <EngineerArchitecturePanel
              nodes={data.architecture}
              usesFallback={data.dataSources.architecture === "fallback"}
            />
          </DashboardPanelShell>
          <DashboardPanelShell panelId="cicd" title="CI/CD">
            <EngineerCicdPanel cicd={data.cicd} />
          </DashboardPanelShell>
        </div>

        {data.primaryProject ? (
          <DashboardPanelShell panelId="github-activity" title="GitHub activity">
            <GitHubActivityPanel
              projectId={data.primaryProject.id}
              configured={data.github.configured}
              lastSyncAt={data.github.lastSyncAt}
              openPullRequests={data.github.openPullRequests}
            />
          </DashboardPanelShell>
        ) : null}

        <DashboardPanelShell panelId="api-contracts" title="API contracts">
          <EngineerApiContractsPanel contracts={data.apiContracts} />
        </DashboardPanelShell>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DashboardPanelShell panelId="pull-requests" title="Pull requests">
            <EngineerPrPanel pr={data.prDashboard} />
          </DashboardPanelShell>
          <DashboardPanelShell panelId="technical-debt" title="Technical debt">
            <EngineerDebtPanel debt={data.technicalDebt} />
          </DashboardPanelShell>
        </div>

        <DashboardPanelShell panelId="stakeholders" title="Stakeholders">
          <EngineerStakeholdersPanel rows={data.stakeholders} />
        </DashboardPanelShell>
        <DashboardPanelShell panelId="collaborative-loop" title="Collaborative loop">
          <CollaborativePanelsGrid snapshot={collaborativeLoop} />
        </DashboardPanelShell>
        <DashboardPanelShell panelId="cross-role" title="Cross-role impact">
          <EngineerCrossRolePanel impacts={data.crossRoleImpact} />
        </DashboardPanelShell>
        </div>
      </EngineerMissionShell>
    </MissionDashboardChrome>
  );
}
