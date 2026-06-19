import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getQaMissionControl } from "@/services/qaDashboard";
import { MissionDashboardChrome } from "@/components/dx/mission-dashboard-chrome";
import { DashboardPanelShell } from "@/components/dx/dashboard-panel-shell";
import { QaAiSummary, QaMissionOverview } from "@/components/qa/qa-mission-overview";
import {
  QaAutomationPanel,
  QaCrossRolePanel,
  QaDefectsPanel,
  QaGuidedTasks,
  QaImpactPanel,
  QaPerformancePanel,
  QaReleasePredictionPanel,
  QaReleaseReadinessPanel,
  QaSecurityPanel,
  QaStakeholdersPanel,
  QaTestCasesPanel,
  QaTraceabilityPanel,
  QaUatPanel,
} from "@/components/qa/qa-panels";
import { MissionControlNoProjectBanner } from "@/components/dx/mission-control-empty";
import { MissionPredictionKpis } from "@/components/prediction/mission-prediction-kpis";
import { CollaborativePanelsGrid } from "@/components/collaborative/collaborative-panels-grid";
import { getCollaborativeLoopSnapshot } from "@/services/collaborativeLoop";
import { listPendingArtifactReviewsForPersona } from "@/services/artifactReviews";
import { PERSONA_REVIEW_LABELS } from "@/lib/approval/persona-reviews";
import { NextUpStrip } from "@/components/dx/next-up-strip";
import { buildMissionNextUpItems } from "@/lib/mission-next-up";
import { MissionBootstrapBanner } from "@/components/dx/mission-bootstrap-banner";
import { QaMissionShell } from "@/components/qa/qa-mission-shell";
import { getProjectBootstrapStatus } from "@/services/projectBootstrap";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import { hasBootstrapParitySummary } from "@/lib/bootstrap-checklist";
import { QA_DAY_ONE_SUBTITLE, resolveQaDashboardMode } from "@/lib/qa-dashboard-mode";
import { filterReviewsByProject } from "@/lib/approval/persona-reviews";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";

export const dynamic = "force-dynamic";

export default async function QaMissionControlPage({
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
    profile?.role !== "qa" &&
    profile?.role !== "pm" &&
    profile?.role !== "team_member"
  ) {
    redirect("/workspace/dashboard");
  }

  const params = await searchParams;
  const [data, collaborativeLoop, pendingReviews] = await Promise.all([
    getQaMissionControl(params.project),
    getCollaborativeLoopSnapshot("qa", params.project),
    listPendingArtifactReviewsForPersona("qa").catch(() => []),
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

  const serverQaMode = resolveQaDashboardMode({
    projectId,
    hasBootstrapSummary,
    pendingReviewCount: projectPendingReviews.length,
    criticalDefects: data.overview.criticalDefects,
    bridgeDismissed: false,
  });

  const qaAccent = getMissionPersonaAccent("qa");

  const nextUpItems = buildMissionNextUpItems({
    personaId: "qa",
    primaryProject: data.primaryProject,
    hasProjects: data.projects.length > 0,
    pendingReviews,
    criticalDefects: data.overview.criticalDefects,
    guidedTaskTitle: data.guidedTasks[0]?.title,
    guidedTaskHref: data.primaryProject ? `/project/${data.primaryProject.id}/qa` : undefined,
  });

  return (
    <MissionDashboardChrome
      personaId="qa"
      header={{
        userName: data.userName,
        primaryProject: data.primaryProject,
        subtitle: serverQaMode === "day-one" ? QA_DAY_ONE_SUBTITLE : undefined,
      }}
    >
      <QaMissionShell
        projectId={projectId}
        hasBootstrapSummary={hasBootstrapSummary}
        pendingReviewCount={projectPendingReviews.length}
        criticalDefects={data.overview.criticalDefects}
        summary={bootstrapSummary}
      >
        <div className="space-y-4 p-6 md:p-8">
          {data.projects.length === 0 ? <MissionControlNoProjectBanner persona="QA" /> : null}
          <NextUpStrip
            items={nextUpItems}
            personaLabel={PERSONA_REVIEW_LABELS.qa}
            personaId="qa"
          />
          <MissionBootstrapBanner
            personaId="qa"
            projectId={data.primaryProject?.id}
            showFallback={data.dataSources.qaMetrics === "fallback"}
          />

          {data.projects.length > 1 && data.primaryProject ? (
            <div className="flex flex-wrap gap-2">
              {data.projects.slice(0, 8).map((p) => (
                <Link
                  key={p.id}
                  href={`/workspace/qa?project=${p.id}`}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    p.id === data.primaryProject?.id ? "" : "border-[#E4E4DC] text-[#6B6B64]"
                  }`}
                  style={
                    p.id === data.primaryProject?.id
                      ? {
                          borderColor: qaAccent.primary,
                          backgroundColor: qaAccent.bg,
                          color: qaAccent.text,
                        }
                      : undefined
                  }
                >
                  {p.name}
                </Link>
              ))}
            </div>
          ) : null}

        <QaMissionOverview data={data} />
        {data.primaryProject ? (
          <MissionPredictionKpis projectId={data.primaryProject.id} />
        ) : null}
        <QaAiSummary summary={data.aiSummary} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DashboardPanelShell panelId="guided-tasks" title="Guided tasks">
            <QaGuidedTasks tasks={data.guidedTasks} />
          </DashboardPanelShell>
          <DashboardPanelShell panelId="release-prediction" title="Release prediction">
            <QaReleasePredictionPanel prediction={data.releasePrediction} />
          </DashboardPanelShell>
        </div>

        <DashboardPanelShell panelId="traceability" title="Traceability">
          <QaTraceabilityPanel rows={data.traceability} />
        </DashboardPanelShell>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DashboardPanelShell panelId="test-cases" title="Test cases">
            <QaTestCasesPanel cases={data.testCases} />
          </DashboardPanelShell>
          <DashboardPanelShell panelId="defects" title="Defects">
            <QaDefectsPanel defects={data.defects} insight={data.defectInsight} />
          </DashboardPanelShell>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DashboardPanelShell panelId="automation" title="Automation">
            <QaAutomationPanel automation={data.automation} />
          </DashboardPanelShell>
          <DashboardPanelShell panelId="impact" title="Impact analysis">
            <QaImpactPanel impact={data.impactAnalysis} />
          </DashboardPanelShell>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DashboardPanelShell panelId="uat" title="UAT">
            <QaUatPanel rows={data.uat} insight={data.uatInsight} />
          </DashboardPanelShell>
          <DashboardPanelShell panelId="release-readiness" title="Release readiness">
            <QaReleaseReadinessPanel readiness={data.releaseReadiness} />
          </DashboardPanelShell>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DashboardPanelShell panelId="performance" title="Performance">
            <QaPerformancePanel performance={data.performance} />
          </DashboardPanelShell>
          <DashboardPanelShell panelId="security" title="Security">
            <QaSecurityPanel security={data.security} />
          </DashboardPanelShell>
        </div>

        <DashboardPanelShell panelId="stakeholders" title="Stakeholders">
          <QaStakeholdersPanel rows={data.stakeholders} />
        </DashboardPanelShell>
        <DashboardPanelShell panelId="collaborative-loop" title="Collaborative loop">
          <CollaborativePanelsGrid snapshot={collaborativeLoop} />
        </DashboardPanelShell>
        <DashboardPanelShell panelId="cross-role" title="Cross-role impact">
          <QaCrossRolePanel impacts={data.crossRoleImpact} />
        </DashboardPanelShell>
        </div>
      </QaMissionShell>
    </MissionDashboardChrome>
  );
}
