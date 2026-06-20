import Link from "next/link";
import type { OrgGovernanceStats } from "@/services/governance";
import { governanceTabHref } from "@/lib/governance-tabs";

export function GovernancePulse({ stats }: { stats: OrgGovernanceStats }) {
  const items = [
    {
      label: "Open risks",
      value: stats.openRisks,
      href: governanceTabHref("risks"),
      color: stats.openRisks > 0 ? "text-rose-600" : "text-slate-700",
    },
    {
      label: "Open issues",
      value: stats.openIssues,
      href: governanceTabHref("risks"),
      color: stats.openIssues > 0 ? "text-amber-600" : "text-slate-700",
    },
    {
      label: "Pending decisions",
      value: stats.pendingDecisions,
      href: governanceTabHref("decisions"),
      color: stats.pendingDecisions > 0 ? "text-indigo-600" : "text-slate-700",
    },
    {
      label: "Open changes",
      value: stats.openChanges,
      href: governanceTabHref("changes"),
      color: stats.openChanges > 0 ? "text-violet-600" : "text-slate-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 transition hover:border-[#0F766E]/20 hover:bg-white"
        >
          <p className="text-[11px] uppercase tracking-wide text-slate-400">{item.label}</p>
          <p className={`mt-1 text-xl font-bold ${item.color}`}>{item.value}</p>
        </Link>
      ))}
    </div>
  );
}
