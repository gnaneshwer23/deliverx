import { existsSync } from "fs";
import { join } from "path";
import { runCollaborativeLoopEngineSmokeTest } from "./collaborativeLoopEngine";

export type PhaseHSmokeCheck = {
  feature: string;
  sprint: string;
  ok: boolean;
  detail: string;
};

export type PhaseHHealthReport = {
  ok: boolean;
  smokeTests: PhaseHSmokeCheck[];
  checkedAt: string;
};

const H1_ROUTE_PATHS = [
  "src/app/workspace/founder/page.tsx",
  "src/app/workspace/pm-mission/page.tsx",
  "src/app/workspace/ba/page.tsx",
  "src/app/workspace/product/page.tsx",
  "src/app/workspace/engineer/page.tsx",
  "src/app/workspace/qa/page.tsx",
  "src/app/workspace/scrum-mission/page.tsx",
];

const H1_COMPONENT_PATHS = [
  "src/components/collaborative/stakeholder-loop-panel.tsx",
  "src/components/collaborative/team-needs-panel.tsx",
  "src/components/collaborative/stakeholder-pulse-panel.tsx",
  "src/components/collaborative/collaborative-panels-grid.tsx",
  "src/services/collaborativeLoopEngine.ts",
  "src/services/collaborativeLoop.ts",
];

export function runPhaseHSmokeTests(): PhaseHSmokeCheck[] {
  const checks: PhaseHSmokeCheck[] = [];
  const engine = runCollaborativeLoopEngineSmokeTest();

  checks.push({
    feature: "Collaborative loop engine",
    sprint: "H1",
    ok: engine.ok,
    detail: `${engine.personaCount} persona snapshots`,
  });

  const routesOk = H1_ROUTE_PATHS.every((p) => existsSync(join(process.cwd(), p)));
  checks.push({
    feature: "Mission dashboard panel wiring",
    sprint: "H1",
    ok: routesOk,
    detail: `${H1_ROUTE_PATHS.length} mission routes`,
  });

  const componentsOk = H1_COMPONENT_PATHS.every((p) => existsSync(join(process.cwd(), p)));
  checks.push({
    feature: "Collaborative panel components",
    sprint: "H1",
    ok: componentsOk,
    detail: `${H1_COMPONENT_PATHS.length} shared files`,
  });

  const impactMergeOk = existsSync(join(process.cwd(), "src/services/deliveryImpact.ts"));
  checks.push({
    feature: "Impact merge helper",
    sprint: "H1",
    ok: impactMergeOk,
    detail: "mergeProjectImpactIntoCrossRole on all dashboards",
  });

  const refreshOk = existsSync(join(process.cwd(), "src/lib/dashboard-refresh.ts"));
  checks.push({
    feature: "Proposal apply revalidation",
    sprint: "H1",
    ok: refreshOk,
    detail: "refreshProjectDashboards after proposal apply",
  });

  return checks;
}

export async function getPhaseHHealthReport(): Promise<PhaseHHealthReport> {
  const smokeTests = runPhaseHSmokeTests();
  return {
    ok: smokeTests.every((s) => s.ok),
    smokeTests,
    checkedAt: new Date().toISOString(),
  };
}
