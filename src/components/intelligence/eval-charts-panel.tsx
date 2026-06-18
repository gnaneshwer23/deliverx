import type { DeliveryEvalMetrics } from "@/services/intelligenceMetrics";

export function EvalChartsPanel({ metrics }: { metrics: DeliveryEvalMetrics }) {
  const hasHistogram = metrics.errorHistogram.length > 0;
  const hasTrend = metrics.weeklyMaeTrend.some((w) => w.samples > 0);

  if (!hasHistogram && !hasTrend && !metrics.slipModel) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-sm text-slate-500">
        Close projects with saved forecasts to unlock error histograms, MAE trends,
        and the org slip model.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {metrics.slipModel ? (
        <SlipModelCard model={metrics.slipModel} />
      ) : null}

      {hasHistogram ? (
        <BarChartCard
          title="Forecast error distribution"
          subtitle="Absolute error on closed projects (days)"
          data={metrics.errorHistogram}
        />
      ) : null}

      {hasTrend ? (
        <BarChartCard
          title="Weekly forecast MAE"
          subtitle="Mean absolute error by forecast week"
          data={metrics.weeklyMaeTrend.map((w) => ({
            label: w.label,
            count: w.mae ?? 0,
            hint: `${w.samples} sample${w.samples === 1 ? "" : "s"}`,
          }))}
          valueSuffix="d"
        />
      ) : null}
    </div>
  );
}

function SlipModelCard({ model }: { model: NonNullable<DeliveryEvalMetrics["slipModel"]> }) {
  return (
    <div className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50/80 to-white p-6 shadow-sm xl:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Delivery Intelligence Model v1
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Ridge regression on {model.sampleCount} closed project
            {model.sampleCount === 1 ? "" : "s"}. Blends up to{" "}
            {Math.round(model.mlWeightCap * 100)}% into live forecasts.
          </p>
        </div>
        <div className="text-right text-xs text-slate-500">
          {model.trainingMae != null ? (
            <p>
              Training MAE:{" "}
              <span className="font-semibold text-slate-800">{model.trainingMae}d</span>
            </p>
          ) : null}
          <p className="mt-0.5">
            Trained{" "}
            {new Date(model.trainedAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>

      {model.topFeatures.length > 0 ? (
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {model.topFeatures.map((f) => (
            <li
              key={f.feature}
              className="rounded-lg border border-teal-100 bg-white/80 px-3 py-2 text-xs"
            >
              <span className="text-slate-500">{formatFeature(f.feature)}</span>
              <p
                className={`mt-0.5 font-mono font-semibold ${
                  f.weight >= 0 ? "text-amber-700" : "text-emerald-700"
                }`}
              >
                {f.weight >= 0 ? "+" : ""}
                {f.weight.toFixed(2)}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function BarChartCard({
  title,
  subtitle,
  data,
  valueSuffix = "",
}: {
  title: string;
  subtitle: string;
  data: Array<{ label: string; count: number; hint?: string }>;
  valueSuffix?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      <div className="mt-4 flex h-36 items-end justify-between gap-2">
        {data.map((item) => {
          const height = Math.round((item.count / max) * 100);
          return (
            <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <span className="text-[10px] font-semibold text-[#0F766E]">
                {item.count}
                {valueSuffix}
              </span>
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-[#0F766E] to-[#14B8A6]/70"
                  style={{ height: `${Math.max(height, 8)}%` }}
                />
              </div>
              <span className="max-w-full truncate text-center text-[10px] text-slate-400">
                {item.label}
              </span>
              {item.hint ? (
                <span className="text-[9px] text-slate-300">{item.hint}</span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatFeature(name: string): string {
  const labels: Record<string, string> = {
    overdueTasks: "Overdue tasks",
    blockers: "Blockers",
    risks: "Open risks",
    velocity: "Velocity",
    milestoneProgress: "Milestone %",
    healthScore: "Health score",
    confidenceScore: "Confidence",
  };
  return labels[name] ?? name;
}
