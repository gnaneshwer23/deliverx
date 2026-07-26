import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  AI_AUTONOMY_POLICY,
  PROFESSIONAL_WORKSPACE_MODULES,
} from "@/lib/professional-workspace/modules";
import { isLegacyWorkspaceNavEnabled } from "@/config/workspace-nav-policy";
import { T7_WORKSPACE_FOUNDATION } from "@/config/workspace-nav-policy";

function source(relativePath: string) {
  return readFileSync(
    fileURLToPath(new URL(relativePath, import.meta.url)),
    "utf8",
  );
}

describe("Professional Workspace home honesty", () => {
  it("keeps AI autonomy policy honest", () => {
    expect(AI_AUTONOMY_POLICY.mayAutoSubmit).toBe(false);
    expect(AI_AUTONOMY_POLICY.mayAutoDecide).toBe(false);
    expect(AI_AUTONOMY_POLICY.mayAssignCapability).toBe(false);
  });

  it("does not invent readiness or Verified from Workspace modules", () => {
    const home = source("../../components/professional-workspace/workspace-home.tsx");
    expect(home.toLowerCase()).not.toMatch(/readiness\s*%/);
    expect(home.toLowerCase()).not.toMatch(/job-ready/);
    expect(home).toMatch(/Capability is never\s+assigned here/);
    expect(home).toMatch(/Team Copilot is the same product alias/);
    expect(home).toMatch(/Observation off \(default\)/);
    expect(home).toMatch(/not a delivery health score/);
    expect(home).toMatch(/Where am I\?/);
    expect(home).toMatch(/What matters now/);
    expect(home).toMatch(/WorkspaceProductShell/);
    expect(home).toMatch(/pw-module/);
  });

  it("exposes primary modules without requiring mission-control depth", () => {
    const ids = PROFESSIONAL_WORKSPACE_MODULES.map((m) => m.id);
    expect(ids).toContain("team");
    expect(ids).toContain("meetings");
    expect(ids).toContain("evidence");
    expect(T7_WORKSPACE_FOUNDATION.teamCopilotIsThirdSku).toBe(false);
    expect(T7_WORKSPACE_FOUNDATION.missionControlInNav).toBe(false);
  });
});

describe("Professional Workspace suite chrome", () => {
  it("defaults to ProductSuiteShell and keeps AppShell behind legacy flag", () => {
    const layout = source("../../app/workspace/layout.tsx");
    expect(layout).toContain("ProductSuiteShell");
    expect(layout).toContain("isLegacyWorkspaceNavEnabled");
    expect(layout).toContain("AppShell");
    expect(isLegacyWorkspaceNavEnabled({})).toBe(false);
    expect(
      isLegacyWorkspaceNavEnabled({ DELIVERX_LEGACY_WORKSPACE_NAV: "on" }),
    ).toBe(true);
  });

  it("module chrome uses landmarks and honest empty copy", () => {
    const chrome = source(
      "../../components/professional-workspace/module-chrome.tsx",
    );
    const frame = source(
      "../../components/professional-workspace/workspace-product-frame.tsx",
    );
    expect(frame).toContain('aria-label="Workspace modules"');
    expect(frame).toContain("pw-rail");
    expect(chrome).toContain("Nothing here yet");
    expect(chrome).toContain("Open Evidence Ledger");
    expect(chrome).toContain("WorkspaceProductFrame");
    expect(chrome).not.toMatch(/recordWorkspaceContribution/);
  });

  it("shares product-app CSS tokens with Experience/Launchpad density", () => {
    const css = source(
      "../../components/professional-workspace/workspace-app.css",
    );
    expect(css).toContain(".pw-root");
    expect(css).toContain("--pw-accent: #1c4a2e");
    expect(css).toContain("--pw-surface: #fffdf8");
    expect(css).toContain(".pw-rail");
    expect(css).toContain(".pw-module-grid");
  });
});
