/**
 * T8 external attestation persistence.
 * Confirm → ledger external_verification + entry externally_attested.
 * Dispute → review case; never lights Verified; never writes capability.
 */

import { randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { appendEvidence } from "@/lib/evidence-ledger/append";
import { createNotification } from "@/lib/notifications/store";
import { createReviewCase } from "@/lib/pi-review/store";
import { shareBaseUrl } from "@/lib/share-url";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getPortfolioEntry,
  listPortfolioShares,
} from "@/lib/verified-portfolio/store";
import { buildAttestorView } from "@/lib/external-attestation/privacy-view";
import type {
  AttestationDecision,
  AttestationRecord,
  AttestationRelationship,
  AttestationRequest,
  AttestationRequestStatus,
  AttestorView,
} from "@/lib/external-attestation/types";

export class AttestationError extends Error {
  constructor(
    message: string,
    readonly code:
      | "not_found"
      | "forbidden"
      | "invalid"
      | "expired"
      | "already_decided"
      | "consent_required"
      | "self_attest"
      | "capability_forbidden",
  ) {
    super(message);
    this.name = "AttestationError";
  }
}

function newToken() {
  return randomBytes(24).toString("base64url");
}

export function buildAttestUrl(token: string) {
  return `${shareBaseUrl()}/portfolio/attest/${token}`;
}

function mapRequest(row: Record<string, unknown>): AttestationRequest {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    entryId: row.entry_id as string,
    shareId: (row.share_id as string) ?? null,
    claimField: (row.claim_field as string) ?? "general",
    claimLabel: row.claim_label as string,
    claimSummary: (row.claim_summary as string) ?? "",
    status: row.status as AttestationRequestStatus,
    token: row.token as string,
    relationshipHint: (row.relationship_hint as string) ?? null,
    consentToShare: Boolean(row.consent_to_share),
    expiresAt: (row.expires_at as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    attestUrl: buildAttestUrl(row.token as string),
  };
}

function mapAttestation(row: Record<string, unknown>): AttestationRecord {
  return {
    id: row.id as string,
    requestId: row.request_id as string,
    entryId: row.entry_id as string,
    userId: row.user_id as string,
    decision: row.decision as AttestationDecision,
    attestorDisplayName: row.attestor_display_name as string,
    attestorRelationship: row.attestor_relationship as AttestationRelationship,
    attestorOrganisation: (row.attestor_organisation as string) ?? null,
    statement: row.statement as string,
    evidenceId: (row.evidence_id as string) ?? null,
    reviewCaseId: (row.review_case_id as string) ?? null,
    createdAt: row.created_at as string,
  };
}

async function appendEvent(
  admin: SupabaseClient,
  input: {
    requestId: string;
    attestationId?: string | null;
    userId: string;
    eventType: string;
    payload?: Record<string, unknown>;
  },
) {
  await admin.from("vpp_attestation_events").insert({
    request_id: input.requestId,
    attestation_id: input.attestationId ?? null,
    user_id: input.userId,
    event_type: input.eventType,
    payload: input.payload ?? {},
  });
}

