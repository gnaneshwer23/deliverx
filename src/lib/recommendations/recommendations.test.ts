import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  cascadeTablesForExport,
  cascadeTablesForPurge,
} from "@/lib/pi-privacy/cascade-map";
import { NEVER_AUTO_VERIFY_SOURCES } from "@/lib/external-attestation/verified-gate";
import type { SnapshotClaims } from "@/lib/capability-engine/snapshot-claims";
import {
  assertRecommendationDraftSafe,
  buildRecommendationDraftsFromSnapshot,
  MAX_ACTIVE_RECOMMENDATIONS_SHOWN,
} from "@/lib/recommendations/generate";
import { isRecommendationSmEnabled } from "@/lib/recommendations/flag";
import {
  canTransitionRecommendation,
  decideRecommendationTransition,
  RECOMMENDATION_TRANSITIONS,
} from "@/lib/recommendations/state-machine";
import {
  RECOMMENDATION_STATUSES,
  type RecommendationStatus,
} from "@/lib/recommendations/types";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/0098_pi_recommendations.sql"),
  "utf8",
);

function claimsFixture(overrides: Partial<SnapshotClaims> = {}): SnapshotClaims {
  return {
    snapshotId: "11111111-2222-3333-4444-555555555555",
    scoreRunId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    capturedAt: "2026-07-26T00:00:00.000Z",
    schemaVersion: "1",
    algorithmVersion: "capability@2026.1",
    confidenceBandAlgorithmVersion: "confidence-bands@2026.1",
    rubricSlug: "pm-core",
    rubricVersion: "2026.1",
    frameworkVersionId: "fw-1",
    frameworkContentHash: "hash-1",
    readiness: null,
    dimensions: null,
    levels: [],
    strengths: [],
    gaps: ["comp.stakeholders: emerging"],
    recommendations: [
      {
        id: "rec-comp.stakeholders",
        title: "Build evidence for comp.stakeholders",
        rationale:
          "Target level not yet met (emerging). Repeat demonstrated behaviours with verified outcomes.",
        evidenceReferences: ["ev-1", "ev-2", "ev-1"],
      },
      {
        id: "rec-apply-learning",
        title: "Convert learning into applied practice",
        rationale: "Course or reflection evidence was detected.",
        evidenceReferences: [],
      },
    ],
    targetComparison: null,
    contradictions: [],
    capabilityAssigned: false,
    source: "pi_capability_snapshots.profile",
    ...overrides,
  };
}

describe("B2 recommendation state machine", () => {
  it("implements the TRD lifecycle generated→viewed→accepted|dismissed (+ accepted→completed|dismissed)", () => {
    expect(RECOMMENDATION_TRANSITIONS.generated).toEqual([
      "viewed",
      "accepted",
      "dismissed",
    ]);
    expect(RECOMMENDATION_TRANSITIONS.viewed).toEqual(["accepted", "dismissed"]);
    expect(RECOMMENDATION_TRANSITIONS.accepted).toEqual(["completed", "dismissed"]);
    expect(RECOMMENDATION_TRANSITIONS.dismissed).toEqual([]);
    expect(RECOMMENDATION_TRANSITIONS.completed).toEqual([]);
  });

  it("rejects every transition not in the allowed map (deterministic)", () => {
    for (const from of RECOMMENDATION_STATUSES) {
      for (const to of RECOMMENDATION_STATUSES) {
        const allowed = RECOMMENDATION_TRANSITIONS[from].includes(to);
        expect(canTransitionRecommendation(from, to)).toBe(allowed);
      }
    }
    expect(canTransitionRecommendation("dismissed", "accepted")).toBe(false);
    expect(canTransitionRecommendation("completed", "generated")).toBe(false);
    expect(canTransitionRecommendation("viewed", "completed")).toBe(false);
  });

  it("treats same-state requests as idempotent no-ops, never errors", () => {
    for (const status of RECOMMENDATION_STATUSES) {
      expect(decideRecommendationTransition(status, status)).toEqual({
        kind: "noop",
        status,
      });
    }
    expect(decideRecommendationTransition("generated", "accepted").kind).toBe("apply");
    const invalid = decideRecommendationTransition(
      "dismissed" as RecommendationStatus,
      "accepted" as RecommendationStatus,
    );
    expect(invalid.kind).toBe("invalid");
  });
});

