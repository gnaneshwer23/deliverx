import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBaMissionControl } from "@/services/baDashboard";
import { DxStatCard } from "@/components/dx/dx-page-chrome";
import { MissionDashboardChrome } from "@/components/dx/mission-dashboard-chrome";
import { DashboardPanelShell } from "@/components/dx/dashboard-panel-shell";
import { BaMissionOverview, BaAiSummary } from "@/components/ba/ba-mission-overview";
import { BaGuidedTasks } from "@/components/ba/ba-guided-tasks";
import {
  BaCrossRoleImpact,
  BaStakeholderPanel,
} from "@/components/ba/ba-stakeholder-panels";
import { BaTraceabilityPreview } from "@/components/ba/ba-traceability-preview";
import { MissionControlNoProjectBanner } from "@/components/dx/mission-control-empty";
import { MissionPredictionKpis } from "@/components/prediction/mission-prediction-kpis";
import { CollaborativePanelsGrid } from "@/components/collaborative/collaborative-panels-grid";
import { getCollaborativeLoopSnapshot } from "@/services/collaborativeLoop";
import { listPendingArtifactReviewsForPersona } from "@/services/artifactReviews";
import { PERSONA_REVIEW_LABELS } from "@/lib/approval/persona-reviews";
import { PendingReviewsStrip } from "@/components/approvals/pending-reviews-strip";
import { ClampableSummary } from "@/components/dx/clampable-summary";
import { dxClass } from "@/lib/dx-theme";

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
  const [data, collaborativeLoop, pendingReviews] = await Promise.all([
    getBaMissionControl(params.project),
    getCollaborativeLoopSnapshot("ba", params.project),
    listPendingArtifactReviewsForPersona("ba").catch(() => []),
  ]);

  return (
    <MissionDashboardChrome
      personaId="ba"
      header={{
        userName: data.userName,
        primaryProject: data.primaryProject,
      }}
    >
      <div className="space-y-4 p-6 md:p-8">
        {data.projects.length === 0 ? <MissionControlNoProjectBanner persona="BA" /> : null}
        <PendingReviewsStrip
          reviews={pendingReviews}
          personaLabel={PERSONA_REVIEW_LABELS["ba"]}
          persona="ba"
          inlineActions
        />

        {data.projects.length > 1 && data.primaryProject ? (
          <ProjectPicker projects={data.projects} currentId={data.primaryProject.id} />
        ) : null}

        <BaMissionOverview data={data} />
        {data.primaryProject ? (
          <MissionPredictionKpis projectId={data.primaryProject.id} />
        ) : null}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <DxStatCard
            label="Org requirements"
            value={data.orgTotals.totalRequirements}
            hint={`${data.orgTotals.totalProjects} active projects`}
          />
          <DxStatCard
            label="Primary project"
            value={data.primaryProject?.name ?? "—"}
            hint="Focus programme"
          />
        </div>

        <BaAiSummary summary={data.aiSummary} projectId={data.primaryProject?.id} />

        <DashboardPanelShell panelId="collaborative-loop" title="Collaborative loop">
          <CollaborativePanelsGrid snapshot={collaborativeLoop} />
        </DashboardPanelShell>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DashboardPanelShell panelId="guided-tasks" title="Guided tasks">
            <BaGuidedTasks tasks={data.guidedTasks} />
          </DashboardPanelShell>
          <DashboardPanelShell panelId="cross-role" title="Cross-role impact">
            <BaCrossRoleImpact impacts={data.crossRoleImpact} />
          </DashboardPanelShell>
        </div>

        <DashboardPanelShell panelId="stakeholders" title="Stakeholder connections">
          <BaStakeholderPanel connections={data.stakeholderConnections} />
        </DashboardPanelShell>

        <DashboardPanelShell panelId="traceability" title="Traceability preview">
          <BaTraceabilityPreview
            rows={data.traceabilityPreview}
            projectId={data.primaryProject?.id}
          />
        </DashboardPanelShell>

        <DashboardPanelShell panelId="success-metrics" title="Success metrics">
          <section className={`${dxClass.card} p-6`}>
            <ClampableSummary
              quote={false}
              text="Track approval rate, clarification time, story quality, and traceability coverage on the learning dashboard — target 80% less ambiguity and 30% better delivery success."
            />
            <Link
              href="/workspace/intelligence"
              className="mt-3 inline-block text-xs font-medium text-[#1C4A2E] hover:underline"
            >
              Open learning dashboard →
            </Link>
          </section>
        </DashboardPanelShell>
      </div>
    </MissionDashboardChrome>
  );
}

function ProjectPicker({
  projects,
  currentId,
}: {
  projects: Array<{ id: string; name: string; status: string }>;
  currentId: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {projects.slice(0, 8).map((p) => (
        <Link
          key={p.id}
          href={`/workspace/ba?project=${p.id}`}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            p.id === currentId
              ? "border-[#1C4A2E] bg-[#EEF5F1] text-[#1C4A2E]"
              : "border-[#E4E4DC] text-[#6B6B64] hover:border-[#A8A89E]"
          }`}
        >
          {p.name}
        </Link>
      ))}
    </div>
  );
}
