import Link from "next/link";
import { CalendarClock, ArrowUpRight } from "lucide-react";
import type { DeliveryForecast } from "@/services/forecastEngine";

export type ForecastRollupEntry = {
  projectId: string;
  projectName: string;
  forecast: DeliveryForecast;
  healthTier: "healthy" | "watch" | "at-risk";
};

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

const TIER_BORDER = {
  healthy: "border-emerald-100",
  watch: "border-amber-100",
  "at-risk": "border-rose-100",
} as const;

export function DeliveryForecastStrip({
  entries,
}: {
  entries: ForecastRollupEntry[];
}) {
  if (entries.length === 0) {
    return (
      <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
        Delivery forecasts appear once projects have tasks or milestones.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((e) => (
        <li
          key={e.projectId}
          className={`rounded-lg border bg-white p-4 ${TIER_BORDER[e.healthTier]}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/project/${e.projectId}`}
                className="truncate text-sm font-medium text-slate-900 hover:text-teal-700"
              >
                {e.projectName}
              </Link>
              <p className="mt-1 flex items-center gap-1.5 text-lg font-semibold text-slate-900">
                <CalendarClock size={16} className="shrink-0 text-teal-600" />
                {formatShortDate(e.forecast.expectedDate)}
              </p>
            </div>
            {e.forecast.delayDays > 0 ? (
              <span className="shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
                +{e.forecast.delayDays}d
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {formatShortDate(e.forecast.p10)} – {formatShortDate(e.forecast.p90)} ·{" "}
            {Math.round(e.forecast.confidence * 100)}% conf.
          </p>
          <Link
            href={`/project/${e.projectId}`}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-900"
          >
            View forecast
            <ArrowUpRight size={12} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
