import { describe, expect, it } from "vitest";
import {
  buildJoinReturnPath,
  formatInviteRoleLabel,
} from "@/lib/invite-role-labels";
import { resolveExtractionQueueSummary } from "@/services/projectBusinessCaseFlow";

describe("formatInviteRoleLabel", () => {
  it("maps database roles to Brief v2 display labels", () => {
    expect(formatInviteRoleLabel("ba")).toBe("BA");
    expect(formatInviteRoleLabel("pm")).toBe("Delivery PM");
    expect(formatInviteRoleLabel("product_manager")).toBe("Product");
  });

  it("falls back for unknown roles", () => {
    expect(formatInviteRoleLabel("custom_role")).toBe("custom role");
    expect(formatInviteRoleLabel(null)).toBe("Team member");
  });
});

describe("buildJoinReturnPath", () => {
  it("builds join URL with token", () => {
    expect(buildJoinReturnPath("abc123")).toBe("/join?token=abc123");
  });

  it("preserves sponsor view param", () => {
    expect(buildJoinReturnPath("abc123", "sponsor")).toBe("/join?token=abc123&view=sponsor");
  });
});

describe("resolveExtractionQueueSummary", () => {
  it("returns honest pending copy when AI is not configured", () => {
    const result = resolveExtractionQueueSummary({ aiConfigured: false });
    expect(result.extractionStatus).toBe("pending");
    expect(result.summary).toContain("AI analysis pending");
  });

  it("queues reviewable summary when AI review exists", () => {
    const result = resolveExtractionQueueSummary({
      aiConfigured: true,
      review: {
        score: 82,
        summary: "Strong problem statement",
        executiveSummary: "Ready for conditional GO",
      } as never,
    });
    expect(result.extractionStatus).toBe("queued");
    expect(result.summary).toBe("Ready for conditional GO");
  });
});
