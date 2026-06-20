import { describe, expect, it } from "vitest";
import {
  governanceEmptyStateForTab,
  governanceTabHref,
  parseGovernanceTab,
} from "./governance-tabs";

describe("governance-tabs", () => {
  it("defaults to risks when tab is missing or invalid", () => {
    expect(parseGovernanceTab(undefined)).toBe("risks");
    expect(parseGovernanceTab("")).toBe("risks");
    expect(parseGovernanceTab("unknown")).toBe("risks");
  });

  it("parses valid tab ids", () => {
    expect(parseGovernanceTab("decisions")).toBe("decisions");
    expect(parseGovernanceTab(["changes"])).toBe("changes");
    expect(parseGovernanceTab("approvals")).toBe("approvals");
  });

  it("builds tab hrefs with query param", () => {
    expect(governanceTabHref("risks")).toBe("/workspace/governance?tab=risks");
    expect(governanceTabHref("approvals")).toBe("/workspace/governance?tab=approvals");
  });

  it("returns tab-specific empty state copy", () => {
    const risks = governanceEmptyStateForTab("risks");
    const approvals = governanceEmptyStateForTab("approvals");
    expect(risks.title).toContain("risks");
    expect(approvals.title).toContain("approvals");
    expect(risks.href).toBe("/workspace/projects");
  });
});
