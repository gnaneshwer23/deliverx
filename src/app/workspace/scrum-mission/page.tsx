import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getScrumMissionControl } from "@/services/scrumDashboard";
import { MissionDashboardChrome } from "@/components/dx/mission-dashboard-chrome";
import { ScrumDashboardLayout } from "@/components/scrum/scrum-dashboard-layout";
import { ScrumHealthKpiStrip } from "@/components/scrum/scrum-health-kpi-strip";
import { ScrumBurndownPanel } from "@/components/scrum/scrum-burndown-panel";
import {
  ScrumCeremoniesRow,
  ScrumImpedimentBoard,
} from "@/components/scrum/scrum-impediment-ceremonies";
import { PersonaAiSynthesis } from "@/components/dx/persona-ai-synthesis";
import { MissionControlNoProjectBanner } from "@/components/dx/mission-control-empty";
import { MissionBootstrapBanner } from "@/components/dx/mission-bootstrap-banner";
import { listPendingArtifactReviewsForPersona } from "@/services/artifactReviews";
import { PERSONA_REVIEW_LABELS } from "@/lib/approval/persona-reviews";
import { NextUpStrip } from "@/components/dx/next-up-strip";
import { buildMissionNextUpItems } from "@/lib/mission-next-up";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";
import {
  buildScrumHealthSynthesis,
} from "@/lib/scrum-health-kpis";

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
  const [data, pendingReviews] = await Promise.all([
    getScrumMissionControl(params.project),
    listPendingArtifactReviewsForPersona("scrum").catch(() => []),
  ]);

  const projectId = data.primaryProject?.id;
  const scrumAccent = getMissionPersonaAccent("scrum");

  const burndownPoints = data.burndownPoints;

  const teamSummary = buildScrumHealthSynthesis({
    projectName: data.primaryProject?.name,
    impedimentCount: data.impediments.length,
    blockedStories: data.overview.blockedStories,
    completionPct: data.overview.completionPct,
    daysRemaining: data.overview.daysRemaining,
    impedimentTitle: data.impediments[0]?.title,
    fallbackSummary: data.aiSummary,
  });

  const nextUpItems = buildMissionNextUpItems({
    personaId: "scrum",
    primaryProject: data.primaryProject,
    hasProjects: data.projects.length > 0,
    pendingReviews,
    impediments: data.impediments.length,
    impedimentTitle: data.impediments[0]?.title,
    blockedTasks: data.overview.blockedStories,
    guidedTaskTitle: data.guidedTasks[0]?.title,
    guidedTaskHref: data.primaryProject ? `/project/${data.primaryProject.id}/scrum` : undefined,
  });

  const dashboard = (
    <ScrumDashboardLayout
      aiSynthesis={
        <PersonaAiSynthesis
          title="What's blocking the team as a unit"
          summary={teamSummary}
          accent={scrumAccent}
        />
      }
      kpiStrip={<ScrumHealthKpiStrip data={data} projectId={projectId} />}
      burndownPanel={
        <ScrumBurndownPanel
          points={burndownPoints}
          sprintLabel={data.overview.sprintLabel}
          plannedPoints={data.sprintHealth.plannedPoints}
          completedPoints={data.sprintHealth.completedPoints}
          usesFallback={data.dataSources.burndown === "fallback"}
        />
      }
      impedimentCeremonyRow={
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ScrumImpedimentBoard
            impediments={data.impediments}
            insight={data.impedimentInsight}
          />
          <ScrumCeremoniesRow
            projectId={projectId}
            ceremonies={data.ceremonies}
            standupBlockers={data.standupSummary.blockers}
          />
        </div>
      }
    />
  );

  return (
    <MissionDashboardChrome
      personaId="scrum"
      header={{
        userName: data.userName,
        primaryProject: data.primaryProject,
      }}
    >
      <div className="space-y-4 p-6 md:p-8">
        {data.projects.length === 0 ? <MissionControlNoProjectBanner persona="Scrum" /> : null}
        <MissionBootstrapBanner
          personaId="scrum"
          projectId={data.primaryProject?.id}
          showFallback={data.dataSources.velocity === "fallback" || data.dataSources.burndown === "fallback"}
        />
        <NextUpStrip
          items={nextUpItems}
          personaLabel={PERSONA_REVIEW_LABELS.scrum}
          personaId="scrum"
        />
        {data.projects.length > 1 && data.primaryProject ? (
          <div className="flex flex-wrap gap-2">
            {data.projects.slice(0, 8).map((p) => (
              <Link
                key={p.id}
                href={`/workspace/scrum-mission?project=${p.id}`}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  p.id === data.primaryProject?.id
                    ? ""
                    : "border-[#E4E4DC] text-[#6B6B64]"
                }`}
                style={
                  p.id === data.primaryProject?.id
                    ? {
                        borderColor: scrumAccent.primary,
                        backgroundColor: scrumAccent.bg,
                        color: scrumAccent.text,
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
