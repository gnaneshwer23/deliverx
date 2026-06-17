import Link from "next/link";
import type { DeliveryEvalMetrics } from "@/services/intelligenceMetrics";
import { EvalChartsPanel } from "@/components/intelligence/eval-charts-panel";

export function IntelligenceMetricsPanel({
  metrics,
}: {
  metrics: DeliveryEvalMetrics;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Active projects" value={metrics.activeProjectCount} />
        <MetricCard label="Closed projects" value={metrics.closedProjectCount} />
        <MetricCard
          label="Proposal approval"
          value={
            metrics.proposalApprovalRate != null
              ? `${metrics.proposalApprovalRate}%`
              : "—"
          }
          hint={`${metrics.proposalApproved}/${metrics.proposalTotal} approved`}
        />
        <MetricCard
          label="Forecast MAE"
          value={
            metrics.meanAbsoluteErrorDays != null
              ? `${metrics.meanAbsoluteErrorDays}d`
              : "—"
          }
          hint={`${metrics.forecastSamples} closed samples`}
        />
      </div>

      <EvalChartsPanel metrics={metrics} />

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">Learning signals</h3>
          <Link
            href="/api/intelligence/training-export?format=csv"
            className="text-xs font-medium text-teal-700 hover:underline"
          >
            Download training export (CSV)
          </Link>
        </div>
        <ul className="grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <li>Approved estimation packs: {metrics.estimationPacksApproved}</li>
          <li>Proposals rejected: {metrics.proposalRejected}</li>
          <li>Forecast samples for eval: {metrics.forecastSamples}</li>
        </ul>
      </div>

      {metrics.recentForecastAccuracy.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 font-semibold">Closed project forecast accuracy</h3>
          <ul className="space-y-2 text-sm">
            {metrics.recentForecastAccuracy.map((row) => (
              <li
                key={row.projectId}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2 last:border-0"
              >
                <Link
                  href={`/project/${row.projectId}`}
                  className="font-medium text-slate-900 hover:text-teal-700"
                >
                  {row.projectName}
                </Link>
                <span className="text-xs text-slate-500">
                  {row.predictedDate ?? "no forecast"} → {row.actualCloseDate}
                  {row.errorDays != null ? (
                    <span
                      className={
                        Math.abs(row.errorDays) <= 7
                          ? " ml-1 text-emerald-600"
                          : " ml-1 text-amber-600"
                      }
                    >
                      ({row.errorDays >= 0 ? "+" : ""}
                      {row.errorDays}d)
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}
