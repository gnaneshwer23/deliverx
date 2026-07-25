/**
 * T8 — External attestation / employer verify contracts.
 * deliverxVerified lights only via this path + PD-2026-07-06 gate.
 * Attestation never writes capability / ScoreRuns.
 */

export const ATTESTATION_REQUEST_STATUSES = [
  "pending",
  "confirmed",
  "disputed",
  "expired",
  "revoked",
  "cancelled",
] as const;

export type AttestationRequestStatus = (typeof ATTESTATION_REQUEST_STATUSES)[number];

export const ATTESTATION_DECISIONS = ["confirm", "dispute"] as const;
export type AttestationDecision = (typeof ATTESTATION_DECISIONS)[number];

export const ATTESTATION_EVENT_TYPES = [
  "requested",
  "confirmed",
  "disputed",
  "revoked",
  "cancelled",
  "expired",
] as const;

export type AttestationEventType = (typeof ATTESTATION_EVENT_TYPES)[number];

export const ATTESTATION_RELATIONSHIPS = [
  "former_manager",
  "current_manager",
  "colleague",
  "client",
  "mentor",
  "other",
] as const;

export type AttestationRelationship = (typeof ATTESTATION_RELATIONSHIPS)[number];

export type AttestationRequest = {
  id: string;
  userId: string;
  entryId: string;
  shareId: string | null;
  claimField: string;
  claimLabel: string;
  claimSummary: string;
  status: AttestationRequestStatus;
  token: string;
  relationshipHint: string | null;
  consentToShare: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  attestUrl: string;
};

export type AttestationRecord = {
  id: string;
  requestId: string;
  entryId: string;
  userId: string;
  decision: AttestationDecision;
  attestorDisplayName: string;
  attestorRelationship: AttestationRelationship;
  attestorOrganisation: string | null;
  statement: string;
  evidenceId: string | null;
  reviewCaseId: string | null;
  createdAt: string;
};

/** What an attestor may see — never private evidence ids or confidential narrative. */
export type AttestorView = {
  requestId: string;
  status: AttestationRequestStatus;
  claimLabel: string;
  claimSummary: string;
  claimField: string;
  entryTitle: string;
  targetRole: string | null;
  relationshipHint: string | null;
  expiresAt: string | null;
  alreadyDecided: boolean;
  purposeNotice: string;
  /** Explicit: no capability levels shown to attestor */
  capabilityLevelsShown: false;
};

export const ATTESTATION_INVARIANTS = {
  writesScoreRuns: false,
  assignsCapability: false,
  selfAttestToExternal: false,
  lightsVerifiedWithoutRecord: false,
  companyNetworkIntelligence: false,
  marketplace: false,
} as const;

export const VERIFIED_PRODUCT_MEANING = {
  badgeName: "DeliverX Verified",
  definition:
    "A specific portfolio claim was independently confirmed by a named third-party attestor (employer or designated relationship) via a tokenised attestation request. The confirmation is recorded on the Evidence Ledger as source_type=external_verification with actor external_employer.",
  notMeaning: [
    "Not a DeliverX audit of the whole profile",
    "Not a ScoreRun threshold or Experience heuristic",
    "Not self-attestation or learning completion",
    "Not employment verification by an automated provider",
  ],
  gate: "verifier_status=externally_attested AND evidence_strength=externally_verified AND kill switch not off",
  killSwitchEnv: "DELIVERX_VERIFIED_BADGE",
} as const;

export function isAttestationDecision(value: string): value is AttestationDecision {
  return (ATTESTATION_DECISIONS as readonly string[]).includes(value);
}

export function isAttestationRelationship(
  value: string,
): value is AttestationRelationship {
  return (ATTESTATION_RELATIONSHIPS as readonly string[]).includes(value);
}
