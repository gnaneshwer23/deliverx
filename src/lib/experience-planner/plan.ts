/**
 * Pure gap → Experience recommendation mapping.
 * Selects among multi-company scenarios from SnapshotClaims gaps + preferences.
 * Never assigns capability.
 */

import {
  EXPERIENCE_PLANNER_VERSION,
  EXPERIENCE_SCENARIO_CATALOG,
  distinctCompanyCount,
  scenarioBySlug,
} from "@/lib/experience-planner/catalog";
import type {
  ExperienceEmphasis,
  ExperiencePlanRecommendation,
  ExperienceScenarioDef,
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

const ROLE_FAMILY_PATTERNS: Array<{ family: string; patterns: RegExp[] }> = [
  {
    family: "project_manager",
    patterns: [/project\s*manager/i, /\bpm\b(?!\s*product)/i, /programme/i, /program\s*manager/i],
  },
  {
    family: "technical_product_manager",
    patterns: [/technical\s*pm/i, /technical\s*product/i, /\btpm\b/i],
  },
  {
    family: "product_manager",
    patterns: [
      /product\s*manager/i,
      /\bapm\b/i,
      /associate\s*product/i,
      /senior\s*product/i,
      /\bpm\b/i,
      /product\s*owner/i,
    ],
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

export function inferRoleFamily(targetRole?: string | null): string | null {
  if (!targetRole) return null;
  for (const row of ROLE_FAMILY_PATTERNS) {
    if (row.patterns.some((p) => p.test(targetRole))) return row.family;
  }
  return null;
}

function normalizeIndustryToken(value: string): string {
  return value.trim().toLowerCase();
}

function industryOverlapScore(
  scenario: ExperienceScenarioDef,
  preferred: string[],
): number {
  if (preferred.length === 0) return 0;
  const labels = scenario.industryLabels.map(normalizeIndustryToken);
  const industry = normalizeIndustryToken(scenario.industry.replace(/_/g, " "));
  let score = 0;
  for (const pref of preferred.map(normalizeIndustryToken)) {
    if (!pref) continue;
    if (labels.some((l) => l.includes(pref) || pref.includes(l))) score += 1.2;
    else if (industry.includes(pref) || pref.includes(industry)) score += 1;
    else if (pref.includes("health") && scenario.industry === "healthcare")
      score += 1;
    else if (pref.includes("edu") && scenario.industry === "education") score += 1;
    else if (
      (pref.includes("saas") || pref.includes("software") || pref.includes("b2b")) &&
      scenario.industry === "saas"
    )
      score += 1;
    else if (
      pref.includes("product") &&
      scenario.industry === "product_management"
    )
      score += 0.9;
    else if (
      pref.includes("project") &&
      scenario.industry === "project_management"
    )
      score += 0.9;
  }
  return score;
}

function competencyOverlapScore(
  scenario: ExperienceScenarioDef,
  ranked: RankedGap[],
): number {
  let score = 0;
  for (const gap of ranked.slice(0, 5)) {
    if (!gap.competencyId) continue;
    if (scenario.competencyCodes.includes(gap.competencyId)) {
      score += gap.score * 2.5;
    } else if (
      gap.matchedEmphasis &&
      (scenario.emphasis === gap.matchedEmphasis ||
        scenario.competencyCodes.some((c) =>
          matchEmphasisForText(c, c).emphasis === gap.matchedEmphasis,
        ))
    ) {
      score += gap.score * 1.2;
    }
  }
  return score;
}

function roleOverlapScore(
  scenario: ExperienceScenarioDef,
  targetRole?: string | null,
): number {
  const family = inferRoleFamily(targetRole);
  if (!family) return 0;
  if (scenario.roleFamily === family) return 1.5;
  if (
    family === "product_manager" &&
    scenario.roleFamily === "technical_product_manager"
  )
    return 0.6;
  if (
    family === "technical_product_manager" &&
    scenario.roleFamily === "product_manager"
  )
    return 0.5;
  if (
    family === "project_manager" &&
    scenario.industry === "project_management"
  )
    return 1.2;
  return 0;
}

export function scoreScenario(
  scenario: ExperienceScenarioDef,
  ranked: RankedGap[],
  input: PlanFromGapsInput,
): number {
  const gapScore = competencyOverlapScore(scenario, ranked);
  const industryScore = industryOverlapScore(
    scenario,
    input.preferredIndustries ?? [],
  );
  const roleScore = roleOverlapScore(scenario, input.targetRole);
  const emphasis = pickEmphasis(ranked);
  const emphasisBoost =
    scenario.emphasis === emphasis ? 0.35 : scenario.emphasis === "balanced" ? 0.1 : 0;
  const fallbackPenalty = scenario.isFallback && ranked.length > 0 ? -0.15 : 0;
  return gapScore + industryScore * 1.4 + roleScore + emphasisBoost + fallbackPenalty;
}

export function pickScenario(
  ranked: RankedGap[],
  input: PlanFromGapsInput,
): ExperienceScenarioDef {
  const scored = EXPERIENCE_SCENARIO_CATALOG.map((scenario) => ({
    scenario,
    score: scoreScenario(scenario, ranked, input),
  })).sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best || best.score <= 0) {
    return (
      EXPERIENCE_SCENARIO_CATALOG.find((s) => s.isFallback) ??
      EXPERIENCE_SCENARIO_CATALOG[0]!
    );
  }
  return best.scenario;
}

function decisionOrderForEmphasis(emphasis: ExperienceEmphasis): string[] {
  const orderByEmphasis: Record<ExperienceEmphasis, string[]> = {
    stakeholder: ["discuss_options", "make_decision", "review_context"],
    delivery: ["review_context", "make_decision", "discuss_options"],
    discovery: ["review_context", "discuss_options", "make_decision"],
    balanced: ["review_context", "discuss_options", "make_decision"],
  };
  return orderByEmphasis[emphasis];
}

function buildRationale(input: {
  scenario: ExperienceScenarioDef;
  emphasis: ExperienceEmphasis;
  ranked: RankedGap[];
  preferredIndustries: string[];
  targetRole?: string | null;
  recTitle?: string;
}): string {
  const { scenario } = input;
  const top = input.ranked.slice(0, 3);
  const industryBit =
    input.preferredIndustries.length > 0
      ? ` Industry preference (${input.preferredIndustries.slice(0, 2).join(", ")}) favoured ${scenario.companyName}.`
      : "";
  const roleBit = input.targetRole
    ? ` Target role “${input.targetRole}” aligned with ${scenario.candidateRole}.`
    : "";

  if (top.length === 0) {
    return `No ScoreRun gaps yet — recommending ${scenario.companyName} (${scenario.projectName}).${industryBit}${roleBit} Practice still writes evidence to the ledger; ScoreRun assigns levels.`;
  }
  const gapList = top.map((g) => `“${g.gap}”`).join("; ");
  const recBit = input.recTitle ? ` ScoreRun also suggested “${input.recTitle}”.` : "";
  return `Your latest ScoreRun gaps (${gapList}) map to ${scenario.companyName} — ${scenario.projectName} (${input.emphasis} emphasis).${industryBit}${roleBit}${recBit} Focus: ${scenario.coachingFocus} Experience produces evidence only — capability is assigned by ScoreRun.`;
}

/**
 * Build a personalised Experience plan recommendation from gaps / levels / preferences.
 * Pure function — no I/O, no capability writes.
 */
export function planExperienceFromGaps(
  input: PlanFromGapsInput,
): ExperiencePlanRecommendation {
  const ranked = rankGapsFromClaims(input);
  const emphasis = pickEmphasis(ranked);
  const scenario = pickScenario(ranked, input);
  const preferredIndustries = input.preferredIndustries ?? [];

  const targeted = [
    ...new Set(
      ranked
        .filter(
          (g) =>
            g.competencyId &&
            (scenario.competencyCodes.includes(g.competencyId) ||
              g.matchedEmphasis === emphasis ||
              emphasis === "balanced"),
        )
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

  const decisionEmphasis = decisionOrderForEmphasis(emphasis);

  const plan: ExperiencePlanRecommendation = {
    scenarioSlug: scenario.slug,
    emphasis,
    title: scenario.title,
    summary: scenario.summary,
    coachingFocus: scenario.coachingFocus,
    companyName: scenario.companyName,
    companyKey: scenario.companyKey,
    industry: scenario.industry,
    projectName: scenario.projectName,
    candidateRole: scenario.candidateRole,
    problem: scenario.problem,
    decisionEmphasis,
    targetedCompetencies: competencies,
    rankedGaps: ranked.slice(0, 8),
    rationale: buildRationale({
      scenario,
      emphasis,
      ranked,
      preferredIndustries,
      targetRole: input.targetRole,
      recTitle: input.recommendations?.[0]?.title,
    }),
    evidenceLinks,
    href: `/experience/app?scenario=${scenario.slug}&planEmphasis=${emphasis}`,
    targetRole: input.targetRole ?? null,
    targetSeniority: input.targetSeniority ?? null,
    preferredIndustries,
    snapshotId: input.snapshotId ?? null,
    scoreRunId: input.scoreRunId ?? null,
    frameworkVersionId: input.frameworkVersionId ?? null,
    plannerVersion: EXPERIENCE_PLANNER_VERSION,
    capabilityAssigned: false,
  };

  return plan;
}

/** Assert two users with different primary gaps get different scenarios/emphases. */
export function emphasesDiffer(
  a: ExperiencePlanRecommendation,
  b: ExperiencePlanRecommendation,
): boolean {
  return (
    a.emphasis !== b.emphasis ||
    a.scenarioSlug !== b.scenarioSlug ||
    a.companyKey !== b.companyKey
  );
}

export function catalogCoverageAssertion(): boolean {
  const companies = distinctCompanyCount();
  const industries = new Set(EXPERIENCE_SCENARIO_CATALOG.map((s) => s.industry));
  return (
    companies >= 10 &&
    industries.has("healthcare") &&
    industries.has("education") &&
    industries.has("saas") &&
    (industries.has("product_management") || industries.has("project_management")) &&
    EXPERIENCE_SCENARIO_CATALOG.every((s) => s.competencyCodes.length > 0) &&
    Boolean(scenarioBySlug("mediflow-trustcare"))
  );
}
