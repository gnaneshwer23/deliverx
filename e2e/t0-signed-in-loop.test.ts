/**
 * T0/T6 — Signed-in P0–P7 (+ T1–T5) loop verification (TD-001 / Technology T6).
 *
 * Exercises the full shipped Professional Intelligence loop as an authenticated
 * user via the real HTTP API surface, and asserts the loop invariants against
 * the database with a service-role client.
 *
 * Preferred: local Supabase + `next dev`. Feasible alternative (used when local
 * Docker stack is unavailable): disposable host test identity against a live
 * app URL, purged afterwards via T1 privacy delete.
 *
 * Run with:  npm run test:e2e:t0   or   npm run test:e2e:t6
 *
 * Environment (falls back to .env.local for Supabase values):
 * - T0_E2E=1 or T6_E2E=1          required gate — suite is skipped without it
 * - T0_BASE_URL / T6_BASE_URL     app under test (default http://localhost:3000)
 * - NEXT_PUBLIC_SUPABASE_URL      Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY anon key (sign-in)
 * - SUPABASE_SERVICE_ROLE_KEY     service role key (test-user admin + invariant reads)
 * - T0_KEEP_DATA=1                skip the purge step (debugging only)
 *
 * Data policy: creates one clearly-marked test user (t0-qa+<ts>@deliverx.test),
 * exercises the loop, then purges all person PI via the T1 privacy delete flow
 * (purge RPC + auth user delete). Synthetic answers respect real provenance
 * rules — everything stays observed / self-reported; nothing is marked verified.
 */
import { type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DELETE_CONFIRM_PHRASE } from "@/lib/pi-privacy/cascade-map";
import {
  createAdminClient,
  createConfirmedTestUser,
  createCookieJar,
  env,
  expectOk as harnessExpectOk,
  apiFetch,
  purgeUserFallback,
  signInWithCookies,
} from "./helpers/signed-in-harness";

const ENABLED = process.env.T0_E2E === "1" || process.env.T6_E2E === "1";
const STEP_TIMEOUT = 180_000;

const BASE_URL = (
  env("T6_BASE_URL") ||
  env("T0_BASE_URL") ||
  "http://localhost:3000"
).replace(/\/$/, "");
const SUPABASE_URL = env("NEXT_PUBLIC_SUPABASE_URL");
const ANON_KEY = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const SERVICE_ROLE_KEY = env("SUPABASE_SERVICE_ROLE_KEY");
const KEEP_DATA = env("T0_KEEP_DATA") === "1" || env("T6_KEEP_DATA") === "1";

const RUN_TS = Date.now();
const TEST_EMAIL = `t0-qa+${RUN_TS}@deliverx.test`;
const TEST_PASSWORD = `T0-qa-${RUN_TS}-${Math.random().toString(36).slice(2, 10)}!`;
const PRIVATE_MARKER = `T0-PRIVATE-MARKER-${RUN_TS}`;

let admin: SupabaseClient;
let userId = "";
const cookieJar = createCookieJar();

const ctx = {
  baselineSessionId: "",
  baselineScoreRunId: "",
  baselineSnapshotId: "",
  baselineFrameworkVersionId: "",
  baselineEvidenceIds: [] as string[],
  gaps: [] as string[],
  planId: "",
  planScenarioSlug: "",
  enrolmentId: "",
  decisionLedgerEvidenceId: "",
  interventionId: "",
  finalSessionId: "",
  finalScoreRunId: "",
  finalFrameworkVersionId: "",
  experienceIndustry: "",
  transferIndustry: "",
  scoreRunCountAfterFinal: 0,
  portfolioEntryId: "",
  shareToken: "",
  latestSnapshotId: "",
  artefactId: "",
  artefactVersion1Id: "",
  artefactVersion2Id: "",
  purged: false,
};

async function api(
  pathName: string,
  init: { method?: string; body?: unknown; noAuth?: boolean } = {},
) {
  return apiFetch(BASE_URL, cookieJar, pathName, init);
}

