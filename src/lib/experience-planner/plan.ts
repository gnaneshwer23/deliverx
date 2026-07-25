/**
 * Pure gap → Experience recommendation mapping.
 * Selects / configures MediFlow emphasis from SnapshotClaims gaps — never assigns capability.
 */

import {
  EXPERIENCE_PLANNER_VERSION,
  MEDIFLOW_SCENARIO_CATALOG,
  scenarioByEmphasis,
} from "@/lib/experience-planner/catalog";
import type {
  ExperienceEmphasis,
  ExperiencePlanRecommendation,
  PlanFromGapsInput,
  RankedGap,
} from "@/lib/experience-planner/types";

const GAP_LEVEL_WEIGHT: Record<string, number> = {
  insufficient_evidence: 1,
  emerging: 0.85,
  developing: 0.55,
  pending_review: 0.7,
  proficient: 0.15,
  advanced: 0.05,
};

const COMPETENCY_EMPHASIS: Array<{
  patterns: RegExp[];
  competencyId: string;
  emphasis: ExperienceEmphasis;
}> = [
  {
    patterns: [
      /comp\.stakeholder/i,
      /stakeholder/i,
      /executive/i,
      /alignment/i,
      /facilitation/i,
      /negotiat/i,
    ],
    competencyId: "comp.stakeholder_management",
    emphasis: "stakeholder",
  },
  {
    patterns: [
      /comp\.delivery/i,
      /delivery/i,
      /constraint/i,
      /scope/i,
      /capacity/i,
      /timeline/i,
      /execution/i,
    ],
    competencyId: "comp.delivery_execution",
    emphasis: "delivery",
  },
  {
    patterns: [
      /comp\.product_discovery/i,
      /comp\.discovery/i,
      /discovery/i,
      /hypothesis/i,
      /problem\s*framing/i,
      /evidence\s*before/i,
      /customer\s*insight/i,
    ],
    competencyId: "comp.product_discovery",
    emphasis: "discovery",
  },
];

/** Extract competency id prefix from a gap string like `comp.x: emerging — …`. */
export function parseGapCompetency(gap: string): {
  competencyId: string | null;
  level: string | null;
  rest: string;
} {
  const colon = gap.indexOf(":");
  if (colon > 0 && gap.slice(0, colon).startsWith("comp.")) {
    const competencyId = gap.slice(0, colon).trim();
    const after = gap.slice(colon + 1).trim();
    const dash = after.indexOf("—");
    const levelPart = (dash >= 0 ? after.slice(0, dash) : after).trim();
    const levelToken = levelPart.split(/\s+/)[0]?.toLowerCase() || null;
    return {
      competencyId,
      level: levelToken,
      rest: dash >= 0 ? after.slice(dash + 1).trim() : after,
    };
  }
  return { competencyId: null, level: null, rest: gap };
}

export function matchEmphasisForText(
  text: string,
  competencyId?: string | null,
): { emphasis: ExperienceEmphasis | null; competencyId: string | null } {
  const hay = `${competencyId ?? ""} ${text}`;
  for (const row of COMPETENCY_EMPHASIS) {
    if (competencyId && row.competencyId === competencyId) {
      return { emphasis: row.emphasis, competencyId: row.competencyId };
    }
    if (row.patterns.some((p) => p.test(hay))) {
      return { emphasis: row.emphasis, competencyId: row.competencyId };
    }
  }
  return { emphasis: null, competencyId: competencyId ?? null };
}

export function rankGapsFromClaims(input: PlanFromGapsInput): RankedGap[] {
  const levelByComp = new Map(
    (input.levels ?? []).map((l) => [l.competencyId, l]),
  );

  const fromGaps: RankedGap[] = (input.gaps ?? []).map((gap) => {
    const parsed = parseGapCompetency(gap);
    const matched = matchEmphasisForText(gap, parsed.competencyId);
    const levelRow = matched.competencyId
      ? levelByComp.get(matched.competencyId)
      : undefined;
    const level = parsed.level ?? levelRow?.level ?? null;
    const levelWeight = level ? (GAP_LEVEL_WEIGHT[level] ?? 0.4) : 0.5;
    const confidencePenalty = levelRow?.confidence
      ? 1 - Math.min(1, levelRow.confidence) * 0.2
      : 1;
    return {
      gap,
      competencyId: matched.competencyId ?? parsed.competencyId,
      level,
      score: levelWeight * confidencePenalty,
      matchedEmphasis: matched.emphasis,
    };
  });

  // Also rank thin levels even if not listed in gaps[] (defensive).
  for (const level of input.levels ?? []) {
    if (fromGaps.some((g) => g.competencyId === level.competencyId)) continue;
    const weight = GAP_LEVEL_WEIGHT[level.level] ?? 0;
    if (weight < 0.4) continue;
    const matched = matchEmphasisForText(level.competencyId, level.competencyId);
    fromGaps.push({
      gap: `${level.competencyId}: ${level.level}`,
      competencyId: level.competencyId,
      level: level.level,
      score: weight * 0.9,
      matchedEmphasis: matched.emphasis,
    });
  }

  return fromGaps.sort((a, b) => b.score - a.score);
}

