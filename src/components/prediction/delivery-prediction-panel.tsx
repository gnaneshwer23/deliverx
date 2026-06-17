import {
  CalendarClock,
  Coins,
  Gauge,
  Timer,
} from "lucide-react";
import type { DeliveryPrediction } from "@/services/predictionEngine";
import {
  formatPredictionDate,
  riskTierAccent,
} from "@/services/predictionEngine";
import { KpiStrip, type KpiItem } from "@/components/dashboard/kpi-strip";
import { dxClass } from "@/lib/dx-theme";

export function predictionToKpiItems(prediction: DeliveryPrediction): KpiItem[] {
  return [
    {
      label: "Expected delivery",
      value: formatPredictionDate(prediction.expectedDate),
      hint: `${formatPredictionDate(prediction.bestDate)} – ${formatPredictionDate(prediction.worstDate)}`,
      accent: riskTierAccent(prediction.delayRisk.tier),
      icon: CalendarClock,
    },
    {
      label: "Delay risk",
      value: prediction.delayRisk.tier.toUpperCase(),
      hint: `${prediction.delayRisk.slipDays}d vs plan`,
      accent: riskTierAccent(prediction.delayRisk.tier),
      icon: Timer,
    },
    {
      label: "Cost risk",
      value: prediction.costRisk.tier.toUpperCase(),
      hint: prediction.costRisk.label.slice(0, 48),
      accent: riskTierAccent(prediction.costRisk.tier),
      icon: Coins,
    },
    {
      label: "Role effort",
      value: `${prediction.totalEffortDays}d`,
      hint:
        prediction.effortConfidence != null
          ? `${prediction.effortConfidence}% confidence`
          : "Generate estimation packs",
      accent: "teal",
      icon: Gauge,
    },
  ];
}

export function PredictionKpiStrip({ prediction }: { prediction: DeliveryPrediction }) {
  return <KpiStrip items={predictionToKpiItems(prediction)} />;
}

const RISK_BADGE = {
  low: "bg-[#EEF5F1] text-[#1C4A2E]",
  medium: "bg-amber-50 text-amber-900",
  high: "bg-[#FDF1F0] text-[#C0392B]",
} as const;

export function DeliveryPredictionPanel({
  prediction,
  projectId,
}: {
  prediction: DeliveryPrediction;
  projectId: string;
}) {
  const sym = prediction.costRisk.currency === "USD" ? "$" : "£";

  return (
    <section className={`${dxClass.card} p-6`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className={`${dxClass.display} text-lg`}>Delivery prediction</h3>
          <p className="mt-1 text-sm text-[#6B6B64]">{prediction.insight}</p>
        </div>
        <span className="rounded-full bg-[#EEF5F1] px-2 py-0.5 font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-wide text-[#1C4A2E]">
          Model v2
        </span>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-[#EEF5F1]/80 px-2 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#1C4A2E]">
            Best case
          </p>
          <p className="text-sm font-semibold">{formatPredictionDate(prediction.bestDate)}</p>
        </div>
        <div className="rounded-lg bg-[#F7F7F2] px-2 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#6B6B64]">
            Expected
          </p>
          <p className="text-sm font-semibold">{formatPredictionDate(prediction.expectedDate)}</p>
        </div>
        <div className="rounded-lg bg-[#FDF1F0]/80 px-2 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#C0392B]">
            Worst case
          </p>
          <p className="text-sm font-semibold">{formatPredictionDate(prediction.worstDate)}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${RISK_BADGE[prediction.delayRisk.tier]}`}>
          Delay: {prediction.delayRisk.tier}
        </span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${RISK_BADGE[prediction.costRisk.tier]}`}>
          Cost: {prediction.costRisk.tier}
        </span>
        {prediction.costRisk.approved ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
            Budget {sym}
            {Math.round(prediction.costRisk.approved / 1000)}k → forecast{" "}
            {sym}
            {Math.round((prediction.costRisk.forecast ?? 0) / 1000)}k
          </span>
        ) : null}
      </div>

      {prediction.roleEffort.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B6B64]">
            Role effort breakdown
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E4E4DC] text-left text-xs text-[#6B6B64]">
                  <th className="pb-2 pr-4 font-medium">Role</th>
                  <th className="pb-2 pr-4 font-medium">Days</th>
                  <th className="pb-2 pr-4 font-medium">Confidence</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {prediction.roleEffort.map((row) => (
                  <tr key={row.role} className="border-b border-[#F0F0E8]">
                    <td className="py-2 pr-4 font-medium">{row.label}</td>
                    <td className="py-2 pr-4">{row.days}d</td>
                    <td className="py-2 pr-4">{row.confidence}%</td>
                    <td className="py-2 capitalize text-[#6B6B64]">{row.status}</td>
                  </tr>
                ))}
                <tr>
                  <td className="pt-2 font-semibold">Total</td>
                  <td className="pt-2 font-semibold">{prediction.totalEffortDays}d</td>
                  <td className="pt-2 text-[#6B6B64]">
                    {prediction.effortConfidence != null
                      ? `${prediction.effortConfidence}% avg`
                      : "—"}
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#6B6B64]">
          No estimation packs yet. Generate role-native estimates on the{" "}
          <a href={`/project/${projectId}`} className="font-medium text-[#0F766E] hover:underline">
            project overview
          </a>
          .
        </p>
      )}
    </section>
  );
}