function expectOk(
  res: { status: number; json: Record<string, unknown>; text: string },
  label: string,
  allowed: number[] = [200, 201],
) {
  return harnessExpectOk(res, label, allowed);
}

/** Long-form synthetic answer — clearly professional, clearly synthetic-safe. */
function answerFor(title: string, prompt: string): string {
  return (
    `In a previous delivery I handled "${title}" as follows. ` +
    `First I clarified the outcome with the sponsor and named the constraint explicitly. ` +
    `I mapped stakeholders, sequenced a two-week discovery, and wrote a one-page decision memo ` +
    `covering options, risks and a recommendation with a measurable success criterion. ` +
    `I then reviewed the decision with engineering and support before committing, and logged ` +
    `the follow-up actions with owners and dates. Context of the question: ${prompt.slice(0, 120)}`
  );
}

async function answerAssessment(kind: "baseline" | "final", sessionId: string, firstItem: Record<string, unknown> | null) {
  const base = kind === "baseline" ? "/api/pi/assessment" : "/api/pi/assessment/final";
  let item = firstItem;
  let guard = 0;
  while (item && guard < 15) {
    guard += 1;
    const res = await api(`${base}/respond`, {
      body: {
        sessionId,
        itemId: item.id,
        responseText: answerFor(String(item.title ?? ""), String(item.prompt ?? "")),
      },
    });
    const json = expectOk(res, `${kind} respond (${String(item.slug ?? item.id)})`);
    expect(json.capabilityAssigned).toBe(false);
    if (json.done) break;
    item = (json.nextItem as Record<string, unknown> | null) ?? null;
    if (!item) {
      const next = expectOk(
        await api(`${base}/next`, { body: { sessionId } }),
        `${kind} next`,
      );
      if (next.done) break;
      item = (next.currentItem as Record<string, unknown> | null) ?? null;
    }
  }
}

