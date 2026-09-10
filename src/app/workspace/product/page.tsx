import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProductMissionControl } from "@/services/pmDashboard";
import { MissionDashboardChrome } from "@/components/dx/mission-dashboard-chrome";
import { ProductDashboardLayout } from "@/components/product/product-dashboard-layout";
import { ProductMissionShell } from "@/components/product/product-mission-shell";
import { ProductRoadmapKpiStrip } from "@/components/product/product-roadmap-kpi-strip";
import { ProductRoadmapKanban } from "@/components/product/product-roadmap-kanban";
import { ProductRiceBacklogTable } from "@/components/product/product-rice-backlog-table";
import { ProductPrimaryFocus } from "@/components/product/product-primary-focus";
import { PersonaAiSynthesis } from "@/components/dx/persona-ai-synthesis";
import { MissionControlNoProjectBanner } from "@/components/dx/mission-control-empty";
import { MissionBootstrapBanner } from "@/components/dx/mission-bootstrap-banner";
import { listPendingArtifactReviewsForPersona } from "@/services/artifactReviews";
import { getProjectBootstrapStatus } from "@/services/projectBootstrap";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import { hasBootstrapParitySummary } from "@/lib/bootstrap-checklist";
import {
  PRODUCT_DAY_ONE_SUBTITLE,
  resolveProductDashboardMode,
} from "@/lib/product-dashboard-mode";
import { filterReviewsByProject } from "@/lib/approval/persona-reviews";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";
import {
  buildProductRoadmapSynthesis,
  buildProductRoadmapSubtitle,
} from "@/lib/product-roadmap-kpis";
import { MissionHelmCopilotSlot } from "@/components/copilot/mission-helm-copilot-slot";
import { PersonaStandupTasks } from "@/components/tasks/persona-standup-tasks";
import { resolveWorkspaceOrgProjectId } from "@/lib/professional-workspace/project-context";

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
  const requestedProjectId = resolveWorkspaceOrgProjectId(params.project);
  const [data, pendingReviews] = await Promise.all([
    getProductMissionControl(requestedProjectId ?? undefined),
    listPendingArtifactReviewsForPersona("product").catch(() => []),
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

  const roadmapItemCount =
    data.roadmap.now.length + data.roadmap.next.length + data.roadmap.later.length;

  const serverProductMode = resolveProductDashboardMode({
    projectId,
    hasBootstrapSummary,
    pendingReviewCount: projectPendingReviews.length,
    roadmapItemCount,
    bridgeDismissed: false,
  });

  const productAccent = getMissionPersonaAccent("product");
  const isLive = data.dataSources.roadmapRice === "live";
  const showRiceTab = isLive && data.topFeatures.length > 0;

  const roadmapSummary = buildProductRoadmapSynthesis({
    projectName: data.primaryProject?.name,
    nowCount: data.roadmap.now.length,
    nextCount: data.roadmap.next.length,
    pendingReviewCount: projectPendingReviews.length,
    productHealth: data.kpis.productHealth,
    isLive,
    fallbackSummary: data.aiSummary,
  });

  const steadyStateSubtitle = buildProductRoadmapSubtitle({
    nowCount: data.roadmap.now.length,
    pendingReviewCount: projectPendingReviews.length,
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
      primaryFocus={
        <ProductPrimaryFocus
          showRiceTab={showRiceTab}
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
      }
    />
  );

  return (
    <MissionDashboardChrome
      personaId="product"
      header={{
        userName: data.userName,
        primaryProject: data.primaryProject,
        subtitle:
          serverProductMode === "day-one" ? PRODUCT_DAY_ONE_SUBTITLE : steadyStateSubtitle,
      }}
    >
      <ProductMissionShell
        projectId={projectId}
        hasBootstrapSummary={hasBootstrapSummary}
        pendingReviewCount={projectPendingReviews.length}
        roadmapItemCount={roadmapItemCount}
        summary={bootstrapSummary}
      >
        <div className="space-y-6 p-6 md:p-8">
          {data.projects.length === 0 ? <MissionControlNoProjectBanner persona="Product" /> : null}
          {!hasBootstrapSummary ? (
            <MissionBootstrapBanner
              personaId="product"
              projectId={data.primaryProject?.id}
              showFallback={!isLive}
            />
          ) : null}
          {data.projects.length > 1 && data.primaryProject ? (
            <div className="flex flex-wrap gap-2">
              {data.projects.slice(0, 8).map((p) => (
                <Link
                  key={p.id}
                  href={`/workspace/product?project=${p.id}`}
                  className={`inline-flex min-h-9 touch-manipulation items-center rounded-full border px-3 py-1 text-xs font-medium ${
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
          <PersonaStandupTasks projectId={projectId} />
          {dashboard}
          <MissionHelmCopilotSlot personaId="product" projectId={data.primaryProject?.id} />
        </div>
      </ProductMissionShell>
    </MissionDashboardChrome>
  );
}
