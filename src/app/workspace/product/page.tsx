import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProductMissionControl } from "@/services/pmDashboard";
import { MissionDashboardChrome } from "@/components/dx/mission-dashboard-chrome";
import { ProductDashboardLayout } from "@/components/product/product-dashboard-layout";
import { ProductRoadmapKpiStrip } from "@/components/product/product-roadmap-kpi-strip";
import { ProductRoadmapKanban } from "@/components/product/product-roadmap-kanban";
import { ProductRiceBacklogTable } from "@/components/product/product-rice-backlog-table";
import { PersonaAiSynthesis } from "@/components/dx/persona-ai-synthesis";
import { MissionControlNoProjectBanner } from "@/components/dx/mission-control-empty";
import { MissionBootstrapBanner } from "@/components/dx/mission-bootstrap-banner";
import { listPendingArtifactReviewsForPersona } from "@/services/artifactReviews";
import { PERSONA_REVIEW_LABELS, filterReviewsByProject } from "@/lib/approval/persona-reviews";
import { NextUpStrip } from "@/components/dx/next-up-strip";
import { buildMissionNextUpItems } from "@/lib/mission-next-up";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";
import { buildProductRoadmapSynthesis } from "@/lib/product-roadmap-kpis";

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
  const [data, pendingReviews] = await Promise.all([
    getProductMissionControl(params.project),
    listPendingArtifactReviewsForPersona("product").catch(() => []),
  ]);

  const projectId = data.primaryProject?.id;
  const projectPendingReviews = filterReviewsByProject(pendingReviews, projectId);
  const productAccent = getMissionPersonaAccent("product");
  const isLive = data.dataSources.roadmapRice === "live";

  const roadmapSummary = buildProductRoadmapSynthesis({
    projectName: data.primaryProject?.name,
    nowCount: data.roadmap.now.length,
    nextCount: data.roadmap.next.length,
    pendingReviewCount: projectPendingReviews.length,
    productHealth: data.kpis.productHealth,
    isLive,
    fallbackSummary: data.aiSummary,
  });

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

  const dashboard = (
    <ProductDashboardLayout
      aiSynthesis={
        <PersonaAiSynthesis
          title="What's blocking adoption/roadmap progress"
          summary={roadmapSummary}
          accent={productAccent}
        />
      }
      kpiStrip={<ProductRoadmapKpiStrip data={data} projectId={projectId} />}
      roadmapKanban={
        <ProductRoadmapKanban
          roadmap={data.roadmap}
          usesFallback={!isLive}
          projectId={projectId}
        />
      }
      riceBacklog={
        <ProductRiceBacklogTable features={data.topFeatures} usesFallback={!isLive} />
      }
    />
  );

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
        <MissionBootstrapBanner
          personaId="product"
          projectId={data.primaryProject?.id}
          showFallback={!isLive}
        />
        <NextUpStrip
          items={nextUpItems}
          personaLabel={PERSONA_REVIEW_LABELS.product}
          personaId="product"
        />
        {data.projects.length > 1 && data.primaryProject ? (
          <div className="flex flex-wrap gap-2">
            {data.projects.slice(0, 8).map((p) => (
              <Link
                key={p.id}
                href={`/workspace/product?project=${p.id}`}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  p.id === data.primaryProject?.id
                    ? ""
                    : "border-[#E4E4DC] text-[#6B6B64]"
                }`}
                style={
                  p.id === data.primaryProject?.id
                    ? {
                        borderColor: productAccent.primary,
                        backgroundColor: productAccent.bg,
                        color: productAccent.text,
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
      </div>
    </MissionDashboardChrome>
  );
}
