import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBaMissionControl } from "@/services/baDashboard";
import { DxPageHeader, DxStatCard } from "@/components/dx/dx-page-chrome";
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
    <>
      <DxPageHeader
        breadcrumb="DeliverX OS · Business Analysis"
        title="BA Mission"
        titleEm="control"
        action={
          data.primaryProject ? (
            <Link
              href={`/project/${data.primaryProject.id}/requirements`}
              className={`${dxClass.btnPrimary} text-[10px]`}
            >
              Requirements workspace →
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
          Bridge business and delivery — guided tasks, requirement quality, stakeholder
          validation, and traceability from business case to benefits.
        </p>

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

        <CollaborativePanelsGrid snapshot={collaborativeLoop} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <BaGuidedTasks tasks={data.guidedTasks} />
          <BaCrossRoleImpact impacts={data.crossRoleImpact} />
        </div>

        <BaStakeholderPanel connections={data.stakeholderConnections} />

        <BaTraceabilityPreview
          rows={data.traceabilityPreview}
          projectId={data.primaryProject?.id}
        />

        <section className={`${dxClass.card} p-6`}>
          <h3 className={`${dxClass.display} mb-2 text-lg`}>Success metrics (goal)</h3>
          <p className="text-sm text-[#6B6B64]">
            Reduce requirement ambiguity by 80% and improve delivery success by 30% — track
            approval rate, clarification time, story quality, traceability coverage, and
            delivery readiness on the{" "}
            <Link href="/workspace/intelligence" className="text-[#1C4A2E] underline">
              learning dashboard
            </Link>
            .
          </p>
        </section>
      </div>
    </>
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
