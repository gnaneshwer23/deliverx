"use client";

import type { ProductMissionControl } from "@/services/pmDashboard";
import { dxClass } from "@/lib/dx-theme";
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

  return (
    <div className={`${dxClass.card} overflow-hidden p-0`} data-panel="product-rice-backlog">
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <h3 className={`${dxClass.display} text-lg`}>RICE backlog</h3>
        <p className="text-xs text-[#6B6B64]">Reach · Impact · Confidence · Effort prioritisation</p>
        {usesFallback ? (
          <p className="mt-1 text-xs text-[#6B6B64]">
            Run product analysis to score your backlog — no scores shown until features exist.
          </p>
        ) : null}
      </div>
      <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="bg-[#FAF0ED] text-left text-xs uppercase text-[#A8A89E]">
            <th className="px-6 py-2">Feature</th>
            <th className="px-4 py-2">Horizon</th>
            <th className="px-3 py-2 text-right">R</th>
            <th className="px-3 py-2 text-right">I</th>
            <th className="px-3 py-2 text-right">C</th>
            <th className="px-3 py-2 text-right">E</th>
            <th className="px-6 py-2 text-right">RICE</th>
          </tr>
        </thead>
        <tbody>
          {hasLiveFeatures ? (
            features.map((f) => (
              <tr key={f.title} className="border-t border-[#F0F0E8]">
                <td className="px-6 py-3 font-medium">{f.title}</td>
                <td className="px-4 py-3 capitalize text-[#6B6B64]">{f.horizon}</td>
                <td className="px-3 py-3 text-right tabular-nums text-[#6B6B64]">{f.reach}</td>
                <td className="px-3 py-3 text-right tabular-nums text-[#6B6B64]">{f.impact}</td>
                <td className="px-3 py-3 text-right tabular-nums text-[#6B6B64]">{f.confidence}</td>
                <td className="px-3 py-3 text-right tabular-nums text-[#6B6B64]">{f.effort}</td>
                <td
                  className="px-6 py-3 text-right font-semibold tabular-nums"
                  style={{ color: productAccent.text }}
                >
                  {f.score}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-6 py-6 text-[#6B6B64]">
                — · Score backlog with RICE after product analysis
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
