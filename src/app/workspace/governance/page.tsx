import {
  getOrgGovernanceStats,
  listOrgChangeRequests,
  listOrgDecisions,
  listOrgRaidItems,
} from "@/services/governance";
import { listPendingApprovals } from "@/services/approvals";
import { DxPageHeader, DxStatCard } from "@/components/dx/dx-page-chrome";
import { GovernanceTabNav } from "@/components/governance/governance-tab-nav";
import { GovernanceEmptyState } from "@/components/governance/governance-empty-state";
import {
  GovernanceApprovalsPanel,
  GovernanceChangesPanel,
  GovernanceDecisionsPanel,
  GovernanceRisksPanel,
} from "@/components/governance/governance-tab-panels";
import {
  governanceEmptyStateForTab,
  parseGovernanceTab,
  type GovernanceTabId,
} from "@/lib/governance-tabs";

export const dynamic = "force-dynamic";

export default async function WorkspaceGovernancePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab = parseGovernanceTab(params.tab);

  const [stats, raidItems, decisions, changes, pendingApprovals] = await Promise.all([
    getOrgGovernanceStats(),
    listOrgRaidItems({ status: ["open", "mitigated"], limit: 200 }),
    listOrgDecisions({ limit: 200 }),
    listOrgChangeRequests({ limit: 200 }),
    listPendingApprovals(50),
  ]);

  const tabCounts: Partial<Record<GovernanceTabId, number>> = {
    risks: stats.openRisks + stats.openIssues,
    decisions: stats.pendingDecisions,
    changes: stats.openChanges,
    approvals: pendingApprovals.length,
  };

  const isEmpty = tabContentIsEmpty(tab, {
    raidItems,
    decisions,
    changes,
    pendingApprovals,
  });

  return (
    <>
      <DxPageHeader breadcrumb="DeliverX · Workspace" title="Governance" />
      <div className="p-6 md:p-8">
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <DxStatCard
            label="Open risks"
            value={stats.openRisks}
            tone={stats.openRisks ? "red" : "default"}
          />
          <DxStatCard
            label="Open issues"
            value={stats.openIssues}
            tone={stats.openIssues ? "amber" : "default"}
          />
          <DxStatCard
            label="Pending decisions"
            value={stats.pendingDecisions}
            tone={stats.pendingDecisions ? "amber" : "default"}
          />
          <DxStatCard
            label="Open changes"
            value={stats.openChanges}
            tone={stats.openChanges ? "amber" : "default"}
          />
        </div>

        <GovernanceTabNav activeTab={tab} counts={tabCounts} />

        {isEmpty ? (
          <GovernanceEmptyState config={governanceEmptyStateForTab(tab)} />
        ) : (
          <div data-governance-tab={tab}>
            {tab === "risks" ? <GovernanceRisksPanel items={raidItems} /> : null}
            {tab === "decisions" ? <GovernanceDecisionsPanel decisions={decisions} /> : null}
            {tab === "changes" ? <GovernanceChangesPanel changes={changes} /> : null}
            {tab === "approvals" ? (
              <GovernanceApprovalsPanel pending={pendingApprovals} />
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}

function tabContentIsEmpty(
  tab: GovernanceTabId,
  data: {
    raidItems: Awaited<ReturnType<typeof listOrgRaidItems>>;
    decisions: Awaited<ReturnType<typeof listOrgDecisions>>;
    changes: Awaited<ReturnType<typeof listOrgChangeRequests>>;
    pendingApprovals: Awaited<ReturnType<typeof listPendingApprovals>>;
  },
): boolean {
  switch (tab) {
    case "risks":
      return data.raidItems.length === 0;
    case "decisions":
      return data.decisions.length === 0;
    case "changes":
      return data.changes.length === 0;
    case "approvals":
      return data.pendingApprovals.length === 0;
    default:
      return true;
  }
}
