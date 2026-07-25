/**
 * Verified Professional Portfolio — models & evidence strength labels.
 * Every claim must link to evidence. Never claim DeliverX verification
 * unless external verification requirements are met.
 */

export const EVIDENCE_STRENGTH_LABELS = [
  "self_reported",
  "document_supported",
  "observed",
  "repeatedly_demonstrated",
  "outcome_validated",
  "externally_verified",
] as const;

export type EvidenceStrengthLabel = (typeof EVIDENCE_STRENGTH_LABELS)[number];

export const EVIDENCE_STRENGTH_DISPLAY: Record<
  EvidenceStrengthLabel,
  { label: string; description: string }
> = {
  self_reported: {
    label: "Self-reported",
    description: "Claim rests on the user’s own statement without supporting artefacts.",
  },
  document_supported: {
    label: "Document-supported",
    description: "Linked artefacts or documents support the claim.",
  },
  observed: {
    label: "Observed",
    description: "Captured from practice in Experience or Workspace (observation, not verification).",
  },
  repeatedly_demonstrated: {
    label: "Repeatedly demonstrated",
    description: "Multiple distinct evidence items support the same competency or claim.",
  },
  outcome_validated: {
    label: "Outcome-validated",
    description: "Linked to an application or delivery outcome record.",
  },
  externally_verified: {
    label: "Externally verified",
    description:
      "Independent external attestation recorded on the Evidence Ledger. Not a DeliverX heuristic score.",
  },
};

/** Verifier status on a portfolio entry — distinct from evidence strength. */
export const VERIFIER_STATUSES = [
  "none",
  "self_attested",
  "pending_external",
  "externally_attested",
  "disputed",
] as const;

export type VerifierStatus = (typeof VERIFIER_STATUSES)[number];

export const ENTRY_VISIBILITY = ["private", "link", "role_version", "public"] as const;
export type EntryVisibility = (typeof ENTRY_VISIBILITY)[number];

export const ENTRY_LIFECYCLE = [
  "draft",
  "compiling",
  "reviewing",
  "ready",
  "shared",
  "archived",
] as const;
export type EntryLifecycle = (typeof ENTRY_LIFECYCLE)[number];

/** Narrative fields that can be hidden in external views. */
export const CONFIDENTIAL_FIELD_KEYS = [
  "project_context",
  "challenge",
  "actions",
  "decisions",
  "artefacts",
  "outcomes",
  "reflection",
  "contribution_breakdown",
  "employer_names",
  "customer_names",
  "metrics",
] as const;

export type ConfidentialFieldKey = (typeof CONFIDENTIAL_FIELD_KEYS)[number];

export type ContributionBreakdown = {
  userAuthored: string[];
  aiSuggested: string[];
  userAccepted: string[];
  userEdited: string[];
  userSubmitted: string[];
  disclosure: string;
};

export type PortfolioEvidenceLink = {
  evidenceId: string;
  claimField: string;
  title: string;
  sourceType: string;
  ledgerStatus: string;
  strength: EvidenceStrengthLabel;
  confidentiality: string;
  /** True only when external attestation requirements are met */
  deliverxClaimsVerification: false;
};

