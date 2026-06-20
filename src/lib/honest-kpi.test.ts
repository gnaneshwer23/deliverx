import { describe, expect, it } from "vitest";
import {
  HONEST_KPI_EMPTY,
  formatHonestKpi,
  formatHonestPct,
  limitDashboardKpis,
  MAX_DASHBOARD_KPIS,
} from "./honest-kpi";

describe("honest-kpi", () => {
  it("returns em-dash and reason when value is missing", () => {
    expect(formatHonestKpi(null, "No data yet")).toEqual({
      value: HONEST_KPI_EMPTY,
      hint: "No data yet",
      isEmpty: true,
    });
    expect(formatHonestKpi(undefined, "Updates after first standup")).toMatchObject({
      value: HONEST_KPI_EMPTY,
      hint: "Updates after first standup",
      isEmpty: true,
    });
    expect(formatHonestKpi("", "No data yet").isEmpty).toBe(true);
    expect(formatHonestKpi(Number.NaN, "No data yet").isEmpty).toBe(true);
  });

  it("returns the real value when present", () => {
    expect(formatHonestKpi(12, "No data yet")).toEqual({
      value: 12,
      isEmpty: false,
    });
    expect(formatHonestKpi("£120k / £200k", "Set budget after charter review")).toEqual({
      value: "£120k / £200k",
      isEmpty: false,
    });
  });

  it("formats percentages or em-dash with reason", () => {
    expect(formatHonestPct(62.4, "Connect milestone plan")).toEqual({
      value: "62%",
      progressPct: 62,
      isEmpty: false,
    });
    expect(formatHonestPct(null, "Connect milestone plan")).toMatchObject({
      value: HONEST_KPI_EMPTY,
      hint: "Connect milestone plan",
      isEmpty: true,
    });
  });

  it("caps dashboard KPI lists at five", () => {
    const items = [1, 2, 3, 4, 5, 6];
    expect(limitDashboardKpis(items)).toEqual([1, 2, 3, 4, 5]);
    expect(MAX_DASHBOARD_KPIS).toBe(5);
  });
});
