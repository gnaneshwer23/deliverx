import type { SupabaseClient } from "@supabase/supabase-js";
import {
  cascadeTablesForExport,
  PRIVACY_EVENT,
} from "@/lib/pi-privacy/cascade-map";
import type { PersonPrivacyExport, PrivacyRequestRecord } from "@/lib/pi-privacy/types";

type DbClient = SupabaseClient;

const EXPORT_TABLES_DIRECT: string[] = [
  "pi_observation_consent",
  "pi_interventions",
  "pi_intervention_outcomes",
  "workspace_observations",
  "pi_calibration_findings",
  "pi_outcome_events",
  "pi_learning_items",
  "pi_learning_paths",
  "pi_growth_reports",
  "pi_assessment_sessions",
  "pi_notifications",
  "pi_review_notifications",
  "pi_review_events",
  "pi_review_cases",
  "pi_capability_reviews",
  "pi_capability_judgements",
  "pi_capability_snapshots",
  "pi_capability_score_runs",
  "pi_evidence_challenges",
  "pi_evidence_records",
  "artefacts",
  "artefact_versions",
  "artefact_status_transitions",
  "ai_interactions",
  "pi_onboarding_sessions",
  "experience_plans",
  "experience_sim_events",
  "xperience_evidence",
  "xperience_decisions",
  "xperience_enrolments",
  "xperience_profiles",
  "launchpad_artefacts",
  "launchpad_progress",
  "launchpad_profiles",
  "workspace_contributions",
  "department_members",
  "team_members",
  "vpp_shares",
  "vpp_versions",
  "vpp_entries",
  "career_activities",
  "career_applications",
  "pi_domain_events",
  "pi_privacy_requests",
];

async function selectOwn(
  supabase: DbClient,
  table: string,
  userId: string,
): Promise<unknown[]> {
  const { data, error } = await supabase.from(table).select("*").eq("user_id", userId);
  if (error) {
    // Table may be absent in older envs; skip rather than fail whole export.
    console.warn(`[pi-privacy] export skip ${table}:`, error.message);
    return [];
  }
  return (data ?? []) as unknown[];
}

function mapRequest(row: Record<string, unknown>): PrivacyRequestRecord {
  return {
    id: String(row.id),
    userId: (row.user_id as string | null) ?? null,
    requestType: row.request_type as PrivacyRequestRecord["requestType"],
    status: row.status as PrivacyRequestRecord["status"],
    exportSummary: (row.export_summary as Record<string, unknown>) ?? {},
    tablesTouched: (row.tables_touched as string[]) ?? [],
    retentionNote: String(row.retention_note ?? ""),
    errorMessage: (row.error_message as string | null) ?? null,
    requestedAt: String(row.requested_at),
    completedAt: (row.completed_at as string | null) ?? null,
  };
}

export async function listPrivacyRequests(
  supabase: DbClient,
  userId: string,
): Promise<PrivacyRequestRecord[]> {
  const { data, error } = await supabase
    .from("pi_privacy_requests")
    .select("*")
    .eq("user_id", userId)
    .order("requested_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []).map((r) => mapRequest(r as Record<string, unknown>));
}

/**
 * Build a person-scoped export JSON. Never includes other users' rows.
 * Does not include shared pi_cf_* catalogue.
 */
export async function buildPersonPrivacyExport(
  supabase: DbClient,
  input: { userId: string; email?: string | null },
): Promise<PersonPrivacyExport> {
  const tables: Record<string, unknown[]> = {};

  for (const table of EXPORT_TABLES_DIRECT) {
    tables[table] = await selectOwn(supabase, table, input.userId);
  }

  const evidenceIds = (tables.pi_evidence_records ?? [])
    .map((r) => (r as { id?: string }).id)
    .filter((id): id is string => Boolean(id));

  if (evidenceIds.length > 0) {
    for (const child of [
      "pi_evidence_provenance",
      "pi_evidence_status_transitions",
      "pi_evidence_interpretations",
      "pi_evidence_competency_links",
      "pi_evidence_processing_jobs",
    ] as const) {
      const { data, error } = await supabase.from(child).select("*").in("evidence_id", evidenceIds);
      if (error) {
        console.warn(`[pi-privacy] export skip ${child}:`, error.message);
        tables[child] = [];
      } else {
        tables[child] = data ?? [];
      }
    }
  } else {
    tables.pi_evidence_provenance = [];
    tables.pi_evidence_status_transitions = [];
    tables.pi_evidence_interpretations = [];
    tables.pi_evidence_competency_links = [];
    tables.pi_evidence_processing_jobs = [];
  }

  const entryIds = (tables.vpp_entries ?? [])
    .map((r) => (r as { id?: string }).id)
    .filter((id): id is string => Boolean(id));
  if (entryIds.length > 0) {
    const { data } = await supabase.from("vpp_entry_evidence").select("*").in("entry_id", entryIds);
    tables.vpp_entry_evidence = data ?? [];
  } else {
    tables.vpp_entry_evidence = [];
  }

  const sessionIds = (tables.pi_assessment_sessions ?? [])
    .map((r) => (r as { id?: string }).id)
    .filter((id): id is string => Boolean(id));
  if (sessionIds.length > 0) {
    for (const child of ["pi_assessment_items", "pi_assessment_responses", "pi_work_samples"] as const) {
      const { data, error } = await supabase.from(child).select("*").in("session_id", sessionIds);
      if (error) {
        console.warn(`[pi-privacy] export skip ${child}:`, error.message);
        tables[child] = [];
      } else {
        tables[child] = data ?? [];
      }
    }
  } else {
    tables.pi_assessment_items = [];
    tables.pi_assessment_responses = [];
    tables.pi_work_samples = [];
  }

  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    userId: input.userId,
    email: input.email ?? null,
    tables,
    notes: [
      "Export is limited to the authenticated user's person Professional Intelligence and linked product rows.",
      "Shared competency framework catalogue (pi_cf_*) is excluded — it is not personal data ownership.",
      `Cascade map tables covered: ${cascadeTablesForExport().join(", ")}`,
    ],
  };
}

