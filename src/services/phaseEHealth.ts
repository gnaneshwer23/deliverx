import { existsSync } from "fs";
import { join } from "path";
import {
  runNavCoherenceEngineSmokeTest,
  runNavCoherenceSmokeTest,
  validateProjectNav,
  validateWorkspaceNav,
  type NavCoherenceCheck,
} from "./navCoherenceEngine";

export type PhaseESmokeCheck = {
  feature: string;
  sprint: string;
  ok: boolean;
  detail: string;
};

export type PhaseEHealthReport = {
  ok: boolean;
  workspaceNav: NavCoherenceCheck[];
  projectNav: NavCoherenceCheck[];
  smokeTests: PhaseESmokeCheck[];
  checkedAt: string;
};

function pageExists(relativePath: string): boolean {
  return existsSync(join(process.cwd(), relativePath));
}

export function runPhaseESmokeTests(): PhaseESmokeCheck[] {
  const checks: PhaseESmokeCheck[] = [];

  const engine = runNavCoherenceEngineSmokeTest();
  checks.push({
    feature: "Ecosystem nav section",
    sprint: "E5",
    ok: engine.ok,
    detail: `${engine.ecosystemRouteCount} ecosystem routes configured`,
  });

  const workspaceNav = validateWorkspaceNav(pageExists);
  const projectNav = validateProjectNav(pageExists);
  const coherence = runNavCoherenceSmokeTest({ workspaceChecks: workspaceNav, projectChecks: projectNav });

  checks.push({
    feature: "Workspace nav → page routes",
    sprint: "E5",
    ok: workspaceNav.every((c) => c.ok),
    detail: `${workspaceNav.length - coherence.missingCount}/${workspaceNav.length} routes resolve`,
  });

  checks.push({
    feature: "Project nav → page routes",
    sprint: "E5",
    ok: projectNav.every((c) => c.ok),
    detail: `${projectNav.length} project segments wired`,
  });

  checks.push({
    feature: "Ecosystem pages discoverable",
    sprint: "E5",
    ok: coherence.ecosystemLinked >= 7,
    detail: `${coherence.ecosystemLinked} ecosystem links in sidebar`,
  });

  checks.push({
    feature: "Project outcomes in nav",
    sprint: "E5",
    ok: coherence.projectOutcomesLinked >= 3,
    detail: "benefits, milestones, closure linked",
  });

  return checks;
}

export async function getPhaseEHealthReport(): Promise<PhaseEHealthReport> {
  const workspaceNav = validateWorkspaceNav(pageExists);
  const projectNav = validateProjectNav(pageExists);
  const smokeTests = runPhaseESmokeTests();
  const ok =
    workspaceNav.every((c) => c.ok) &&
    projectNav.every((c) => c.ok) &&
    smokeTests.every((s) => s.ok);

  return {
    ok,
    workspaceNav,
    projectNav,
    smokeTests,
    checkedAt: new Date().toISOString(),
  };
}
