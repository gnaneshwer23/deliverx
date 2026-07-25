import { describe, expect, it } from "vitest";
import {
  buildOutcomeEvidenceInput,
  defaultSentimentFor,
  deriveOutcomeStrength,
  outcomeValidatesStrengthLabel,
  summariseOutcomes,
} from "@/lib/real-world-outcomes/outcomes";
import type { OutcomeEventRecord } from "@/lib/real-world-outcomes/types";
import { deriveEvidenceStrength } from "@/lib/verified-portfolio/types";

function makeEvent(overrides: Partial<OutcomeEventRecord>): OutcomeEventRecord {
  return {
    id: "o1",
    userId: "u1",
    applicationId: null,
    eventType: "application_submitted",
    occurredOn: "2026-07-01",
    title: "Applied",
    detail: "",
    company: null,
    roleTitle: null,
    seniority: null,
    stageReached: null,
    sentiment: "neutral",
    artefactRef: null,
    hasArtefact: false,
    evidenceId: "ev-1",
    evidenceStrength: "self_reported",
    selfReported: true,
    externallyVerified: false,
    capabilityAssigned: false,
    confidentiality: "private",
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

describe("outcome → ledger provenance & strength", () => {
  it("defaults to self_reported with no artefact", () => {
    expect(deriveOutcomeStrength({})).toBe("self_reported");
  });

  it("upgrades to document_supported only when an artefact backs it", () => {
    expect(deriveOutcomeStrength({ hasArtefact: true })).toBe("document_supported");
    expect(deriveOutcomeStrength({ artefactRef: "offer.pdf" })).toBe("document_supported");
  });

  it("appends outcome evidence as user-provenance, private, never capability", () => {
    const input = buildOutcomeEvidenceInput({
      userId: "u1",
      outcomeEventId: "o1",
      eventType: "offer_received",
      title: "Offer from Acme",
      company: "Acme",
      roleTitle: "APM",
      strength: "self_reported",
    });
    expect(input.sourceType).toBe("real_world_outcome");
    expect(input.category).toBe("outcome");
    expect(input.provenance.actorType).toBe("user");
    expect(input.confidentiality).toBe("private");
    expect(input.rawContent.selfReported).toBe(true);
    expect(input.rawContent.externallyVerified).toBe(false);
    expect(input.rawContent.capabilityAssigned).toBe(false);
    // Employer name must not leak into the shareable summary line.
    expect(String(input.summary)).not.toContain("Acme");
  });

  it("attaches artefact as storageRef and flags document_supported strength", () => {
    const input = buildOutcomeEvidenceInput({
      userId: "u1",
      outcomeEventId: "o2",
      eventType: "offer_received",
      title: "Offer",
      strength: "document_supported",
      artefactRef: "s3://letter.pdf",
    });
    expect(input.storageRef).toBe("s3://letter.pdf");
    expect(input.rawContent.evidenceStrength).toBe("document_supported");
  });
});

describe("portfolio strength derivation for real_world_outcome", () => {
  it("never auto-promotes a self-reported outcome to outcome_validated", () => {
    expect(
      deriveEvidenceStrength({
        id: "ev-1",
        title: "Outcome",
        sourceType: "real_world_outcome",
        status: "observed",
        category: "outcome",
      }),
    ).toBe("self_reported");
  });

  it("labels document_supported when an artefact backs the outcome (status supported)", () => {
    expect(
      deriveEvidenceStrength({
        id: "ev-2",
        title: "Outcome",
        sourceType: "real_world_outcome",
        status: "supported",
        category: "outcome",
      }),
    ).toBe("document_supported");
  });

  it("keeps application_outcome mapping to outcome_validated (unchanged)", () => {
    expect(
      deriveEvidenceStrength({
        id: "ev-3",
        title: "App outcome",
        sourceType: "application_outcome",
        status: "observed",
      }),
    ).toBe("outcome_validated");
  });
});

describe("outcome-validated strength label rules", () => {
  it("only genuine positive outcomes validate a portfolio claim", () => {
    expect(outcomeValidatesStrengthLabel([makeEvent({ eventType: "application_submitted" })])).toBe(false);
    expect(outcomeValidatesStrengthLabel([makeEvent({ eventType: "interview_attended" })])).toBe(false);
    expect(outcomeValidatesStrengthLabel([makeEvent({ eventType: "rejection" })])).toBe(false);
    expect(outcomeValidatesStrengthLabel([makeEvent({ eventType: "offer_received" })])).toBe(true);
    expect(outcomeValidatesStrengthLabel([makeEvent({ eventType: "job_started" })])).toBe(true);
    expect(outcomeValidatesStrengthLabel([makeEvent({ eventType: "promotion_achieved" })])).toBe(true);
    expect(outcomeValidatesStrengthLabel([makeEvent({ eventType: "external_project_completed" })])).toBe(true);
  });
});

describe("summary + sentiment", () => {
  it("counts by event type and document-supported", () => {
    const summary = summariseOutcomes([
      makeEvent({ eventType: "application_submitted" }),
      makeEvent({ eventType: "interview_attended" }),
      makeEvent({ eventType: "interview_attended" }),
      makeEvent({ eventType: "offer_received", evidenceStrength: "document_supported" }),
      makeEvent({ eventType: "rejection" }),
    ]);
    expect(summary.applications).toBe(1);
    expect(summary.interviews).toBe(2);
    expect(summary.offers).toBe(1);
    expect(summary.rejections).toBe(1);
    expect(summary.documentSupported).toBe(1);
    expect(summary.capabilityAssigned).toBe(false);
  });

  it("infers sensible default sentiment", () => {
    expect(defaultSentimentFor("offer_received")).toBe("positive");
    expect(defaultSentimentFor("rejection")).toBe("negative");
    expect(defaultSentimentFor("application_submitted")).toBe("neutral");
  });
});