export function summarizeExport(exportDoc: PersonPrivacyExport): Record<string, unknown> {
  const counts: Record<string, number> = {};
  for (const [table, rows] of Object.entries(exportDoc.tables)) {
    counts[table] = rows.length;
  }
  return {
    schemaVersion: exportDoc.schemaVersion,
    exportedAt: exportDoc.exportedAt,
    tableCounts: counts,
    totalRows: Object.values(counts).reduce((a, b) => a + b, 0),
  };
}

export async function requestAndBuildExport(
  supabase: DbClient,
  input: { userId: string; email?: string | null },
): Promise<{ request: PrivacyRequestRecord; export: PersonPrivacyExport }> {
  const { data: inserted, error: insertError } = await supabase
    .from("pi_privacy_requests")
    .insert({
      user_id: input.userId,
      request_type: "export",
      status: "processing",
    })
    .select("*")
    .single();
  if (insertError || !inserted) throw insertError ?? new Error("Could not create export request");

  const requestId = inserted.id as string;

  await supabase.from("pi_domain_events").insert({
    event_type: PRIVACY_EVENT.exportRequested,
    aggregate_type: "pi_privacy_request",
    aggregate_id: requestId,
    user_id: input.userId,
    payload: { request_type: "export" },
    schema_version: 1,
  });

  try {
    const exportDoc = await buildPersonPrivacyExport(supabase, input);
    const summary = summarizeExport(exportDoc);

    const { data: updated, error: updateError } = await supabase
      .from("pi_privacy_requests")
      .update({
        status: "completed",
        export_summary: summary,
        tables_touched: Object.keys(exportDoc.tables),
        completed_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .eq("user_id", input.userId)
      .select("*")
      .single();
    if (updateError || !updated) throw updateError ?? new Error("Could not complete export request");

    await supabase.from("pi_domain_events").insert({
      event_type: PRIVACY_EVENT.exportCompleted,
      aggregate_type: "pi_privacy_request",
      aggregate_id: requestId,
      user_id: input.userId,
      payload: summary,
      schema_version: 1,
    });

    return { request: mapRequest(updated as Record<string, unknown>), export: exportDoc };
  } catch (err) {
    await supabase
      .from("pi_privacy_requests")
      .update({
        status: "failed",
        error_message: err instanceof Error ? err.message : "Export failed",
      })
      .eq("id", requestId);
    throw err;
  }
}

/** Guard: every row in export tables must belong to userId when user_id is present. */
export function assertExportNoCrossUserLeak(
  exportDoc: PersonPrivacyExport,
  userId: string,
): void {
  for (const [table, rows] of Object.entries(exportDoc.tables)) {
    for (const row of rows) {
      if (!row || typeof row !== "object") continue;
      const uid = (row as { user_id?: string }).user_id;
      if (uid != null && uid !== userId) {
        throw new Error(`Cross-user leak detected in ${table}`);
      }
    }
  }
}
