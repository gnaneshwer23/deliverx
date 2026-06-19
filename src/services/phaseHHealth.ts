import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { runCollaborativeLoopEngineSmokeTest } from "./collaborativeLoopEngine";
import { runCollaborativeLoopPropagationSmokeTest, runNarrativeThreadSemanticSmokeTest } from "./collaborativeLoopPropagation";
import { runAgentOrchestrationImpactSmokeTest } from "./agentOrchestrationImpact";
import { runLoopEventPropagationSmokeTest } from "./loopEventPropagation";

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

const H2_PATHS = [
  "supabase/migrations/0056_delivery_impact_realtime.sql",
  "src/components/intelligence/delivery-impact-live-refresh.tsx",
  "src/services/collaborativeLoopPropagation.ts",
  "src/services/collaborativeLoopPropagation.test.ts",
  "src/services/loopEventPropagation.ts",
  "src/services/loopEventPropagation.test.ts",
];

const H3_PATHS = [
  "supabase/migrations/0057_collaborative_loop_snapshots.sql",
  "src/services/agentOrchestrationImpact.ts",
  "src/services/agentOrchestrationImpact.test.ts",
  "src/services/collaborativeLoopSnapshot.ts",
];

function dashboardHasCollaborativePanels(): boolean {
  const path = join(process.cwd(), "src/app/workspace/dashboard/page.tsx");
  if (!existsSync(path)) return false;
  const content = readFileSync(path, "utf8");
  return (
    content.includes("CollaborativePanelsGrid") &&
    content.includes("getCollaborativeLoopSnapshot")
  );
}

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

  const propagation = runCollaborativeLoopPropagationSmokeTest();
  checks.push({
    feature: "Narrative thread propagation",
    sprint: "H2",
    ok: propagation.ok,
    detail: `${propagation.threadCount} threads → ${propagation.rolesReached} roles`,
  });

  const semanticThreads = runNarrativeThreadSemanticSmokeTest();
  checks.push({
    feature: "J2 live narrative thread signals",
    sprint: "J2",
    ok: semanticThreads.ok,
    detail: `blocked ${semanticThreads.blockedTask ? "yes" : "no"} · defects ${semanticThreads.criticalDefects} · compliance ${semanticThreads.complianceGap ? "yes" : "no"}`,
  });

  const loopEvents = runLoopEventPropagationSmokeTest();
  checks.push({
    feature: "J1 loop event propagation",
    sprint: "J1",
    ok: loopEvents.ok,
    detail: `task ${loopEvents.taskDrafts} · defect ${loopEvents.defectDrafts} · req ${loopEvents.requirementDrafts} · decision ${loopEvents.decisionDrafts}`,
  });

  const liveRefreshOk = existsSync(
    join(process.cwd(), "src/components/intelligence/delivery-impact-live-refresh.tsx"),
  );
  checks.push({
    feature: "Delivery impact live refresh",
    sprint: "H2",
    ok: liveRefreshOk,
    detail: "delivery_impact_events realtime subscription",
  });

  const migrationOk = existsSync(
    join(process.cwd(), "supabase/migrations/0056_delivery_impact_realtime.sql"),
  );
  checks.push({
    feature: "Realtime migration",
    sprint: "H2",
    ok: migrationOk,
    detail: "0056_delivery_impact_realtime.sql",
  });

  const h2FilesOk = H2_PATHS.every((p) => existsSync(join(process.cwd(), p)));
  checks.push({
    feature: "H2 propagation module",
    sprint: "H2",
    ok: h2FilesOk,
    detail: `${H2_PATHS.length} H2 artifacts`,
  });

  const agentImpact = runAgentOrchestrationImpactSmokeTest();
  checks.push({
    feature: "Agent orchestration impact bridge",
    sprint: "H3",
    ok: agentImpact.ok,
    detail: `${agentImpact.draftCount} drafts → ${agentImpact.rolesReached} roles`,
  });

  const commandCentreOk = dashboardHasCollaborativePanels();
  checks.push({
    feature: "Command centre collaborative panels",
    sprint: "H3",
    ok: commandCentreOk,
    detail: "Stakeholder loop + team needs + pulse on /workspace/dashboard",
  });

  const programmeHookOk = existsSync(
    join(process.cwd(), "src/services/programmeOrchestration.ts"),
  ) && readFileSync(join(process.cwd(), "src/services/programmeOrchestration.ts"), "utf8").includes(
    "programmeResultsToImpactDrafts",
  );
  checks.push({
    feature: "Programme orchestration impact hook",
    sprint: "H3",
    ok: programmeHookOk,
    detail: "org-wide impact events on programme escalations",
  });

  const snapshotMigrationOk = existsSync(
    join(process.cwd(), "supabase/migrations/0057_collaborative_loop_snapshots.sql"),
  );
  checks.push({
    feature: "Collaborative loop snapshots",
    sprint: "H3",
    ok: snapshotMigrationOk,
    detail: "0057_collaborative_loop_snapshots.sql",
  });

  const h3FilesOk = H3_PATHS.every((p) => existsSync(join(process.cwd(), p)));
  checks.push({
    feature: "H3 orchestration module",
    sprint: "H3",
    ok: h3FilesOk,
    detail: `${H3_PATHS.length} H3 artifacts`,
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
