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
import { PendingReviewsStrip } from "@/components/approvals/pending-reviews-strip";
import { MockDataBanner } from "@/components/dx/mock-data-banner";

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

  return (
    <MissionDashboardChrome
      personaId="qa"
      header={{
        userName: data.userName,
        primaryProject: data.primaryProject,
      }}
    >
      <div className="space-y-4 p-6 md:p-8">
        {data.projects.length === 0 ? <MissionControlNoProjectBanner persona="QA" /> : null}
        <PendingReviewsStrip
          reviews={pendingReviews}
          personaLabel={PERSONA_REVIEW_LABELS["qa"]}
          persona="qa"
          inlineActions
        />
        {data.dataSources.qaMetrics === "fallback" ? (
          <MockDataBanner message="QA KPIs are illustrative until test cases, defects, or UAT data is recorded." />
        ) : null}

        {data.projects.length > 1 && data.primaryProject ? (
          <div className="flex flex-wrap gap-2">
            {data.projects.slice(0, 8).map((p) => (
              <Link
                key={p.id}
                href={`/workspace/qa?project=${p.id}`}
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
    </MissionDashboardChrome>
  );
}
