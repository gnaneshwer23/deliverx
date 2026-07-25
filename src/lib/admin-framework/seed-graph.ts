/**
 * Bootstrap FrameworkVersionGraph from in-code PM_CORE_RUBRIC + CAREER_ROLE_CATALOGUE.
 * Used for migration seed parity and tests. Runtime SoT becomes pi_cf_* after Phase 1.
 */

import { CAREER_ROLE_CATALOGUE } from "@/lib/career-intelligence/role-catalogue";
import { PM_CORE_RUBRIC_2026_1 } from "@/lib/capability-engine/rubric";
import type {
  AssessmentContent,
  EvidenceRule,
  FrameworkCapabilityLevel,
  FrameworkCompetency,
  FrameworkIndicator,
  FrameworkRole,
  FrameworkVersionGraph,
  FrameworkVersionSummary,
  PortfolioExpectation,
  ReadinessRequirement,
  RoleFamily,
  RubricAnchor,
  SeniorityLevel,
} from "@/lib/admin-framework/types";
import { CAPABILITY_LEVELS } from "@/lib/admin-framework/types";

const FAMILY_SLUG = "product-management";

/** Map free-text career hints → competency codes in the PM core rubric. */
const HINT_TO_COMPETENCY_CODE: Record<string, string> = {
  "stakeholder judgement": "comp.stakeholder_management",
  facilitation: "comp.stakeholder_management",
  discovery: "comp.product_discovery",
  "artefact craft": "comp.product_discovery",
  "delivery practice": "comp.delivery_execution",
  "outcome ownership": "comp.delivery_execution",
};

const COMPETENCY_TITLES: Record<string, string> = {
  "comp.stakeholder_management": "Stakeholder management",
  "comp.delivery_execution": "Delivery execution",
  "comp.product_discovery": "Product discovery",
};

const INDICATOR_TITLES: Record<string, string> = {
  stakeholder_judgement: "Stakeholder judgement",
  delivery_judgement: "Delivery judgement",
  product_discovery: "Discovery practice",
};

