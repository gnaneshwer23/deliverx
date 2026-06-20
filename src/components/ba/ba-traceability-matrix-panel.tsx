"use client";

import Link from "next/link";
import type { TraceMatrixRow } from "@/services/baRequirementEngine";
import { dxClass } from "@/lib/dx-theme";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";

const baAccent = getMissionPersonaAccent("ba");

export function BaTraceabilityMatrixPanel({
  rows,
  projectId,
}: {
  rows: TraceMatrixRow[];
  projectId?: string;
}) {
  if (rows.length === 0) {
    return (
      <div
        className={`${dxClass.card} border-t-2 p-6 text-sm text-[#6B6B64]`}
        style={{ borderTopColor: baAccent.primary }}
        data-panel="ba-traceability-matrix"
      >
        <h3 className={`${dxClass.display} mb-2 text-lg text-[#0D0D0B]`}>Traceability matrix</h3>
        <p>Req → Story → Test → Release links appear after requirements and user stories are generated.</p>
      </div>
    );
  }

  return (
    <div
      className={`${dxClass.card} overflow-hidden border-t-2 p-0`}
      style={{ borderTopColor: baAccent.primary }}
      data-panel="ba-traceability-matrix"
    >
      <div className="flex items-center justify-between border-b border-[#E4E4DC] px-6 py-4">
        <div>
          <h3 className={`${dxClass.display} text-lg`}>Traceability matrix</h3>
          <p className="text-xs text-[#6B6B64]">Requirement → Story → Test → Release</p>
        </div>
        {projectId ? (
          <Link
            href={`/project/${projectId}/requirements?tab=traceability`}
            className="text-xs font-medium hover:underline"
            style={{ color: baAccent.text }}
          >
            Full matrix →
          </Link>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-xs">
          <thead>
            <tr className="border-b border-[#E4E4DC] bg-[#FEF6EC] text-left uppercase tracking-wide text-[#A8A89E]">
              <th className="px-4 py-2">Requirement</th>
              <th className="px-4 py-2">Story</th>
              <th className="px-4 py-2">Test</th>
              <th className="px-4 py-2">Release</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.requirementId ?? row.reqCode} className="border-b border-[#F0F0E8] last:border-0">
                <td className="px-4 py-2">
                  <span className="font-mono text-[10px] text-[#A8A89E]">{row.reqCode}</span>
                  <div className="font-medium text-[#0D0D0B]">{row.requirement}</div>
                </td>
                <td className="px-4 py-2">
                  {row.story ? (
                    <>
                      {row.storyCode ? (
                        <span className="font-mono text-[10px] text-[#A8A89E]">{row.storyCode} · </span>
                      ) : null}
                      {row.story}
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-2">{row.testCode ?? row.test ?? "—"}</td>
                <td className="px-4 py-2">{row.task ?? "—"}</td>
                <td className="px-4 py-2">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
