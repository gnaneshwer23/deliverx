import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import {
  getOrgGovernanceStats,
  getGovernanceRollup,
} from "@/services/governance";
import { PageHeader } from "@/components/shared/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function WorkspaceGovernancePage() {
  const [stats, rollup] = await Promise.all([
    getOrgGovernanceStats(),
    getGovernanceRollup(),
  ]);

  const kpis = [
    { label: "Open risks", value: stats.openRisks },
    { label: "Open issues", value: stats.openIssues },
    { label: "Pending decisions", value: stats.pendingDecisions },
    { label: "Open changes", value: stats.openChanges },
  ];

  return (
    <main className="p-8">
      <PageHeader
        title="Governance"
        description="Cross-project RAID, decisions, and change rollup."
        icon={ShieldCheck}
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{k.label}</p>
            <p className="mt-1 text-2xl font-bold">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50 text-slate-500">
            <TableRow>
              <TableHead className="px-4">Project</TableHead>
              <TableHead className="px-4">Open risks</TableHead>
              <TableHead className="px-4">Open issues</TableHead>
              <TableHead className="px-4">Pending decisions</TableHead>
              <TableHead className="px-4"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rollup.map((row) => (
              <TableRow key={row.project_id}>
                <TableCell className="px-4 font-medium">{row.project_name}</TableCell>
                <TableCell className="px-4">{row.open_risks}</TableCell>
                <TableCell className="px-4">{row.open_issues}</TableCell>
                <TableCell className="px-4">{row.pending_decisions}</TableCell>
                <TableCell className="px-4 text-right">
                  <Link
                    href={`/project/${row.project_id}/raid`}
                    className="text-sm text-[#0F766E] hover:underline"
                  >
                    Open RAID
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
