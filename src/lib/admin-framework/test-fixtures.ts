import type {
  FrameworkVersionGraph,
  FrameworkVersionSummary,
} from "@/lib/admin-framework/types";

/** Minimal valid graph for lifecycle / publish tests (mirrors pm-core seed). */
export function makePublishedVersionSummary(
  overrides: Partial<FrameworkVersionSummary> = {},
): FrameworkVersionSummary {
  return {
    id: "fv-published-1",
    frameworkId: "fw-pm-core",
    frameworkSlug: "pm-core",
    version: "2026.1",
    title: "Product Manager core framework",
    status: "published",
    changelog: "Seed",
    contentHash: "hash-2026.1",
    rubricVersionId: "rv-pm-core-2026.1",
    publishedAt: "2026-01-01T00:00:00.000Z",
    supersededBy: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export function makeDraftVersionSummary(
  overrides: Partial<FrameworkVersionSummary> = {},
): FrameworkVersionSummary {
  return makePublishedVersionSummary({
    id: "fv-draft-2",
    version: "2026.2",
    status: "draft",
    contentHash: null,
    publishedAt: null,
    changelog: "Draft clone",
    ...overrides,
  });
}

export function makeMinimalGraph(
  version: FrameworkVersionSummary,
): FrameworkVersionGraph {
  const familyId = "family-pm";
  const seniorityId = "sen-associate";
  const roleId = "role-apm";
  const competencyId = "comp-stakeholder";
  const indicatorId = "ind-stakeholder";

  return {
    version,
    roleFamilies: [
      {
        id: familyId,
        frameworkVersionId: version.id,
        slug: "product-management",
        title: "Product Management",
        description: "",
        sortOrder: 0,
      },
    ],
    seniorityLevels: [
      {
        id: seniorityId,
        frameworkVersionId: version.id,
        slug: "associate",
        title: "Associate",
        rank: 1,
      },
    ],
    roles: [
      {
        id: roleId,
        frameworkVersionId: version.id,
        roleFamilyId: familyId,
        seniorityLevelId: seniorityId,
        slug: "apm-healthtech",
        title: "Associate Product Manager",
        industryFit: ["Healthtech"],
        description: "",
      },
    ],
    competencies: [
      {
        id: competencyId,
        frameworkVersionId: version.id,
        code: "comp.stakeholder_management",
        title: "Stakeholder management",
        description: "",
        sortOrder: 0,
      },
    ],
    indicators: [
      {
        id: indicatorId,
        frameworkVersionId: version.id,
        competencyId,
        code: "ind.stakeholder_judgement",
        key: "stakeholder_judgement",
        title: "Stakeholder judgement",
        description: "",
        sortOrder: 0,
      },
    ],
    rubricAnchors: [
      {
        id: "a1",
        frameworkVersionId: version.id,
        indicatorId,
        level: "emerging",
        anchorText: "Identifies stakeholders with prompting",
      },
      {
        id: "a2",
        frameworkVersionId: version.id,
        indicatorId,
        level: "developing",
        anchorText: "Balances two stakeholder needs with trade-offs",
      },
      {
        id: "a3",
        frameworkVersionId: version.id,
        indicatorId,
        level: "proficient",
        anchorText: "Navigates conflicting priorities with clear rationale",
      },
      {
        id: "a4",
        frameworkVersionId: version.id,
        indicatorId,
        level: "advanced",
        anchorText: "Shapes multi-party alignment under ambiguity",
      },
    ],
    assessmentContent: [
      {
        id: "sc1",
        frameworkVersionId: version.id,
        kind: "scenario",
        slug: "conflicting-stakeholders",
        title: "Conflicting stakeholder asks",
        body: "Two executives disagree on scope.",
        payload: {},
        competencyIds: [competencyId],
        indicatorIds: [indicatorId],
        sortOrder: 0,
      },
    ],
    evidenceRules: [
      {
        id: "er1",
        frameworkVersionId: version.id,
        slug: "decision-records",
        title: "Decision records map to stakeholder judgement",
        sourceTypeHints: ["decision"],
        competencyId,
        indicatorId,
        rule: { mapsToIndicatorKey: "stakeholder_judgement" },
        weight: 1,
      },
    ],
    portfolioExpectations: [
      {
        id: "pe1",
        frameworkVersionId: version.id,
        roleId,
        slug: "decision-log",
        title: "Decision log sample",
        expectation: "Include at least one verified decision artefact.",
        required: true,
      },
    ],
    readinessRequirements: [
      {
        id: "rr1",
        frameworkVersionId: version.id,
        roleId,
        competencyId,
        minLevel: "developing",
        weight: 1,
      },
    ],
  };
}