export async function createAttestationRequest(
  supabase: SupabaseClient,
  userId: string,
  input: {
    entryId: string;
    claimLabel: string;
    claimField?: string;
    claimSummary?: string;
    relationshipHint?: string | null;
    consentToShare: boolean;
    shareId?: string | null;
    expiresInDays?: number;
  },
): Promise<AttestationRequest> {
  if (!input.consentToShare) {
    throw new AttestationError(
      "Consent to share this claim with an external attestor is required",
      "consent_required",
    );
  }
  const label = input.claimLabel.trim();
  if (label.length < 3 || label.length > 200) {
    throw new AttestationError("claimLabel must be 3–200 characters", "invalid");
  }

  const entry = await getPortfolioEntry(supabase, userId, input.entryId);
  const shares = await listPortfolioShares(supabase, userId, input.entryId);
  const shareId =
    input.shareId ??
    shares.find((s) => s.status === "active")?.id ??
    null;

  const expiresAt = new Date(
    Date.now() + (input.expiresInDays ?? 14) * 24 * 60 * 60 * 1000,
  ).toISOString();
  const token = newToken();

  const summary =
    input.claimSummary?.trim() ||
    [
      `Claim: ${label}`,
      entry.targetRole ? `Role context: ${entry.targetRole}` : null,
      `Portfolio entry: ${entry.title}`,
      "Evidence strength labels describe packaging only until this attestation completes.",
    ]
      .filter(Boolean)
      .join(" · ");

  const { data, error } = await supabase
    .from("vpp_attestation_requests")
    .insert({
      user_id: userId,
      entry_id: input.entryId,
      share_id: shareId,
      claim_field: input.claimField?.trim() || "general",
      claim_label: label,
      claim_summary: summary.slice(0, 800),
      status: "pending",
      token,
      relationship_hint: input.relationshipHint?.trim() || null,
      consent_to_share: true,
      expires_at: expiresAt,
    })
    .select("*")
    .single();

  if (error) throw error;

  await supabase
    .from("vpp_entries")
    .update({ verifier_status: "pending_external" })
    .eq("id", input.entryId)
    .eq("user_id", userId)
    .in("verifier_status", ["none", "self_attested"]);

  const admin = createAdminClient();
  await appendEvent(admin, {
    requestId: data.id as string,
    userId,
    eventType: "requested",
    payload: { claim_label: label, entry_id: input.entryId },
  });

  await createNotification(supabase, {
    userId,
    kind: "system",
    title: "Attestation request created",
    body: `Share the attestation link for “${label}” with your chosen attestor.`,
    href: "/portfolio",
    contextType: "career_objective",
    contextId: input.entryId,
    payload: { attestationRequestId: data.id, claimLabel: label },
    sourceType: "vpp_attestation_request",
    sourceId: data.id as string,
    dedupeKey: `attestation.requested:${data.id}`,
  });

  return mapRequest(data);
}

