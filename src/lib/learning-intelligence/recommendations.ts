/**
 * Gap → learning path recommendations with application triggers.
 * Pure — never writes capability. Completing a path never upgrades levels alone.
 */

import { parseGapCompetency } from "@/lib/experience-planner/plan";
import type {
  ApplicationTrigger,
  LearningItemKind,
  LearningRecommendation,
} from "@/lib/learning-intelligence/types";
import { PI_LEARNING_PATH } from "@/lib/learning-intelligence/types";

const TOPIC_HINTS: Array<{
  patterns: RegExp[];
  topic: string;
  kinds: LearningItemKind[];
  concepts: string[];
  practiceFocus: string;
}> = [
  {
    patterns: [/stakeholder/i, /executive/i, /alignment/i, /facilitation/i],
    topic: "Stakeholder alignment under pressure",
    kinds: ["article", "book", "podcast"],
    concepts: [
      "pre-wire before the decision meeting",
      "map power vs interest",
      "separate advocacy from inquiry",
    ],
    practiceFocus: "Run a stakeholder decision in Experience",
  },
  {
    patterns: [/delivery/i, /constraint/i, /scope/i, /capacity/i, /timeline/i],
    topic: "Delivery under constraint",
    kinds: ["article", "course", "book"],
    concepts: [
      "cut scope before cutting quality",
      "make trade-offs explicit to sponsors",
      "capacity-based commitments",
    ],
    practiceFocus: "Make a constrained delivery call in Experience",
  },
  {
    patterns: [/discovery/i, /hypothesis/i, /problem\s*fram/i, /customer/i],
    topic: "Product discovery & problem framing",
    kinds: ["book", "article", "course"],
    concepts: [
      "evidence before solution",
      "falsifiable hypotheses",
      "opportunity solution trees",
    ],
    practiceFocus: "Frame a discovery hypothesis in Experience",
  },
  {
    patterns: [/risk/i, /decision/i, /judgement/i, /judgment/i],
    topic: "Professional judgement & risk response",
    kinds: ["article", "podcast", "book"],
    concepts: [
      "name the decision and the reversible/irreversible split",
      "surface second-order effects",
      "document the rationale for later ScoreRun",
    ],
    practiceFocus: "Capture a risk response decision in Workspace or Experience",
  },
];

function matchHint(gap: string) {
  for (const hint of TOPIC_HINTS) {
    if (hint.patterns.some((p) => p.test(gap))) return hint;
  }
  return {
    topic: "Targeted professional knowledge",
    kinds: ["article", "book"] as LearningItemKind[],
    concepts: [
      "capture concepts in your own words",
      "reflect on how it applies to your target role",
      "apply in Experience before claiming capability",
    ],
    practiceFocus: "Apply this learning in Experience",
  };
}

function applicationTriggerForGap(gap: string, experienceHref?: string | null): ApplicationTrigger {
  const parsed = parseGapCompetency(gap);
  const href =
    experienceHref ??
    `/experience/app${parsed.competencyId ? `?gap=${encodeURIComponent(parsed.competencyId)}` : ""}`;
  const hint = matchHint(gap);
  return {
    surface: "experience",
    href,
    title: hint.practiceFocus,
    rationale:
      "Learning alone is not competency proof. Apply what you learned in Experience or Workspace so ScoreRun can interpret practice evidence.",
  };
}

/**
 * Map ScoreRun gaps → learning recommendations + application CTAs.
 * Completing learning never upgrades capability levels.
 */
export function recommendLearningFromGaps(input: {
  gaps: string[];
  targetRole?: string | null;
  experienceHref?: string | null;
  limit?: number;
}): LearningRecommendation[] {
  const limit = input.limit ?? 4;
  const recs: LearningRecommendation[] = [];

  for (const gap of input.gaps.slice(0, limit)) {
    const parsed = parseGapCompetency(gap);
    const hint = matchHint(gap);
    const competencyCodes = parsed.competencyId ? [parsed.competencyId] : [];
    const roleBit = input.targetRole ? ` for ${input.targetRole}` : "";

    recs.push({
      pathTitle: `Close gap: ${hint.topic}`,
      rationale: `ScoreRun highlights “${gap}”. Log focused learning${roleBit}, reflect, then apply in Experience — learning completion never assigns capability.`,
      targetGap: gap,
      competencyCodes,
      suggestedKinds: hint.kinds,
      concepts: hint.concepts,
      applicationTrigger: applicationTriggerForGap(gap, input.experienceHref),
      capabilityAssigned: false,
      learningNotCapability: true,
    });
  }

  return recs;
}

/** CTA chain: gap → learning → application (after reflected_upon+). */
export type LearningCtaChain = {
  stage: "learn" | "apply" | "scorerun";
  title: string;
  rationale: string;
  href: string;
  capabilityAssigned: false;
  learningNotCapability: true;
};

export function buildLearningApplicationCta(input: {
  hasKnowledgeGap: boolean;
  highestLearningLevel: string | null;
  experienceHref?: string | null;
  learningHref?: string;
}): LearningCtaChain | null {
  const learningHref = input.learningHref ?? PI_LEARNING_PATH;
  const experienceHref = input.experienceHref ?? "/experience/app";
  const level = input.highestLearningLevel;

  if (
    level &&
    ["reflected_upon", "applied", "repeatedly_applied", "outcome_supported"].includes(level)
  ) {
    return {
      stage: "apply",
      title: "Apply your learning in Experience",
      rationale:
        "You have reflected on learning. Practice evidence is what ScoreRun can use — completing a course alone never upgrades capability.",
      href: experienceHref,
      capabilityAssigned: false,
      learningNotCapability: true,
    };
  }

  if (input.hasKnowledgeGap) {
    return {
      stage: "learn",
      title: "Log learning against your top gap",
      rationale:
        "Knowledge gaps benefit from focused learning + reflection first. Then apply in Experience so capability can be demonstrated.",
      href: learningHref,
      capabilityAssigned: false,
      learningNotCapability: true,
    };
  }

  return null;
}
