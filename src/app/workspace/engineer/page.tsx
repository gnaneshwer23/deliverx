import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEngineerMissionControl } from "@/services/engineerDashboard";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import {
  EngineerAiSummary,
  EngineerMissionOverview,
} from "@/components/engineer/engineer-mission-overview";
import {
  EngineerApiContractsPanel,
  EngineerArchitecturePanel,
  EngineerCicdPanel,
  EngineerCrossRolePanel,
  EngineerDebtPanel,
  EngineerDependenciesPanel,
  EngineerGuidedTasks,
  EngineerPrPanel,
  EngineerStakeholdersPanel,
  EngineerTraceabilityPanel,
} from "@/components/engineer/engineer-panels";
import { GitHubActivityPanel } from "@/components/engineer/github-activity-panel";
import { MissionControlNoProjectBanner } from "@/components/dx/mission-control-empty";
import { MissionPredictionKpis } from "@/components/prediction/mission-prediction-kpis";
import { dxClass } from "@/lib/dx-theme";

export const dynamic = "force-dynamic";

export default async function EngineerMissionControlPage({
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
    profile?.role !== "engineer" &&
    profile?.role !== "team_member" &&
    profile?.role !== "pm"
  ) {
    redirect("/workspace/dashboard");
  }

  const params = await searchParams;
  const data = await getEngineerMissionControl(params.project);

  return (
    <>
      <DxPageHeader
        breadcrumb="DeliverX OS · Engineering"
        title="Engineer Mission"
        titleEm="control"
        action={
          data.primaryProject ? (
            <Link
              href={`/project/${data.primaryProject.id}/engineering`}
              className={`${dxClass.btnPrimary} text-[10px]`}
            >
              Engineering workspace →
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
          AI Engineering Copilot — assigned stories, traceability, dependencies, architecture, CI/CD,
          and guided tasks from requirements to deployment.
        </p>

        {data.projects.length === 0 ? <MissionControlNoProjectBanner persona="Engineering" /> : null}

        {data.projects.length > 1 && data.primaryProject ? (
          <div className="flex flex-wrap gap-2">
            {data.projects.slice(0, 8).map((p) => (
              <Link
                key={p.id}
                href={`/workspace/engineer?project=${p.id}`}
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

        <EngineerMissionOverview data={data} />
        {data.primaryProject ? (
          <MissionPredictionKpis projectId={data.primaryProject.id} />
        ) : null}
        <EngineerAiSummary summary={data.aiSummary} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <EngineerGuidedTasks tasks={data.guidedTasks} />
          <EngineerDependenciesPanel
            dependencies={data.dependencies}
            insight={data.dependencyInsight}
          />
        </div>

        <EngineerTraceabilityPanel rows={data.traceability} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <EngineerArchitecturePanel nodes={data.architecture} />
          <EngineerCicdPanel cicd={data.cicd} />
        </div>

        {data.primaryProject ? (
          <GitHubActivityPanel
            projectId={data.primaryProject.id}
            configured={data.github.configured}
            lastSyncAt={data.github.lastSyncAt}
            openPullRequests={data.github.openPullRequests}
          />
        ) : null}

        <EngineerApiContractsPanel contracts={data.apiContracts} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <EngineerPrPanel pr={data.prDashboard} />
          <EngineerDebtPanel debt={data.technicalDebt} />
        </div>

        <EngineerStakeholdersPanel rows={data.stakeholders} />
        <EngineerCrossRolePanel impacts={data.crossRoleImpact} />
      </div>
    </>
  );
}