async function countRows(table: string, filters: Record<string, string> = {}): Promise<number> {
  let q = admin.from(table).select("id", { count: "exact", head: true }).eq("user_id", userId);
  for (const [k, v] of Object.entries(filters)) q = q.eq(k, v);
  const { count, error } = await q;
  if (error) throw new Error(`count(${table}) failed: ${error.message}`);
  return count ?? 0;
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe.skipIf(!ENABLED)("T0/T6 signed-in P0–P7 loop (TD-001)", () => {
  beforeAll(async () => {
    if (!SUPABASE_URL || !ANON_KEY || !SERVICE_ROLE_KEY) {
      throw new Error(
        "Missing Supabase env (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY)",
      );
    }
    admin = createAdminClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    userId = await createConfirmedTestUser(admin, TEST_EMAIL, TEST_PASSWORD, {
      t0_qa: true,
      note: "T0/T6 signed-in QA harness user — purged after run",
    });
    await signInWithCookies({
      url: SUPABASE_URL,
      anonKey: ANON_KEY,
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      jar: cookieJar,
    });
  }, STEP_TIMEOUT);

  afterAll(async () => {
    if (!admin || !userId || KEEP_DATA || ctx.purged) return;
    await purgeUserFallback(admin, userId);
  }, STEP_TIMEOUT);

  it("01 authenticated API access works (profile is honest before any data)", async () => {
    const json = expectOk(await api("/api/pi/profile"), "GET /api/pi/profile");
    expect(json.capabilityAssigned).toBe(false);
    expect(json.deliverxVerified).toBe(false);
    // No ScoreRun yet — must not invent levels.
    expect(json.scoreRun).toBeNull();
    const evidence = json.evidence as { totalCount: number; emptyGuidance: string | null };
    expect(evidence.totalCount).toBe(0);
    expect(evidence.emptyGuidance).toBeTruthy();
  }, STEP_TIMEOUT);

  it("02 onboarding completes and profile identity exists", async () => {
    const payload = {
      firstName: "T0",
      lastName: "Harness",
      professionalIdentity: "Aspiring product manager",
      currentSituation: "employed_non_pm",
      careerObjective:
        "Move into an associate product manager role within 12 months by building observed evidence.",
      targetRole: "Associate Product Manager",
      targetSeniority: "associate",
      preferredIndustries: ["fintech", "logistics"],
      noPriorExperience: true,
      consentAnalysis: true,
      visibilityDefault: "private",
      baselineOptIn: true,
    };
    const json = expectOk(
      await api("/api/pi-onboarding", {
        body: { action: "complete", step: "path", payload },
      }),
      "POST /api/pi-onboarding complete",
    );
    expect(json.status).toBe("completed");
    expect(json.redirectTo).toBe("/profile/baseline");

    const profile = expectOk(await api("/api/pi/profile"), "GET /api/pi/profile");
    const identity = profile.identity as Record<string, unknown>;
    expect(identity.firstName).toBe("T0");
    expect(identity.onboardingComplete).toBe(true);
  }, STEP_TIMEOUT);

  it("03 baseline appends evidence with provenance and a pinned baseline ScoreRun", async () => {
    const start = expectOk(
      await api("/api/pi/assessment/start", {
        body: { targetRole: "Associate Product Manager", targetSeniority: "associate" },
      }),
      "baseline start",
    );
    const session = start.session as Record<string, unknown>;
    ctx.baselineSessionId = String(session.id);
    expect(session.frameworkVersionId).toBeTruthy();
    expect(start.capabilityAssigned).toBe(false);

    await answerAssessment(
      "baseline",
      ctx.baselineSessionId,
      start.currentItem as Record<string, unknown> | null,
    );

    const complete = expectOk(
      await api("/api/pi/assessment/complete", {
        body: { sessionId: ctx.baselineSessionId },
      }),
      "baseline complete",
    );
    expect(complete.capabilityAssigned).toBe(false);
    ctx.baselineEvidenceIds = (complete.evidenceIds as string[]) ?? [];
    ctx.baselineScoreRunId = String(complete.scoreRunId ?? "");
    ctx.baselineSnapshotId = String(complete.snapshotId ?? "");
    ctx.baselineFrameworkVersionId = String(complete.frameworkVersionId ?? "");
    ctx.gaps = (complete.gaps as string[]) ?? [];
    expect(ctx.baselineEvidenceIds.length).toBeGreaterThan(0);
    expect(ctx.baselineScoreRunId).toBeTruthy();
    expect(ctx.baselineFrameworkVersionId).toBeTruthy();

    // DB invariants — run_kind, framework pin, rubric resolve audit.
    const { data: run, error } = await admin
      .from("pi_capability_score_runs")
      .select("id, run_kind, framework_version_id, rubric_resolve_source, status")
      .eq("id", ctx.baselineScoreRunId)
      .single();
    if (error) throw new Error(error.message);
    expect(run.run_kind).toBe("baseline");
    expect(run.framework_version_id).toBe(ctx.baselineFrameworkVersionId);
    expect(run.rubric_resolve_source).toBe("db");

    // Evidence provenance rows exist and stay observed (never auto-verified).
    const { data: prov } = await admin
      .from("pi_evidence_provenance")
      .select("evidence_id, actor_type")
      .in("evidence_id", ctx.baselineEvidenceIds);
    expect((prov ?? []).length).toBe(ctx.baselineEvidenceIds.length);
    const evidence = expectOk(await api("/api/pi/evidence"), "GET /api/pi/evidence");
    const rows = evidence.evidence as Array<Record<string, unknown>>;
    for (const id of ctx.baselineEvidenceIds) {
      const row = rows.find((r) => r.id === id);
      expect(row, `ledger row ${id}`).toBeTruthy();
      expect(row!.status).toBe("observed");
    }
  }, STEP_TIMEOUT);

  it("04 profile answers the five questions from real data", async () => {
    const json = expectOk(await api("/api/pi/profile"), "GET /api/pi/profile");
    // 1. Who am I?
    const identity = json.identity as Record<string, unknown>;
    expect(identity.firstName).toBe("T0");
    expect(identity.targetRole).toBe("Associate Product Manager");
    // 2. What can I prove?
    const evidence = json.evidence as { totalCount: number };
    expect(evidence.totalCount).toBeGreaterThan(0);
    const scoreRun = json.scoreRun as Record<string, unknown> | null;
    expect(scoreRun).toBeTruthy();
    expect(scoreRun!.scoreRunId).toBe(ctx.baselineScoreRunId);
    // 3. What is holding me back?
    const holdingBack = json.holdingBack as { topGaps: string[] };
    expect(Array.isArray(holdingBack.topGaps)).toBe(true);
    // 4. What next?
    const nextAction = json.nextAction as Record<string, unknown>;
    expect(String(nextAction.title ?? "").length).toBeGreaterThan(0);
    expect(String(nextAction.href ?? "")).toMatch(/^\//);
    // 5. Which opportunities fit? (honest empty state allowed)
    const opportunities = json.opportunities as { items: unknown[]; emptyGuidance: string | null };
    expect(opportunities.items.length > 0 || Boolean(opportunities.emptyGuidance)).toBe(true);
    expect(json.capabilityAssigned).toBe(false);
    expect(json.deliverxVerified).toBe(false);
  }, STEP_TIMEOUT);

  it("05 experience plan is gap-driven and Day-1 decision appends ledger evidence", async () => {
    const planRes = expectOk(
      await api("/api/pi/experience-plan", { body: { force: true } }),
      "experience-plan create",
    );
    const plan = planRes.plan as Record<string, unknown>;
    expect(plan).toBeTruthy();
    ctx.planId = String(plan.id);
    ctx.planScenarioSlug = String(plan.scenarioSlug);
    expect(plan.capabilityAssigned).toBe(false);
    expect(String(plan.rationale ?? "").length).toBeGreaterThan(0);
    // Gap-planned: the plan cites ranked gaps from the baseline ScoreRun.
    expect(plan.scoreRunId).toBe(ctx.baselineScoreRunId);

    const start = expectOk(
      await api("/api/xperience/experience/start", {
        body: {
          firstName: "T0",
          lastName: "Harness",
          email: TEST_EMAIL,
          targetRole: "Associate Product Manager",
          planId: ctx.planId,
          scenarioSlug: ctx.planScenarioSlug,
        },
      }),
      "experience start",
    );
    ctx.enrolmentId = String(start.enrolmentId);
    const state = start.state as Record<string, unknown>;
    const decisions = (state.availableDecisions as Array<Record<string, unknown>>) ?? [];
    expect(decisions.length).toBeGreaterThan(0);
    ctx.experienceIndustry = String(
      (state.scenarioMeta as Record<string, unknown> | undefined)?.industry ?? "",
    );

    console.log(
      `[t0] plan scenario=${ctx.planScenarioSlug} industry=${ctx.experienceIndustry} gaps=${ctx.gaps.length}`,
    );

    const choice = decisions[0]!;
    const decide = expectOk(
      await api("/api/xperience/scenarios/decide", {
        body: {
          enrolmentId: ctx.enrolmentId,
          choice: { id: choice.id, label: choice.label },
          rationale: `Chose this to protect delivery while keeping stakeholders aligned. ${PRIVATE_MARKER}`,
        },
      }),
      "experience decide",
    );
    expect(decide.capabilityAssigned).toBe(false);
    const record = decide.evidenceRecord as Record<string, unknown>;
    ctx.decisionLedgerEvidenceId = String(record.ledgerEvidenceId ?? "");
    expect(ctx.decisionLedgerEvidenceId).toBeTruthy();

    // Ledger row is observed practice evidence with provenance.
    const { data: ledgerRow, error } = await admin
      .from("pi_evidence_records")
      .select("id, source_type, category, confidentiality")
      .eq("id", ctx.decisionLedgerEvidenceId)
      .single();
    if (error) throw new Error(error.message);
    expect(ledgerRow.source_type).toBe("decision");
    expect(ledgerRow.category).toBe("practice");
    expect(ledgerRow.confidentiality).toBe("private");
  }, STEP_TIMEOUT);

  it("06 consent OFF by default — contribution produces no observation rows", async () => {
    const consent = expectOk(
      await api("/api/pi/observation/consent"),
      "consent GET",
    );
    expect(consent.effective).toBeFalsy();

    const contrib = expectOk(
      await api("/api/workspace/contributions", {
        body: {
          moduleId: "decisions",
          kind: "user_authored",
          title: "T0 QA decision before consent",
          summary: "Recorded a scope decision before enabling observation consent.",
          project: `experience:${ctx.enrolmentId}`,
        },
      }),
      "contribution (consent off)",
    );
    const observation = contrib.observation as Record<string, unknown>;
    expect(observation.observed).toBe(false);
    // Must be blocked by consent specifically — module and kind are observable.
    expect(observation.reason).toBe("consent_denied");
    expect(await countRows("workspace_observations")).toBe(0);
  }, STEP_TIMEOUT);

  it("07 consent ON — contribution creates observation + evidence (not verified)", async () => {
    const set = expectOk(
      await api("/api/pi/observation/consent", {
        body: { consented: true, scope: "global" },
      }),
      "consent ON",
    );
    expect(set.ok).toBe(true);

    const contrib = expectOk(
      await api("/api/workspace/contributions", {
        body: {
          moduleId: "decisions",
          kind: "user_submitted",
          title: "T0 QA stakeholder update decision",
          summary: "Submitted the weekly stakeholder update decision with risks and rationale.",
          project: `experience:${ctx.enrolmentId}`,
        },
      }),
      "contribution (consent on)",
    );
    const observation = contrib.observation as Record<string, unknown>;
    expect(observation.observed).toBe(true);
    expect(contrib.capabilityAssigned).toBe(false);

    expect(await countRows("workspace_observations")).toBeGreaterThan(0);
    const wsEvidence = await countRows("pi_evidence_records", {
      source_type: "workspace_observation",
    });
    expect(wsEvidence).toBeGreaterThan(0);

    // Observation-sourced evidence must remain observed, never verified.
    const { data: wsRows } = await admin
      .from("pi_evidence_records")
      .select("id")
      .eq("user_id", userId)
      .eq("source_type", "workspace_observation");
    const ids = (wsRows ?? []).map((r) => r.id as string);
    const { data: transitions } = await admin
      .from("pi_evidence_status_transitions")
      .select("evidence_id, to_status")
      .in("evidence_id", ids);
    for (const t of transitions ?? []) {
      expect(t.to_status).not.toBe("externally_verified");
    }
  }, STEP_TIMEOUT);

  it("08 intervention is offered from gaps + workspace evidence and can be accepted", async () => {
    const list = expectOk(await api("/api/pi/interventions"), "interventions GET");
    const interventions = (list.interventions as Array<Record<string, unknown>>) ?? [];
    console.log(`[t0] gaps=${ctx.gaps.length} interventions offered=${interventions.length}`);
    if (ctx.gaps.length === 0) {
      // No gaps → no interventions expected; nothing to accept.
      expect(interventions.length).toBe(0);
      return;
    }
    expect(interventions.length).toBeGreaterThan(0);
    ctx.interventionId = String(interventions[0]!.id);
    const accept = expectOk(
      await api("/api/pi/interventions", {
        body: { interventionId: ctx.interventionId, action: "accepted" },
      }),
      "intervention accept",
    );
    expect(accept.ok).toBe(true);
    expect((accept.intervention as Record<string, unknown>).status).toBe("accepted");
  }, STEP_TIMEOUT);

  it("09 final/transfer runs in a different industry under the same framework pin", async () => {
    const start = expectOk(
      await api("/api/pi/assessment/final/start", {
        body: { targetRole: "Associate Product Manager", targetSeniority: "associate" },
      }),
      "final start",
    );
    const session = start.session as Record<string, unknown>;
    ctx.finalSessionId = String(session.id);
    ctx.transferIndustry = String(start.transferIndustry ?? "");
    const experienceIndustry = String(start.experienceIndustry ?? "");
    expect(ctx.transferIndustry).toBeTruthy();
    expect(ctx.transferIndustry).not.toBe(experienceIndustry);
    expect(session.frameworkVersionId).toBe(ctx.baselineFrameworkVersionId);

    await answerAssessment(
      "final",
      ctx.finalSessionId,
      start.currentItem as Record<string, unknown> | null,
    );

    const complete = expectOk(
      await api("/api/pi/assessment/final/complete", {
        body: { sessionId: ctx.finalSessionId },
      }),
      "final complete",
    );
    expect(complete.capabilityAssigned).toBe(false);
    expect(complete.deliverxVerified).toBe(false);
    ctx.finalScoreRunId = String(complete.scoreRunId ?? "");
    ctx.finalFrameworkVersionId = String(complete.frameworkVersionId ?? "");
    expect(ctx.finalScoreRunId).toBeTruthy();
    expect(ctx.finalFrameworkVersionId).toBe(ctx.baselineFrameworkVersionId);

    const growthReport = complete.growthReport as Record<string, unknown> | null;
    expect(growthReport).toBeTruthy();
    expect(Number(growthReport!.citationCount)).toBeGreaterThan(0);

    const { data: run, error } = await admin
      .from("pi_capability_score_runs")
      .select("run_kind, framework_version_id")
      .eq("id", ctx.finalScoreRunId)
      .single();
    if (error) throw new Error(error.message);
    expect(run.framework_version_id).toBe(ctx.baselineFrameworkVersionId);
    ctx.scoreRunCountAfterFinal = await countRows("pi_capability_score_runs");
  }, STEP_TIMEOUT);

  it("10 growth report is loadable and cites evidence; Verified stays off", async () => {
    const json = expectOk(await api("/api/pi/growth-report"), "growth report GET");
    expect(json.deliverxVerified).toBe(false);
    const report = json.growthReport as Record<string, unknown> | null;
    expect(report).toBeTruthy();
    expect(Number(report!.citationCount ?? 0)).toBeGreaterThan(0);
  }, STEP_TIMEOUT);

  it("11 learning is knowledge only — never changes capability", async () => {
    const runsBefore = await countRows("pi_capability_score_runs");
    const created = expectOk(
      await api("/api/pi/learning", {
        body: {
          title: "Inspired — How to Create Tech Products Customers Love",
          kind: "book",
          note: "Read chapters on discovery and outcome-based roadmaps.",
        },
      }),
      "learning create",
    );
    expect(created.capabilityAssigned).toBe(false);
    expect(created.learningNotCapability).toBe(true);
    expect(created.scoreRunTriggered).toBe(false);
    expect(created.evidenceId).toBeTruthy();

    const runsAfter = await countRows("pi_capability_score_runs");
    expect(runsAfter).toBe(runsBefore);

    // Knowledge evidence is categorised as knowledge, not practice.
    const { data: ev } = await admin
      .from("pi_evidence_records")
      .select("category")
      .eq("id", String(created.evidenceId))
      .single();
    expect(ev?.category).toBe("knowledge");

    const list = expectOk(await api("/api/pi/learning"), "learning GET");
    expect(list.learningNotCapability).toBe(true);
    expect(((list.items as unknown[]) ?? []).length).toBeGreaterThan(0);
  }, STEP_TIMEOUT);

  it("12 outcomes are self-reported, never verified; calibration respects volume floor", async () => {
    const runsBefore = await countRows("pi_capability_score_runs");
    const recorded = expectOk(
      await api("/api/career/outcomes", {
        body: {
          action: "record_outcome",
          eventType: "application_submitted",
          title: "Applied to Associate PM role",
          company: "T0 QA Test Co",
          roleTitle: "Associate Product Manager",
          sentiment: "neutral",
        },
      }),
      "outcome record",
    );
    expect(recorded.capabilityAssigned).toBe(false);
    expect(recorded.scoreRunTriggered).toBe(false);
    expect(recorded.evidenceId).toBeTruthy();

    // Below the volume floor (1 outcome < 3) calibration must not claim conversion
    // patterns — only an insufficient_data diagnostic is allowed.
    const findings = (recorded.findings as Array<Record<string, unknown>>) ?? [];
    for (const f of findings) {
      expect(f.diagnosticOnly).toBe(true);
    }
    const conversionFindings = findings.filter(
      (f) => f.findingType !== "insufficient_data",
    );
    expect(conversionFindings.length).toBe(0);

    // The evidence row must not be externally verified.
    const { data: transitions } = await admin
      .from("pi_evidence_status_transitions")
      .select("to_status")
      .eq("evidence_id", String(recorded.evidenceId));
    for (const t of transitions ?? []) {
      expect(t.to_status).not.toBe("externally_verified");
    }
    expect(await countRows("pi_capability_score_runs")).toBe(runsBefore);
  }, STEP_TIMEOUT);

  it("13 portfolio compiles from evidence; public share hides private content and Verified", async () => {
    const list = expectOk(await api("/api/portfolio/entries"), "portfolio GET");
    ctx.latestSnapshotId = String(list.snapshotId ?? "");
    expect(ctx.latestSnapshotId).toBeTruthy();

    const created = expectOk(
      await api("/api/portfolio/entries", {
        body: {
          title: "T0 QA — Experience decision case study",
          targetRole: "Associate Product Manager",
          evidenceIds: [ctx.decisionLedgerEvidenceId],
        },
      }),
      "portfolio create",
    );
    const entry = created.entry as Record<string, unknown>;
    ctx.portfolioEntryId = String(entry.id);
    expect(entry.deliverxVerified).toBe(false);

    const shared = expectOk(
      await api(`/api/portfolio/entries/${ctx.portfolioEntryId}`, {
        body: { action: "share", label: "T0 QA share" },
      }),
      "portfolio share",
    );
    const share = shared.share as Record<string, unknown>;
    ctx.shareToken = String(share.token ?? "");
    expect(ctx.shareToken).toBeTruthy();

    // Public share page — unauthenticated — must not leak private evidence
    // content and must not show a Verified badge.
    const pub = await fetch(`${BASE_URL}/portfolio/v/${ctx.shareToken}`, {
      redirect: "manual",
    });
    expect(pub.status).toBe(200);
    const html = await pub.text();
    expect(html.includes(PRIVATE_MARKER)).toBe(false);
    expect(/DeliverX Verified/i.test(html)).toBe(false);
  }, STEP_TIMEOUT);

  it("14 career readiness reads the same SnapshotClaims as Profile", async () => {
    const career = expectOk(await api("/api/career/intelligence"), "career GET");
    expect(career.capabilityAssigned).toBe(false);
    expect(career.readinessSource).toBe("score_run");
    const scoreRun = career.scoreRun as Record<string, unknown> | null;
    expect(scoreRun).toBeTruthy();

    const snap = expectOk(await api("/api/pi/capability/run"), "capability GET");
    expect(String(snap.snapshotId)).toBe(ctx.latestSnapshotId);
    // Career readiness and Profile read the same latest snapshot.
    if (scoreRun!.snapshotId) {
      expect(String(scoreRun!.snapshotId)).toBe(String(snap.snapshotId));
    }
  }, STEP_TIMEOUT);

  it("15 notifications inbox is readable and self-only (T5)", async () => {
    const json = expectOk(await api("/api/pi/notifications"), "notifications GET");
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.notifications)).toBe(true);
    // Mark-all-read is idempotent even when empty.
    const mark = expectOk(
      await api("/api/pi/notifications", { method: "PATCH", body: { all: true } }),
      "notifications mark-read",
    );
    expect(mark.ok).toBe(true);
  }, STEP_TIMEOUT);

  it("16 artefact versioning appends immutable versions (T3)", async () => {
    const created = expectOk(
      await api("/api/pi/artefacts", {
        body: {
          kind: "work_sample",
          title: "T6 QA decision memo",
          summary: "Stakeholder decision memo produced during Experience.",
          sourceSurface: "experience",
          content: {
            body: `v1 decision memo ${PRIVATE_MARKER}`,
            outcome: "scoped discovery",
          },
          changeNote: "initial draft",
        },
      }),
      "artefact create",
      [200, 201],
    );
    const artefact = (created.artefact ?? created) as Record<string, unknown>;
    ctx.artefactId = String(artefact.id ?? created.id ?? "");
    expect(ctx.artefactId).toBeTruthy();

    const detail1 = expectOk(
      await api(`/api/pi/artefacts/${ctx.artefactId}/versions`),
      "artefact versions v1",
    );
    const versions1 = (detail1.versions as Array<Record<string, unknown>>) ?? [];
    expect(versions1.length).toBeGreaterThanOrEqual(1);
    ctx.artefactVersion1Id = String(versions1[0]!.id);

    const v2 = expectOk(
      await api(`/api/pi/artefacts/${ctx.artefactId}/versions`, {
        body: {
          content: {
            body: "v2 decision memo — revised after sponsor feedback",
            outcome: "approved scope",
          },
          changeNote: "sponsor revision",
        },
      }),
      "artefact version 2",
      [200, 201],
    );
    ctx.artefactVersion2Id = String(
      (v2.version as Record<string, unknown> | undefined)?.id ?? v2.id ?? "",
    );
    expect(ctx.artefactVersion2Id).toBeTruthy();
    expect(ctx.artefactVersion2Id).not.toBe(ctx.artefactVersion1Id);

    const detail2 = expectOk(
      await api(`/api/pi/artefacts/${ctx.artefactId}/versions`),
      "artefact versions after v2",
    );
    const versions2 = (detail2.versions as Array<Record<string, unknown>>) ?? [];
    expect(versions2.length).toBeGreaterThanOrEqual(2);
    // Earlier version content must still be present (immutable append).
    const v1Still = versions2.find((v) => String(v.id) === ctx.artefactVersion1Id);
    expect(v1Still).toBeTruthy();
  }, STEP_TIMEOUT);

  it("17 privacy export returns all person domains", async () => {
    const json = expectOk(
      await api("/api/pi/privacy/export", { method: "POST" }),
      "privacy export",
    );
    const exportDoc = json.export as Record<string, unknown>;
    expect(exportDoc).toBeTruthy();
    const tables = (exportDoc.tables ?? exportDoc) as Record<string, unknown[]>;
    for (const table of [
      "pi_evidence_records",
      "pi_capability_score_runs",
      "pi_learning_items",
      "pi_outcome_events",
      "pi_observation_consent",
      "workspace_observations",
      "vpp_entries",
    ]) {
      expect(Array.isArray(tables[table]), `export domain ${table}`).toBe(true);
      expect((tables[table] ?? []).length, `export rows for ${table}`).toBeGreaterThan(0);
    }
  }, STEP_TIMEOUT);

  it("18 privacy purge removes all person rows (T1 delete flow)", async () => {
    if (KEEP_DATA) return;
    const json = expectOk(
      await api("/api/pi/privacy/delete", {
        body: {
          password: TEST_PASSWORD,
          confirmPhrase: DELETE_CONFIRM_PHRASE,
          deleteAuthUser: true,
        },
      }),
      "privacy delete",
    );
    expect(json.ok).toBe(true);
    ctx.purged = true;

    for (const table of [
      "pi_evidence_records",
      "pi_capability_score_runs",
      "pi_capability_snapshots",
      "pi_learning_items",
      "pi_outcome_events",
      "pi_observation_consent",
      "workspace_observations",
      "workspace_contributions",
      "pi_assessment_sessions",
      "pi_interventions",
      "vpp_entries",
      "vpp_shares",
      "xperience_enrolments",
      "experience_plans",
      "artefacts",
      "pi_notifications",
    ]) {
      expect(await countRows(table), `post-purge rows in ${table}`).toBe(0);
    }

    const { data: authUser } = await admin.auth.admin.getUserById(userId);
    expect(authUser.user).toBeNull();
  }, STEP_TIMEOUT);
});