function titleCaseFromCode(code: string): string {
  const leaf = code.includes(".") ? code.split(".").pop()! : code;
  return leaf
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function seniorityMinLevel(seniority: string): FrameworkCapabilityLevel {
  if (seniority === "associate" || seniority === "junior") return "developing";
  if (seniority === "mid" || seniority === "senior" || seniority === "lead") {
    return "proficient";
  }
  return "developing";
}

function resolveCompetencyCodesFromHints(hints: string[]): string[] {
  const codes = new Set<string>();
  for (const hint of hints) {
    const key = hint.trim().toLowerCase();
    const code = HINT_TO_COMPETENCY_CODE[key];
    if (code) codes.add(code);
  }
  return [...codes];
}

/**
 * Build a complete seed graph for pm-core@2026.1 (or any version summary).
 * IDs are deterministic for tests / clone remapping.
 */
export function buildPmCoreSeedGraph(
  version: FrameworkVersionSummary,
): FrameworkVersionGraph {
  const vid = version.id;
  const familyId = `seed-family-${FAMILY_SLUG}`;

  const roleFamilies: RoleFamily[] = [
    {
      id: familyId,
      frameworkVersionId: vid,
      slug: FAMILY_SLUG,
      title: "Product Management",
      description:
        "Product management role family for Professional Intelligence matching.",
      sortOrder: 0,
    },
  ];

  const seniorityBySlug = new Map<string, SeniorityLevel>();
  for (const role of CAREER_ROLE_CATALOGUE) {
    if (seniorityBySlug.has(role.seniority)) continue;
    seniorityBySlug.set(role.seniority, {
      id: `seed-sen-${role.seniority}`,
      frameworkVersionId: vid,
      slug: role.seniority,
      title: titleCaseFromCode(role.seniority),
      rank: seniorityBySlug.size + 1,
    });
  }
  const seniorityLevels = [...seniorityBySlug.values()];

  const competencyByCode = new Map<string, FrameworkCompetency>();
  const indicatorByKey = new Map<string, FrameworkIndicator>();
  const rubricAnchors: RubricAnchor[] = [];

  let competencyOrder = 0;
  let indicatorOrder = 0;

  for (const [key, ind] of Object.entries(PM_CORE_RUBRIC_2026_1.indicators)) {
    let competency = competencyByCode.get(ind.competencyId);
    if (!competency) {
      competency = {
        id: `seed-${ind.competencyId.replace(/\./g, "-")}`,
        frameworkVersionId: vid,
        code: ind.competencyId,
        title: COMPETENCY_TITLES[ind.competencyId] ?? titleCaseFromCode(ind.competencyId),
        description: "",
        sortOrder: competencyOrder++,
      };
      competencyByCode.set(ind.competencyId, competency);
    }

    const indicator: FrameworkIndicator = {
      id: `seed-${ind.indicatorId.replace(/\./g, "-")}`,
      frameworkVersionId: vid,
      competencyId: competency.id,
      code: ind.indicatorId,
      key,
      title: INDICATOR_TITLES[key] ?? titleCaseFromCode(key),
      description: "",
      sortOrder: indicatorOrder++,
    };
    indicatorByKey.set(key, indicator);

    for (const level of CAPABILITY_LEVELS) {
      rubricAnchors.push({
        id: `seed-anchor-${key}-${level}`,
        frameworkVersionId: vid,
        indicatorId: indicator.id,
        level,
        anchorText: ind.anchors[level],
      });
    }
  }

  const competencies = [...competencyByCode.values()];
  const indicators = [...indicatorByKey.values()];

  const roles: FrameworkRole[] = CAREER_ROLE_CATALOGUE.map((role) => {
    const seniority = seniorityBySlug.get(role.seniority)!;
    return {
      id: `seed-role-${role.id}`,
      frameworkVersionId: vid,
      roleFamilyId: familyId,
      seniorityLevelId: seniority.id,
      slug: role.id,
      title: role.title,
      industryFit: [...role.industryFit],
      description: "",
    };
  });

  const readinessRequirements: ReadinessRequirement[] = [];
  const readinessSeen = new Set<string>();

  for (const catalogueRole of CAREER_ROLE_CATALOGUE) {
    const role = roles.find((r) => r.slug === catalogueRole.id)!;
    const minLevel = seniorityMinLevel(catalogueRole.seniority);
    for (const req of catalogueRole.requirements) {
      const codes = resolveCompetencyCodesFromHints(req.competencyHints);
      for (const code of codes) {
        const competency = competencyByCode.get(code);
        if (!competency) continue;
        const dedupeKey = `${role.id}:${competency.id}`;
        if (readinessSeen.has(dedupeKey)) continue;
        readinessSeen.add(dedupeKey);
        readinessRequirements.push({
          id: `seed-rr-${catalogueRole.id}-${code.replace(/\./g, "-")}`,
          frameworkVersionId: vid,
          roleId: role.id,
          competencyId: competency.id,
          minLevel,
          weight: req.weight,
        });
      }
    }
  }

  const evidenceRules: EvidenceRule[] = [];
  const evidenceSeen = new Set<string>();
  for (const catalogueRole of CAREER_ROLE_CATALOGUE) {
    for (const req of catalogueRole.requirements) {
      const codes = resolveCompetencyCodesFromHints(req.competencyHints);
      const competencyCode = codes[0];
      if (!competencyCode) continue;
      const competency = competencyByCode.get(competencyCode);
      const indicator = indicators.find((i) => i.competencyId === competency?.id);
      if (!competency || !indicator) continue;
      for (const source of req.evidenceSourceHints) {
        const slug = `map-${source}-to-${indicator.key}`;
        if (evidenceSeen.has(slug)) continue;
        evidenceSeen.add(slug);
        evidenceRules.push({
          id: `seed-er-${slug}`,
          frameworkVersionId: vid,
          slug,
          title: `${source} evidence maps to ${indicator.title}`,
          sourceTypeHints: [source],
          competencyId: competency.id,
          indicatorId: indicator.id,
          // PI rule: maps evidence → indicators only; never assigns capability.
          rule: {
            mapsToIndicatorKey: indicator.key,
            assignsCapability: false,
          },
          weight: 1,
        });
      }
    }
  }

  const stakeholder = indicatorByKey.get("stakeholder_judgement")!;
  const stakeholderComp = competencyByCode.get("comp.stakeholder_management")!;

  const assessmentContent: AssessmentContent[] = [
    {
      id: "seed-sc-conflicting-stakeholders",
      frameworkVersionId: vid,
      kind: "scenario",
      slug: "conflicting-stakeholders",
      title: "Conflicting stakeholder asks",
      body: "Two executives disagree on scope and timeline. Decide how to proceed.",
      payload: { source: "pm-core-seed" },
      competencyIds: [stakeholderComp.id],
      indicatorIds: [stakeholder.id],
      sortOrder: 0,
    },
  ];

  const portfolioExpectations: PortfolioExpectation[] = roles.map((role) => ({
    id: `seed-pe-${role.slug}-decision-log`,
    frameworkVersionId: vid,
    roleId: role.id,
    slug: `${role.slug}-decision-log`,
    title: "Decision log sample",
    expectation:
      "Include at least one verified decision artefact with provenance.",
    required: true,
  }));

  return {
    version,
    roleFamilies,
    seniorityLevels,
    roles,
    competencies,
    indicators,
    rubricAnchors,
    assessmentContent,
    evidenceRules,
    portfolioExpectations,
    readinessRequirements,
  };
}

export { HINT_TO_COMPETENCY_CODE };
