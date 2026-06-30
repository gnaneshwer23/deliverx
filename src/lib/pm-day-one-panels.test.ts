import { describe, expect, it } from "vitest";
import type { ArtifactReviewRow } from "@/lib/approval/artifact-review";
import type { PmMissionControl } from "@/services/deliveryPmDashboard";
import {
  buildPmDayOneKpis,
  buildPmRaidSummaryCounts,
  extractReviewConfidence,
  groupPendingReviewsByCategory,
  inferPmReviewCategory,
  milestoneDayOneLabel,
} from "./pm-day-one-panels";

function mockReview(
  overrides: Partial<ArtifactReviewRow> & Pick<ArtifactReviewRow, "entity_type" | "title">,
): ArtifactReviewRow {
  return {
    id: overrides.id ?? "rev-1",
    organisation_id: "org-1",
    project_id: "proj-1",
    entity_id: null,
    entity_ids: overrides.entity_ids ?? ["e1"],
    summary: overrides.summary ?? "",
    payload: overrides.payload ?? {},
    status: "needs_review",
    source: "ai",
    reviewer_notes: null,
    decided_by: null,
    decided_at: null,
    created_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

const SAMPLE_RAID: PmMissionControl["raid"] = {
  risks: [
    { title: "Vendor delay", severity: "high", owner: "PM" },
    { title: "Scope creep", severity: "medium", owner: "PM" },
  ],
  issues: [{ title: "Missing API spec", severity: "medium" }],
  dependencies: ["Legal sign-off", "Infra provisioning"],
};

describe("pm-day-one-panels", () => {
  it("infers review categories from entity type and title", () => {
    expect(
      inferPmReviewCategory(mockReview({ entity_type: "raid_item", title: "Delivery risks" })),
    ).toBe("raid-risks");
    expect(
      inferPmReviewCategory(mockReview({ entity_type: "decision", title: "GO decision" })),
    ).toBe("go-recommendation");
    expect(
      inferPmReviewCategory(mockReview({ entity_type: "report", title: "Timeline draft" })),
    ).toBe("milestones-timeline");
  });

  it("groups pending reviews into stable category order", () => {
    const groups = groupPendingReviewsByCategory([
      mockReview({ id: "r1", entity_type: "raid_item", title: "RAID bundle" }),
      mockReview({ id: "r2", entity_type: "task", title: "Workstream tasks" }),
      mockReview({ id: "r3", entity_type: "decision", title: "GO recommendation" }),
    ]);

    expect(groups.map((group) => group.id)).toEqual([
      "workstreams",
      "raid-risks",
      "go-recommendation",
    ]);
    expect(groups[0]?.reviews).toHaveLength(1);
    expect(groups[0]?.meta).toContain("1 proposal");
  });

  it("extracts confidence from payload metadata", () => {
    expect(
      extractReviewConfidence(mockReview({ entity_type: "task", title: "T", payload: { confidence: 0.82 } })),
    ).toBe(82);
    expect(
      extractReviewConfidence(
        mockReview({
          entity_type: "structure_bundle",
          title: "Structure",
          payload: { draft: { confidenceScore: 91 } },
        }),
      ),
    ).toBe(91);
    expect(extractReviewConfidence(mockReview({ entity_type: "task", title: "T", payload: {} }))).toBeNull();
  });

  it("builds day-one KPI strip with honest empty health and bootstrap milestones", () => {
    const kpis = buildPmDayOneKpis({
      pendingReviewCount: 3,
      bootstrapSummary: { structure: { milestones: 4 }, personas: {} },
      overview: { budgetLabel: "£120k / £200k" } as PmMissionControl["overview"],
      milestones: [
        { phase: "Discovery", status: "done" },
        { phase: "Build", status: "active" },
      ],
      dataSources: { deliveryPlan: "fallback" },
      teamJoinedCount: 2,
      teamTotalCount: 4,
    });

    expect(kpis.find((kpi) => kpi.label === "Project health")).toMatchObject({
      value: "—",
      hint: "Updates after first standup",
    });
    expect(kpis.find((kpi) => kpi.label === "Milestones")?.value).toBe("1/4");
    expect(kpis.find((kpi) => kpi.label === "Milestones")?.progressPct).toBe(25);
    expect(kpis.find((kpi) => kpi.label === "Awaiting review")?.value).toBe("3");
    expect(kpis.find((kpi) => kpi.label === "Team joined")?.value).toBe("2/4");
    expect(kpis.find((kpi) => kpi.label === "Team joined")?.progressPct).toBe(50);
    expect(kpis.find((kpi) => kpi.label === "Budget")?.value).toBe("—");
  });

  it("uses live budget label when delivery plan is live", () => {
    const kpis = buildPmDayOneKpis({
      pendingReviewCount: 0,
      bootstrapSummary: null,
      overview: { budgetLabel: "£50k / £100k" } as PmMissionControl["overview"],
      milestones: [],
      dataSources: { deliveryPlan: "live" },
      teamJoinedCount: 1,
      teamTotalCount: 1,
    });

    expect(kpis.find((kpi) => kpi.label === "Budget")?.value).toBe("£50k / £100k");
  });

  it("summarises RAID counts and milestone day-one labels", () => {
    expect(buildPmRaidSummaryCounts(SAMPLE_RAID)).toEqual({
      highRisk: 1,
      assumptions: 1,
      issues: 1,
      dependencies: 2,
    });

    const milestones = [
      { phase: "A", status: "done" as const },
      { phase: "B", status: "active" as const },
      { phase: "C", status: "pending" as const },
    ];
    expect(milestoneDayOneLabel(milestones[0]!, 0, milestones)).toBe("Complete");
    expect(milestoneDayOneLabel(milestones[1]!, 1, milestones)).toBe("Starts now");
    expect(milestoneDayOneLabel(milestones[2]!, 2, milestones)).toBe("Upcoming");
  });
});
