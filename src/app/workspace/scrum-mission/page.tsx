import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getScrumMissionControl } from "@/services/scrumDashboard";
import { MissionDashboardChrome } from "@/components/dx/mission-dashboard-chrome";
import { DashboardPanelShell } from "@/components/dx/dashboard-panel-shell";
import {
  ScrumAiSummary,
  ScrumMissionOverview,
} from "@/components/scrum/scrum-mission-overview";
import {
  ScrumBurnoutPanel,
  ScrumCapacityPanel,
  ScrumCeremoniesPanel,
  ScrumCrossRolePanel,
  ScrumCrossTeamPanel,
  ScrumGuidedTasks,
  ScrumImpedimentsPanel,
  ScrumMaturityPanel,
  ScrumRetroPanel,
  ScrumSprintHealthPanel,
  ScrumStakeholdersPanel,
  ScrumStandupPanel,
  ScrumTeamHealthPanel,
  ScrumVelocityPanel,
} from "@/components/scrum/scrum-panels";
import { MissionControlNoProjectBanner } from "@/components/dx/mission-control-empty";
import { MissionPredictionKpis } from "@/components/prediction/mission-prediction-kpis";
import { CollaborativePanelsGrid } from "@/components/collaborative/collaborative-panels-grid";
import { getCollaborativeLoopSnapshot } from "@/services/collaborativeLoop";
import { listPendingArtifactReviewsForPersona } from "@/services/artifactReviews";
import { PERSONA_REVIEW_LABELS } from "@/lib/approval/persona-reviews";
import { NextUpStrip } from "@/components/dx/next-up-strip";
import { buildMissionNextUpItems } from "@/lib/mission-next-up";
import { MissionBootstrapBanner } from "@/components/dx/mission-bootstrap-banner";

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
  const [data, collaborativeLoop, pendingReviews] = await Promise.all([
    getScrumMissionControl(params.project),
    getCollaborativeLoopSnapshot("scrum", params.project),
    listPendingArtifactReviewsForPersona("scrum").catch(() => []),
  ]);

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

  return (
    <MissionDashboardChrome
      personaId="scrum"
      header={{
        userName: data.userName,
        primaryProject: data.primaryProject,
      }}
    >
      <div className="space-y-4 p-6 md:p-8">
        {data.projects.length === 0 ? <MissionControlNoProjectBanner persona="Scrum" /> : null}
        <MissionBootstrapBanner
          personaId="scrum"
          projectId={data.primaryProject?.id}
          showFallback={data.dataSources.velocity === "fallback"}
        />
        <NextUpStrip items={nextUpItems} personaLabel={PERSONA_REVIEW_LABELS.scrum} />

        {data.projects.length > 1 && data.primaryProject ? (
          <div className="flex flex-wrap gap-2">
            {data.projects.slice(0, 8).map((p) => (
              <Link
                key={p.id}
                href={`/workspace/scrum-mission?project=${p.id}`}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  p.id === data.primaryProject?.id
                    ? "border-[#1C4A2E] bg-[#EEF5F1] text-[#1C4A2E]"
                    : "border-[#E4E4DC] text-[#6B6B64]"
                }`}
              >
                {p.name}
              </Link>
            ))}
          </div>
        ) : null}

        <ScrumMissionOverview data={data} />
        {data.primaryProject ? (
          <MissionPredictionKpis projectId={data.primaryProject.id} />
        ) : null}
        <ScrumAiSummary summary={data.aiSummary} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DashboardPanelShell panelId="guided-tasks" title="Guided tasks">
            <ScrumGuidedTasks tasks={data.guidedTasks} />
          </DashboardPanelShell>
          <DashboardPanelShell panelId="sprint-health" title="Sprint health">
            <ScrumSprintHealthPanel health={data.sprintHealth} />
          </DashboardPanelShell>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DashboardPanelShell panelId="team-health" title="Team health">
            <ScrumTeamHealthPanel health={data.teamHealth} />
          </DashboardPanelShell>
          <DashboardPanelShell panelId="burnout" title="Burnout signals">
            <ScrumBurnoutPanel burnout={data.burnout} />
          </DashboardPanelShell>
        </div>

        <DashboardPanelShell panelId="impediments" title="Impediments">
          <ScrumImpedimentsPanel impediments={data.impediments} insight={data.impedimentInsight} />
        </DashboardPanelShell>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DashboardPanelShell panelId="ceremonies" title="Ceremonies">
            <ScrumCeremoniesPanel
              projectId={data.primaryProject?.id}
              ceremonies={data.ceremonies}
            />
          </DashboardPanelShell>
          <DashboardPanelShell panelId="standup" title="Standup summary">
            <ScrumStandupPanel summary={data.standupSummary} />
          </DashboardPanelShell>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DashboardPanelShell panelId="velocity" title="Velocity">
            <ScrumVelocityPanel
              velocity={data.velocity}
              insight={data.velocityInsight}
              usesFallback={data.dataSources.velocity === "fallback"}
            />
          </DashboardPanelShell>
          <DashboardPanelShell panelId="capacity" title="Capacity">
            <ScrumCapacityPanel capacity={data.capacity} />
          </DashboardPanelShell>
        </div>

        <DashboardPanelShell panelId="cross-team" title="Cross-team dependencies">
          <ScrumCrossTeamPanel deps={data.crossTeamDeps} />
        </DashboardPanelShell>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DashboardPanelShell panelId="retro" title="Retrospective themes">
            <ScrumRetroPanel themes={data.retroThemes} recommendation={data.retroRecommendation} />
          </DashboardPanelShell>
          <DashboardPanelShell panelId="maturity" title="Agile maturity">
            <ScrumMaturityPanel maturity={data.agileMaturity} />
          </DashboardPanelShell>
        </div>

        <DashboardPanelShell panelId="stakeholders" title="Stakeholders">
          <ScrumStakeholdersPanel rows={data.stakeholders} />
        </DashboardPanelShell>
        <DashboardPanelShell panelId="collaborative-loop" title="Team needs">
          <CollaborativePanelsGrid snapshot={collaborativeLoop} />
        </DashboardPanelShell>
        <DashboardPanelShell panelId="cross-role" title="Cross-role impact">
          <ScrumCrossRolePanel impacts={data.crossRoleImpact} />
        </DashboardPanelShell>
      </div>
    </MissionDashboardChrome>
  );
}
