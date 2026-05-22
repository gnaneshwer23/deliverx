/**
 * Programme Engine — pure compute over a programme's projects.
 *
 * Signals come pre-aggregated per project (id, name, healthScore,
 * confidenceScore, status, blockers, velocity). The engine identifies
 * cross-project patterns: risks, bottlenecks, slowest mover, etc.
 */

export type ProgrammeProject = {
  id: string;
  name: string;
  status: string;
  healthScore: number; // 0..100
  confidenceScore: number; // 0..100
  blockers: number;
  velocity: number; // 0..1
  milestoneDelay: boolean;
};

export type ProgrammeAnalysis = {
  programmeHealth: number;
  risks: string[];
  bottlenecks: string[];
  atRiskProjectIds: string[];
};

export function computeProgrammeHealth(projects: ProgrammeProject[]): number {
  if (projects.length === 0) return 0;
  return Math.round(
    projects.reduce((sum, p) => sum + p.healthScore, 0) / projects.length,
  );
}

export function detectProgrammeRisks(projects: ProgrammeProject[]): string[] {
  const risks: string[] = [];
  if (projects.length === 0) return risks;

  const delayed = projects.filter((p) => p.milestoneDelay);
  if (delayed.length > 2) {
    risks.push(
      `${delayed.length} projects show milestone slippage — programme-level coordination needed`,
    );
  }

  const atRisk = projects.filter((p) => p.healthScore < 60);
  if (atRisk.length > 0 && atRisk.length / projects.length > 0.3) {
    risks.push(
      `${Math.round((atRisk.length / projects.length) * 100)}% of projects below the health threshold`,
    );
  }

  const blockerHeavy = projects.filter((p) => p.blockers > 5);
  if (blockerHeavy.length > 1) {
    risks.push(
      `Multiple projects (${blockerHeavy.length}) with high blocker counts — likely shared dependency`,
    );
  }

  const slowMover = projects.filter((p) => p.velocity < 0.6);
  if (slowMover.length > 1) {
    risks.push(
      `Velocity drag across ${slowMover.length} projects — capacity may be mis-allocated`,
    );
  }

  return risks.slice(0, 4);
}

export function identifyBottlenecks(
  projects: ProgrammeProject[],
  incomingDependencyCounts: Map<string, number>,
): string[] {
  const out: string[] = [];

  const ranked = [...projects].sort((a, b) => {
    const incomingA = incomingDependencyCounts.get(a.id) ?? 0;
    const incomingB = incomingDependencyCounts.get(b.id) ?? 0;
    return incomingB - incomingA;
  });

  for (const p of ranked) {
    if (out.length >= 3) break;
    const incoming = incomingDependencyCounts.get(p.id) ?? 0;
    if (incoming > 0 && (p.healthScore < 70 || p.blockers > 3)) {
      out.push(
        `${p.name} — ${incoming} downstream ${incoming === 1 ? "project depends" : "projects depend"} on it, currently ${p.healthScore < 60 ? "at risk" : "needs watch"}`,
      );
    }
  }

  return out;
}

export function analyseProgramme(
  projects: ProgrammeProject[],
  incomingDeps: Map<string, number>,
): ProgrammeAnalysis {
  return {
    programmeHealth: computeProgrammeHealth(projects),
    risks: detectProgrammeRisks(projects),
    bottlenecks: identifyBottlenecks(projects, incomingDeps),
    atRiskProjectIds: projects
      .filter((p) => p.healthScore < 60)
      .map((p) => p.id),
  };
}
