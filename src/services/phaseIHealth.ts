import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { getObservabilityDiagnostics } from "@/lib/observability";
import { runCollaborativeLoopPropagationSmokeTest } from "./collaborativeLoopPropagation";

export type PhaseISmokeCheck = {
  feature: string;
  sprint: string;
  ok: boolean;
  detail: string;
};

export type PhaseIHealthReport = {
  ok: boolean;
  smokeTests: PhaseISmokeCheck[];
  checkedAt: string;
};

const I5_MISSION_ROUTE_PATHS = [
  "src/app/workspace/founder/page.tsx",
  "src/app/workspace/pm-mission/page.tsx",
  "src/app/workspace/ba/page.tsx",
  "src/app/workspace/product/page.tsx",
  "src/app/workspace/engineer/page.tsx",
  "src/app/workspace/qa/page.tsx",
  "src/app/workspace/scrum-mission/page.tsx",
];

const I5_A_PATHS = [
  "src/components/dx/mission-persona-header.tsx",
  "src/config/mission-persona-meta.ts",
  "src/components/dx/mission-dashboard-chrome.tsx",
];

const I5_B_PATHS = [
  "src/lib/dashboard-prefs.ts",
  "src/lib/dashboard-prefs.test.ts",
  "src/components/dx/dashboard-panel-shell.tsx",
  "src/components/dx/dashboard-customize-context.tsx",
];

const I5_C_PATHS = [
  "src/components/dx/clampable-summary.tsx",
  "src/components/dx/mission-ai-summary-block.tsx",
];

const LOOP_PATHS = [
  "src/services/collaborativeLoopPropagation.ts",
  "src/services/collaborativeLoopPropagation.test.ts",
  "src/components/intelligence/workspace-live-refresh.tsx",
];

function missionPagesUsePersonaChrome(): boolean {
  return I5_MISSION_ROUTE_PATHS.every((relativePath) => {
    const path = join(process.cwd(), relativePath);
    if (!existsSync(path)) return false;
    const content = readFileSync(path, "utf8");
    return (
      content.includes("MissionDashboardChrome") &&
      content.includes("@/components/dx/mission-dashboard-chrome")
    );
  });
}

function missionOverviewsUseAiSummary(): boolean {
  const overviewPaths = [
    "src/components/founder/founder-mission-overview.tsx",
    "src/components/delivery-pm/delivery-pm-mission-overview.tsx",
    "src/components/ba/ba-mission-overview.tsx",
    "src/components/product/product-mission-overview.tsx",
    "src/components/engineer/engineer-mission-overview.tsx",
    "src/components/qa/qa-mission-overview.tsx",
    "src/components/scrum/scrum-mission-overview.tsx",
  ];
  return overviewPaths.every((relativePath) => {
    const path = join(process.cwd(), relativePath);
    if (!existsSync(path)) return false;
    const content = readFileSync(path, "utf8");
    return (
      content.includes("MissionAiSummaryBlock") || content.includes("EditableMissionAiSummary")
    );
  });
}

function stickyHeaderTokensPresent(): boolean {
  const themePath = join(process.cwd(), "src/lib/dx-theme.ts");
  const headerPath = join(process.cwd(), "src/components/dx/mission-persona-header.tsx");
  if (!existsSync(themePath) || !existsSync(headerPath)) return false;
  const theme = readFileSync(themePath, "utf8");
  const header = readFileSync(headerPath, "utf8");
  return (
    theme.includes("stickyHeader:") &&
    theme.includes("panelShellBody:") &&
    header.includes("sticky")
  );
}

function observabilityWiredInRootLayout(): boolean {
  const layoutPath = join(process.cwd(), "src/app/layout.tsx");
  if (!existsSync(layoutPath)) return false;
  const content = readFileSync(layoutPath, "utf8");
  return (
    content.includes("VercelObservability") &&
    content.includes("@/components/vercel-observability")
  );
}

