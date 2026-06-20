import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getQaMissionControl } from "@/services/qaDashboard";
import { MissionDashboardChrome } from "@/components/dx/mission-dashboard-chrome";
import { QaMissionShell } from "@/components/qa/qa-mission-shell";
import { QaDashboardLayout } from "@/components/qa/qa-dashboard-layout";
import { QaReleaseKpiStrip } from "@/components/qa/qa-release-kpi-strip";
import { QaReleaseGauge } from "@/components/qa/qa-release-gauge";
import { QaDefectBoard } from "@/components/qa/qa-defect-board";
import { PersonaAiSynthesis } from "@/components/dx/persona-ai-synthesis";
import { MissionControlNoProjectBanner } from "@/components/dx/mission-control-empty";
import { MissionBootstrapBanner } from "@/components/dx/mission-bootstrap-banner";
import { listPendingArtifactReviewsForPersona } from "@/services/artifactReviews";
import { getProjectBootstrapStatus } from "@/services/projectBootstrap";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import { hasBootstrapParitySummary } from "@/lib/bootstrap-checklist";
import { QA_DAY_ONE_SUBTITLE, resolveQaDashboardMode } from "@/lib/qa-dashboard-mode";
import { filterReviewsByProject, PERSONA_REVIEW_LABELS } from "@/lib/approval/persona-reviews";
import { NextUpStrip } from "@/components/dx/next-up-strip";
import { buildMissionNextUpItems } from "@/lib/mission-next-up";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";
import { buildQaReleaseSynthesis } from "@/lib/qa-release-kpis";

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
  const [data, pendingReviews] = await Promise.all([
    getQaMissionControl(params.project),
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
  const isLive = data.dataSources.qaMetrics === "live";

  const releaseSummary = buildQaReleaseSynthesis({
    projectName: data.primaryProject?.name,
    releaseReadiness: data.releaseReadiness.overall,
    recommendation: data.releaseReadiness.recommendation,
    criticalDefects: data.overview.criticalDefects,
    openDefects: data.overview.openDefects,
    testCoverage: data.overview.testCoverage,
    isLive,
    fallbackSummary: data.aiSummary,
  });

  const nextUpItems = buildMissionNextUpItems({
    personaId: "qa",
    primaryProject: data.primaryProject,
    hasProjects: data.projects.length > 0,
    pendingReviews,
    criticalDefects: data.overview.criticalDefects,
    guidedTaskTitle: data.guidedTasks[0]?.title,
    guidedTaskHref: data.primaryProject ? `/project/${data.primaryProject.id}/qa` : undefined,
  });

  const dashboard = (
    <QaDashboardLayout
      aiSynthesis={
        <PersonaAiSynthesis
          title="What's blocking release"
          summary={releaseSummary}
          accent={qaAccent}
        />
      }
      kpiStrip={<QaReleaseKpiStrip data={data} projectId={projectId} />}
      readinessRow={
        <QaReleaseGauge
          readiness={data.releaseReadiness}
          criticalDefects={data.overview.criticalDefects}
        />
      }
      defectBoard={<QaDefectBoard defects={data.defects} />}
    />
  );

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
            showFallback={!isLive}
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
          {dashboard}
        </div>
      </QaMissionShell>
    </MissionDashboardChrome>
  );
}
