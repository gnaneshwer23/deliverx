/**
 * Persistence for the real-world outcome loop.
 *
 * recordOutcomeEvent appends a SELF-REPORTED ledger record and stores the event.
 * It never writes capability, never triggers ScoreRun, and never sets
 * externally_verified. Calibration findings are recomputed and persisted as
 * diagnostic snapshots (challengeable), never capability writes.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { appendEvidence } from "@/lib/evidence-ledger/append";
import { detectCalibrationFindings, type CalibrationContext } from "@/lib/real-world-outcomes/calibration";
import {
  buildOutcomeEvidenceInput,
  defaultSentimentFor,
  deriveOutcomeStrength,
} from "@/lib/real-world-outcomes/outcomes";
import {
  isOutcomeEventType,
  type CalibrationFinding,
  type CalibrationFindingRecord,
  type OutcomeEventRecord,
  type OutcomeStrength,
  type RecordOutcomeInput,
} from "@/lib/real-world-outcomes/types";

function mapEvent(row: Record<string, unknown>): OutcomeEventRecord {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    applicationId: (row.application_id as string | null) ?? null,
    eventType: row.event_type as OutcomeEventRecord["eventType"],
    occurredOn: row.occurred_on as string,
    title: row.title as string,
    detail: (row.detail as string) ?? "",
    company: (row.company as string | null) ?? null,
    roleTitle: (row.role_title as string | null) ?? null,
    seniority: (row.seniority as string | null) ?? null,
    stageReached: (row.stage_reached as string | null) ?? null,
    sentiment: row.sentiment as OutcomeEventRecord["sentiment"],
    artefactRef: (row.artefact_ref as string | null) ?? null,
    hasArtefact: Boolean(row.has_artefact),
    evidenceId: (row.evidence_id as string | null) ?? null,
    evidenceStrength: row.evidence_strength as OutcomeStrength,
    selfReported: true,
    externallyVerified: false,
    capabilityAssigned: false,
    confidentiality: (row.confidentiality as string) ?? "private",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapFinding(row: Record<string, unknown>): CalibrationFindingRecord {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    findingType: row.finding_type as CalibrationFindingRecord["findingType"],
    severity: row.severity as CalibrationFindingRecord["severity"],
    title: row.title as string,
    detail: (row.detail as string) ?? "",
    evidenceIds: ((row.evidence_ids as string[]) ?? []).map(String),
    implicatedGaps: ((row.implicated_gaps as string[]) ?? []).map(String),
    metrics: (row.metrics as Record<string, number | string>) ?? {},
    diagnosticOnly: true,
    capabilityAssigned: false,
    status: row.status as CalibrationFindingRecord["status"],
    reviewCaseId: (row.review_case_id as string | null) ?? null,
    sourceWindowStart: (row.source_window_start as string | null) ?? null,
    sourceWindowEnd: (row.source_window_end as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function listOutcomeEvents(
  supabase: SupabaseClient,
  userId: string,
): Promise<OutcomeEventRecord[]> {
  const { data, error } = await supabase
    .from("pi_outcome_events")
    .select("*")
    .eq("user_id", userId)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []).map((r) => mapEvent(r as Record<string, unknown>));
}

export async function listCalibrationFindings(
  supabase: SupabaseClient,
  userId: string,
): Promise<CalibrationFindingRecord[]> {
  const { data, error } = await supabase
    .from("pi_calibration_findings")
    .select("*")
    .eq("user_id", userId)
    .neq("status", "dismissed")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []).map((r) => mapFinding(r as Record<string, unknown>));
}

/**
 * Record a real-world outcome:
 * 1. append a self-reported (or document_supported) ledger record — never capability
 * 2. insert the outcome event row (linked to the evidence)
 * 3. log a career activity for the timeline
 * Never triggers ScoreRun. Never sets externally_verified.
 */
