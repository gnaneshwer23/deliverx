import { describe, expect, it } from "vitest";
import {
  buildBaClarificationQueue,
} from "./ba-clarification-queue";
import {
  buildBaHandoffKpis,
  buildBaHandoffSynthesis,
} from "./ba-handoff-kpis";

describe("ba-handoff-kpis", () => {
  it("caps KPIs at five", () => {
    const kpis = buildBaHandoffKpis({
      kpis: {
        extracted: 10,
        approved: 6,
        pendingClarification: 2,
        stakeholderReviewsPending: 1,
        storiesReady: 4,
        traceabilityScore: 72,
        deliveryImpact: "Medium",
        deliveryImpactTone: "amber",
      },
      openClarifications: 3,
      pendingReviewCount: 1,
      projectId: "p1",
    });
    expect(kpis).toHaveLength(5);
  });

  it("synthesises handoff blockers", () => {
    const summary = buildBaHandoffSynthesis({
      openClarifications: 2,
      pendingClarification: 1,
      storiesReady: 3,
      traceabilityScore: 40,
      pendingReviewCount: 0,
    });
    expect(summary).toContain("2 open clarifications");
    expect(summary).toContain("resolve before dev");
  });
});

describe("ba-clarification-queue", () => {
  it("sorts open clarifications by priority", () => {
    const items = buildBaClarificationQueue(
      [
        {
          id: "c1",
          question: "Low priority?",
          status: "open",
          priority: "low",
          stakeholder_role: "PM",
          blocks: null,
          due_date: null,
        },
        {
          id: "c2",
          question: "Auth scope?",
          status: "open",
          priority: "high",
          stakeholder_role: "Sponsor",
          blocks: "Engineer",
          due_date: null,
        },
      ],
      "p1",
    );
    expect(items[0]?.id).toBe("c2");
    expect(items[0]?.status).toBe("Urgent");
  });
});
