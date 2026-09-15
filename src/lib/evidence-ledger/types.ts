import { createHash } from "node:crypto";

export const PI_EVIDENCE_SOURCE_TYPES = [
  "baseline_assessment",
  "adaptive_interview",
  "work_sample",
  "experience_project",
  "meeting",
  "message",
  "decision",
  "artefact",
  "reflection",
  "learning_activity",
  "portfolio_import",
  "external_verification",
  "launchpad_interview",
  "application_outcome",
  "self_report",
  "system",
  "workspace_observation",
  "final_assessment",
  "transfer_assessment",
  "real_world_outcome",
  // Phase 4: human coach/reviewer-confirmed coaching submission (supported, non-Verified).
  "coach_confirmation",
] as const;

export type PiEvidenceSourceType = (typeof PI_EVIDENCE_SOURCE_TYPES)[number];

export const PI_EVIDENCE_CATEGORIES = [
  "practice",
  "knowledge",
  "outcome",
  "attestation",
  "packaging",
  "communication",
  "other",
] as const;

export type PiEvidenceCategory = (typeof PI_EVIDENCE_CATEGORIES)[number];

export const PI_EVIDENCE_STATUSES = [
  "observed",
  "supported",
  "platform_verified",
  "disputed",
  "withdrawn",
] as const;

export type PiEvidenceStatus = (typeof PI_EVIDENCE_STATUSES)[number];

export const PI_ACTOR_TYPES = [
  "user",
  "ai",
  "system",
  "external_employer",
  "admin_attestor",
] as const;

export type PiActorType = (typeof PI_ACTOR_TYPES)[number];

export type AppendEvidenceInput = {
  userId: string;
  sourceType: PiEvidenceSourceType;
  category: PiEvidenceCategory;
  title: string;
  summary?: string;
  rawContent: Record<string, unknown>;
  storageRef?: string | null;
  sourceRecordType?: string | null;
  sourceRecordId?: string | null;
  confidentiality?: "private" | "restricted" | "shareable" | "public";
  consentStatus?: "analysis_allowed" | "share_restricted" | "share_denied" | "unknown";
  idempotencyKey?: string | null;
  initialStatus?: PiEvidenceStatus;
  provenance: {
    actorType: PiActorType;
    actorUserId?: string | null;
    userContribution?: Record<string, unknown>;
    aiContribution?: Record<string, unknown>;
    modelId?: string | null;
    modelVersion?: string | null;
    promptSlug?: string | null;
    promptVersion?: string | null;
    promptHash?: string | null;
    rawRef?: Record<string, unknown>;
    /** T3: evidence citing an artefact MUST reference a specific immutable version. */
    artefactId?: string | null;
    artefactVersionId?: string | null;
  };
};

export function isPiEvidenceSourceType(value: string): value is PiEvidenceSourceType {
  return (PI_EVIDENCE_SOURCE_TYPES as readonly string[]).includes(value);
}

export function isPiEvidenceCategory(value: string): value is PiEvidenceCategory {
  return (PI_EVIDENCE_CATEGORIES as readonly string[]).includes(value);
}

export function isPiEvidenceStatus(value: string): value is PiEvidenceStatus {
  return (PI_EVIDENCE_STATUSES as readonly string[]).includes(value);
}

/** Stable hash for duplicate detection — sorted JSON of raw body + source + title. */
export function computeEvidenceContentHash(input: {
  sourceType: string;
  title: string;
  rawContent: Record<string, unknown>;
  storageRef?: string | null;
}): string {
  const canonical = JSON.stringify({
    sourceType: input.sourceType,
    title: input.title.trim(),
    storageRef: input.storageRef ?? null,
    rawContent: sortKeys(input.rawContent),
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

export function defaultCategoryForSource(source: PiEvidenceSourceType): PiEvidenceCategory {
  switch (source) {
    case "learning_activity":
    case "reflection":
      return "knowledge";
    case "application_outcome":
    case "real_world_outcome":
      return "outcome";
    case "external_verification":
      return "attestation";
    case "artefact":
    case "portfolio_import":
      return "packaging";
    case "meeting":
    case "message":
      return "communication";
    case "self_report":
    case "system":
      return "other";
    case "workspace_observation":
      return "practice";
    default:
      return "practice";
  }
}

/** Experience heuristic scores must NOT become ledger verification. */
export function initialStatusFromCapture(source: PiEvidenceSourceType): PiEvidenceStatus {
  if (source === "external_verification") return "supported";
  return "observed";
}
