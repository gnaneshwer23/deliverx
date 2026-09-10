import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEngineerMissionControl } from "@/services/engineerDashboard";
import { MissionDashboardChrome } from "@/components/dx/mission-dashboard-chrome";
import { EngineerMissionShell } from "@/components/engineer/engineer-mission-shell";
import { EngineerDashboardLayout } from "@/components/engineer/engineer-dashboard-layout";
import { EngineerShippingKpiStrip } from "@/components/engineer/engineer-shipping-kpi-strip";
import {
  EngineerAssignedStoriesPanel,
  EngineerOpenPrsPanel,
} from "@/components/engineer/engineer-work-panels";
import { EngineerDependenciesPanel } from "@/components/engineer/engineer-panels";
import { PersonaAiSynthesis } from "@/components/dx/persona-ai-synthesis";
import { MissionControlNoProjectBanner } from "@/components/dx/mission-control-empty";
import { MissionBootstrapBanner } from "@/components/dx/mission-bootstrap-banner";
import { listPendingArtifactReviewsForPersona } from "@/services/artifactReviews";
import { getProjectBootstrapStatus } from "@/services/projectBootstrap";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import { hasBootstrapParitySummary } from "@/lib/bootstrap-checklist";
import {
  ENGINEER_DAY_ONE_SUBTITLE,
  resolveEngineerDashboardMode,
} from "@/lib/engineer-dashboard-mode";
import { filterReviewsByProject, PERSONA_REVIEW_LABELS } from "@/lib/approval/persona-reviews";
import { NextUpStrip } from "@/components/dx/next-up-strip";
import { buildMissionNextUpItems } from "@/lib/mission-next-up";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";
import { buildEngineerShippingSynthesis } from "@/lib/engineer-shipping-kpis";
import { MissionHelmCopilotSlot } from "@/components/copilot/mission-helm-copilot-slot";
import { PersonaStandupTasks } from "@/components/tasks/persona-standup-tasks";
import { resolveWorkspaceOrgProjectId } from "@/lib/professional-workspace/project-context";

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
  const requestedProjectId = resolveWorkspaceOrgProjectId(params.project);
  const [data, pendingReviews] = await Promise.all([
    getEngineerMissionControl(requestedProjectId ?? undefined),
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
  const blockedDependencies = data.dependencies.filter((d) => d.status === "Delayed").length;

  const shippingSummary = buildEngineerShippingSynthesis({
    projectName: data.primaryProject?.name,
    blockedStories: data.overview.blockedStories,
    openPrs: data.overview.openPrs,
    reviewsRequired: data.prDashboard.reviewsRequired,
    blockedDependencies,
    buildHealth: data.overview.buildHealth,
    fallbackSummary: data.aiSummary,
  });

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

  const dashboard = (
    <EngineerDashboardLayout
      aiSynthesis={
        <PersonaAiSynthesis
          title="What's blocking your code from shipping"
          summary={shippingSummary}
          accent={engineerAccent}
        />
      }
      kpiStrip={
        <EngineerShippingKpiStrip
          data={data}
          blockedDependencies={blockedDependencies}
          projectId={projectId}
        />
      }
      workRow={
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <EngineerAssignedStoriesPanel tasks={data.guidedTasks} projectId={projectId} />
          <EngineerOpenPrsPanel
            openPullRequests={data.github.openPullRequests}
            prStats={data.prDashboard}
            configured={data.github.configured}
          />
        </div>
      }
      dependenciesPanel={
        <EngineerDependenciesPanel
          dependencies={data.dependencies}
          insight={data.dependencyInsight}
        />
      }
    />
  );

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
          {data.projects.length === 0 ? (
            <MissionControlNoProjectBanner persona="Engineering" />
          ) : null}
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
          <PersonaStandupTasks projectId={projectId} />
          {data.projects.length > 1 && data.primaryProject ? (
            <div className="flex flex-wrap gap-2">
              {data.projects.slice(0, 8).map((p) => (
                <Link
                  key={p.id}
                  href={`/workspace/engineer?project=${p.id}`}
                  className={`inline-flex min-h-9 touch-manipulation items-center rounded-full border px-3 py-1 text-xs font-medium ${
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
          {dashboard}
          <MissionHelmCopilotSlot personaId="engineer" projectId={data.primaryProject?.id} />
        </div>
      </EngineerMissionShell>
    </MissionDashboardChrome>
  );
}
