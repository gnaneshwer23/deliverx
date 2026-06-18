import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProductMissionControl } from "@/services/pmDashboard";
import { MissionPersonaHeader } from "@/components/dx/mission-persona-header";
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
import { PendingReviewsStrip } from "@/components/approvals/pending-reviews-strip";
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

  return (
    <>
      <MissionPersonaHeader
        personaId="product"
        userName={data.userName}
        primaryProject={data.primaryProject}
      />
      <div className="space-y-6 p-6 md:p-8">
        {data.projects.length === 0 ? <MissionControlNoProjectBanner persona="Product" /> : null}
        {data.dataSources.roadmapRice === "fallback" ? (
          <MockDataBanner message="Roadmap and RICE are illustrative until you run product analysis." />
        ) : null}
        <PendingReviewsStrip
          reviews={pendingReviews}
          personaLabel={PERSONA_REVIEW_LABELS["product"]}
          persona="product"
          inlineActions
        />

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

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ProductGuidedTasks tasks={data.guidedTasks} />
          <ProductVisionPanel vision={data.vision} />
        </div>

        <ProductRoadmapPanel
          roadmap={data.roadmap}
          usesFallback={data.dataSources.roadmapRice === "fallback"}
        />
        <ProductRicePanel
          features={data.topFeatures}
          usesFallback={data.dataSources.roadmapRice === "fallback"}
        />
        <OpportunityTreePanel tree={data.opportunityTree} />

        {data.topPainPoints.length > 0 ? (
          <div className={`${dxClass.card} p-6`}>
            <h3 className={`${dxClass.display} mb-3 text-lg`}>Top customer pain points</h3>
            <ol className="list-inside list-decimal text-sm text-[#6B6B64]">
              {data.topPainPoints.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ol>
          </div>
        ) : null}

        <ProductSegmentsPanel segments={data.customerSegments} />
        <ProductAdoptionPanel adoption={data.featureAdoption} voc={data.voiceOfCustomer} />
        <CollaborativePanelsGrid snapshot={collaborativeLoop} />
        <ProductCrossRolePanel impacts={data.crossRoleImpact} />

        <div className={`${dxClass.card} p-6`}>
          <h3 className={`${dxClass.display} mb-2 text-lg`}>Stakeholder connections</h3>
          <ul className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            {data.stakeholderConnections.map((s) => (
              <li key={s.stakeholder} className="flex justify-between border-b border-[#F0F0E8] py-2">
                <span className="font-medium">{s.stakeholder}</span>
                <span className="text-[#6B6B64]">{s.dependency}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