function workspaceLiveRefreshWired(): boolean {
  const layoutPath = join(process.cwd(), "src/app/workspace/layout.tsx");
  if (!existsSync(layoutPath)) return false;
  const content = readFileSync(layoutPath, "utf8");
  return (
    content.includes("WorkspaceLiveRefresh") &&
    content.includes("@/components/intelligence/workspace-live-refresh")
  );
}

export function runPhaseISmokeTests(): PhaseISmokeCheck[] {
  const checks: PhaseISmokeCheck[] = [];

  const i5aFilesOk = I5_A_PATHS.every((p) => existsSync(join(process.cwd(), p)));
  checks.push({
    feature: "Persona header module",
    sprint: "I5-A",
    ok: i5aFilesOk,
    detail: `${I5_A_PATHS.length} I5-A artifacts`,
  });

  const missionChromeOk = missionPagesUsePersonaChrome();
  checks.push({
    feature: "Mission pages persona chrome",
    sprint: "I5-A",
    ok: missionChromeOk,
    detail: `${I5_MISSION_ROUTE_PATHS.length} mission routes use MissionDashboardChrome`,
  });

  const i5bFilesOk = I5_B_PATHS.every((p) => existsSync(join(process.cwd(), p)));
  checks.push({
    feature: "Dashboard customize primitives",
    sprint: "I5-B",
    ok: i5bFilesOk,
    detail: `${I5_B_PATHS.length} I5-B artifacts`,
  });

  const i5cFilesOk = I5_C_PATHS.every((p) => existsSync(join(process.cwd(), p)));
  checks.push({
    feature: "Clampable summary components",
    sprint: "I5-C",
    ok: i5cFilesOk,
    detail: `${I5_C_PATHS.length} I5-C artifacts`,
  });

  const missionSummariesOk = missionOverviewsUseAiSummary();
  checks.push({
    feature: "Mission AI summary wiring",
    sprint: "I5-C",
    ok: missionSummariesOk,
    detail: "7 mission overview components use MissionAiSummaryBlock or EditableMissionAiSummary",
  });

  const stickyOk = stickyHeaderTokensPresent();
  checks.push({
    feature: "Sticky header polish tokens",
    sprint: "I5-D",
    ok: stickyOk,
    detail: "dxClass.stickyHeader + MissionPersonaHeader sticky",
  });

  const loopFilesOk = LOOP_PATHS.every((p) => existsSync(join(process.cwd(), p)));
  checks.push({
    feature: "Loop propagation module",
    sprint: "Loop",
    ok: loopFilesOk,
    detail: `${LOOP_PATHS.length} propagation + live refresh artifacts`,
  });

  const propagation = runCollaborativeLoopPropagationSmokeTest();
  checks.push({
    feature: "Narrative thread propagation",
    sprint: "Loop",
    ok: propagation.ok,
    detail: `${propagation.threadCount} threads → ${propagation.rolesReached} roles`,
  });

  const liveRefreshOk = workspaceLiveRefreshWired();
  checks.push({
    feature: "Workspace live refresh wiring",
    sprint: "Loop",
    ok: liveRefreshOk,
    detail: "WorkspaceLiveRefresh on /workspace layout",
  });

  const observability = getObservabilityDiagnostics();
  checks.push({
    feature: "Vercel observability component",
    sprint: "S1-B",
    ok: observability.componentPresent,
    detail: "vercel-observability.tsx present",
  });

  const layoutObservabilityOk = observabilityWiredInRootLayout();
  checks.push({
    feature: "Root layout observability wiring",
    sprint: "S1-B",
    ok: layoutObservabilityOk,
    detail: "VercelObservability in src/app/layout.tsx",
  });

  return checks;
}

export async function getPhaseIHealthReport(): Promise<PhaseIHealthReport> {
  const smokeTests = runPhaseISmokeTests();
  return {
    ok: smokeTests.every((s) => s.ok),
    smokeTests,
    checkedAt: new Date().toISOString(),
  };
}
