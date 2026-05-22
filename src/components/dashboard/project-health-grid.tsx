import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ProjectHealthSummary } from "@/services/dashboard";

const TIER = {
  healthy: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  watch: "bg-amber-50 text-amber-700 ring-amber-200",
  "at-risk": "bg-rose-50 text-rose-700 ring-rose-200",
};

const SCORE_COLOR = (n: number) =>
  n >= 80 ? "text-emerald-600" : n >= 60 ? "text-amber-600" : "text-rose-600";

export function ProjectHealthGrid({ projects }: { projects: ProjectHealthSummary[] }) {
  if (projects.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No active projects.{" "}
        <Link href="/project/new" className="font-medium text-[#0F766E] hover:underline">
          Create one
        </Link>{" "}
        to see health signals.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((p) => (
        <Link
          key={p.id}
          href={`/project/${p.id}`}
          className="group rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:border-[#0F766E]/30 hover:bg-white hover:shadow-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-medium text-[#0F172A] group-hover:text-[#0F766E]">
                {p.name}
              </p>
              <p className="text-xs capitalize text-slate-400">{p.status}</p>
            </div>
            <ArrowUpRight
              size={14}
              className="shrink-0 text-slate-300 group-hover:text-[#0F766E]"
            />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className={`text-2xl font-bold ${SCORE_COLOR(p.healthScore)}`}>
              {p.healthScore}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${TIER[p.healthTier]}`}
            >
              {p.healthTier.replace("-", " ")}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
            <span>{p.confidenceScore}% confidence</span>
            {p.openRisks > 0 ? <span>{p.openRisks} risks</span> : null}
            {p.blockers > 0 ? <span className="text-rose-600">{p.blockers} blocked</span> : null}
            {p.overdueTasks > 0 ? (
              <span className="text-amber-600">{p.overdueTasks} overdue</span>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}
