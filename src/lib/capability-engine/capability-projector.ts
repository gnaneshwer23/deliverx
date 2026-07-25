import { levelRank } from "@/lib/capability-engine/rubric";
import type {
  CapabilityLevel,
  CapabilitySnapshotProfile,
  Contradiction,
  StructuredJudgement,
  TargetRoleRequirements,
} from "@/lib/capability-engine/types";
import {
  ALGORITHM_VERSION,
  DEFAULT_MODEL_VERSION,
  DEFAULT_PROMPT_VERSION,
} from "@/lib/capability-engine/types";

function dimScore(judgements: StructuredJudgement[], kind: string): number {
  const relevant = judgements.filter((j) =>
    j.intelligenceKinds.some((k) => k === kind || (kind === "appliedSkill" && k === "applied_skill")),
  );
  if (!relevant.length) return 0;
  const avg =
    relevant.reduce((s, j) => s + levelRank(j.levelProposed) * j.confidence, 0) /
    relevant.length;
  return Number(Math.min(100, (avg / 4) * 100).toFixed(1));
}

export function defaultTargetRequirements(
  role = "Associate Product Manager",
  seniority = "associate",
): TargetRoleRequirements {
  const minLevel: CapabilityLevel =
    seniority === "senior" || seniority === "lead" ? "proficient" : "developing";
  return {
    role,
    seniority,
    requiredCompetencies: [
      { competencyId: "comp.stakeholder_management", minLevel },
      { competencyId: "comp.delivery_execution", minLevel },
      { competencyId: "comp.product_discovery", minLevel: "emerging" },
    ],
  };
}

export function compareToTarget(
  judgements: StructuredJudgement[],
  target: TargetRoleRequirements,
): { met: string[]; unmet: string[] } {
  const byComp = new Map(judgements.map((j) => [j.competencyId, j]));
  const met: string[] = [];
  const unmet: string[] = [];
  for (const req of target.requiredCompetencies) {
    const j = byComp.get(req.competencyId);
    if (j && levelRank(j.levelProposed) >= levelRank(req.minLevel)) {
      met.push(req.competencyId);
    } else {
      unmet.push(req.competencyId);
    }
  }
  return { met, unmet };
}

/** Capability Projector — derived snapshot; never writes evidence. */
export function projectCapabilitySnapshot(input: {
  judgements: StructuredJudgement[];
  contradictions: Contradiction[];
  strengths: string[];
  gaps: string[];
  recommendations: CapabilitySnapshotProfile["recommendations"];
  target: TargetRoleRequirements;
  rubricSlug: string;
  rubricVersion: string;
  now?: Date;
}): CapabilitySnapshotProfile {
  const now = input.now ?? new Date();
  const comparison = compareToTarget(input.judgements, input.target);

  const readinessBase =
    input.judgements.reduce((s, j) => s + levelRank(j.levelProposed) * j.confidence, 0) /
    Math.max(input.judgements.length, 1);
  const readiness = Number(Math.min(100, (readinessBase / 4) * 100).toFixed(1));

  return {
    schemaVersion: "1",
    algorithmVersion: ALGORITHM_VERSION,
    rubricSlug: input.rubricSlug,
    rubricVersion: input.rubricVersion,
    modelVersion: DEFAULT_MODEL_VERSION,
    promptVersion: DEFAULT_PROMPT_VERSION,
    generatedAt: now.toISOString(),
    readiness,
    dimensions: {
      knowledge: dimScore(input.judgements, "knowledge"),
      appliedSkill: dimScore(input.judgements, "appliedSkill"),
      behaviour: dimScore(input.judgements, "behaviour"),
      competency: dimScore(input.judgements, "competency"),
      outcome: dimScore(input.judgements, "outcome"),
      potential: dimScore(input.judgements, "potential"),
      readiness,
    },
    judgements: input.judgements,
    strengths: input.strengths,
    gaps: input.gaps,
    recommendations: input.recommendations,
    contradictions: input.contradictions,
    targetComparison: {
      role: input.target.role,
      seniority: input.target.seniority,
      met: comparison.met,
      unmet: comparison.unmet,
    },
    explanations: input.judgements.map((j) => ({
      competencyId: j.competencyId,
      text: j.reasoningSummary,
    })),
  };
}
