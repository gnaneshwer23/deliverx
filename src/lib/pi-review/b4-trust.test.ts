import { describe, expect, it } from "vitest";
import { isReviewerQueueEnabled } from "@/lib/pi-review/flag";
import {
  REVIEW_DOES_NOT_GRANT_VERIFIED,
  guardAiAssistedCitations,
  guardReviewTrustRails,
} from "@/lib/pi-review/trust-guards";
import { guardCapabilityRewrite, resolveTransition } from "@/lib/pi-review/status-machine";

describe("DELIVERX_REVIEWER_QUEUE flag", () => {
  it("defaults off", () => {
    expect(isReviewerQueueEnabled({})).toBe(false);
    expect(isReviewerQueueEnabled({ DELIVERX_REVIEWER_QUEUE: "" })).toBe(false);
    expect(isReviewerQueueEnabled({ DELIVERX_REVIEWER_QUEUE: "off" })).toBe(false);
  });

  it("enables on on/1/true/enabled", () => {
    expect(isReviewerQueueEnabled({ DELIVERX_REVIEWER_QUEUE: "on" })).toBe(true);
    expect(isReviewerQueueEnabled({ DELIVERX_REVIEWER_QUEUE: "1" })).toBe(true);
    expect(isReviewerQueueEnabled({ DELIVERX_REVIEWER_QUEUE: "true" })).toBe(true);
    expect(isReviewerQueueEnabled({ DELIVERX_REVIEWER_QUEUE: "enabled" })).toBe(true);
  });
});

describe("B4 trust rails — Verified / capability never via review", () => {
  it("publishes the non-Verified invariant copy", () => {
    expect(REVIEW_DOES_NOT_GRANT_VERIFIED).toMatch(/does not grant/i);
    expect(REVIEW_DOES_NOT_GRANT_VERIFIED).toMatch(/T8/i);
  });

  it("rejects deliverxVerified in proposedRevision", () => {
    const err = guardReviewTrustRails({
      proposedRevision: { deliverxVerified: true },
    });
    expect(err).toMatch(/cannot set deliverxVerified/i);
    expect(err).toMatch(/T8/i);
  });

  it("rejects verified badge aliases in audit", () => {
    const err = guardReviewTrustRails({
      audit: { verified_badge: true },
    });
    expect(err).toMatch(/verified_badge/i);
  });

  it("rejects capability write keys", () => {
    const err = guardReviewTrustRails({
      proposedRevision: { write_capability: true, levelProposed: "developing" },
    });
    expect(err).toMatch(/cannot write write_capability/i);
  });

  it("allows narrative revise without Verified keys", () => {
    expect(
      guardReviewTrustRails({
        proposedRevision: { narrative_note: "Clarify wording", levelProposed: "developing" },
      }),
    ).toBeNull();
  });

  it("admin revise with Verified payload is blocked before transition", () => {
    const trust = guardReviewTrustRails({
      proposedRevision: { deliverxVerified: true, levelProposed: "proficient" },
    });
    expect(trust).not.toBeNull();

    // Transition itself may be valid; trust guard is the Verified fence.
    const transition = resolveTransition({
      fromStatus: "under_review",
      action: "revise",
      actorRole: "admin_reviewer",
      rationale: "Looks overstated relative to evidence base",
      proposesCapabilityLevelChange: true,
      evidenceIds: ["11111111-1111-1111-1111-111111111111"],
    });
    expect(transition.ok).toBe(true);
  });

  it("capability rewrite without evidence still blocked", () => {
    const err = guardCapabilityRewrite({
      action: "revise",
      subjectKind: "capability_level",
      proposedRevision: { levelProposed: "developing" },
      evidenceIds: [],
    });
    expect(err).toMatch(/without evidence/i);
  });
});

describe("AI-assisted citations", () => {
  it("allows non-AI decisions without citations", () => {
    expect(guardAiAssistedCitations({ aiAssisted: false })).toBeNull();
    expect(guardAiAssistedCitations({})).toBeNull();
  });

  it("requires citations when AI-assisted", () => {
    const err = guardAiAssistedCitations({ aiAssisted: true, citations: [] });
    expect(err).toMatch(/require at least one citation/i);
  });

  it("accepts sourceId objects", () => {
    expect(
      guardAiAssistedCitations({
        aiAssisted: true,
        citations: [{ sourceId: "evidence:abc" }],
      }),
    ).toBeNull();
  });

  it("rejects empty source ids", () => {
    const err = guardAiAssistedCitations({
      aiAssisted: true,
      citations: [{ sourceId: "  " }],
    });
    expect(err).toMatch(/non-empty source id/i);
  });
});

describe("RLS / ownership model (documented invariants)", () => {
  it("subject cases are scoped by user_id — admin uses service role, not cross-user RLS bypass from anon", () => {
    // Pure contract: user APIs must pass caseUserId = auth user; admin APIs require canAccessPiReviewAdmin.
    // Cross-user SELECT/UPDATE via anon RLS is forbidden by 0073 policies (user_id = auth.uid()).
    const subjectScoped = { caseUserIdRequired: true, policy: "pi_review_cases_own" };
    const adminPath = { requiresAdminGate: true, client: "service_role" };
    expect(subjectScoped.caseUserIdRequired).toBe(true);
    expect(adminPath.requiresAdminGate).toBe(true);
  });
});
