import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDefaultPortfolio, getPortfolioSnapshot } from "@/services/portfolio";
import { getPmoSnapshot } from "@/services/portfolio";
import { getOrgGovernanceStats } from "@/services/governance";
import { getOrgAlertQueue } from "@/services/alerts";
import { getDeliveryEvalMetrics } from "@/services/intelligenceMetrics";
import { IntelligenceMetricsPanel } from "@/components/intelligence/intelligence-metrics-panel";
import { DxPageHeader, DxStatCard } from "@/components/dx/dx-page-chrome";
import { AlertQueuePanel } from "@/components/dashboard/alert-queue-panel";
import { ExecutiveSummary } from "@/components/portfolio/executive-summary";
import { dxClass } from "@/lib/dx-theme";

export const dynamic = "force-dynamic";

export default async function ExecutiveDashboardPage() {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .maybeSingle();

  if (profile?.role !== "executive" && profile?.role !== "pm") {
    redirect("/workspace/dashboard");
  }

  const portfolioMeta = await getDefaultPortfolio();
  const [pmo, governance, alerts, evalMetrics] = await Promise.all([
    getPmoSnapshot(),
    getOrgGovernanceStats(),
    getOrgAlertQueue(8),
    getDeliveryEvalMetrics().catch(() => null),
  ]);

  let healthScore = 0;
  let projectCount = 0;
  let programmeCount = 0;
  if (portfolioMeta) {
    const { snapshot, programmes } = await getPortfolioSnapshot(portfolioMeta.id);
    healthScore = snapshot.health;
    projectCount = snapshot.totalProjects;
    programmeCount = programmes.length;
  }

  return (
    <>
      <DxPageHeader
        breadcrumb="DeliverX OS · Executive"
        title="Portfolio"
        titleEm="command"
        action={
          <Link href="/workspace/portfolio" className={`${dxClass.btnGhost} text-[10px]`}>
            Full portfolio →
          </Link>
        }
      />
      <div className="space-y-6 p-6 md:p-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <DxStatCard label="Portfolio health" value={healthScore} hint="/ 100" />
          <DxStatCard label="Active projects" value={projectCount} />
          <DxStatCard label="Open risks" value={governance.openRisks} tone={governance.openRisks ? "red" : "default"} />
          <DxStatCard label="Pending decisions" value={governance.pendingDecisions} tone="amber" />
        </div>

        <ExecutiveSummary summary={pmo.executiveSummary} />

        {evalMetrics ? (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className={`${dxClass.display} text-lg`}>Delivery learning</h2>
              <Link href="/workspace/intelligence" className="text-xs text-[#1C4A2E] underline">
                Full intelligence →
              </Link>
            </div>
            <IntelligenceMetricsPanel metrics={evalMetrics} />
          </section>
        ) : null}

        <section>
          <h2 className={`${dxClass.display} mb-3 text-lg`}>Strategic alerts</h2>
          <AlertQueuePanel alerts={alerts} />
        </section>

        <section className={`${dxClass.cardPad}`}>
          <h2 className={`${dxClass.display} mb-3 text-lg`}>Programme overview</h2>
          <p className="text-sm text-[#6B6B64]">
            {programmeCount} programmes · cross-project dependencies and heatmaps in{" "}
            <Link href="/workspace/twin" className="text-[#1C4A2E] underline">
              digital twin
            </Link>{" "}
            and{" "}
            <Link href="/workspace/global" className="text-[#1C4A2E] underline">
              global intelligence
            </Link>
            .
          </p>
        </section>
      </div>
    </>
  );
}
