import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPmMissionControl } from "@/services/deliveryPmDashboard";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import {
  DeliveryPmAiSummary,
  DeliveryPmMissionOverview,
} from "@/components/delivery-pm/delivery-pm-mission-overview";
import {
  DeliveryBenefitsPanel,
  DeliveryBudgetPanel,
  DeliveryCrossRolePanel,
  DeliveryDecisionsPanel,
  DeliveryHealthPanel,
  DeliveryMilestonesPanel,
  DeliveryPmGuidedTasks,
  DeliveryRaidPanel,
  DeliveryStakeholdersPanel,
} from "@/components/delivery-pm/delivery-pm-panels";
import { DeliveryStatusReportsPanel } from "@/components/delivery-pm/delivery-status-reports-panel";
import { DeliveryStakeholderActionQueue } from "@/components/delivery-pm/delivery-stakeholder-action-queue";
import { MissionControlNoProjectBanner } from "@/components/dx/mission-control-empty";
import { ProjectMemoryPanel } from "@/components/memory/project-memory-panel";
import { getProjectMemoryStats } from "@/services/projectMemoryRag";
import { dxClass } from "@/lib/dx-theme";

export const dynamic = "force-dynamic";

export default async function PmMissionControlPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .maybeSingle();

  if (profile?.role !== "pm" && profile?.role !== "executive") {
    redirect("/workspace/dashboard");
  }

  const params = await searchParams;
  const data = await getPmMissionControl(params.project);
  const memoryStats = data.primaryProject
    ? await getProjectMemoryStats(data.primaryProject.id).catch(() => ({
        totalChunks: 0,
        bySource: {},
      }))
    : undefined;

  return (
    <>
      <DxPageHeader
        breadcrumb="DeliverX OS · Delivery PM"
        title="PM Mission"
        titleEm="control"
        action={
          data.primaryProject ? (
            <Link
              href={`/project/${data.primaryProject.id}/delivery`}
              className={`${dxClass.btnPrimary} text-[10px]`}
            >
              Delivery workspace →
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
          AI Chief Project Officer — scope, timeline, budget, risks, stakeholders, governance, and
          guided delivery execution from business case to benefits realisation.
        </p>

        {data.projects.length === 0 ? <MissionControlNoProjectBanner persona="PM" /> : null}

        {data.projects.length > 1 && data.primaryProject ? (
          <div className="flex flex-wrap gap-2">
            {data.projects.slice(0, 8).map((p) => (
              <Link
                key={p.id}
                href={`/workspace/pm-mission?project=${p.id}`}
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

        <DeliveryPmMissionOverview data={data} />
        <DeliveryPmAiSummary summary={data.aiSummary} projectId={data.primaryProject?.id} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <DeliveryPmGuidedTasks tasks={data.guidedTasks} />
          <DeliveryHealthPanel
            dimensions={data.healthDimensions}
            insight={data.healthInsight}
          />
        </div>

        <DeliveryStakeholdersPanel rows={data.stakeholders} />
        <DeliveryStakeholderActionQueue actions={data.stakeholderActionQueue} />
        <DeliveryStatusReportsPanel
          projectId={data.primaryProject?.id}
          reports={data.statusReports}
        />
        <ProjectMemoryPanel
          projectId={data.primaryProject?.id}
          initialStats={memoryStats}
        />
        <DeliveryRaidPanel raid={data.raid} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <DeliveryMilestonesPanel
            milestones={data.milestones}
            goLiveProbability={data.overview.goLiveProbability}
          />
          <DeliveryBudgetPanel budget={data.budget} />
        </div>

        <DeliveryBenefitsPanel benefits={data.benefits} />
        <DeliveryDecisionsPanel decisions={data.decisions} />
        <DeliveryCrossRolePanel impacts={data.crossRoleImpact} />
      </div>
    </>
  );
}
