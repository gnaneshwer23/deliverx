/** Em-dash shown when a KPI has no computed value yet. */
export const HONEST_KPI_EMPTY = "—";

export type HonestKpiFormatted = {
  value: string | number;
  hint?: string;
  progressPct?: number;
  isEmpty: boolean;
};

export const MAX_DASHBOARD_KPIS = 5;

/** Return a real KPI value or em-dash plus a one-line reason — never a fake number with a disclaimer. */
export function formatHonestKpi(
  value: string | number | null | undefined,
  reasonWhenEmpty: string,
): HonestKpiFormatted {
  if (value === null || value === undefined) {
    return { value: HONEST_KPI_EMPTY, hint: reasonWhenEmpty, isEmpty: true };
  }

  if (typeof value === "string" && value.trim().length === 0) {
    return { value: HONEST_KPI_EMPTY, hint: reasonWhenEmpty, isEmpty: true };
  }

  if (typeof value === "number" && !Number.isFinite(value)) {
    return { value: HONEST_KPI_EMPTY, hint: reasonWhenEmpty, isEmpty: true };
  }

  return { value, isEmpty: false };
}

/** Percentage helper — omits progress bar when empty. */
export function formatHonestPct(
  pct: number | null | undefined,
  reasonWhenEmpty: string,
): HonestKpiFormatted {
  if (pct == null || !Number.isFinite(pct)) {
    return { value: HONEST_KPI_EMPTY, hint: reasonWhenEmpty, isEmpty: true };
  }

  const rounded = Math.round(pct);
  return { value: `${rounded}%`, progressPct: rounded, isEmpty: false };
}

export function limitDashboardKpis<T>(items: readonly T[], max = MAX_DASHBOARD_KPIS): T[] {
  return items.slice(0, max);
}
