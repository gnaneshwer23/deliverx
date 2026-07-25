import { describe, expect, it } from "vitest";
import {
  AI_AUTONOMY_POLICY,
  PROFESSIONAL_WORKSPACE_MODULES,
  getWorkspaceModule,
} from "@/lib/professional-workspace/modules";
import {
  encodeWorkspaceProjectParam,
  parseWorkspaceProjectParam,
  withProjectQuery,
} from "@/lib/professional-workspace/project-context";
import { contributionTrailLabel } from "@/lib/professional-workspace/contribution";
import { parseSuiteProduct, productDisplayName, productMarketingPath } from "@/lib/marketing/product-intent";

describe("Professional Workspace modules", () => {
  it("defines all 13 modules with contracts", () => {
    expect(PROFESSIONAL_WORKSPACE_MODULES).toHaveLength(13);
    for (const m of PROFESSIONAL_WORKSPACE_MODULES) {
      expect(m.userJobs.length).toBeGreaterThan(0);
      expect(m.primaryActions.length).toBeGreaterThan(0);
      expect(m.aiActions.length).toBeGreaterThan(0);
      expect(m.evidenceGenerated.length).toBeGreaterThan(0);
      expect(m.emptyState).toBeTruthy();
      expect(m.errorState).toBeTruthy();
      expect(m.completionState).toBeTruthy();
    }
    expect(getWorkspaceModule("coach").aiActions.join(" ")).toMatch(/Never replace/i);
  });

  it("forbids AI auto-completion of core work", () => {
    expect(AI_AUTONOMY_POLICY.mayAutoSubmit).toBe(false);
    expect(AI_AUTONOMY_POLICY.mayAutoDecide).toBe(false);
    expect(AI_AUTONOMY_POLICY.mayMarkTaskDoneForUser).toBe(false);
    expect(AI_AUTONOMY_POLICY.mayAssignCapability).toBe(false);
  });
});

describe("Workspace project context", () => {
  it("encodes and parses org + experience refs", () => {
    expect(parseWorkspaceProjectParam("experience:abc")).toEqual({
      kind: "experience",
      id: "abc",
    });
    expect(encodeWorkspaceProjectParam({ kind: "org", id: "p1" })).toBe("org:p1");
    expect(withProjectQuery("/workspace/tasks", {
      kind: "org",
      id: "p1",
      name: "Alpha",
      href: "/project/p1",
    })).toContain("project=org%3Ap1");
  });
});

describe("Contribution trail labels", () => {
  it("covers the required trail", () => {
    expect(contributionTrailLabel("user_authored")).toBe("You authored");
    expect(contributionTrailLabel("ai_suggested")).toBe("AI suggested");
    expect(contributionTrailLabel("user_accepted")).toBe("You accepted");
    expect(contributionTrailLabel("user_edited")).toBe("You edited");
    expect(contributionTrailLabel("user_submitted")).toBe("You submitted");
    expect(contributionTrailLabel("outcome_followed")).toBe("Outcome followed");
  });
});

describe("Professional Workspace product aliases", () => {
  it("parses legacy and new product ids", () => {
    expect(parseSuiteProduct("team-copilot")).toBe("team-copilot");
    expect(parseSuiteProduct("professional-workspace")).toBe("team-copilot");
    expect(parseSuiteProduct("workspace")).toBe("team-copilot");
    expect(productDisplayName("team-copilot")).toBe("Professional Workspace");
    expect(productMarketingPath("team-copilot")).toBe("/professional-workspace");
  });
});
