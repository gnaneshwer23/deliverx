/**
 * Founder engine — company health, cross-role impact, strategic objectives.
 */

export type HealthTone = "green" | "amber" | "red";

export type FounderStrategicObjective = {
  title: string;
  progress: number;
  insight?: string;
};

export type FounderPortfolioRow = {
  id: string;
  name: string;
  healthTone: HealthTone;
  budgetLabel: string;
  deliveryPct: number;
};

export type FounderDecisionRow = {
  id: string;
  title: string;
  impact: string;
  status: string;
  projectName?: string;
};

export type CrossRoleFounderImpact = {
  role: string;
  message: string;
  tone: "ready" | "waiting" | "blocked" | "updated";
};

export function toneFromScore(score: number): HealthTone {
  if (score >= 75) return "green";
  if (score >= 55) return "amber";
  return "red";
}

export function computeStartupHealthTier(input: {
  portfolioHealth: number;
  runwayMonths: number;
  growthPct: number;
}): { tier: HealthTone; label: string } {
  if (input.runwayMonths < 6 || input.portfolioHealth < 50) {
    return { tier: "red", label: "Red" };
  }
  if (input.runwayMonths < 12 || input.portfolioHealth < 70) {
    return { tier: "amber", label: "Amber" };
  }
  return { tier: "green", label: "Green" };
}

export function buildFounderCrossRoleImpact(input: {
  pendingDecisions: number;
  criticalRisks: number;
  productHealth: number;
  deliveryConfidence: number;
  capacityStrain: "low" | "medium" | "high";
}): CrossRoleFounderImpact[] {
  return [
    {
      role: "Product Manager",
      message: `Roadmap & adoption signals · product health ${input.productHealth}/100`,
      tone: input.productHealth < 60 ? "updated" : "ready",
    },
    {
      role: "Project Manager",
      message: `${input.criticalRisks} critical risks · ${input.deliveryConfidence}% delivery confidence`,
      tone: input.criticalRisks > 2 ? "blocked" : "waiting",
    },
    {
      role: "Engineers",
      message: "Velocity and deployment health aggregated from delivery signals",
      tone: input.capacityStrain === "high" ? "blocked" : "ready",
    },
    {
      role: "QA",
      message: "Release readiness tied to milestone progress across portfolio",
      tone: "waiting",
    },
    {
      role: "Operations",
      message: "Adoption, support load, and SLA health from live delivery data",
      tone: "ready",
    },
  ];
}

export function defaultStrategicObjectives(): FounderStrategicObjective[] {
  return [
    { title: "PMF", progress: 72 },
    { title: "AI Differentiation", progress: 81 },
    { title: "Revenue Growth", progress: 64 },
    { title: "Customer Adoption", progress: 70 },
  ];
}

export function formatInvestorBullets(snapshot: {
  headline?: string;
  bullets?: string[];
}): string[] {
  if (snapshot.bullets?.length) return snapshot.bullets;
  if (snapshot.headline) return [snapshot.headline];
  return [];
}
