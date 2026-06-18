import type { CrossRoleImpact } from "@/services/baRequirementEngine";
import { dxClass } from "@/lib/dx-theme";

const TONE = {
  ready: "text-emerald-700 bg-emerald-50 border-emerald-200",
  waiting: "text-slate-600 bg-slate-50 border-slate-200",
  blocked: "text-rose-700 bg-rose-50 border-rose-200",
  pending: "text-amber-700 bg-amber-50 border-amber-200",
} as const;

export function BaStakeholderPanel({
  connections,
}: {
  connections: Array<{
    stakeholder: string;
    dependency: string;
    status: string;
    tone: string;
  }>;
}) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>Stakeholder connections</h3>
        <p className="mt-1 text-xs text-[#6B6B64]">Who depends on your BA work</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-[#E4E4DC] bg-[#FAFAF7] text-left text-xs uppercase tracking-wide text-[#A8A89E]">
              <th className="px-6 py-2 font-medium">Stakeholder</th>
              <th className="px-4 py-2 font-medium">Dependency</th>
              <th className="px-6 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {connections.map((row) => (
              <tr key={row.stakeholder} className="border-b border-[#F0F0E8] last:border-0">
                <td className="px-6 py-3 font-medium text-[#0D0D0B]">{row.stakeholder}</td>
                <td className="px-4 py-3 text-[#6B6B64]">{row.dependency}</td>
                <td className="px-6 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${
                      row.tone === "green"
                        ? TONE.ready
                        : row.tone === "red"
                          ? TONE.blocked
                          : row.tone === "amber"
                            ? TONE.pending
                            : TONE.waiting
                    }`}
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

export function BaCrossRoleImpact({ impacts }: { impacts: CrossRoleImpact[] }) {
  return (
    <div className={`${dxClass.card} p-6`}>
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Cross-role impact</h3>
      <ul className="space-y-2">
        {impacts.map((item) => (
          <li
            key={item.role}
            className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3 text-sm ${TONE[item.tone]}`}
          >
            <span className="font-semibold">{item.role}</span>
            <span>{item.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