export async function recordOutcomeEvent(
  supabase: SupabaseClient,
  userId: string,
  input: RecordOutcomeInput,
): Promise<{
  event: OutcomeEventRecord;
  evidenceId: string;
  strength: OutcomeStrength;
  capabilityAssigned: false;
  scoreRunTriggered: false;
}> {
  if (!isOutcomeEventType(input.eventType)) throw new Error("Invalid outcome event type");
  if (!input.title?.trim()) throw new Error("Title is required");

  const strength = deriveOutcomeStrength({
    hasArtefact: input.hasArtefact,
    artefactRef: input.artefactRef,
  });
  const sentiment = input.sentiment ?? defaultSentimentFor(input.eventType);
  const occurredOn = input.occurredOn ?? new Date().toISOString().slice(0, 10);

  const { data: row, error } = await supabase
    .from("pi_outcome_events")
    .insert({
      user_id: userId,
      application_id: input.applicationId ?? null,
      event_type: input.eventType,
      occurred_on: occurredOn,
      title: input.title.trim(),
      detail: (input.detail ?? "").trim(),
      company: input.company?.trim() || null,
      role_title: input.roleTitle?.trim() || null,
      seniority: input.seniority?.trim() || null,
      stage_reached: input.stageReached?.trim() || null,
      sentiment,
      artefact_ref: input.artefactRef?.trim() || null,
      has_artefact: Boolean(input.hasArtefact) || Boolean(input.artefactRef?.trim()),
      evidence_strength: strength,
      self_reported: true,
      externally_verified: false,
      capability_assigned: false,
      confidentiality: "private",
      payload: { createdVia: "real-world-outcomes-v1" },
    })
    .select("*")
    .single();
  if (error) throw error;

  const eventId = row.id as string;

  const append = await appendEvidence(
    supabase,
    buildOutcomeEvidenceInput({
      userId,
      outcomeEventId: eventId,
      eventType: input.eventType,
      title: input.title,
      detail: input.detail,
      company: input.company,
      roleTitle: input.roleTitle,
      seniority: input.seniority,
      stageReached: input.stageReached,
      occurredOn,
      strength,
      artefactRef: input.artefactRef,
    }),
  );

  const { data: updated, error: updErr } = await supabase
    .from("pi_outcome_events")
    .update({ evidence_id: append.evidenceId, updated_at: new Date().toISOString() })
    .eq("id", eventId)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (updErr) throw updErr;

  // Timeline entry (reuses 0072 career_activities; no capability implications).
  await supabase
    .from("career_activities")
    .insert({
      user_id: userId,
      module_id: "applications",
      activity_type: `outcome_${input.eventType}`,
      title: input.title.trim(),
      payload: { outcomeEventId: eventId, evidenceId: append.evidenceId, strength },
    })
    .then(
      () => undefined,
      (e: unknown) => {
        console.error("[outcomes] activity log failed", e);
      },
    );

  return {
    event: mapEvent(updated as Record<string, unknown>),
    evidenceId: append.evidenceId,
    strength,
    capabilityAssigned: false,
    scoreRunTriggered: false,
  };
}

/**
 * Recompute calibration findings and persist a fresh snapshot.
 * Replaces prior OPEN findings (keeps acknowledged/challenged history intact) so the
 * diagnostic view reflects current outcomes. Never a capability write.
 */
export async function refreshCalibrationFindings(
  supabase: SupabaseClient,
  userId: string,
  context: CalibrationContext = {},
): Promise<CalibrationFindingRecord[]> {
  const events = await listOutcomeEvents(supabase, userId);
  const findings = detectCalibrationFindings(events, context);

  // Retire stale OPEN findings before inserting the new snapshot.
  await supabase
    .from("pi_calibration_findings")
    .update({ status: "dismissed", updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("status", "open");

  if (findings.length === 0) return [];

  const windowStart = events.length
    ? events[events.length - 1].occurredOn
    : null;
  const windowEnd = events.length ? events[0].occurredOn : null;

  const rows = findings.map((f: CalibrationFinding) => ({
    user_id: userId,
    finding_type: f.findingType,
    severity: f.severity,
    title: f.title,
    detail: f.detail,
    evidence_ids: f.evidenceIds,
    implicated_gaps: f.implicatedGaps,
    metrics: f.metrics,
    diagnostic_only: true,
    capability_assigned: false,
    status: "open" as const,
    source_window_start: windowStart,
    source_window_end: windowEnd,
  }));

  const { data, error } = await supabase
    .from("pi_calibration_findings")
    .insert(rows)
    .select("*");
  if (error) throw error;
  return (data ?? []).map((r) => mapFinding(r as Record<string, unknown>));
}

/** Load a compact outcome context for Profile/Career (events + open findings). */
export async function loadOutcomeContext(
  supabase: SupabaseClient,
  userId: string,
): Promise<{
  events: OutcomeEventRecord[];
  findings: CalibrationFindingRecord[];
}> {
  const [events, findings] = await Promise.all([
    listOutcomeEvents(supabase, userId).catch(() => []),
    listCalibrationFindings(supabase, userId).catch(() => []),
  ]);
  return { events, findings };
}
