/**
 * Admin Competency Framework — shared types & API contracts.
 * Runtime consumers (capability engine, career intelligence) must load
 * published framework versions — never hard-coded role catalogues.
 */

export const ADMIN_FRAMEWORK_SCHEMA_VERSION = "admin-framework-v1";

/** Full publication lifecycle. Published+ content is immutable. */
export const FRAMEWORK_PUBLICATION_STATUSES = [
  "draft",
  "internal_review",
  "calibration",
  "published",
  "deprecated",
  "archived",
] as const;

export type FrameworkPublicationStatus =
  (typeof FRAMEWORK_PUBLICATION_STATUSES)[number];

/** Statuses where content rows may still be edited. */
export const MUTABLE_FRAMEWORK_STATUSES = [
  "draft",
  "internal_review",
  "calibration",
] as const satisfies readonly FrameworkPublicationStatus[];

export type MutableFrameworkStatus = (typeof MUTABLE_FRAMEWORK_STATUSES)[number];

/** Statuses where content is frozen. Changes require a new version. */
export const IMMUTABLE_FRAMEWORK_STATUSES = [
  "published",
  "deprecated",
  "archived",
] as const satisfies readonly FrameworkPublicationStatus[];

export type ImmutableFrameworkStatus =
  (typeof IMMUTABLE_FRAMEWORK_STATUSES)[number];

export const CAPABILITY_LEVELS = [
  "emerging",
  "developing",
  "proficient",
  "advanced",
] as const;

export type FrameworkCapabilityLevel = (typeof CAPABILITY_LEVELS)[number];

export const ASSESSMENT_CONTENT_KINDS = [
  "question",
  "scenario",
  "work_sample",
  "transfer_task",
] as const;

export type AssessmentContentKind = (typeof ASSESSMENT_CONTENT_KINDS)[number];

export type FrameworkSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
};

