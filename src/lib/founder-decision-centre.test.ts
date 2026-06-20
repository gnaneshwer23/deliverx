import { describe, expect, it } from "vitest";
import type { FounderDecisionRow } from "@/services/founderEngine";
import {
  FOUNDER_DECISION_CENTRE_MAX,
  buildFounderDecisionCentreItems,
} from "./founder-decision-centre";

const SAMPLE_DECISION: FounderDecisionRow = {
  id: "d1",
  title: "Approve vendor contract",
  impact: "High",
  status: "pending",
  projectName: "Alpha",
  projectId: "p1",
  kind: "decision",
};

const SAMPLE_APPROVAL: FounderDecisionRow = {
  id: "a1",
  title: "Business case approval (steering)",
  impact: "High",
  status: "pending",
  projectName: "Beta",
  projectId: "p2",
  kind: "approval",
};

describe("founder-decision-centre", () => {
  it("caps decision centre at four items", () => {
    const decisions = Array.from({ length: 8 }, (_, i) => ({
      ...SAMPLE_DECISION,
      id: `d${i}`,
      title: `Decision ${i}`,
      impact: (i % 2 === 0 ? "High" : "Medium") as FounderDecisionRow["impact"],
    }));

    const items = buildFounderDecisionCentreItems({
      decisions,
      pendingReviews: [],
      projectId: "p1",
    });

    expect(items.length).toBeLessThanOrEqual(FOUNDER_DECISION_CENTRE_MAX);
  });

  it("prioritises reviews on day-one mode", () => {
    const items = buildFounderDecisionCentreItems({
      decisions: [SAMPLE_DECISION],
      pendingReviews: [
        {
          id: "r1",
          title: "Strategic plan bundle",
          summary: "AI draft ready for sign-off",
          entity_type: "structure_bundle",
          status: "pending",
          project_id: "p1",
          created_at: new Date().toISOString(),
        },
      ],
      projectId: "p1",
      mode: "day-one",
    });

    expect(items[0]?.kind).toBe("review");
    expect(items.some((item) => item.kind === "decision")).toBe(true);
  });

  it("sorts high-impact governance items ahead of medium", () => {
    const items = buildFounderDecisionCentreItems({
      decisions: [
        { ...SAMPLE_DECISION, id: "low", impact: "Low", title: "Low priority" },
        SAMPLE_APPROVAL,
      ],
      pendingReviews: [],
    });

    expect(items[0]?.impact).toBe("High");
    expect(items[0]?.context).toMatch(/approval required/i);
  });

  it("uses plain English context strings", () => {
    const items = buildFounderDecisionCentreItems({
      decisions: [SAMPLE_DECISION],
      pendingReviews: [],
      projectId: "p1",
    });

    expect(items[0]?.context).toMatch(/sign-off unlocks/i);
    expect(items[0]?.title).toBe("Approve vendor contract");
  });
});
