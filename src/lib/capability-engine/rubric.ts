import type { CapabilityLevel } from "@/lib/capability-engine/types";

export type RubricIndicator = {
  competencyId: string;
  indicatorId: string;
  anchors: Record<Exclude<CapabilityLevel, "insufficient_evidence">, string>;
};

export type RubricDefinition = {
  slug: string;
  version: string;
  title: string;
  indicators: Record<string, RubricIndicator>;
};

/** In-code published rubric (mirrors 0068 seed) — versioned and swapable. */
export const PM_CORE_RUBRIC_2026_1: RubricDefinition = {
  slug: "pm-core",
  version: "2026.1",
  title: "Product Manager core rubric",
  indicators: {
    stakeholder_judgement: {
      competencyId: "comp.stakeholder_management",
      indicatorId: "ind.stakeholder_judgement",
      anchors: {
        emerging: "Identifies stakeholders with prompting",
        developing: "Balances two stakeholder needs with trade-offs",
        proficient: "Navigates conflicting priorities with clear rationale",
        advanced: "Shapes multi-party alignment under ambiguity",
      },
    },
    delivery_judgement: {
      competencyId: "comp.delivery_execution",
      indicatorId: "ind.delivery_judgement",
      anchors: {
        emerging: "Tracks tasks",
        developing: "Sequences work with dependencies",
        proficient: "Protects outcomes under constraint",
        advanced: "Recovers delivery with systemic insight",
      },
    },
    product_discovery: {
      competencyId: "comp.product_discovery",
      indicatorId: "ind.discovery_practice",
      anchors: {
        emerging: "Restates problems",
        developing: "Forms testable hypotheses",
        proficient: "Validates with evidence before build",
        advanced: "Reframes problem space from outcomes",
      },
    },
  },
};

/** Example next rubric version — used in tests for version-change behaviour. */
export const PM_CORE_RUBRIC_2026_2: RubricDefinition = {
  ...PM_CORE_RUBRIC_2026_1,
  version: "2026.2",
  title: "Product Manager core rubric (stricter discovery)",
  indicators: {
    ...PM_CORE_RUBRIC_2026_1.indicators,
    product_discovery: {
      competencyId: "comp.product_discovery",
      indicatorId: "ind.discovery_practice",
      anchors: {
        emerging: "Restates problems with user context",
        developing: "Forms falsifiable hypotheses with metrics",
        proficient: "Runs discovery loops with decision records",
        advanced: "Institutionalises discovery under executive pressure",
      },
    },
  },
};

const RUBRICS: Record<string, RubricDefinition> = {
  "pm-core@2026.1": PM_CORE_RUBRIC_2026_1,
  "pm-core@2026.2": PM_CORE_RUBRIC_2026_2,
};

export function getRubric(slug: string, version: string): RubricDefinition | null {
  return RUBRICS[`${slug}@${version}`] ?? null;
}

export function levelRank(level: CapabilityLevel): number {
  switch (level) {
    case "insufficient_evidence":
      return 0;
    case "emerging":
      return 1;
    case "developing":
      return 2;
    case "proficient":
      return 3;
    case "advanced":
      return 4;
  }
}
