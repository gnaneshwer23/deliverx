import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProgrammeSummary } from "@/services/portfolioEngine";

const STATUS_STYLE: Record<string, string> = {
  planning: "bg-slate-100 text-slate-700",
  active: "bg-emerald-100 text-emerald-700",
  paused: "bg-amber-100 text-amber-700",
  completed: "bg-indigo-100 text-indigo-700",
  cancelled: "bg-rose-100 text-rose-700",
};

const HEALTH_TIER = (n: number) =>
  n >= 80
    ? "text-emerald-600"
    : n >= 60
      ? "text-amber-600"
      : n === 0
        ? "text-slate-400"
        : "text-rose-600";

export function ProgrammeCard({ programme }: { programme: ProgrammeSummary }) {
  return (
    <Link
      href={`/workspace/programmes/${programme.id}`}
      className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900">{programme.name}</p>
          <span
            className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${
              STATUS_STYLE[programme.status] ?? STATUS_STYLE.active
            }`}
          >
            {programme.status}
          </span>
        </div>
        <ArrowRight
          size={14}
          className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-500"
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-slate-500">
        <div>
          <p className="text-[10px] uppercase tracking-wide">Health</p>
          <p
            className={`mt-0.5 text-base font-semibold ${HEALTH_TIER(programme.health)}`}
          >
            {programme.health || "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide">Projects</p>
          <p className="mt-0.5 text-base font-semibold text-slate-900">
            {programme.projectCount}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide">At Risk</p>
          <p
            className={`mt-0.5 text-base font-semibold ${
              programme.atRiskCount > 0 ? "text-rose-600" : "text-slate-900"
            }`}
          >
            {programme.atRiskCount}
          </p>
        </div>
      </div>

      {programme.risks.length > 0 ? (
        <p className="mt-3 line-clamp-2 text-xs text-slate-500">
          ⚠ {programme.risks[0]}
        </p>
      ) : null}
    </Link>
  );
}
