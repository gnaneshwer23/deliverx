import { describe, expect, it } from "vitest";
import {
  assessCostRisk,
  assessDelayRisk,
  buildDeliveryPrediction,
  buildRoleEffortBreakdown,
} from "@/services/predictionEngine";
import type { DeliveryForecast } from "@/services/forecastEngine";
import type { EstimationPackRow } from "@/services/estimationPacks";

const baseForecast: DeliveryForecast = {
  prediction: "On track",
  confidence: 0.8,
  horizonDays: 30,
  trend: "stable",
  expectedDate: "2026-08-01",
  p10: "2026-07-15",
  p50: "2026-08-01",
  p90: "2026-08-20",
  drivers: [],
  baselineDate: "2026-07-01",
  delayDays: 5,
  anchorLabel: "Go-live milestone",
};

function mockPack(
  role: EstimationPackRow["role"],
  days: number,
  status: EstimationPackRow["status"] = "approved",
): EstimationPackRow {
  return {
    id: `${role}-1`,
    organisation_id: "org",
    project_id: "proj",
    role,
    line_items: [{ id: "1", title: "Work", days }],
    total_days: days,
    confidence: 75,
    rationale: "",
    status,
    reviewer_notes: null,
    decided_by: null,
    decided_at: null,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

describe("predictionEngine", () => {
  it("builds per-role effort breakdown", () => {
    const rows = buildRoleEffortBreakdown([
      mockPack("pm", 10),
      mockPack("engineering", 40),
      mockPack("qa", 12),
    ]);

    expect(rows).toHaveLength(3);
    expect(rows.find((r) => r.role === "engineering")?.days).toBe(40);
  });

  it("flags high delay risk when slip exceeds threshold", () => {
    const risk = assessDelayRisk({ ...baseForecast, delayDays: 25, trend: "declining" });
    expect(risk.tier).toBe("high");
  });

  it("flags high cost risk when forecast exceeds budget", () => {
    const risk = assessCostRisk({ approved: 100_000, forecast: 120_000 });
    expect(risk.tier).toBe("high");
  });

  it("assembles full delivery prediction snapshot", () => {
    const prediction = buildDeliveryPrediction({
      forecast: baseForecast,
      packs: [mockPack("pm", 8), mockPack("engineering", 35), mockPack("qa", 10)],
      budget: { approved: 500_000, forecast: 480_000, currency: "GBP" },
    });

    expect(prediction.modelVersion).toBe("v2");
    expect(prediction.totalEffortDays).toBe(53);
    expect(prediction.roleEffort).toHaveLength(3);
    expect(prediction.costRisk.tier).toBe("low");
    expect(prediction.expectedDate).toBe("2026-08-01");
  });
});
