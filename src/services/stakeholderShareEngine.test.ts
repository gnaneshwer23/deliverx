import { describe, expect, it } from "vitest";
import {
  buildRaidSummary,
  isShareLinkExpired,
  sanitizeReportExcerpt,
} from "@/services/stakeholderShareEngine";

describe("sanitizeReportExcerpt", () => {
  it("truncates long report content", () => {
    const long = "word ".repeat(200);
    const excerpt = sanitizeReportExcerpt(long, 50);
    expect(excerpt.length).toBeLessThanOrEqual(50);
    expect(excerpt.endsWith("…")).toBe(true);
  });
});

describe("buildRaidSummary", () => {
  it("counts RAID types", () => {
    const summary = buildRaidSummary([
      { type: "risk", title: "A", severity: "high" },
      { type: "issue", title: "B", severity: "medium" },
      { type: "dependency", title: "C", severity: "low" },
      { type: "risk", title: "D", severity: "critical" },
    ]);
    expect(summary).toEqual({ openRisks: 2, openIssues: 1, openDependencies: 1 });
  });
});

describe("isShareLinkExpired", () => {
  it("detects past expiry", () => {
    expect(isShareLinkExpired("2020-01-01T00:00:00Z")).toBe(true);
    expect(isShareLinkExpired("2099-01-01T00:00:00Z")).toBe(false);
  });
});
