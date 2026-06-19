import { describe, expect, it } from "vitest";
import {
  WORKSPACE_SIDEBAR_BREAKPOINT,
  WORKSPACE_SIDEBAR_MIN_WIDTH_PX,
  workspaceMainFullWidthClass,
  workspaceMainOffsetClass,
} from "./responsive-layout";

describe("responsive-layout", () => {
  it("uses lg breakpoint for workspace sidebar", () => {
    expect(WORKSPACE_SIDEBAR_BREAKPOINT).toBe("lg");
    expect(WORKSPACE_SIDEBAR_MIN_WIDTH_PX).toBe(1024);
  });

  it("applies sidebar margin only at lg and above", () => {
    expect(workspaceMainOffsetClass).toContain("lg:ml-[var(--dx-sbw)]");
    expect(workspaceMainOffsetClass).not.toContain(" ml-[var(--dx-sbw)]");
    expect(workspaceMainOffsetClass).not.toMatch(/^ml-\[var\(--dx-sbw\)\]/);
  });

  it("keeps full-width main when sidebar is hidden", () => {
    expect(workspaceMainFullWidthClass).not.toContain("--dx-sbw");
  });
});
