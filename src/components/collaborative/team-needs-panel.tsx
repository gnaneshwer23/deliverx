import Link from "next/link";
import { dxClass } from "@/lib/dx-theme";
import type { TeamNeedRow } from "@/services/collaborativeLoopEngine";

const KIND_LABEL: Record<TeamNeedRow["kind"], string> = {
  clarification: "Clarification",
  blocker: "Blocker",
  decision: "Decision",
  defect: "Defect",
};

const KIND_STYLE: Record<TeamNeedRow["kind"], string> = {
  clarification: "bg-indigo-50 text-indigo-700 border-indigo-200",
  blocker: "bg-rose-50 text-rose-700 border-rose-200",
  decision: "bg-amber-50 text-amber-800 border-amber-200",
  defect: "bg-violet-50 text-violet-700 border-violet-200",
};

const PRIORITY_DOT: Record<TeamNeedRow["priority"], string> = {
  high: "bg-rose-500",
  medium: "bg-amber-500",
  low: "bg-slate-400",
};

export function TeamNeedsPanel({ needs }: { needs: TeamNeedRow[] }) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>AI Review Queue</h3>
        <p className="mt-1 text-xs text-[#6B6B64]">
          Open clarifications, blockers, decisions, and defects awaiting review
        </p>
      </div>
      <ul className="divide-y divide-[#F0F0E8]">
        {needs.length ? (
          needs.map((need) => (
            <li key={need.id} className="px-6 py-4 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${KIND_STYLE[need.kind]}`}
                    >
                      {KIND_LABEL[need.kind]}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#A8A89E]">
                      <span className={`size-1.5 rounded-full ${PRIORITY_DOT[need.priority]}`} />
                      {need.fromStakeholder}
                    </span>
                  </div>
                  <p className="mt-2 font-medium text-[#0D0D0B]">{need.title}</p>
                  {need.dueLabel ? (
                    <p className="mt-1 text-xs text-[#A8A89E]">Due: {need.dueLabel}</p>
                  ) : null}
                </div>
                {need.href ? (
                  <Link href={need.href} className={`${dxClass.btnGhost} shrink-0 text-[10px]`}>
                    Open
                  </Link>
                ) : null}
              </div>
            </li>
          ))
        ) : (
          <li className="px-6 py-4 text-[#6B6B64]">
            No open items in your AI Review Queue from live delivery signals.
          </li>
        )}
      </ul>
    </div>
  );
}
