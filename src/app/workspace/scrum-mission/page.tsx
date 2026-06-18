import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getScrumMissionControl } from "@/services/scrumDashboard";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
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
import { PendingReviewsStrip } from "@/components/approvals/pending-reviews-strip";
import { dxClass } from "@/lib/dx-theme";

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

  return (
    <>
      <DxPageHeader
        breadcrumb="DeliverX OS · Scrum"
        title="Scrum Mission"
        titleEm="control"
        action={
          data.primaryProject ? (
            <Link
              href={`/project/${data.primaryProject.id}/scrum`}
              className={`${dxClass.btnPrimary} text-[10px]`}
            >
              Scrum workspace →
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
          AI Agile Coach — sprint health, impediments, ceremonies, velocity, capacity, retrospectives,
          and team wellbeing from live delivery signals.
        </p>

        {data.projects.length === 0 ? <MissionControlNoProjectBanner persona="Scrum" /> : null}
        <PendingReviewsStrip reviews={pendingReviews} personaLabel={PERSONA_REVIEW_LABELS["scrum"]} />

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

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ScrumGuidedTasks tasks={data.guidedTasks} />
          <ScrumSprintHealthPanel health={data.sprintHealth} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ScrumTeamHealthPanel health={data.teamHealth} />
          <ScrumBurnoutPanel burnout={data.burnout} />
        </div>

        <ScrumImpedimentsPanel impediments={data.impediments} insight={data.impedimentInsight} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ScrumCeremoniesPanel
            projectId={data.primaryProject?.id}
            ceremonies={data.ceremonies}
          />
          <ScrumStandupPanel summary={data.standupSummary} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ScrumVelocityPanel velocity={data.velocity} insight={data.velocityInsight} usesFallback={data.dataSources.velocity === "fallback"} />
          <ScrumCapacityPanel capacity={data.capacity} />
        </div>

        <ScrumCrossTeamPanel deps={data.crossTeamDeps} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ScrumRetroPanel themes={data.retroThemes} recommendation={data.retroRecommendation} />
          <ScrumMaturityPanel maturity={data.agileMaturity} />
        </div>

        <ScrumStakeholdersPanel rows={data.stakeholders} />
        <CollaborativePanelsGrid snapshot={collaborativeLoop} />
        <ScrumCrossRolePanel impacts={data.crossRoleImpact} />
      </div>
    </>
  );
}
