/**
 * T8 — External attestation → DeliverX Verified journey (R-P1-02).
 *
 * Proves the ONLY honest path to `deliverxVerified` end-to-end:
 *   compile portfolio entry → share → request attestation (token) →
 *   external attestor confirms (no auth) → Verified lights.
 *
 * Trust-rail invariants asserted:
 *   - Verified lights ONLY after a real external attestation confirm
 *     (externally_attested + externally_verified). Never from ScoreRun /
 *     learning / self-report / share alone.
 *   - Private evidence content never appears on the public share.
 *   - Self-set Verified-bearing VPP columns stay blocked at the DB (Batch 1 / 0095).
 *   - Negative: fake token, expired token, and self-attest never verify.
 *
 * Always-on unit coverage of the gate lives in
 * `src/lib/external-attestation/attestation.test.ts`.
 *
 * Live portion runs only with T6_E2E=1 / T0_E2E=1 (+ Supabase keys, optional
 * T6_BASE_URL). Same disposable-identity + purge policy as the T0/T6 harness.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  apiFetch,
  createAdminClient,
  createConfirmedTestUser,
  createCookieJar,
  env,
  expectOk,
  purgeUserFallback,
  signInWithCookies,
} from "./helpers/signed-in-harness";

const LIVE = process.env.T6_E2E === "1" || process.env.T0_E2E === "1";
const STEP_TIMEOUT = 120_000;
const BASE_URL = (env("T6_BASE_URL") || env("T0_BASE_URL") || "http://localhost:3000").replace(
  /\/$/,
  "",
);
const SUPABASE_URL = env("NEXT_PUBLIC_SUPABASE_URL");
const ANON_KEY = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const SERVICE_ROLE_KEY = env("SUPABASE_SERVICE_ROLE_KEY");
const KEEP_DATA = env("T0_KEEP_DATA") === "1" || env("T6_KEEP_DATA") === "1";

describe.skipIf(!LIVE)("T8 attestation → Verified journey (live)", () => {
  const runTs = Date.now();
  const subjectEmail = `t8-subject+${runTs}@deliverx.test`;
  const password = `T8-att-${runTs}-Aa1!`;
  const PRIVATE_MARKER = `T8-PRIVATE-MARKER-${runTs}`;
  const subjectJar = createCookieJar();

  let admin = null as SupabaseClient | null;
  let subjectId = "";
  let subjectAnon = null as SupabaseClient | null;
  let cleaned = false;

  const ctx = {
    privateEvidenceId: "",
    shareableEvidenceId: "",
    entryId: "",
    shareToken: "",
    okRequestToken: "",
    selfRequestToken: "",
    expiredRequestToken: "",
    attestationEvidenceId: "",
  };

  async function subjectApi(
    pathName: string,
    init: { method?: string; body?: unknown } = {},
  ) {
    return apiFetch(BASE_URL, subjectJar, pathName, init);
  }

  /** Attestor call — no subject auth cookies (external third party). */
  async function attestApi(
    token: string,
    body: Record<string, unknown>,
    method = "POST",
  ) {
    return apiFetch(BASE_URL, createCookieJar(), `/api/portfolio/attest/${token}`, {
      method,
      body: method === "GET" ? undefined : body,
    });
  }

  async function getEntry(): Promise<Record<string, unknown>> {
    const res = expectOk(
      await subjectApi(`/api/portfolio/entries/${ctx.entryId}`),
      "GET entry",
    );
    return res.entry as Record<string, unknown>;
  }

  beforeAll(async () => {
    if (!SUPABASE_URL || !ANON_KEY || !SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase env for live T8 attestation suite");
    }
    admin = createAdminClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    subjectId = await createConfirmedTestUser(admin, subjectEmail, password, {
      role: "t8_subject",
      note: "T8 attestation harness — purged after run",
    });

    // Seed two evidence records via service role (respects provenance rules):
    // one PRIVATE (must never leak) and one SHAREABLE (safe on public share).
    const { data: priv, error: privErr } = await admin
      .from("pi_evidence_records")
      .insert({
        user_id: subjectId,
        source_type: "decision",
        category: "practice",
        title: "T8 private decision record",
        summary: `Confidential rationale — ${PRIVATE_MARKER}`,
        raw_content: { note: "t8-private", secret: PRIVATE_MARKER },
        content_hash: `t8-priv-${runTs}`,
        confidentiality: "private",
        consent_status: "analysis_allowed",
        captured_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (privErr || !priv) throw new Error(`seed private evidence failed: ${privErr?.message}`);
    ctx.privateEvidenceId = priv.id as string;

    const { data: shareable, error: shareErr } = await admin
      .from("pi_evidence_records")
      .insert({
        user_id: subjectId,
        source_type: "artefact",
        category: "packaging",
        title: "T8 shareable delivery artefact",
        summary: "A sharable artefact that can appear on the public portfolio.",
        raw_content: { note: "t8-shareable" },
        content_hash: `t8-share-${runTs}`,
        confidentiality: "shareable",
        consent_status: "analysis_allowed",
        captured_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (shareErr || !shareable) {
      throw new Error(`seed shareable evidence failed: ${shareErr?.message}`);
    }
    ctx.shareableEvidenceId = shareable.id as string;

    await signInWithCookies({
      url: SUPABASE_URL,
      anonKey: ANON_KEY,
      email: subjectEmail,
      password,
      jar: subjectJar,
    });

    subjectAnon = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: anonSignInError } = await subjectAnon.auth.signInWithPassword({
      email: subjectEmail,
      password,
    });
    if (anonSignInError) {
      throw new Error(`subject anon sign-in failed: ${anonSignInError.message}`);
    }
  }, STEP_TIMEOUT);

  afterAll(async () => {
    if (!admin || cleaned || KEEP_DATA) return;
    await purgeUserFallback(admin, subjectId);
    cleaned = true;
  }, STEP_TIMEOUT);

  it("01 compiles a portfolio entry from evidence — Verified is off at creation", async () => {
    const created = expectOk(
      await subjectApi("/api/portfolio/entries", {
        body: {
          title: "T8 — Attestation journey case study",
          targetRole: "Associate Product Manager",
          evidenceIds: [ctx.shareableEvidenceId, ctx.privateEvidenceId],
        },
      }),
      "portfolio create",
    );
    const entry = created.entry as Record<string, unknown>;
    ctx.entryId = String(entry.id);
    expect(ctx.entryId).toBeTruthy();
    // Never externally verified from compilation alone.
    expect(entry.deliverxVerified).toBe(false);
    expect(entry.verifierStatus).not.toBe("externally_attested");
    expect(entry.evidenceStrength).not.toBe("externally_verified");
  }, STEP_TIMEOUT);

  it("02 shares the entry — public view hides private evidence and shows no Verified badge", async () => {
    const shared = expectOk(
      await subjectApi(`/api/portfolio/entries/${ctx.entryId}`, {
        body: { action: "share", label: "T8 attestation share" },
      }),
      "portfolio share",
    );
    const share = shared.share as Record<string, unknown>;
    ctx.shareToken = String(share.token ?? "");
    expect(ctx.shareToken).toBeTruthy();

    const pub = await fetch(`${BASE_URL}/portfolio/v/${ctx.shareToken}`, {
      redirect: "manual",
    });
    expect(pub.status).toBe(200);
    const html = await pub.text();
    // Private evidence content must never leak to an unauthenticated viewer.
    expect(html.includes(PRIVATE_MARKER)).toBe(false);
    // Pre-attestation the honest notice must state DeliverX has not verified it.
    expect(/has not independently verified/i.test(html)).toBe(true);
    expect(/Externally attested evidence is linked/i.test(html)).toBe(false);
  }, STEP_TIMEOUT);

  it("03 self-attestation by the subject is rejected (no self-verify)", async () => {
    const requested = expectOk(
      await subjectApi(`/api/portfolio/entries/${ctx.entryId}/attestations`, {
        body: {
          action: "request",
          claimLabel: "Led the delivery trade-off decision",
          claimField: "decisions",
          consentToShare: true,
        },
      }),
      "attestation request (self)",
      [200, 201],
    );
    ctx.selfRequestToken = String(
      (requested.request as Record<string, unknown>).token ?? "",
    );
    expect(ctx.selfRequestToken).toBeTruthy();

    // Subject is signed in → attest endpoint must reject as self-attest.
    const res = await subjectApi(`/api/portfolio/attest/${ctx.selfRequestToken}`, {
      body: {
        decision: "confirm",
        attestorDisplayName: "The Subject",
        attestorRelationship: "former_manager",
        statement: "I am trying to attest my own claim, which must be blocked.",
      },
    });
    expect(res.status).toBe(403);
    expect(String(res.json.code ?? "")).toBe("self_attest");

    const entry = await getEntry();
    expect(entry.deliverxVerified).toBe(false);
  }, STEP_TIMEOUT);

  it("04 attestation requires consent to share", async () => {
    const res = await subjectApi(
      `/api/portfolio/entries/${ctx.entryId}/attestations`,
      {
        body: {
          action: "request",
          claimLabel: "A claim without consent",
          consentToShare: false,
        },
      },
    );
    expect(res.status).toBe(400);
    expect(String(res.json.code ?? "")).toBe("consent_required");
  }, STEP_TIMEOUT);

  it("05 fake / unknown attestation token never verifies", async () => {
    const fake = `fake-${runTs}-deadbeef`;
    const get = await attestApi(fake, {}, "GET");
    expect(get.status).toBe(404);

    const post = await attestApi(fake, {
      decision: "confirm",
      attestorDisplayName: "Ghost Attestor",
      attestorRelationship: "former_manager",
      statement: "This token does not exist and must not verify anything.",
    });
    expect(post.status).toBe(404);

    const entry = await getEntry();
    expect(entry.deliverxVerified).toBe(false);
  }, STEP_TIMEOUT);

  it("06 expired attestation token never verifies", async () => {
    const requested = expectOk(
      await subjectApi(`/api/portfolio/entries/${ctx.entryId}/attestations`, {
        body: {
          action: "request",
          claimLabel: "A claim whose link expires",
          claimField: "actions",
          consentToShare: true,
        },
      }),
      "attestation request (expire)",
      [200, 201],
    );
    ctx.expiredRequestToken = String(
      (requested.request as Record<string, unknown>).token ?? "",
    );
    expect(ctx.expiredRequestToken).toBeTruthy();

    // Force expiry in the past via service role.
    const { error } = await admin!
      .from("vpp_attestation_requests")
      .update({ expires_at: new Date(Date.now() - 60_000).toISOString() })
      .eq("token", ctx.expiredRequestToken);
    expect(error).toBeNull();

    const res = await attestApi(ctx.expiredRequestToken, {
      decision: "confirm",
      attestorDisplayName: "Late Attestor",
      attestorRelationship: "former_manager",
      statement: "Attesting after the link expired must be rejected.",
    });
    expect(res.status).toBe(410);
    expect(String(res.json.code ?? "")).toBe("expired");

    const entry = await getEntry();
    expect(entry.deliverxVerified).toBe(false);
  }, STEP_TIMEOUT);

  it("07 valid external attestor confirm lights Verified honestly", async () => {
    const requested = expectOk(
      await subjectApi(`/api/portfolio/entries/${ctx.entryId}/attestations`, {
        body: {
          action: "request",
          claimLabel: "Owned the MediFlow discovery decision",
          claimField: "decisions",
          claimSummary: "Confirm the subject led the scoping decision on the pilot.",
          relationshipHint: "former_manager",
          consentToShare: true,
        },
      }),
      "attestation request (ok)",
      [200, 201],
    );
    ctx.okRequestToken = String(
      (requested.request as Record<string, unknown>).token ?? "",
    );
    expect(ctx.okRequestToken).toBeTruthy();

    // Attestor view (no auth) shows the claim but never capability levels.
    const view = expectOk(await attestApi(ctx.okRequestToken, {}, "GET"), "attestor view");
    const v = view.view as Record<string, unknown>;
    expect(v.capabilityLevelsShown).toBe(false);
    expect(v.alreadyDecided).toBe(false);

    // External attestor confirms — no subject auth cookies.
    const confirm = await attestApi(ctx.okRequestToken, {
      decision: "confirm",
      attestorDisplayName: "Jordan Ellis",
      attestorRelationship: "former_manager",
      attestorOrganisation: "MediFlow",
      statement:
        "I managed the subject and can confirm they owned the scoping decision described.",
    });
    expect(confirm.status).toBe(200);
    expect(confirm.json.ok).toBe(true);
    expect(confirm.json.deliverxVerified).toBe(true);
    ctx.attestationEvidenceId = String(confirm.json.evidenceId ?? "");
    expect(ctx.attestationEvidenceId).toBeTruthy();

    // Entry now reads Verified via the honest gate.
    const entry = await getEntry();
    expect(entry.deliverxVerified).toBe(true);
    expect(entry.verifierStatus).toBe("externally_attested");
    expect(entry.evidenceStrength).toBe("externally_verified");
  }, STEP_TIMEOUT);

  it("08 attestation is recorded on the ledger as external_verification / platform_verified", async () => {
    const { data: ledger } = await admin!
      .from("pi_evidence_records")
      .select("id, source_type, category, confidentiality")
      .eq("id", ctx.attestationEvidenceId)
      .single();
    expect(ledger).toMatchObject({
      source_type: "external_verification",
      category: "attestation",
      confidentiality: "shareable",
    });

    const { data: transitions } = await admin!
      .from("pi_evidence_status_transitions")
      .select("to_status")
      .eq("evidence_id", ctx.attestationEvidenceId);
    const statuses = (transitions ?? []).map((t) => t.to_status);
    expect(statuses).toContain("platform_verified");

    const { data: attestation } = await admin!
      .from("vpp_attestations")
      .select("decision, evidence_id")
      .eq("entry_id", ctx.entryId)
      .eq("decision", "confirm")
      .maybeSingle();
    expect(attestation?.decision).toBe("confirm");
    expect(attestation?.evidence_id).toBe(ctx.attestationEvidenceId);

    // No capability ScoreRun was created by attestation.
    const { count: runCount } = await admin!
      .from("pi_capability_score_runs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", subjectId);
    expect(runCount ?? 0).toBe(0);
  }, STEP_TIMEOUT);

  it("09 subject still cannot self-set Verified-bearing VPP columns at the DB (Batch 1)", async () => {
    // Probe elevation on a FRESH, unverified entry — a legitimate no-op rewrite of
    // the already-attested entry would not exercise the elevation guard.
    const created = expectOk(
      await subjectApi("/api/portfolio/entries", {
        body: {
          title: "T8 — self-elevation probe entry",
          evidenceIds: [ctx.shareableEvidenceId],
        },
      }),
      "portfolio create (probe)",
    );
    const probeEntryId = String((created.entry as Record<string, unknown>).id);

    const { error: ownerUpdateError } = await subjectAnon!
      .from("vpp_entries")
      .update({
        verifier_status: "externally_attested",
        evidence_strength: "externally_verified",
      })
      .eq("id", probeEntryId);
    expect(ownerUpdateError, "owner Verified-bearing UPDATE must be denied").toBeTruthy();

    const { error: ownerInsertError } = await subjectAnon!
      .from("vpp_entries")
      .insert({
        user_id: subjectId,
        title: "Forged self-verified entry",
        verifier_status: "externally_attested",
        evidence_strength: "externally_verified",
      });
    expect(ownerInsertError, "owner Verified-bearing INSERT must be denied").toBeTruthy();

    // The probe entry must remain unverified.
    const { data: probe } = await admin!
      .from("vpp_entries")
      .select("verifier_status, evidence_strength")
      .eq("id", probeEntryId)
      .single();
    expect(probe?.verifier_status).not.toBe("externally_attested");
    expect(probe?.evidence_strength).not.toBe("externally_verified");
  }, STEP_TIMEOUT);

  it("10 public share after attestation keeps private evidence hidden and reflects verification", async () => {
    const pub = await fetch(`${BASE_URL}/portfolio/v/${ctx.shareToken}`, {
      redirect: "manual",
    });
    expect(pub.status).toBe(200);
    const html = await pub.text();
    // Private evidence content is still never exposed.
    expect(html.includes(PRIVATE_MARKER)).toBe(false);
    // The externally-attested evidence is shareable and now visible.
    expect(/External attestation:/i.test(html)).toBe(true);
    // Honest verification notice now reflects the attestation.
    expect(/Externally attested evidence is linked/i.test(html)).toBe(true);
  }, STEP_TIMEOUT);
});
