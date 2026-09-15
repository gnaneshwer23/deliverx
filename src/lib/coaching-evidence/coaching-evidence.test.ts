import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isCoachingEvidenceEnabled,
  isProgrammeEnabled,
} from "@/lib/coaching-evidence/flag";
import {
  COACH_CONFIRMATION_SOURCE,
  COACH_EVIDENCE_STATUS,
  computeSubmissionContentHash,
  isCoachingIntakeMethod,
  isCoachingReviewDecision,
  isCoachingTerminalStatus,
} from "@/lib/coaching-evidence/types";
import { resolveCoachDecision } from "@/lib/coaching-evidence/state-machine";
import {
  COACHING_DOES_NOT_GRANT_VERIFIED,
  assertCoachEvidenceShape,
  guardAiAssistedCoachingCitations,
  guardCoachingTrustRails,
  guardHumanConfirmer,
} from "@/lib/coaching-evidence/trust-guards";
import {
  createSubmission,
  decideSubmission,
  listCoachQueue,
  listSubmissions,
} from "@/lib/coaching-evidence/store";
import {
  cascadeTablesForExport,
  cascadeTablesForPurge,
  PRIVACY_CASCADE_MAP,
  PRIVACY_PURGE_EXCLUSIONS,
} from "@/lib/pi-privacy/cascade-map";

const MIGRATION = join(process.cwd(), "supabase/migrations/0106_coaching_evidence.sql");

// ---------------------------------------------------------------------------
// Chainable in-memory Supabase-like mock (no live DB).
// ---------------------------------------------------------------------------
type Row = Record<string, unknown>;

const CAPABILITY_TABLES = [
  "pi_capability_score_runs",
  "pi_capability_judgements",
  "pi_capability_snapshots",
  "pi_capability_reviews",
];

function makeSupabaseMock(seed?: Record<string, Row[]>) {
  const tables: Record<string, Row[]> = {
    coaching_programmes: [],
    coaching_exercises: [],
    coaching_submissions: [],
    coaching_submission_reviews: [],
    artefacts: [],
    artefact_versions: [],
    artefact_status_transitions: [],
    pi_evidence_records: [],
    pi_evidence_provenance: [],
    pi_evidence_status_transitions: [],
    pi_evidence_processing_jobs: [],
    pi_domain_events: [],
    ...seed,
  };
  const insertedTables = new Set<string>();
  let idSeq = 0;

  function builder(table: string) {
    const store = (tables[table] ??= []);
    const eqFilters: Array<[string, unknown]> = [];
    const inFilters: Array<[string, unknown[]]> = [];
    let mode: "select" | "insert" | "update" = "select";
    let pending: Row[] = [];
    let updateValues: Row = {};

    const applyFilters = () =>
      store.filter(
        (r) =>
          eqFilters.every(([c, v]) => r[c] === v) &&
          inFilters.every(([c, vs]) => vs.includes(r[c])),
      );

    const runUpdate = () => {
      const targets = applyFilters();
      for (const t of targets) Object.assign(t, updateValues);
      return targets;
    };

    const api: Record<string, unknown> = {
      select() {
        return api;
      },
      insert(payload: Row | Row[]) {
        mode = "insert";
        insertedTables.add(table);
        const list = Array.isArray(payload) ? payload : [payload];
        pending = list.map((p) => {
          const row: Row = {
            id: `${table}-${++idSeq}`,
            created_at: new Date(2026, 8, 15, 12, 0, idSeq).toISOString(),
            updated_at: new Date(2026, 8, 15, 12, 0, idSeq).toISOString(),
            ...p,
          };
          store.push(row);
          return row;
        });
        return api;
      },
      update(values: Row) {
        mode = "update";
        updateValues = values;
        return api;
      },
      eq(col: string, val: unknown) {
        eqFilters.push([col, val]);
        return api;
      },
      in(col: string, vals: unknown[]) {
        inFilters.push([col, vals]);
        return api;
      },
      order() {
        return api;
      },
      limit() {
        return api;
      },
      maybeSingle() {
        if (mode === "insert") return Promise.resolve({ data: pending[0] ?? null, error: null });
        if (mode === "update") return Promise.resolve({ data: runUpdate()[0] ?? null, error: null });
        return Promise.resolve({ data: applyFilters()[0] ?? null, error: null });
      },
      single() {
        if (mode === "insert") return Promise.resolve({ data: pending[0] ?? null, error: null });
        if (mode === "update") return Promise.resolve({ data: runUpdate()[0] ?? null, error: null });
        return Promise.resolve({ data: applyFilters()[0] ?? null, error: null });
      },
      then(resolve: (v: { data: unknown; error: null }) => unknown) {
        if (mode === "insert") return Promise.resolve({ data: pending, error: null }).then(resolve);
        if (mode === "update") return Promise.resolve({ data: runUpdate(), error: null }).then(resolve);
        return Promise.resolve({ data: applyFilters(), error: null }).then(resolve);
      },
    };
    return api;
  }

  return {
    tables,
    insertedTables,
    client: { from: (t: string) => builder(t) } as unknown as SupabaseClient,
  };
}

