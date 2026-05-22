import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { Forecast } from "@/services/forecastEngine";

const TREND_ICON = {
  declining: TrendingDown,
  improving: TrendingUp,
  stable: Minus,
} as const;

const TREND_COLOR = {
  declining: "text-rose-600",
  improving: "text-emerald-600",
  stable: "text-slate-500",
} as const;

export type ForecastEntry = {
  projectId: string;
  projectName: string;
  forecast: Forecast;
};

export function ForecastPanel({
  forecasts,
  title = "Forecast",
}: {
  forecasts: ForecastEntry[];
  title?: string;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-3 font-semibold">{title}</h3>

      {forecasts.length === 0 ? (
        <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
          No projects flagged for short-horizon forecasting.
        </p>
      ) : (
        <ul className="space-y-3">
          {forecasts.map((f) => {
            const Icon = TREND_ICON[f.forecast.trend];
            return (
              <li
                key={f.projectId}
                className="rounded-lg border border-slate-100 bg-slate-50/40 p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-900">
                    {f.projectName}
                  </p>
                  <span
                    className={`flex items-center gap-1 text-xs ${TREND_COLOR[f.forecast.trend]}`}
                  >
                    <Icon size={12} />
                    {f.forecast.trend}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {f.forecast.prediction}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  {Math.round(f.forecast.confidence * 100)}% confidence over{" "}
                  {f.forecast.horizonDays} days
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
