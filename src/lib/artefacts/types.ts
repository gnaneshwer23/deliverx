import { createHash } from "node:crypto";

/**
 * T3 Artefacts & versioning domain types.
 *
 * An `artefact` is a mutable envelope (title, status, current version pointer).
 * Each `artefact_version` is immutable once written; new content = new version.
 * Provenance separates user contribution from AI contribution.
 */

export const ARTEFACT_KINDS = [
  "cv",
  "portfolio_case",
  "work_sample",
  "design_doc",
  "decision_record",
  "presentation",
  "report",
  "star_story",
  "launchpad_artefact",
  "other",
] as const;

export type ArtefactKind = (typeof ARTEFACT_KINDS)[number];

export const ARTEFACT_STATUSES = [
  "draft",
  "active",
  "submitted",
  "archived",
] as const;

export type ArtefactStatus = (typeof ARTEFACT_STATUSES)[number];

export const ARTEFACT_SOURCE_SURFACES = [
  "launchpad",
  "workspace",
  "experience",
  "portfolio",
  "manual",
  "career",
] as const;

export type ArtefactSourceSurface = (typeof ARTEFACT_SOURCE_SURFACES)[number];

export const ARTEFACT_CONTRIBUTION_SOURCES = ["user", "ai", "mixed"] as const;

export type ArtefactContributionSource =
  (typeof ARTEFACT_CONTRIBUTION_SOURCES)[number];

export type ArtefactActorType =
  | "user"
  | "ai"
  | "system"
  | "external_employer"
  | "admin_attestor";

export const ARTEFACT_EVENT = {
  artefactCreated: "artefact.created",
  versionCreated: "artefact.version.created",
  statusChanged: "artefact.status.changed",
} as const;

export const ARTEFACT_CONFIDENTIALITY = [
  "private",
  "restricted",
  "shareable",
  "public",
] as const;

export type ArtefactConfidentiality = (typeof ARTEFACT_CONFIDENTIALITY)[number];

export type ArtefactVersionProvenance = {
  contributionSource?: ArtefactContributionSource;
  actorType?: ArtefactActorType;
  userContribution?: Record<string, unknown>;
  aiContribution?: Record<string, unknown>;
  modelId?: string | null;
  modelVersion?: string | null;
  promptSlug?: string | null;
  promptVersion?: string | null;
  promptHash?: string | null;
};

export type CreateArtefactInput = {
  userId: string;
  kind?: ArtefactKind;
  title: string;
  summary?: string;
  confidentiality?: ArtefactConfidentiality;
  sourceSurface?: ArtefactSourceSurface | null;
  workItemRef?: string | null;
  activityRef?: string | null;
  projectRef?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  /** Optional initial version content. If provided, a v1 immutable version is created. */
  initialVersion?: {
    title?: string;
    content: Record<string, unknown>;
    storageRef?: string | null;
    changeNote?: string;
    provenance?: ArtefactVersionProvenance;
  };
};

export type AddArtefactVersionInput = {
  userId: string;
  artefactId: string;
  title?: string;
  content: Record<string, unknown>;
  storageRef?: string | null;
  changeNote?: string;
  provenance?: ArtefactVersionProvenance;
};

export type ArtefactVersionRecord = {
  id: string;
  artefactId: string;
  userId: string;
  versionNumber: number;
  title: string;
  content: Record<string, unknown>;
  storageRef: string | null;
  contentHash: string;
  contributionSource: ArtefactContributionSource;
  actorType: ArtefactActorType;
  changeNote: string | null;
  createdAt: string;
};

export type ArtefactRecord = {
  id: string;
  userId: string;
  kind: ArtefactKind;
  title: string;
  summary: string;
  status: ArtefactStatus;
  confidentiality: ArtefactConfidentiality;
  sourceSurface: ArtefactSourceSurface | null;
  currentVersionId: string | null;
  currentVersionNumber: number;
  createdAt: string;
  updatedAt: string;
};

export function isArtefactKind(value: string): value is ArtefactKind {
  return (ARTEFACT_KINDS as readonly string[]).includes(value);
}

export function isArtefactStatus(value: string): value is ArtefactStatus {
  return (ARTEFACT_STATUSES as readonly string[]).includes(value);
}

export function isArtefactSourceSurface(
  value: string,
): value is ArtefactSourceSurface {
  return (ARTEFACT_SOURCE_SURFACES as readonly string[]).includes(value);
}

/**
 * Allowed artefact status transitions. Archived is terminal.
 * Submissions/state changes are recorded append-only for audit.
 */
const ARTEFACT_STATUS_TRANSITIONS: Record<ArtefactStatus, ArtefactStatus[]> = {
  draft: ["active", "submitted", "archived"],
  active: ["draft", "submitted", "archived"],
  submitted: ["active", "archived"],
  archived: [],
};

export function canTransitionArtefactStatus(
  from: ArtefactStatus,
  to: ArtefactStatus,
): boolean {
  if (from === to) return false;
  return ARTEFACT_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Stable content hash for a version — sorted JSON of body + title + storage ref. */
export function computeArtefactContentHash(input: {
  title: string;
  content: Record<string, unknown>;
  storageRef?: string | null;
}): string {
  const canonical = JSON.stringify({
    title: input.title.trim(),
    storageRef: input.storageRef ?? null,
    content: sortKeys(input.content),
  });
  return createHash("sha256").update(canonical).digest("hex");
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      out[key] = sortKeys(obj[key]);
    }
    return out;
  }
  return value;
}

function hasKeys(value: Record<string, unknown> | undefined): boolean {
  return Boolean(value && Object.keys(value).length > 0);
}

/**
 * Derive whether a version was produced by the user, AI, or both.
 * Honest provenance: AI drafting is never silently attributed to the user.
 */
export function deriveContributionSource(
  provenance: ArtefactVersionProvenance | undefined,
): ArtefactContributionSource {
  if (provenance?.contributionSource) return provenance.contributionSource;
  const hasUser = hasKeys(provenance?.userContribution);
  const hasAi = hasKeys(provenance?.aiContribution);
  if (hasUser && hasAi) return "mixed";
  if (hasAi) return "ai";
  return "user";
}

/**
 * Evidence citation guard: evidence referencing an artefact MUST cite a specific
 * immutable version — never a mutable envelope alone. Mirrors the DB CHECK.
 */
export function assertEvidenceCitesArtefactVersion(input: {
  artefactId?: string | null;
  artefactVersionId?: string | null;
}): void {
  if (input.artefactId && !input.artefactVersionId) {
    throw new Error(
      "Evidence citing an artefact must reference a specific artefact_version_id.",
    );
  }
}