export function pickEmphasis(ranked: RankedGap[]): ExperienceEmphasis {
  const tallies: Record<ExperienceEmphasis, number> = {
    stakeholder: 0,
    delivery: 0,
    discovery: 0,
    balanced: 0,
  };
  for (const row of ranked.slice(0, 5)) {
    if (row.matchedEmphasis) {
      tallies[row.matchedEmphasis] += row.score;
    }
  }
  const best = (Object.entries(tallies) as [ExperienceEmphasis, number][])
    .filter(([k]) => k !== "balanced")
    .sort((a, b) => b[1] - a[1])[0];

  if (!best || best[1] <= 0) return "balanced";
  return best[0];
}

function buildRationale(input: {
  scenarioTitle: string;
  emphasis: ExperienceEmphasis;
  ranked: RankedGap[];
  coachingFocus: string;
  recTitle?: string;
}): string {
  const top = input.ranked.slice(0, 3);
  if (top.length === 0) {
    return `No ScoreRun gaps yet — recommending ${input.scenarioTitle} (balanced MediFlow Day 1). Practice still writes evidence to the ledger; ScoreRun assigns levels.`;
  }
  const gapList = top.map((g) => `“${g.gap}”`).join("; ");
  const recBit = input.recTitle ? ` ScoreRun also suggested “${input.recTitle}”.` : "";
  return `Your latest ScoreRun gaps (${gapList}) map to a ${input.emphasis}-emphasised MediFlow TrustCare plan.${recBit} Focus: ${input.coachingFocus} Experience produces evidence only — capability is assigned by ScoreRun.`;
}

/**
 * Build a personalised Experience plan recommendation from gaps / levels.
 * Pure function — no I/O, no capability writes.
 */
export function planExperienceFromGaps(
  input: PlanFromGapsInput,
): ExperiencePlanRecommendation {
  const ranked = rankGapsFromClaims(input);
  const emphasis = pickEmphasis(ranked);
  const scenario = scenarioByEmphasis(emphasis);
  const targeted = [
    ...new Set(
      ranked
        .filter((g) => g.matchedEmphasis === emphasis || emphasis === "balanced")
        .map((g) => g.competencyId)
        .filter((c): c is string => Boolean(c)),
    ),
  ];
  const competencies =
    targeted.length > 0 ? targeted : [...scenario.competencyCodes];

  const evidenceLinks = (input.evidenceRefs ?? []).slice(0, 8).map((id) => ({
    kind: "evidence",
    id,
    label: "Cited evidence",
  }));
  if (input.snapshotId) {
    evidenceLinks.unshift({
      kind: "snapshot",
      id: input.snapshotId,
      label: "ScoreRun snapshot",
    });
  }

  const plan: ExperiencePlanRecommendation = {
    scenarioSlug: scenario.slug,
    emphasis: scenario.emphasis,
    title: scenario.title,
    summary: scenario.summary,
    coachingFocus: scenario.coachingFocus,
    decisionEmphasis: [...scenario.decisionEmphasis],
    targetedCompetencies: competencies,
    rankedGaps: ranked.slice(0, 8),
    rationale: buildRationale({
      scenarioTitle: scenario.title,
      emphasis: scenario.emphasis,
      ranked,
      coachingFocus: scenario.coachingFocus,
      recTitle: input.recommendations?.[0]?.title,
    }),
    evidenceLinks,
    href: `/experience/app?planEmphasis=${scenario.emphasis}`,
    targetRole: input.targetRole ?? null,
    targetSeniority: input.targetSeniority ?? null,
    snapshotId: input.snapshotId ?? null,
    scoreRunId: input.scoreRunId ?? null,
    frameworkVersionId: input.frameworkVersionId ?? null,
    plannerVersion: EXPERIENCE_PLANNER_VERSION,
    capabilityAssigned: false,
  };

  return plan;
}

/** Assert two users with different primary gaps get different emphases (or balanced vs specialised). */
export function emphasesDiffer(
  a: ExperiencePlanRecommendation,
  b: ExperiencePlanRecommendation,
): boolean {
  return a.emphasis !== b.emphasis || a.scenarioSlug !== b.scenarioSlug;
}

export function catalogCoverageAssertion(): boolean {
  const emphases = new Set(MEDIFLOW_SCENARIO_CATALOG.map((s) => s.emphasis));
  return (
    emphases.has("stakeholder") &&
    emphases.has("delivery") &&
    emphases.has("discovery") &&
    emphases.has("balanced") &&
    MEDIFLOW_SCENARIO_CATALOG.every((s) => s.competencyCodes.length > 0)
  );
}
