import Link from "next/link";
import { CalendarClock, TrendingDown, TrendingUp, Minus, Telescope } from "lucide-react";
import type { DeliveryForecast } from "@/services/forecastEngine";

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

const IMPACT_DOT = {
  high: "bg-rose-500",
  medium: "bg-amber-500",
  low: "bg-slate-300",
} as const;

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DeliveryForecastCard({
  forecast,
  projectId,
  compact = false,
}: {
  forecast: DeliveryForecast;
  projectId?: string;
  compact?: boolean;
}) {
  const Icon = TREND_ICON[forecast.trend];
  const slipLabel =
    forecast.delayDays > 0
      ? `${forecast.delayDays}d slip vs plan`
      : forecast.trend === "improving"
        ? "Ahead of plan"
        : "On plan";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Delivery forecast</p>
          <div className="mt-1 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight">
              {formatShortDate(forecast.expectedDate)}
            </h3>
            <span
              className={`flex items-center gap-1 text-xs font-medium ${TREND_COLOR[forecast.trend]}`}
            >
              <Icon size={12} />
              {forecast.trend}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Anchor: {forecast.anchorLabel} · {slipLabel}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <CalendarClock size={18} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-emerald-50/80 px-2 py-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-700">
            Optimistic
          </p>
          <p className="text-sm font-semibold text-emerald-900">
            {formatShortDate(forecast.p10)}
          </p>
        </div>
        <div className="rounded-lg bg-slate-100 px-2 py-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-600">
            Median
          </p>
          <p className="text-sm font-semibold text-slate-900">
            {formatShortDate(forecast.p50)}
          </p>
        </div>
        <div className="rounded-lg bg-rose-50/80 px-2 py-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-rose-700">
            Pessimistic
          </p>
          <p className="text-sm font-semibold text-rose-900">
            {formatShortDate(forecast.p90)}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-600">{forecast.prediction}</p>

      {!compact && forecast.drivers.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {forecast.drivers.map((d) => (
            <li
              key={d.id}
              className="flex items-center gap-2 text-xs text-slate-600"
            >
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${IMPACT_DOT[d.impact]}`}
              />
              {d.label}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <p className="text-[11px] text-slate-400">
          {Math.round(forecast.confidence * 100)}% confidence ·{" "}
          {forecast.horizonDays}-day horizon
          {forecast.modelSampleCount != null &&
          forecast.modelSampleCount >= 3 &&
          forecast.mlWeight != null &&
          forecast.mlWeight > 0 ? (
            <>
              {" "}
              · Model v1 ({Math.round(forecast.mlWeight * 100)}% blend, n=
              {forecast.modelSampleCount})
            </>
          ) : null}
        </p>
        {projectId ? (
          <Link
            href={`/workspace/twin?project=${projectId}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-900"
          >
            <Telescope size={12} />
            Simulate scenario
          </Link>
        ) : null}
      </div>
    </div>
  );
}