describe("B2 recommendation generation", () => {
  it("is deterministic and cites source snapshot, rationale and evidence", () => {
    const drafts = buildRecommendationDraftsFromSnapshot(claimsFixture());
    expect(drafts).toHaveLength(2);
    expect(drafts).toEqual(buildRecommendationDraftsFromSnapshot(claimsFixture()));

    const [gapDraft, learningDraft] = drafts;
    expect(gapDraft.competencyId).toBe("comp.stakeholders");
    expect(gapDraft.href).toBe("/experience/app");
    expect(gapDraft.rationale.length).toBeGreaterThan(0);
    expect(gapDraft.evidenceReferences).toEqual(["ev-1", "ev-2"]); // de-duplicated
    expect(gapDraft.dedupeKey).toBe(
      "capability_snapshot:11111111-2222-3333-4444-555555555555:rec-comp.stakeholders",
    );
    expect(gapDraft.sourceSnapshotId).toBe("11111111-2222-3333-4444-555555555555");
    expect(gapDraft.sourceScoreRunId).toBe("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");

    expect(learningDraft.href).toBe("/learning");
    expect(learningDraft.competencyId).toBeNull();
  });

  it("supplies a deterministic rationale when the snapshot omits one", () => {
    const drafts = buildRecommendationDraftsFromSnapshot(
      claimsFixture({
        recommendations: [{ id: "rec-comp.risk", title: "Build evidence for comp.risk" }],
      }),
    );
    expect(drafts[0].rationale).toMatch(/Capability assessment/);
  });

  it("caps generation and keeps the ≤3 display rule available to surfaces", () => {
    const many = Array.from({ length: 12 }, (_, i) => ({
      id: `rec-comp.c${i}`,
      title: `Build evidence for comp.c${i}`,
      rationale: "r",
    }));
    const drafts = buildRecommendationDraftsFromSnapshot(
      claimsFixture({ recommendations: many }),
    );
    expect(drafts.length).toBeLessThanOrEqual(8);
    expect(MAX_ACTIVE_RECOMMENDATIONS_SHOWN).toBe(3);
  });

  it("refuses unexplained, external or capability-claiming drafts", () => {
    const [safe] = buildRecommendationDraftsFromSnapshot(claimsFixture());
    expect(() => assertRecommendationDraftSafe(safe)).not.toThrow();
    expect(() =>
      assertRecommendationDraftSafe({ ...safe, rationale: "  " }),
    ).toThrow(/rationale is required/);
    expect(() =>
      assertRecommendationDraftSafe({ ...safe, href: "https://example.com" }),
    ).toThrow(/internal deterministic path/);
    expect(() =>
      assertRecommendationDraftSafe({
        ...safe,
        payload: { capabilityAssigned: true },
      }),
    ).toThrow(/cannot assign capability/);
    expect(() =>
      assertRecommendationDraftSafe({
        ...safe,
        payload: { externallyVerified: true },
      }),
    ).toThrow(/cannot assign capability/);
  });
});

describe("B2 rollout flag", () => {
  it("defaults OFF until pilot enablement", () => {
    expect(isRecommendationSmEnabled({})).toBe(false);
    expect(isRecommendationSmEnabled({ DELIVERX_RECOMMENDATION_SM: "" })).toBe(false);
    expect(isRecommendationSmEnabled({ DELIVERX_RECOMMENDATION_SM: "off" })).toBe(false);
    expect(isRecommendationSmEnabled({ DELIVERX_RECOMMENDATION_SM: "on" })).toBe(true);
    expect(isRecommendationSmEnabled({ DELIVERX_RECOMMENDATION_SM: "true" })).toBe(true);
  });
});

describe("B2 SQL contract (0098)", () => {
  it("creates the entity, evidence links and append-only events", () => {
    expect(migration).toMatch(/create table if not exists public\.pi_recommendations/);
    expect(migration).toMatch(
      /create table if not exists public\.pi_recommendation_evidence/,
    );
    expect(migration).toMatch(
      /create table if not exists public\.pi_recommendation_events/,
    );
    expect(migration).toMatch(/unique \(user_id, dedupe_key\)/);
  });

  it("enforces the deterministic state machine in the database", () => {
    expect(migration).toMatch(/pi_recommendation_transition_allowed/);
    expect(migration).toMatch(
      /p_from = 'generated' and p_to in \('viewed', 'accepted', 'dismissed'\)/,
    );
    expect(migration).toMatch(/p_from = 'viewed'\s+and p_to in \('accepted', 'dismissed'\)/);
    expect(migration).toMatch(
      /p_from = 'accepted'\s+and p_to in \('completed', 'dismissed'\)/,
    );
    expect(migration).toMatch(/invalid recommendation transition/);
    expect(migration).toMatch(/core fields are immutable/);
  });

  it("keeps the audit trail append-only and self-scoped", () => {
    expect(migration).toMatch(
      /pi_recommendations_own_select[\s\S]*user_id = auth\.uid\(\)/,
    );
    expect(migration).toMatch(
      /pi_recommendation_events_own_select[\s\S]*user_id = auth\.uid\(\)/,
    );
    expect(migration).toMatch(
      /revoke update, delete on table public\.pi_recommendation_events from authenticated/,
    );
    expect(migration).toMatch(
      /revoke delete on table public\.pi_recommendations from authenticated/,
    );
    expect(migration).toMatch(/revoke all on table public\.pi_recommendations from anon/);
    // No update or delete policy exists for events/evidence links.
    expect(migration).not.toMatch(
      /on public\.pi_recommendation_events\s+for (update|delete)/,
    );
    expect(migration).not.toMatch(
      /on public\.pi_recommendation_evidence\s+for (update|delete)/,
    );
  });

  it("never grants capability or verification from a recommendation", () => {
    expect(migration).toMatch(/check \(capability_assigned = false\)/);
    expect(migration).toMatch(/check \(verification_changed = false\)/);
    expect(migration).not.toMatch(/deliverx_verified/i);
    expect(migration).not.toMatch(/update[\s\S]{0,80}pi_capability_snapshots/);
    expect(migration).not.toMatch(/insert into public\.pi_capability/);
  });

  it("adds recommendations to privacy purge before the T9 cascade", () => {
    expect(migration).toMatch(
      /delete from public\.pi_recommendation_events where user_id = p_user_id/,
    );
    expect(migration).toMatch(
      /delete from public\.pi_recommendation_evidence where user_id = p_user_id/,
    );
    expect(migration).toMatch(
      /delete from public\.pi_recommendations where user_id = p_user_id/,
    );
    expect(migration).toMatch(/pi_privacy_purge_person_data_t9/);
  });
});

describe("B2 privacy + trust rails", () => {
  it("exports and purges all recommendation tables", () => {
    for (const table of [
      "pi_recommendations",
      "pi_recommendation_evidence",
      "pi_recommendation_events",
    ]) {
      expect(cascadeTablesForExport()).toContain(table);
      expect(cascadeTablesForPurge()).toContain(table);
    }
  });

  it("keeps ScoreRun-derived sources on the never-auto-verify list", () => {
    expect(NEVER_AUTO_VERIFY_SOURCES).toContain("score_run");
  });
});
