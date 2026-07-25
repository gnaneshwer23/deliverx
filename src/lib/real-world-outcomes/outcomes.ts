/**
 * Pure mapping: real-world outcome event → Evidence Ledger append input.
 * Strength is self-reported by default; document_supported only when an artefact
 * backs the outcome. Never externally_verified / outcome_validated here — those
 * require attestation (P8) or genuine downstream validation.
 */

import type { AppendEvidenceInput } from "@/lib/evidence-ledger/types";
import {
  OUTCOME_EVENT_DISPLAY,
  type OutcomeEventRecord,
  type OutcomeEventType,
  type OutcomeStrength,
  type OutcomeSummary,
  type RecordOutcomeInput,
} from "@/lib/real-world-outcomes/types";

/** Document-supported only when an artefact backs the outcome; else self-reported. */
export function deriveOutcomeStrength(input: {
  hasArtefact?: boolean;
  artefactRef?: string | null;
}): OutcomeStrength {
  const backed = Boolean(input.hasArtefact) || Boolean(input.artefactRef?.trim());
  return backed ? "document_supported" : "self_reported";
}

/** Default sentiment when the user does not set one, inferred from event type. */
export function defaultSentimentFor(eventType: OutcomeEventType) {
  switch (eventType) {
    case "offer_received":
    case "job_started":
    case "promotion_achieved":
      return "positive" as const;
    case "rejection":
      return "negative" as const;
    default:
      return "neutral" as const;
  }
}

/**
 * Build the ledger append input for an outcome event.
 * - source_type: real_world_outcome (distinct from application_outcome)
 * - actorType: user (self-reported)
 * - confidentiality: private (sensitive third-party data; never in shared artefacts)
 * The append itself never assigns capability and never triggers ScoreRun.
 */
export function buildOutcomeEvidenceInput(input: {
  userId: string;
  outcomeEventId: string;
  eventType: OutcomeEventType;
  title: string;
  detail?: string;
  company?: string | null;
  roleTitle?: string | null;
  seniority?: string | null;
  stageReached?: string | null;
  occurredOn?: string | null;
  strength: OutcomeStrength;
  artefactRef?: string | null;
}): AppendEvidenceInput {
  const display = OUTCOME_EVENT_DISPLAY[input.eventType];
  const summaryParts = [
    input.roleTitle?.trim(),
    input.stageReached ? `stage: ${input.stageReached}` : null,
    input.detail?.trim()?.slice(0, 200),
  ].filter(Boolean);

  return {
    userId: input.userId,
    sourceType: "real_world_outcome",
    category: "outcome",
    title: `Outcome: ${display.label} — ${input.title.trim()}`,
    summary: summaryParts.join(" · ") || display.label,
    rawContent: {
      outcomeEventId: input.outcomeEventId,
      eventType: input.eventType,
      // Employer/company kept out of shareable summary; retained in private raw body.
      company: input.company ?? null,
      roleTitle: input.roleTitle ?? null,
      seniority: input.seniority ?? null,
      stageReached: input.stageReached ?? null,
      detail: input.detail ?? "",
      occurredOn: input.occurredOn ?? null,
      evidenceStrength: input.strength,
      selfReported: true,
      externallyVerified: false,
      capabilityAssigned: false,
      notice:
        "Self-reported real-world outcome. Not externally verified and not a capability assignment.",
    },
    sourceRecordType: "pi_outcome_events",
    sourceRecordId: input.outcomeEventId,
    storageRef: input.artefactRef?.trim() ? input.artefactRef.trim() : null,
    confidentiality: "private",
    consentStatus: "analysis_allowed",
    idempotencyKey: `outcome-event:${input.outcomeEventId}`,
    provenance: {
      actorType: "user",
      actorUserId: input.userId,
      userContribution: {
        eventType: input.eventType,
        title: input.title.trim(),
        detail: input.detail ?? "",
        strength: input.strength,
      },
      aiContribution: {},
      promptSlug: "real-world-outcomes",
      promptVersion: "v1",
    },
  };
}

/** Roll up outcome events into a summary for Profile/Career surfacing. */
export function summariseOutcomes(events: OutcomeEventRecord[]): OutcomeSummary {
  let applications = 0;
  let interviews = 0;
  let offers = 0;
  let rejections = 0;
  let hires = 0;
  let promotions = 0;
  let externalProjects = 0;
  let documentSupported = 0;
  let latestOccurredOn: string | null = null;

  for (const e of events) {
    if (e.evidenceStrength === "document_supported") documentSupported += 1;
    if (!latestOccurredOn || e.occurredOn > latestOccurredOn) latestOccurredOn = e.occurredOn;
    switch (e.eventType) {
      case "application_submitted":
        applications += 1;
        break;
      case "interview_attended":
        interviews += 1;
        break;
      case "offer_received":
        offers += 1;
        break;
      case "rejection":
        rejections += 1;
        break;
      case "job_started":
        hires += 1;
        break;
      case "promotion_achieved":
        promotions += 1;
        break;
      case "external_project_completed":
        externalProjects += 1;
        break;
      default:
        break;
    }
  }

  return {
    total: events.length,
    applications,
    interviews,
    offers,
    rejections,
    hires,
    promotions,
    externalProjects,
    documentSupported,
    latestOccurredOn,
    capabilityAssigned: false,
  };
}

/**
 * A portfolio claim can wear the `outcome_validated` strength label ONLY when a genuine
 * positive real-world outcome supports it (offer, hire, promotion, or a delivered
 * external project). Applications, interviews and rejections do NOT validate a claim.
 * This never assigns capability — it labels evidence strength on a packaged claim.
 */
export function outcomeValidatesStrengthLabel(events: OutcomeEventRecord[]): boolean {
  return events.some(
    (e) =>
      e.eventType === "offer_received" ||
      e.eventType === "job_started" ||
      e.eventType === "promotion_achieved" ||
      e.eventType === "external_project_completed",
  );
}
