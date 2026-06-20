import Link from "next/link";
import {
  getOrgGovernanceStats,
  getGovernanceRollup,
} from "@/services/governance";
import { DxPageHeader, DxStatCard } from "@/components/dx/dx-page-chrome";
import { dxClass } from "@/lib/dx-theme";

export const dynamic = "force-dynamic";

export default async function WorkspaceGovernancePage() {
  const [stats, rollup] = await Promise.all([
    getOrgGovernanceStats(),
    getGovernanceRollup(),
  ]);

  return (
    <>
      <DxPageHeader
        breadcrumb="DeliverX · Workspace"
        title="Team"
        titleEm="& governance"
      />
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

        <div className="mb-4 flex flex-wrap gap-2">
          <QuickLink href="/workspace/raid" label="RAID log" />
          <QuickLink href="/workspace/decisions" label="Decisions" />
          <QuickLink href="/workspace/changes" label="Changes" />
          <QuickLink href="/workspace/meetings" label="Meetings" />
        </div>

        <div className={`${dxClass.card} overflow-x-auto`}>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#E4E4DC] bg-[#F7F7F2]">
                {["Project", "Open risks", "Open issues", "Pending decisions", ""].map((h) => (
                  <th
                    key={h || "action"}
                    className="px-4 py-3 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-[0.12em] text-[#6B6B64]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rollup.map((row) => (
                <tr key={row.project_id} className="border-b border-[#F0F0E8] last:border-0">
                  <td className="px-4 py-3 font-medium">{row.project_name}</td>
                  <td className="px-4 py-3">{row.open_risks}</td>
                  <td className="px-4 py-3">{row.open_issues}</td>
                  <td className="px-4 py-3">{row.pending_decisions}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/project/${row.project_id}/raid`}
                      className="text-sm text-[#1C4A2E] hover:underline"
                    >
                      Open RAID
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="border border-[#E4E4DC] px-3 py-1.5 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.1em] text-[#6B6B64] hover:border-[#1C4A2E] hover:text-[#1C4A2E]"
    >
      {label}
    </Link>
  );
}
