import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getQaMissionControl } from "@/services/qaDashboard";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
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
import { dxClass } from "@/lib/dx-theme";

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
  const [data, collaborativeLoop] = await Promise.all([
    getQaMissionControl(params.project),
    getCollaborativeLoopSnapshot("qa", params.project),
  ]);

  return (
    <>
      <DxPageHeader
        breadcrumb="DeliverX OS · QA"
        title="QA Mission"
        titleEm="control"
        action={
          data.primaryProject ? (
            <Link
              href={`/project/${data.primaryProject.id}/qa`}
              className={`${dxClass.btnPrimary} text-[10px]`}
            >
              QA workspace →
            </Link>
          ) : (
            <Link href="/project/new" className={`${dxClass.btnPrimary} text-[10px]`}>
              New project →
            </Link>
          )
        }
      />
      <div className="space-y-6 p-6 md:p-8">
        <p className="max-w-3xl text-sm text-[#6B6B64]">
          AI Quality Engineer — test coverage, defects, release readiness, UAT, automation, and
          requirement-to-test traceability from live delivery signals.
        </p>

        {data.projects.length === 0 ? <MissionControlNoProjectBanner persona="QA" /> : null}

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

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <QaGuidedTasks tasks={data.guidedTasks} />
          <QaReleasePredictionPanel prediction={data.releasePrediction} />
        </div>

        <QaTraceabilityPanel rows={data.traceability} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <QaTestCasesPanel cases={data.testCases} />
          <QaDefectsPanel defects={data.defects} insight={data.defectInsight} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <QaAutomationPanel automation={data.automation} />
          <QaImpactPanel impact={data.impactAnalysis} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <QaUatPanel rows={data.uat} insight={data.uatInsight} />
          <QaReleaseReadinessPanel readiness={data.releaseReadiness} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <QaPerformancePanel performance={data.performance} />
          <QaSecurityPanel security={data.security} />
        </div>

        <QaStakeholdersPanel rows={data.stakeholders} />
        <CollaborativePanelsGrid snapshot={collaborativeLoop} />
        <QaCrossRolePanel impacts={data.crossRoleImpact} />
      </div>
    </>
  );
}
