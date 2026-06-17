import Link from "next/link";
import type { TraceMatrixRow } from "@/services/baRequirementEngine";
import { dxClass } from "@/lib/dx-theme";

export function BaTraceabilityPreview({
  rows,
  projectId,
}: {
  rows: TraceMatrixRow[];
  projectId?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className={`${dxClass.card} p-6 text-sm text-[#6B6B64]`}>
        Traceability matrix will appear after requirements and user stories are generated.
      </div>
    );
  }

  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="flex items-center justify-between border-b border-[#E4E4DC] px-6 py-4">
        <div>
          <h3 className={`${dxClass.display} text-lg`}>Traceability matrix</h3>
          <p className="text-xs text-[#6B6B64]">Business case → requirement → story → task → test</p>
        </div>
        {projectId ? (
          <Link
            href={`/project/${projectId}/requirements?tab=traceability`}
            className="text-xs font-medium text-[#1C4A2E] hover:underline"
          >
            Full matrix →
          </Link>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-xs">
          <thead>
            <tr className="border-b border-[#E4E4DC] bg-[#FAFAF7] text-left uppercase tracking-wide text-[#A8A89E]">
              <th className="px-4 py-2">Objective</th>
              <th className="px-4 py-2">Requirement</th>
              <th className="px-4 py-2">Story</th>
              <th className="px-4 py-2">Task</th>
              <th className="px-4 py-2">Test</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.reqCode} className="border-b border-[#F0F0E8] last:border-0">
                <td className="px-4 py-2 text-[#6B6B64]">{row.objective}</td>
                <td className="px-4 py-2">
                  <span className="font-mono text-[10px] text-[#A8A89E]">{row.reqCode}</span>
                  <div className="font-medium text-[#0D0D0B]">{row.requirement}</div>
                </td>
                <td className="px-4 py-2">{row.story ?? "—"}</td>
                <td className="px-4 py-2">{row.task ?? "—"}</td>
                <td className="px-4 py-2">{row.test ?? "—"}</td>
                <td className="px-4 py-2">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
