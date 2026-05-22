/**
 * Portfolio Engine — pure compute one level up.
 *
 * Aggregates programmes (which in turn aggregate projects). Produces
 * portfolio health, headline risks, and an executive-grade summary.
 */

export type ProgrammeSummary = {
  id: string;
  name: string;
  status: string;
  health: number; // 0..100
  projectCount: number;
  atRiskCount: number;
  risks: string[];
};

export type PortfolioSnapshot = {
  health: number;
  totalProgrammes: number;
  totalProjects: number;
  atRiskProjects: number;
  totalDependencies: number;
  topRisk: string | null;
  executiveSummary: string;
};

export function computePortfolioHealth(
  programmes: ProgrammeSummary[],
): number {
  if (programmes.length === 0) return 0;
  return Math.round(
    programmes.reduce((sum, p) => sum + p.health, 0) / programmes.length,
  );
}

export function generateExecutiveSummary(snapshot: {
  health: number;
  totalProgrammes: number;
  totalProjects: number;
  atRiskProjects: number;
  totalDependencies: number;
  topRisk: string | null;
}): string {
  if (snapshot.totalProjects === 0) {
    return "No active delivery yet — create your first programme and project to begin tracking portfolio health.";
  }

  const headline =
    snapshot.health >= 80
      ? "Portfolio is healthy."
      : snapshot.health >= 60
        ? "Portfolio is broadly stable with watch items."
        : "Portfolio is at risk and requires attention.";

  const risk = snapshot.topRisk
    ? ` Top concern: ${snapshot.topRisk.toLowerCase()}.`
    : "";

  const scope = ` ${snapshot.totalProgrammes} programme${snapshot.totalProgrammes === 1 ? "" : "s"} across ${snapshot.totalProjects} project${snapshot.totalProjects === 1 ? "" : "s"}${snapshot.atRiskProjects > 0 ? `, ${snapshot.atRiskProjects} flagged at risk` : ""}.`;

  return `${headline}${scope}${risk}`;
}

export function summarisePortfolio(
  programmes: ProgrammeSummary[],
  totalDependencies: number,
): PortfolioSnapshot {
  const totalProjects = programmes.reduce((s, p) => s + p.projectCount, 0);
  const atRiskProjects = programmes.reduce((s, p) => s + p.atRiskCount, 0);
  const topRisk =
    programmes
      .flatMap((p) => p.risks)
      .sort((a, b) => b.length - a.length)[0] ?? null;
  const health = computePortfolioHealth(programmes);

  return {
    health,
    totalProgrammes: programmes.length,
    totalProjects,
    atRiskProjects,
    totalDependencies,
    topRisk,
    executiveSummary: generateExecutiveSummary({
      health,
      totalProgrammes: programmes.length,
      totalProjects,
      atRiskProjects,
      totalDependencies,
      topRisk,
    }),
  };
}