export type PortfolioEntry = {
  id: string;
  userId: string;
  title: string;
  targetRole: string | null;
  lifecycle: EntryLifecycle;
  visibility: EntryVisibility;
  projectContext: string;
  userResponsibility: string;
  challenge: string;
  actions: string;
  decisions: string;
  artefacts: string;
  outcomes: string;
  competenciesDemonstrated: string[];
  evidenceStrength: EvidenceStrengthLabel;
  contributionBreakdown: ContributionBreakdown;
  reflection: string;
  verifierStatus: VerifierStatus;
  aiAssistanceDisclosure: string;
  aiSummary: string | null;
  narrative: string;
  hiddenFields: ConfidentialFieldKey[];
  evidenceLinks: PortfolioEvidenceLink[];
  /** Explicit: DeliverX has not verified this entry unless externally_attested */
  deliverxVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PortfolioShare = {
  id: string;
  entryId: string;
  versionId: string | null;
  token: string;
  label: string | null;
  status: "active" | "revoked" | "expired";
  expiresAt: string | null;
  hiddenFields: ConfidentialFieldKey[];
  viewCount: number;
  lastViewedAt: string | null;
  shareUrl: string;
};

export type PortfolioVersion = {
  id: string;
  entryId: string;
  roleLabel: string;
  snapshot: Record<string, unknown>;
  createdAt: string;
};

export type LinkedEvidenceInput = {
  id: string;
  title: string;
  sourceType: string;
  category?: string;
  status: string;
  confidentiality?: string;
  summary?: string | null;
  actorType?: string | null;
};

/** Rank for aggregating entry-level strength (higher = stronger). */
export const STRENGTH_RANK: Record<EvidenceStrengthLabel, number> = {
  self_reported: 1,
  document_supported: 2,
  observed: 3,
  repeatedly_demonstrated: 4,
  outcome_validated: 5,
  externally_verified: 6,
};

/**
 * Derive strength for a single evidence item.
 * externally_verified ONLY when source is external_verification (attestation),
 * never from Experience heuristic "platform_verified" scores.
 */
export function deriveEvidenceStrength(item: LinkedEvidenceInput): EvidenceStrengthLabel {
  if (
    item.sourceType === "external_verification" &&
    (item.status === "platform_verified" ||
      item.status === "supported" ||
      item.actorType === "external_employer" ||
      item.actorType === "admin_attestor")
  ) {
    return "externally_verified";
  }

  // Real-world outcomes are self-reported by default; document_supported only when an
  // artefact backs them (status supported). They are NOT auto outcome_validated — that
  // label is reserved for portfolio claims genuinely validated by a positive outcome.
  if (item.sourceType === "real_world_outcome") {
    return item.status === "supported" ? "document_supported" : "self_reported";
  }

  if (item.sourceType === "application_outcome" || item.category === "outcome") {
    return "outcome_validated";
  }

  if (
    item.sourceType === "artefact" ||
    item.sourceType === "portfolio_import" ||
    item.sourceType === "work_sample"
  ) {
    return "document_supported";
  }

  if (
    item.sourceType === "experience_project" ||
    item.sourceType === "decision" ||
    item.sourceType === "meeting" ||
    item.sourceType === "message" ||
    item.status === "observed" ||
    item.status === "supported"
  ) {
    return "observed";
  }

  if (item.sourceType === "self_report" || item.sourceType === "reflection") {
    return "self_reported";
  }

  return "self_reported";
}

export function aggregateEvidenceStrength(
  links: Array<{ strength: EvidenceStrengthLabel; competencyHint?: string }>,
): EvidenceStrengthLabel {
  if (links.length === 0) return "self_reported";

  let best: EvidenceStrengthLabel = "self_reported";
  for (const link of links) {
    if (STRENGTH_RANK[link.strength] > STRENGTH_RANK[best]) best = link.strength;
  }

  // Upgrade when multiple supporting items exist (practice repetition).
  const supporting = links.filter(
    (l) => STRENGTH_RANK[l.strength] >= STRENGTH_RANK.document_supported,
  );
  if (
    supporting.length >= 3 &&
    STRENGTH_RANK[best] <= STRENGTH_RANK.observed &&
    STRENGTH_RANK[best] >= STRENGTH_RANK.document_supported
  ) {
    return "repeatedly_demonstrated";
  }

  return best;
}

export function deliverxVerifiedClaim(entry: {
  verifierStatus: VerifierStatus;
  evidenceStrength: EvidenceStrengthLabel;
}): boolean {
  return (
    entry.verifierStatus === "externally_attested" &&
    entry.evidenceStrength === "externally_verified"
  );
}

export function defaultAiDisclosure(): string {
  return "AI may have drafted summaries. The user reviewed and owns the final narrative. AI suggestions are disclosed in the contribution breakdown.";
}

export function emptyContributionBreakdown(): ContributionBreakdown {
  return {
    userAuthored: [],
    aiSuggested: [],
    userAccepted: [],
    userEdited: [],
    userSubmitted: [],
    disclosure: defaultAiDisclosure(),
  };
}