export async function listAttestationRequests(
  supabase: SupabaseClient,
  userId: string,
  entryId?: string,
): Promise<AttestationRequest[]> {
  let q = supabase
    .from("vpp_attestation_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (entryId) q = q.eq("entry_id", entryId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((r) => mapRequest(r));
}

export async function revokeAttestationRequest(
  supabase: SupabaseClient,
  userId: string,
  requestId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("vpp_attestation_requests")
    .update({ status: "revoked" })
    .eq("id", requestId)
    .eq("user_id", userId)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new AttestationError("Request not found or not pending", "not_found");

  const admin = createAdminClient();
  await appendEvent(admin, {
    requestId,
    userId,
    eventType: "revoked",
  });
}

export async function getAttestorViewByToken(token: string): Promise<AttestorView> {
  const admin = createAdminClient();
  const { data: req, error } = await admin
    .from("vpp_attestation_requests")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  if (error || !req) throw new AttestationError("Invalid attestation link", "not_found");

  if (req.status === "revoked" || req.status === "cancelled") {
    throw new AttestationError("This attestation request was revoked", "forbidden");
  }
  if (req.expires_at && new Date(req.expires_at as string).getTime() < Date.now()) {
    if (req.status === "pending") {
      await admin
        .from("vpp_attestation_requests")
        .update({ status: "expired" })
        .eq("id", req.id);
      await appendEvent(admin, {
        requestId: req.id as string,
        userId: req.user_id as string,
        eventType: "expired",
      });
    }
    throw new AttestationError("This attestation link has expired", "expired");
  }

  const { data: entry } = await admin
    .from("vpp_entries")
    .select("title, target_role, hidden_fields")
    .eq("id", req.entry_id)
    .single();
  if (!entry) throw new AttestationError("Entry unavailable", "not_found");

  const { data: existing } = await admin
    .from("vpp_attestations")
    .select("id")
    .eq("request_id", req.id)
    .maybeSingle();

  return buildAttestorView({
    requestId: req.id as string,
    status: req.status as AttestationRequestStatus,
    claimLabel: req.claim_label as string,
    claimSummary: (req.claim_summary as string) ?? "",
    claimField: (req.claim_field as string) ?? "general",
    entry: {
      title: entry.title as string,
      targetRole: (entry.target_role as string) ?? null,
      hiddenFields: (entry.hidden_fields as never[]) ?? [],
    },
    relationshipHint: (req.relationship_hint as string) ?? null,
    expiresAt: (req.expires_at as string) ?? null,
    alreadyDecided: Boolean(existing) || req.status !== "pending",
  });
}

export async function submitAttestation(
  token: string,
  input: {
    decision: AttestationDecision;
    attestorDisplayName: string;
    attestorRelationship: AttestationRelationship;
    attestorOrganisation?: string | null;
    statement: string;
    /** If the attestor is signed in as the subject, reject (no self-attest). */
    actorUserId?: string | null;
  },
): Promise<{ attestation: AttestationRecord; deliverxVerified: boolean }> {
  const admin = createAdminClient();
  const { data: req, error } = await admin
    .from("vpp_attestation_requests")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  if (error || !req) throw new AttestationError("Invalid attestation link", "not_found");

  if (input.actorUserId && input.actorUserId === req.user_id) {
    throw new AttestationError(
      "You cannot attest your own portfolio claim",
      "self_attest",
    );
  }

  if (req.status !== "pending") {
    throw new AttestationError("This request is no longer open", "already_decided");
  }
  if (req.expires_at && new Date(req.expires_at as string).getTime() < Date.now()) {
    await admin
      .from("vpp_attestation_requests")
      .update({ status: "expired" })
      .eq("id", req.id);
    throw new AttestationError("This attestation link has expired", "expired");
  }

  const name = input.attestorDisplayName.trim().slice(0, 80);
  const statement = input.statement.trim().slice(0, 2000);
  if (name.length < 2) {
    throw new AttestationError("Attestor display name is required", "invalid");
  }
  if (statement.length < 10) {
    throw new AttestationError("Statement must be at least 10 characters", "invalid");
  }

  const { data: existing } = await admin
    .from("vpp_attestations")
    .select("id")
    .eq("request_id", req.id)
    .maybeSingle();
  if (existing) {
    throw new AttestationError("Already decided", "already_decided");
  }

  const subjectUserId = req.user_id as string;
  const entryId = req.entry_id as string;
  let evidenceId: string | null = null;
  let reviewCaseId: string | null = null;
  let deliverxVerified = false;

  if (input.decision === "confirm") {
    const append = await appendEvidence(admin, {
      userId: subjectUserId,
      sourceType: "external_verification",
      category: "attestation",
      title: `External attestation: ${req.claim_label}`,
      summary: statement.slice(0, 400),
      rawContent: {
        claim_field: req.claim_field,
        claim_label: req.claim_label,
        decision: "confirm",
        // Attestor PII stays in attestation row, not public portfolio
        relationship: input.attestorRelationship,
        request_id: req.id,
      },
      sourceRecordType: "vpp_attestation_request",
      sourceRecordId: req.id as string,
      confidentiality: "shareable",
      consentStatus: "analysis_allowed",
      idempotencyKey: `attestation:${req.id}`,
      initialStatus: "platform_verified",
      provenance: {
        actorType: "external_employer",
        actorUserId: null,
        userContribution: {
          claim_label: req.claim_label,
          consent_to_share: true,
        },
        aiContribution: {},
        rawRef: {
          attestation_request_id: req.id,
          relationship: input.attestorRelationship,
        },
      },
    });
    evidenceId = append.evidenceId;

    await admin.from("vpp_entry_evidence").upsert(
      {
        entry_id: entryId,
        evidence_id: evidenceId,
        claim_field: (req.claim_field as string) || "general",
        strength: "externally_verified",
        title_snapshot: `External attestation: ${req.claim_label}`,
        source_type: "external_verification",
        ledger_status: "platform_verified",
        confidentiality: "shareable",
      },
      { onConflict: "entry_id,evidence_id,claim_field" },
    );

    const { error: verifiedStateError } = await admin.rpc(
      "pi_apply_vpp_attestation_state",
      {
        p_entry_id: entryId,
        p_user_id: subjectUserId,
        p_verifier_status: "externally_attested",
        p_evidence_strength: "externally_verified",
      },
    );
    if (verifiedStateError) throw verifiedStateError;

    await admin
      .from("vpp_attestation_requests")
      .update({ status: "confirmed" })
      .eq("id", req.id);

    const { deliverxVerifiedFromAttestation } = await import(
      "@/lib/external-attestation/verified-gate"
    );
    deliverxVerified = deliverxVerifiedFromAttestation({
      verifierStatus: "externally_attested",
      evidenceStrength: "externally_verified",
    });
  } else {
    const review = await createReviewCase(admin, {
      userId: subjectUserId,
      subjectKind: "portfolio_claim",
      subjectRefType: "vpp_attestation_request",
      subjectRefId: req.id as string,
      subjectLabel: `Disputed attestation: ${req.claim_label}`,
      subjectSnapshot: {
        entry_id: entryId,
        claim_label: req.claim_label,
        decision: "dispute",
        // No capability mutation
        capabilityWrite: false,
      },
      priority: "high",
    });
    if (review.error || !review.data) {
      throw new AttestationError(
        review.error ?? "Could not open review case",
        "invalid",
      );
    }
    reviewCaseId = review.data.id;

    const { error: disputedStateError } = await admin.rpc(
      "pi_apply_vpp_attestation_state",
      {
        p_entry_id: entryId,
        p_user_id: subjectUserId,
        p_verifier_status: "disputed",
        p_evidence_strength: null,
      },
    );
    if (disputedStateError) throw disputedStateError;

    await admin
      .from("vpp_attestation_requests")
      .update({ status: "disputed" })
      .eq("id", req.id);

    deliverxVerified = false;
  }

  const { data: attRow, error: attError } = await admin
    .from("vpp_attestations")
    .insert({
      request_id: req.id,
      entry_id: entryId,
      user_id: subjectUserId,
      decision: input.decision,
      attestor_display_name: name,
      attestor_relationship: input.attestorRelationship,
      attestor_organisation: input.attestorOrganisation?.trim().slice(0, 120) || null,
      statement,
      evidence_id: evidenceId,
      review_case_id: reviewCaseId,
    })
    .select("*")
    .single();
  if (attError) throw attError;

  await appendEvent(admin, {
    requestId: req.id as string,
    attestationId: attRow.id as string,
    userId: subjectUserId,
    eventType: input.decision === "confirm" ? "confirmed" : "disputed",
    payload: {
      decision: input.decision,
      evidence_id: evidenceId,
      review_case_id: reviewCaseId,
      // Never store capability write
      capability_write: false,
    },
  });

  await createNotification(admin, {
    userId: subjectUserId,
    kind: input.decision === "dispute" ? "review" : "system",
    title:
      input.decision === "confirm"
        ? "External attestation confirmed"
        : "Attestation disputed — review opened",
    body:
      input.decision === "confirm"
        ? `“${req.claim_label}” was confirmed by an external attestor.`
        : `“${req.claim_label}” was disputed. A review case was opened. The Verified badge stays off.`,
    href: input.decision === "dispute" ? "/profile/evidence" : "/portfolio",
    contextType: "evidence",
    contextId: evidenceId ?? reviewCaseId,
    payload: {
      attestationId: attRow.id,
      decision: input.decision,
      capabilityAssigned: false,
    },
    sourceType: "vpp_attestation",
    sourceId: attRow.id as string,
    dedupeKey: `attestation.${input.decision}:${req.id}`,
  });

  return { attestation: mapAttestation(attRow), deliverxVerified };
}

export async function listAttestationsForEntry(
  supabase: SupabaseClient,
  userId: string,
  entryId: string,
): Promise<AttestationRecord[]> {
  const { data, error } = await supabase
    .from("vpp_attestations")
    .select("*")
    .eq("user_id", userId)
    .eq("entry_id", entryId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => mapAttestation(r));
}
