"use client";

import type { ProductMissionControl } from "@/services/pmDashboard";
import { DashboardPanelShell } from "@/components/dx/dashboard-panel-shell";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";

const productAccent = getMissionPersonaAccent("product");

export function ProductRiceBacklogTable({
  features,
  usesFallback = false,
}: {
  features: ProductMissionControl["topFeatures"];
  usesFallback?: boolean;
}) {
  const hasLiveFeatures = features.length > 0 && !usesFallback;

  if (!hasLiveFeatures) {
    return null;
  }

  return (
    <DashboardPanelShell
      panelId="product-rice-backlog"
      title="RICE backlog"
      subtitle="Reach · Impact · Confidence · Effort prioritisation"
      count={features.length}
      countTone="neutral"
      card
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-[#E4E4DC] text-left text-xs uppercase text-[#A8A89E]">
              <th className="px-2 py-2">Feature</th>
              <th className="px-2 py-2">Horizon</th>
              <th className="px-2 py-2 text-right">R</th>
              <th className="px-2 py-2 text-right">I</th>
              <th className="px-2 py-2 text-right">C</th>
              <th className="px-2 py-2 text-right">E</th>
              <th className="px-2 py-2 text-right">RICE</th>
            </tr>
          </thead>
          <tbody>
            {features.map((f) => (
              <tr key={f.title} className="border-t border-[#F0F0E8]">
                <td className="px-2 py-2.5 font-medium">{f.title}</td>
                <td className="px-2 py-2.5 capitalize text-[#6B6B64]">{f.horizon}</td>
                <td className="px-2 py-2.5 text-right tabular-nums text-[#6B6B64]">{f.reach}</td>
                <td className="px-2 py-2.5 text-right tabular-nums text-[#6B6B64]">{f.impact}</td>
                <td className="px-2 py-2.5 text-right tabular-nums text-[#6B6B64]">{f.confidence}</td>
                <td className="px-2 py-2.5 text-right tabular-nums text-[#6B6B64]">{f.effort}</td>
                <td
                  className="px-2 py-2.5 text-right font-semibold tabular-nums"
                  style={{ color: productAccent.text }}
                >
                  {f.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardPanelShell>
  );
}
