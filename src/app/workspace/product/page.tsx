import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProductMissionControl } from "@/services/pmDashboard";
import { MissionDashboardChrome } from "@/components/dx/mission-dashboard-chrome";
import { DashboardPanelShell } from "@/components/dx/dashboard-panel-shell";
import {
  ProductAiSummary,
  ProductMissionOverview,
  ProductVisionPanel,
} from "@/components/product/product-mission-overview";
import {
  OpportunityTreePanel,
  ProductAdoptionPanel,
  ProductCrossRolePanel,
  ProductGuidedTasks,
  ProductRicePanel,
  ProductRoadmapPanel,
  ProductSegmentsPanel,
} from "@/components/product/product-panels";
import { MissionControlNoProjectBanner } from "@/components/dx/mission-control-empty";
import { MockDataBanner } from "@/components/dx/mock-data-banner";
import { MissionPredictionKpis } from "@/components/prediction/mission-prediction-kpis";
import { CollaborativePanelsGrid } from "@/components/collaborative/collaborative-panels-grid";
import { getCollaborativeLoopSnapshot } from "@/services/collaborativeLoop";
import { listPendingArtifactReviewsForPersona } from "@/services/artifactReviews";
import { PERSONA_REVIEW_LABELS } from "@/lib/approval/persona-reviews";
import { NextUpStrip } from "@/components/dx/next-up-strip";
import { buildMissionNextUpItems } from "@/lib/mission-next-up";
import { dxClass } from "@/lib/dx-theme";

export const dynamic = "force-dynamic";

export default async function ProductMissionControlPage({
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
    profile?.role !== "product_manager" &&
    profile?.role !== "pm" &&
    profile?.role !== "executive"
  ) {
    redirect("/workspace/dashboard");
  }

  const params = await searchParams;
  const [data, collaborativeLoop, pendingReviews] = await Promise.all([
    getProductMissionControl(params.project),
    getCollaborativeLoopSnapshot("product", params.project),
    listPendingArtifactReviewsForPersona("product").catch(() => []),
  ]);

  const nextUpItems = buildMissionNextUpItems({
    personaId: "product",
    primaryProject: data.primaryProject,
    hasProjects: data.projects.length > 0,
    pendingReviews,
    guidedTaskTitle: data.guidedTasks[0]?.title,
    guidedTaskHref: data.primaryProject
      ? `/project/${data.primaryProject.id}/product`
      : undefined,
  });

  return (
    <MissionDashboardChrome
      personaId="product"
      header={{
        userName: data.userName,
        primaryProject: data.primaryProject,
      }}
    >
      <div className="space-y-4 p-6 md:p-8">
        {data.projects.length === 0 ? <MissionControlNoProjectBanner persona="Product" /> : null}
        {data.dataSources.roadmapRice === "fallback" ? (
          <MockDataBanner message="Roadmap and RICE are illustrative until you run product analysis." />
        ) : null}
        <NextUpStrip items={nextUpItems} personaLabel={PERSONA_REVIEW_LABELS.product} />

        {data.projects.length > 1 && data.primaryProject ? (
          <div className="flex flex-wrap gap-2">
            {data.projects.slice(0, 8).map((p) => (
              <Link
                key={p.id}
                href={`/workspace/product?project=${p.id}`}
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

        <ProductMissionOverview data={data} />
        {data.primaryProject ? (
          <MissionPredictionKpis projectId={data.primaryProject.id} />
        ) : null}
        <ProductAiSummary
          summary={data.aiSummary}
          differentiation={data.differentiationInsight}
          projectId={data.primaryProject?.id}
        />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DashboardPanelShell panelId="guided-tasks" title="Guided tasks">
            <ProductGuidedTasks tasks={data.guidedTasks} />
          </DashboardPanelShell>
          <DashboardPanelShell panelId="vision" title="Product vision">
            <ProductVisionPanel vision={data.vision} />
          </DashboardPanelShell>
        </div>

        <DashboardPanelShell panelId="roadmap" title="Roadmap">
          <ProductRoadmapPanel
            roadmap={data.roadmap}
            usesFallback={data.dataSources.roadmapRice === "fallback"}
          />
        </DashboardPanelShell>
        <DashboardPanelShell panelId="rice" title="RICE prioritisation">
          <ProductRicePanel
            features={data.topFeatures}
            usesFallback={data.dataSources.roadmapRice === "fallback"}
          />
        </DashboardPanelShell>
        <DashboardPanelShell panelId="opportunity-tree" title="Opportunity tree">
          <OpportunityTreePanel tree={data.opportunityTree} />
        </DashboardPanelShell>

        {data.topPainPoints.length > 0 ? (
          <DashboardPanelShell panelId="pain-points" title="Top customer pain points">
            <div className={`${dxClass.card} p-6`}>
              <ol className="list-inside list-decimal text-sm text-[#6B6B64]">
                {data.topPainPoints.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ol>
            </div>
          </DashboardPanelShell>
        ) : null}

        <DashboardPanelShell panelId="segments" title="Customer segments">
          <ProductSegmentsPanel segments={data.customerSegments} />
        </DashboardPanelShell>
        <DashboardPanelShell panelId="adoption" title="Feature adoption">
          <ProductAdoptionPanel adoption={data.featureAdoption} voc={data.voiceOfCustomer} />
        </DashboardPanelShell>
        <DashboardPanelShell panelId="collaborative-loop" title="Collaborative loop">
          <CollaborativePanelsGrid snapshot={collaborativeLoop} />
        </DashboardPanelShell>
        <DashboardPanelShell panelId="cross-role" title="Cross-role impact">
          <ProductCrossRolePanel impacts={data.crossRoleImpact} />
        </DashboardPanelShell>

        <DashboardPanelShell panelId="stakeholders" title="Stakeholder connections">
          <div className={`${dxClass.card} p-6`}>
            <ul className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              {data.stakeholderConnections.map((s) => (
                <li key={s.stakeholder} className="flex justify-between border-b border-[#F0F0E8] py-2">
                  <span className="font-medium">{s.stakeholder}</span>
                  <span className="text-[#6B6B64]">{s.dependency}</span>
                </li>
              ))}
            </ul>
          </div>
        </DashboardPanelShell>
      </div>
    </MissionDashboardChrome>
  );
}
