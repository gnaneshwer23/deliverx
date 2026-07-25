import { describe, expect, it } from "vitest";
import {
  availableActions,
  guardCapabilityRewrite,
  resolveTransition,
} from "@/lib/pi-review/status-machine";
import {
  isClosedStatus,
  isPiReviewAction,
  isPiReviewStatus,
  isPiReviewSubjectKind,
  PI_REVIEW_STATUSES,
} from "@/lib/pi-review/types";

describe("pi-review status machine", () => {
  it("accepts pending_review → accepted", () => {
    const r = resolveTransition({
      fromStatus: "pending_review",
      action: "accept",
      actorRole: "subject_user",
    });
    expect(r).toEqual({ ok: true, toStatus: "accepted" });
  });

  it("challenge creates challenged status with rationale", () => {
    const r = resolveTransition({
      fromStatus: "pending_review",
      action: "challenge_judgement",
      actorRole: "subject_user",
      rationale: "Evidence does not support proficient",
    });
    expect(r).toEqual({ ok: true, toStatus: "challenged" });
  });

  it("rejects challenge without rationale", () => {
    const r = resolveTransition({
      fromStatus: "pending_review",
      action: "challenge_judgement",
      actorRole: "subject_user",
      rationale: "short",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("rationale_required");
  });

  it("user cannot run admin uphold", () => {
    const r = resolveTransition({
      fromStatus: "challenged",
      action: "uphold",
      actorRole: "subject_user",
      rationale: "Looks correct to me overall",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("invalid_actor");
  });

  it("admin start_review → under_review from challenged", () => {
    const r = resolveTransition({
      fromStatus: "challenged",
      action: "start_review",
      actorRole: "admin_reviewer",
    });
    expect(r).toEqual({ ok: true, toStatus: "under_review" });
  });

  it("admin uphold → upheld", () => {
    const r = resolveTransition({
      fromStatus: "under_review",
      action: "uphold",
      actorRole: "admin_reviewer",
      rationale: "Judgement matches rubric anchors",
    });
    expect(r).toEqual({ ok: true, toStatus: "upheld" });
  });

  it("admin revise → revised", () => {
    const r = resolveTransition({
      fromStatus: "under_review",
      action: "revise",
      actorRole: "admin_reviewer",
      rationale: "Level overstated relative to evidence",
    });
    expect(r).toEqual({ ok: true, toStatus: "revised" });
  });

  it("admin escalate → escalated_to_human_review", () => {
    const r = resolveTransition({
      fromStatus: "under_review",
      action: "escalate",
      actorRole: "admin_reviewer",
      rationale: "Needs senior reviewer judgement",
    });
    expect(r).toEqual({ ok: true, toStatus: "escalated_to_human_review" });
  });

  it("cannot change verified capability without evidence", () => {
    const r = resolveTransition({
      fromStatus: "under_review",
      action: "revise",
      actorRole: "admin_reviewer",
      rationale: "Should be developing not proficient",
      touchesVerifiedCapability: true,
      proposesCapabilityLevelChange: true,
      evidenceIds: [],
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.code).toBe("evidence_required");
      expect(r.error).toMatch(/without evidence/i);
    }
  });

  it("allows revise of capability level when evidence attached", () => {
    const r = resolveTransition({
      fromStatus: "under_review",
      action: "revise",
      actorRole: "admin_reviewer",
      rationale: "Counter-evidence supports developing",
      touchesVerifiedCapability: true,
      proposesCapabilityLevelChange: true,
      evidenceIds: ["11111111-1111-1111-1111-111111111111"],
    });
    expect(r).toEqual({ ok: true, toStatus: "revised" });
  });

  it("add_evidence requires evidence ids", () => {
    const r = resolveTransition({
      fromStatus: "challenged",
      action: "add_evidence",
      actorRole: "subject_user",
      evidenceIds: [],
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("evidence_required");
  });

  it("add_context → user_context_added", () => {
    const r = resolveTransition({
      fromStatus: "pending_review",
      action: "add_context",
      actorRole: "subject_user",
      rationale: "Project was a pivot quarter",
    });
    expect(r).toEqual({ ok: true, toStatus: "user_context_added" });
  });

  it("report_inappropriate escalates", () => {
    const r = resolveTransition({
      fromStatus: "pending_review",
      action: "report_inappropriate",
      actorRole: "subject_user",
      rationale: "Contains private employer data",
    });
    expect(r).toEqual({ ok: true, toStatus: "escalated_to_human_review" });
  });

  it("reopen from upheld → pending_review", () => {
    const r = resolveTransition({
      fromStatus: "upheld",
      action: "reopen",
      actorRole: "admin_reviewer",
    });
    expect(r).toEqual({ ok: true, toStatus: "pending_review" });
  });

  it("lists user actions from pending_review", () => {
    const acts = availableActions("pending_review", "subject_user");
    expect(acts).toContain("accept");
    expect(acts).toContain("challenge_judgement");
    expect(acts).not.toContain("uphold");
  });

  it("lists admin actions from challenged", () => {
    const acts = availableActions("challenged", "admin_reviewer");
    expect(acts).toContain("start_review");
    expect(acts).toContain("uphold");
    expect(acts).not.toContain("accept");
  });
});

describe("guardCapabilityRewrite", () => {
  it("blocks proposed level change without evidence", () => {
    const err = guardCapabilityRewrite({
      action: "revise",
      subjectKind: "capability_level",
      proposedRevision: { levelProposed: "developing" },
      evidenceIds: [],
    });
    expect(err).toMatch(/without evidence/i);
  });

  it("allows proposed level change with evidence", () => {
    const err = guardCapabilityRewrite({
      action: "revise",
      subjectKind: "capability_level",
      proposedRevision: { levelProposed: "developing" },
      evidenceIds: ["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"],
    });
    expect(err).toBeNull();
  });

  it("blocks level change via accept action", () => {
    const err = guardCapabilityRewrite({
      action: "accept",
      proposedRevision: { level: "advanced" },
      evidenceIds: ["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"],
    });
    expect(err).toMatch(/only allowed via revise/i);
  });

  it("allows non-level revisions without evidence", () => {
    const err = guardCapabilityRewrite({
      action: "revise",
      subjectKind: "capability_level",
      proposedRevision: { narrative_note: "Clarify wording" },
      evidenceIds: [],
    });
    expect(err).toBeNull();
  });
});

describe("pi-review types", () => {
  it("recognises all designed statuses", () => {
    const expected = [
      "pending_review",
      "accepted",
      "user_context_added",
      "challenged",
      "under_review",
      "additional_evidence_required",
      "reassessed",
      "upheld",
      "revised",
      "escalated_to_human_review",
    ];
    expect([...PI_REVIEW_STATUSES]).toEqual(expected);
    for (const s of expected) expect(isPiReviewStatus(s)).toBe(true);
  });

  it("validates subject kinds and actions", () => {
    expect(isPiReviewSubjectKind("portfolio_claim")).toBe(true);
    expect(isPiReviewSubjectKind("made_up")).toBe(false);
    expect(isPiReviewAction("challenge_judgement")).toBe(true);
    expect(isPiReviewAction("delete_capability")).toBe(false);
  });

  it("marks terminal statuses closed", () => {
    expect(isClosedStatus("accepted")).toBe(true);
    expect(isClosedStatus("upheld")).toBe(true);
    expect(isClosedStatus("revised")).toBe(true);
    expect(isClosedStatus("reassessed")).toBe(true);
    expect(isClosedStatus("challenged")).toBe(false);
    expect(isClosedStatus("under_review")).toBe(false);
  });
});

describe("e2e transition path (pure)", () => {
  it("user challenge → admin start → uphold preserves path", () => {
    const challenge = resolveTransition({
      fromStatus: "pending_review",
      action: "challenge_judgement",
      actorRole: "subject_user",
      rationale: "Confidence too high for single artefact",
    });
    expect(challenge).toEqual({ ok: true, toStatus: "challenged" });

    const start = resolveTransition({
      fromStatus: "challenged",
      action: "start_review",
      actorRole: "admin_reviewer",
    });
    expect(start).toEqual({ ok: true, toStatus: "under_review" });

    const uphold = resolveTransition({
      fromStatus: "under_review",
      action: "uphold",
      actorRole: "admin_reviewer",
      rationale: "Artefact plus meeting notes suffice",
    });
    expect(uphold).toEqual({ ok: true, toStatus: "upheld" });
  });

  it("user challenge → admin revise with evidence → reassessed", () => {
    const challenge = resolveTransition({
      fromStatus: "pending_review",
      action: "challenge_judgement",
      actorRole: "subject_user",
      rationale: "Level should be developing",
    });
    expect(challenge.ok && challenge.toStatus).toBe("challenged");

    const revise = resolveTransition({
      fromStatus: "challenged",
      action: "revise",
      actorRole: "admin_reviewer",
      rationale: "Agree — overstated proficiency",
      proposesCapabilityLevelChange: true,
      touchesVerifiedCapability: true,
      evidenceIds: ["bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"],
    });
    expect(revise).toEqual({ ok: true, toStatus: "revised" });

    const reassessed = resolveTransition({
      fromStatus: "revised",
      action: "mark_reassessed",
      actorRole: "admin_reviewer",
    });
    expect(reassessed).toEqual({ ok: true, toStatus: "reassessed" });
  });
});
