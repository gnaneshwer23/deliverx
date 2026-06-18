import { dxClass } from "@/lib/dx-theme";
import type { StakeholderLoopRow } from "@/services/collaborativeLoopEngine";

const TONE = {
  green: "text-emerald-700 bg-emerald-50 border-emerald-200",
  amber: "text-amber-700 bg-amber-50 border-amber-200",
  red: "text-rose-700 bg-rose-50 border-rose-200",
  slate: "text-slate-600 bg-slate-50 border-slate-200",
} as const;

export function StakeholderLoopPanel({
  rows,
  hideTitle = false,
}: {
  rows: StakeholderLoopRow[];
  hideTitle?: boolean;
}) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      {!hideTitle ? (
        <div className="border-b border-[#E4E4DC] px-6 py-4">
          <h3 className={`${dxClass.display} text-lg`}>Stakeholder loop</h3>
          <p className="mt-1 text-xs text-[#6B6B64]">Who needs what from whom — bidirectional</p>
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-[#E4E4DC] bg-[#FAFAF7] text-left text-xs uppercase tracking-wide text-[#A8A89E]">
              <th className="px-6 py-2 font-medium">Counterparty</th>
              <th className="px-4 py-2 font-medium">You need</th>
              <th className="px-4 py-2 font-medium">They need</th>
              <th className="px-6 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-[#F0F0E8] last:border-0">
                <td className="px-6 py-3 font-medium text-[#0D0D0B]">{row.counterparty}</td>
                <td className="px-4 py-3 text-[#6B6B64]">{row.youNeed}</td>
                <td className="px-4 py-3 text-[#6B6B64]">{row.theyNeed}</td>
                <td className="px-6 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${TONE[row.tone]}`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