export type FrameworkVersionSummary = {
  id: string;
  frameworkId: string;
  frameworkSlug: string;
  version: string;
  title: string;
  status: FrameworkPublicationStatus;
  changelog: string;
  contentHash: string | null;
  rubricVersionId: string | null;
  publishedAt: string | null;
  supersededBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RoleFamily = {
  id: string;
  frameworkVersionId: string;
  slug: string;
  title: string;
  description: string;
  sortOrder: number;
};

export type SeniorityLevel = {
  id: string;
  frameworkVersionId: string;
  slug: string;
  title: string;
  rank: number;
};

export type FrameworkRole = {
  id: string;
  frameworkVersionId: string;
  roleFamilyId: string;
  seniorityLevelId: string;
  slug: string;
  title: string;
  industryFit: string[];
  description: string;
};

export type FrameworkCompetency = {
  id: string;
  frameworkVersionId: string;
  /** Stable code e.g. `comp.stakeholder_management` */
  code: string;
  title: string;
  description: string;
  sortOrder: number;
};

export type FrameworkIndicator = {
  id: string;
  frameworkVersionId: string;
  competencyId: string;
  code: string;
  /** Engine lookup key e.g. `stakeholder_judgement` */
  key: string;
  title: string;
  description: string;
  sortOrder: number;
};

export type RubricAnchor = {
  id: string;
  frameworkVersionId: string;
  indicatorId: string;
  level: FrameworkCapabilityLevel;
  anchorText: string;
};

export type AssessmentContent = {
  id: string;
  frameworkVersionId: string;
  kind: AssessmentContentKind;
  slug: string;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  competencyIds: string[];
  indicatorIds: string[];
  sortOrder: number;
};

export type EvidenceRule = {
  id: string;
  frameworkVersionId: string;
  slug: string;
  title: string;
  sourceTypeHints: string[];
  competencyId: string | null;
  indicatorId: string | null;
  rule: Record<string, unknown>;
  weight: number;
};

export type PortfolioExpectation = {
  id: string;
  frameworkVersionId: string;
  roleId: string | null;
  slug: string;
  title: string;
  expectation: string;
  required: boolean;
};

export type ReadinessRequirement = {
  id: string;
  frameworkVersionId: string;
  roleId: string;
  competencyId: string;
  minLevel: FrameworkCapabilityLevel;
  weight: number;
};

export type FrameworkAuditEvent = {
  id: string;
  frameworkVersionId: string | null;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  beforeState: unknown;
  afterState: unknown;
  metadata: Record<string, unknown>;
  createdAt: string;
};

/** Full graph used by admin preview / publish validation. */
export type FrameworkVersionGraph = {
  version: FrameworkVersionSummary;
  roleFamilies: RoleFamily[];
  seniorityLevels: SeniorityLevel[];
  roles: FrameworkRole[];
  competencies: FrameworkCompetency[];
  indicators: FrameworkIndicator[];
  rubricAnchors: RubricAnchor[];
  assessmentContent: AssessmentContent[];
  evidenceRules: EvidenceRule[];
  portfolioExpectations: PortfolioExpectation[];
  readinessRequirements: ReadinessRequirement[];
};

/** Assessment / capability run pin — never rewrite historical judgements. */
export type AssessmentFrameworkPin = {
  frameworkVersionId: string;
  frameworkSlug: string;
  frameworkVersion: string;
  /** Bridge to `pi_rubric_versions` while capability engine migrates. */
  rubricVersionId: string | null;
  rubricSlug: string | null;
  rubricVersion: string | null;
  pinnedAt: string;
};

// ---------------------------------------------------------------------------
// HTTP route contracts (`/api/admin/framework/*`)
// ---------------------------------------------------------------------------

export type ListFrameworkVersionsQuery = {
  frameworkSlug?: string;
  status?: FrameworkPublicationStatus | FrameworkPublicationStatus[];
};

export type ListFrameworkVersionsResponse = {
  frameworks: FrameworkSummary[];
  versions: FrameworkVersionSummary[];
};

export type GetFrameworkVersionResponse = {
  graph: FrameworkVersionGraph;
};

export type CreateFrameworkVersionRequest = {
  frameworkSlug: string;
  /** If omitted, clones the latest published/deprecated version when present. */
  cloneFromVersionId?: string;
  version: string;
  title: string;
  changelog?: string;
};

export type CreateFrameworkVersionResponse = {
  version: FrameworkVersionSummary;
};

export type TransitionFrameworkStatusRequest = {
  toStatus: FrameworkPublicationStatus;
  note?: string;
};

export type TransitionFrameworkStatusResponse = {
  version: FrameworkVersionSummary;
  auditEventId: string;
};

export type PublishFrameworkVersionRequest = {
  confirmImmutable: true;
  changelog?: string;
  /** Require reviewer acknowledgement of dependency warnings. */
  acknowledgedWarningIds?: string[];
};

export type PublishFrameworkVersionResponse = {
  version: FrameworkVersionSummary;
  /** Created/updated `pi_rubric_versions` row for engine compatibility. */
  rubricVersionId: string;
  auditEventId: string;
};

export type CompareFrameworkVersionsResponse = {
  from: FrameworkVersionSummary;
  to: FrameworkVersionSummary;
  diffs: FrameworkVersionDiff[];
};

export type FrameworkVersionDiff = {
  entityType: string;
  entityKey: string;
  change: "added" | "removed" | "changed";
  before?: unknown;
  after?: unknown;
};

export type ValidateFrameworkVersionResponse = {
  ok: boolean;
  errors: FrameworkValidationIssue[];
  warnings: FrameworkValidationIssue[];
};

export type FrameworkValidationIssue = {
  id: string;
  code: string;
  severity: "error" | "warning";
  path: string;
  message: string;
  dependency?: {
    entityType: string;
    entityId: string;
    label: string;
  };
};

export type AdminFrameworkApiError = {
  error: string;
  code:
    | "unauthorized"
    | "forbidden"
    | "not_found"
    | "immutable_version"
    | "invalid_transition"
    | "validation_failed"
    | "publish_confirmation_required"
    | "dependency_warnings_unacknowledged";
  issues?: FrameworkValidationIssue[];
};
