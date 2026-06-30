import { describe, expect, it } from "vitest";
import { resolveWorkspaceFlowStage } from "@/lib/workspace-flow-stages";
import { buildExtractionCounts, formatExtractionCount } from "@/lib/workspace-flow-extraction";

describe("resolveWorkspaceFlowStage", () => {
  it("marks only upload complete when business case exists but nothing else", () => {
    const stage = resolveWorkspaceFlowStage({
      hasBusinessCase: true,
      extractionStatus: "none",
      baInviteActive: false,
      baJoined: false,
      requirementsExtracted: 0,
      storiesReady: 0,
    });
    expect(stage.completedThrough).toBe(0);
    expect(stage.currentIndex).toBe(1);
    expect(stage.steps[0]?.status).toBe("complete");
    expect(stage.steps[1]?.status).toBe("current");
  });

  it("does not mark BA review complete without extracted requirements", () => {
    const stage = resolveWorkspaceFlowStage({
      hasBusinessCase: true,
      extractionStatus: "queued",
      baInviteActive: true,
      baJoined: true,
      requirementsExtracted: 0,
      storiesReady: 0,
    });
    expect(stage.completedThrough).toBe(2);
    expect(stage.steps[3]?.status).toBe("current");
  });
});

describe("buildExtractionCounts", () => {
  it("returns null requirements when none extracted", () => {
    const counts = buildExtractionCounts({
      requirementsExtracted: 0,
      traceabilityScore: null,
      report: { gaps: ["a"], initialRisks: ["r"], clarificationQuestions: ["q"] } as never,
    });
    expect(counts.requirements).toBeNull();
    expect(counts.gaps).toBe(1);
    expect(counts.risks).toBe(1);
  });
});

describe("formatExtractionCount", () => {
  it("uses em-dash for empty values", () => {
    expect(formatExtractionCount(null)).toBe("—");
    expect(formatExtractionCount(3)).toBe("3");
  });
});