function seedProgramme(tables: Record<string, Row[]>) {
  tables.coaching_programmes.push({
    id: "prog-1",
    slug: "pm-core-coaching",
    title: "PM Core coaching",
    description: "",
    framework_version_ref: "pm-core@2026.1",
    enabled: true,
  });
  tables.coaching_exercises.push({
    id: "ex-1",
    programme_id: "prog-1",
    slug: "discovery",
    title: "Discovery synthesis",
    instructions: "Do the thing",
    artefact_kind: "work_sample",
    capability_ref: "discovery",
    enabled: true,
  });
}

// ---------------------------------------------------------------------------
// Flag
// ---------------------------------------------------------------------------
describe("DELIVERX_COACHING_EVIDENCE flag", () => {
  it("defaults off", () => {
    expect(isCoachingEvidenceEnabled({})).toBe(false);
    expect(isCoachingEvidenceEnabled({ DELIVERX_COACHING_EVIDENCE: "" })).toBe(false);
    expect(isCoachingEvidenceEnabled({ DELIVERX_COACHING_EVIDENCE: "off" })).toBe(false);
  });

  it("enables on on/1/true/enabled", () => {
    for (const v of ["on", "1", "true", "enabled"]) {
      expect(isCoachingEvidenceEnabled({ DELIVERX_COACHING_EVIDENCE: v })).toBe(true);
    }
  });

  it("per-programme enable requires global flag AND programme.enabled", () => {
    expect(isProgrammeEnabled({ enabled: true }, { DELIVERX_COACHING_EVIDENCE: "off" })).toBe(false);
    expect(isProgrammeEnabled({ enabled: false }, { DELIVERX_COACHING_EVIDENCE: "on" })).toBe(false);
    expect(isProgrammeEnabled({ enabled: true }, { DELIVERX_COACHING_EVIDENCE: "on" })).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------
describe("submission content hash + guards", () => {
  it("is stable regardless of key order and changes with content", () => {
    const a = computeSubmissionContentHash({
      exerciseId: "e", intakeMethod: "text", title: "T", content: { a: 1, b: 2 }, attempt: 1,
    });
    const b = computeSubmissionContentHash({
      exerciseId: "e", intakeMethod: "text", title: "T", content: { b: 2, a: 1 }, attempt: 1,
    });
    const c = computeSubmissionContentHash({
      exerciseId: "e", intakeMethod: "text", title: "T", content: { a: 9 }, attempt: 1,
    });
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  it("type guards recognise known values", () => {
    expect(isCoachingIntakeMethod("text")).toBe(true);
    expect(isCoachingIntakeMethod("nope")).toBe(false);
    expect(isCoachingReviewDecision("confirm")).toBe(true);
    expect(isCoachingReviewDecision("verify")).toBe(false);
    expect(isCoachingTerminalStatus("confirmed")).toBe(true);
    expect(isCoachingTerminalStatus("submitted")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// State machine
// ---------------------------------------------------------------------------
describe("coaching decision state machine", () => {
  it("maps decisions to statuses; only confirm appends evidence", () => {
    const confirm = resolveCoachDecision({
      fromStatus: "under_review", decision: "confirm", reviewerRole: "coach", rationale: "good work here",
    });
    expect(confirm).toEqual({ ok: true, toStatus: "confirmed", appendsEvidence: true });

    const reject = resolveCoachDecision({
      fromStatus: "submitted", decision: "reject", reviewerRole: "coach", rationale: "insufficient",
    });
    expect(reject.ok && reject.toStatus).toBe("rejected");
    expect(reject.ok && reject.appendsEvidence).toBe(false);

    const changes = resolveCoachDecision({
      fromStatus: "submitted", decision: "request_changes", reviewerRole: "reviewer", rationale: "please revise",
    });
    expect(changes.ok && changes.toStatus).toBe("changes_requested");
    expect(changes.ok && changes.appendsEvidence).toBe(false);
  });

  it("AI can never confirm and rationale is mandatory", () => {
    const ai = resolveCoachDecision({
      fromStatus: "submitted", decision: "confirm", reviewerRole: "ai" as never, rationale: "looks good",
    });
    expect(ai.ok).toBe(false);
    expect(!ai.ok && ai.code).toBe("ai_cannot_confirm");

    const noRationale = resolveCoachDecision({
      fromStatus: "submitted", decision: "confirm", reviewerRole: "coach", rationale: "x",
    });
    expect(noRationale.ok).toBe(false);
    expect(!noRationale.ok && noRationale.code).toBe("rationale_required");
  });

  it("terminal submissions cannot be re-decided", () => {
    const res = resolveCoachDecision({
      fromStatus: "confirmed", decision: "reject", reviewerRole: "coach", rationale: "changed mind",
    });
    expect(res.ok).toBe(false);
    expect(!res.ok && res.code).toBe("terminal_state");
  });
});

// ---------------------------------------------------------------------------
// Trust guards
// ---------------------------------------------------------------------------
describe("coaching trust rails", () => {
  it("publishes the non-Verified invariant", () => {
    expect(COACHING_DOES_NOT_GRANT_VERIFIED).toMatch(/never/i);
    expect(COACHING_DOES_NOT_GRANT_VERIFIED).toMatch(/T8/);
  });

  it("only a human coach/reviewer (not AI, not self) can confirm", () => {
    expect(
      guardHumanConfirmer({ reviewerRole: "ai" as never, reviewerId: "c1", learnerUserId: "u1" }),
    ).toMatch(/AI cannot confirm/i);
    expect(
      guardHumanConfirmer({ reviewerRole: "coach", reviewerId: "u1", learnerUserId: "u1" }),
    ).toMatch(/cannot confirm their own/i);
    expect(
      guardHumanConfirmer({ reviewerRole: "coach", reviewerId: null, learnerUserId: "u1" }),
    ).toMatch(/reviewer id is required/i);
    expect(
      guardHumanConfirmer({ reviewerRole: "coach", reviewerId: "c1", learnerUserId: "u1" }),
    ).toBeNull();
  });

  it("rejects Verified / capability payloads", () => {
    expect(guardCoachingTrustRails({ deliverxVerified: true })).toMatch(/cannot set deliverxVerified/i);
    expect(guardCoachingTrustRails({ write_capability: true })).toMatch(/cannot write write_capability/i);
    expect(guardCoachingTrustRails({ note: "fine" })).toBeNull();
  });

  it("asserts supported / coach_confirmation evidence shape", () => {
    expect(() =>
      assertCoachEvidenceShape({ sourceType: COACH_CONFIRMATION_SOURCE, initialStatus: COACH_EVIDENCE_STATUS }),
    ).not.toThrow();
    expect(() =>
      assertCoachEvidenceShape({ sourceType: "external_verification", initialStatus: "supported" }),
    ).toThrow(/must use source coach_confirmation/i);
    expect(() =>
      assertCoachEvidenceShape({ sourceType: COACH_CONFIRMATION_SOURCE, initialStatus: "platform_verified" }),
    ).toThrow(/must be supported strength/i);
  });

  it("requires citations for AI-assisted decisions", () => {
    expect(guardAiAssistedCoachingCitations({ aiAssisted: false })).toBeNull();
    expect(guardAiAssistedCoachingCitations({ aiAssisted: true, citations: [] })).toMatch(/require at least one/i);
    expect(guardAiAssistedCoachingCitations({ aiAssisted: true, citations: ["evidence:1"] })).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Store — end-to-end lifecycle with mock
// ---------------------------------------------------------------------------
describe("coaching store lifecycle", () => {
  async function makeSubmission() {
    const mock = makeSupabaseMock();
    seedProgramme(mock.tables);
    const created = await createSubmission(mock.client, {
      userId: "learner-1",
      programmeId: "prog-1",
      exerciseId: "ex-1",
      intakeMethod: "text",
      title: "Discovery synthesis",
      content: { body: "I interviewed five users" },
      selfConfidence: 4,
    });
    return { mock, created };
  }

  it("createSubmission captures an immutable artefact version and appends NO evidence", async () => {
    const { mock, created } = await makeSubmission();
    expect(created.error).toBeNull();
    expect(created.data?.submission.status).toBe("submitted");
    expect(created.data?.submission.evidence_id ?? null).toBeNull();
    expect(created.data?.evidenceAppended).toBe(false);
    expect(mock.tables.artefact_versions).toHaveLength(1);
    expect(mock.tables.pi_evidence_records).toHaveLength(0);
    // self-confidence stored as a claim, never as evidence
    expect(mock.tables.coaching_submissions[0].self_confidence).toBe(4);
  });

  it("human confirm appends EXACTLY ONE supported, non-Verified evidence row with provenance", async () => {
    const { mock, created } = await makeSubmission();
    const submissionId = created.data!.submission.id;

    const decided = await decideSubmission(mock.client, {
      submissionId,
      reviewerId: "coach-9",
      reviewerRole: "coach",
      decision: "confirm",
      rationale: "Clear synthesis with evidence of user contact.",
    });

    expect(decided.error).toBeNull();
    expect(decided.data?.deliverxVerified).toBe(false);
    expect(decided.data?.capabilityWritten).toBe(false);
    expect(decided.data?.evidenceStrength).toBe("supported");

    // Exactly one evidence record, supported strength, coach_confirmation source.
    expect(mock.tables.pi_evidence_records).toHaveLength(1);
    const evidence = mock.tables.pi_evidence_records[0];
    expect(evidence.source_type).toBe("coach_confirmation");
    expect(evidence.confidentiality).toBe("private");

    // Initial status transition is `supported`, never platform_verified.
    const transitions = mock.tables.pi_evidence_status_transitions;
    expect(transitions).toHaveLength(1);
    expect(transitions[0].to_status).toBe("supported");
    expect(transitions.some((t) => t.to_status === "platform_verified")).toBe(false);

    // Provenance: human coach actor, cites the immutable artefact version.
    const provenance = mock.tables.pi_evidence_provenance[0];
    expect(provenance.actor_type).toBe("admin_attestor");
    expect(provenance.actor_user_id).toBe("coach-9");
    expect(provenance.artefact_version_id).toBe(created.data!.artefactVersionId);

    // Submission updated + append-only review row recorded.
    expect(decided.data?.submission.status).toBe("confirmed");
    expect(decided.data?.submission.evidence_id).toBe(evidence.id);
    expect(mock.tables.coaching_submission_reviews).toHaveLength(1);
    expect(mock.tables.coaching_submission_reviews[0].decision).toBe("confirm");
    expect(mock.tables.coaching_submission_reviews[0].evidence_id).toBe(evidence.id);

    // No capability tables were ever written.
    for (const t of CAPABILITY_TABLES) {
      expect(mock.insertedTables.has(t)).toBe(false);
    }
  });

  it("reject records a review but NO evidence", async () => {
    const { mock, created } = await makeSubmission();
    const decided = await decideSubmission(mock.client, {
      submissionId: created.data!.submission.id,
      reviewerId: "coach-9",
      reviewerRole: "coach",
      decision: "reject",
      rationale: "Not enough evidence of user contact.",
    });
    expect(decided.error).toBeNull();
    expect(decided.data?.submission.status).toBe("rejected");
    expect(decided.data?.evidenceId ?? null).toBeNull();
    expect(mock.tables.pi_evidence_records).toHaveLength(0);
    expect(mock.tables.coaching_submission_reviews).toHaveLength(1);
    expect(mock.tables.coaching_submission_reviews[0].evidence_id).toBeNull();
  });

  it("AI cannot confirm and a learner cannot self-confirm through the store", async () => {
    const { mock, created } = await makeSubmission();
    const submissionId = created.data!.submission.id;

    const ai = await decideSubmission(mock.client, {
      submissionId,
      reviewerId: "coach-9",
      reviewerRole: "ai" as never,
      decision: "confirm",
      rationale: "This looks great to me the AI.",
    });
    expect(ai.error).toMatch(/AI cannot confirm/i);

    const selfConfirm = await decideSubmission(mock.client, {
      submissionId,
      reviewerId: "learner-1",
      reviewerRole: "coach",
      decision: "confirm",
      rationale: "Confirming my own work.",
    });
    expect(selfConfirm.error).toMatch(/cannot confirm their own/i);

    // Nothing was appended by the blocked attempts.
    expect(mock.tables.pi_evidence_records).toHaveLength(0);
  });

  it("resubmission creates a new attempt/version and never mutates the prior submission", async () => {
    const { mock } = await makeSubmission();
    const second = await createSubmission(mock.client, {
      userId: "learner-1",
      programmeId: "prog-1",
      exerciseId: "ex-1",
      intakeMethod: "text",
      title: "Discovery synthesis v2",
      content: { body: "Refined synthesis" },
    });
    expect(second.data?.submission.attempt).toBe(2);
    expect(mock.tables.coaching_submissions).toHaveLength(2);
    expect(mock.tables.artefacts).toHaveLength(2);
    expect(mock.tables.coaching_submissions[0].attempt).toBe(1);
  });

  it("coach queue lists open submissions; confirmed drops out", async () => {
    const { mock, created } = await makeSubmission();
    let queue = await listCoachQueue(mock.client);
    expect(queue.data).toHaveLength(1);

    await decideSubmission(mock.client, {
      submissionId: created.data!.submission.id,
      reviewerId: "coach-9",
      reviewerRole: "coach",
      decision: "confirm",
      rationale: "Confirmed with clear evidence.",
    });
    queue = await listCoachQueue(mock.client);
    expect(queue.data).toHaveLength(0);

    const own = await listSubmissions(mock.client, "learner-1");
    expect(own.data?.[0].status).toBe("confirmed");
  });

  it("rejects submission to a disabled programme", async () => {
    const mock = makeSupabaseMock();
    mock.tables.coaching_programmes.push({ id: "prog-2", enabled: false });
    mock.tables.coaching_exercises.push({
      id: "ex-2", programme_id: "prog-2", enabled: true, title: "X", artefact_kind: "work_sample",
    });
    const res = await createSubmission(mock.client, {
      userId: "u1", programmeId: "prog-2", exerciseId: "ex-2",
      intakeMethod: "text", title: "Attempt", content: {},
    });
    expect(res.error).toMatch(/not enabled/i);
    expect(mock.tables.coaching_submissions).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Privacy cascade coverage
// ---------------------------------------------------------------------------
describe("coaching privacy cascade coverage", () => {
  it("includes submission + review person tables in export and purge", () => {
    for (const t of ["coaching_submissions", "coaching_submission_reviews"]) {
      expect(cascadeTablesForExport()).toContain(t);
      expect(cascadeTablesForPurge()).toContain(t);
    }
  });

  it("purges reviews before submissions", () => {
    const purge = cascadeTablesForPurge();
    expect(purge.indexOf("coaching_submission_reviews")).toBeLessThan(
      purge.indexOf("coaching_submissions"),
    );
  });

  it("marks reviews append-only and excludes org-shared catalogue from purge", () => {
    const review = PRIVACY_CASCADE_MAP.find((e) => e.table === "coaching_submission_reviews");
    expect(review?.kind).toBe("append_only_person");
    for (const t of ["coaching_programmes", "coaching_exercises"]) {
      expect(PRIVACY_PURGE_EXCLUSIONS as readonly string[]).toContain(t);
      expect(cascadeTablesForPurge()).not.toContain(t);
    }
  });
});

// ---------------------------------------------------------------------------
// Migration hygiene
// ---------------------------------------------------------------------------
describe("0106 coaching migration hygiene", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("adds the coach_confirmation evidence source and seeds the catalogue", () => {
    expect(sql).toMatch(/add value if not exists 'coach_confirmation'/);
    expect(sql).toMatch(/insert into public\.pi_evidence_sources[\s\S]*'coach_confirmation'/);
  });

  it("creates coaching tables with self-only submission RLS and honest insert pin", () => {
    expect(sql).toMatch(/create table if not exists public\.coaching_submissions/);
    expect(sql).toMatch(/create table if not exists public\.coaching_submission_reviews/);
    expect(sql).toMatch(/coaching_submissions_own_select[\s\S]*user_id = auth\.uid\(\)/);
    // Learner insert can only create an honest initial state (no self-confirm).
    expect(sql).toMatch(/coaching_submissions_own_insert[\s\S]*status = 'submitted'[\s\S]*evidence_id is null/);
  });

  it("captures submissions as immutable artefact versions (cites version, RESTRICT FK)", () => {
    expect(sql).toMatch(/artefact_version_id\s+uuid not null references public\.artefact_versions/);
  });

  it("makes review decisions append-only with a purge-only delete bypass", () => {
    expect(sql).toMatch(/coaching_forbid_review_mutation/);
    expect(sql).toMatch(/trg_coaching_reviews_immutable[\s\S]*before update or delete/);
    expect(sql).toMatch(/app\.pi_privacy_delete[\s\S]*tg_op = 'DELETE'/);
    expect(sql).toMatch(/set search_path = public/);
  });

  it("only allows evidence reference on a confirm decision", () => {
    expect(sql).toMatch(/coaching_review_evidence_only_on_confirm[\s\S]*decision = 'confirm' or evidence_id is null/);
  });

  it("extends person purge to coaching person rows and keeps service-role-only grant", () => {
    expect(sql).toMatch(/delete from public\.coaching_submission_reviews where user_id = p_user_id/);
    expect(sql).toMatch(/delete from public\.coaching_submissions where user_id = p_user_id/);
    expect(sql).toMatch(/grant execute on function public\.pi_privacy_purge_person_data\(uuid, uuid\)\s*\n?\s*to service_role/);
  });

  it("never writes capability or lights Verified from this path", () => {
    // No capability-engine writes and no verified-strength / external-attestation values.
    expect(sql).not.toMatch(/insert\s+into\s+public\.pi_capability/i);
    expect(sql).not.toMatch(/update\s+public\.pi_capability/i);
    expect(sql).not.toMatch(/'platform_verified'/);
    expect(sql).not.toMatch(/'externally_verified'|'externally_attested'/);
  });
});
