/**
 * T1 Privacy — person PI export / deletion cascade map.
 * Shared catalogue (pi_cf_*) is never exported as "user data" ownership
 * and is never deleted by privacy purge.
 */

export type PrivacyCascadeKind =
  | "person_row"
  | "person_child_via_parent"
  | "append_only_person"
  | "retain_tombstone";

export type PrivacyCascadeEntry = {
  table: string;
  kind: PrivacyCascadeKind;
  /** Column used for ownership filter when kind is person_row / append_only_person */
  ownerColumn?: "user_id";
  /** Parent table when deleting via join (documentation / tests) */
  via?: string;
  export: boolean;
  purge: boolean;
  notes?: string;
};

/** Ordered for documentation; SQL RPC has the authoritative delete order. */
export const PRIVACY_CASCADE_MAP: readonly PrivacyCascadeEntry[] = [
  { table: "pi_intervention_outcomes", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  { table: "pi_interventions", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  { table: "workspace_observations", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  { table: "pi_observation_consent", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  { table: "pi_calibration_findings", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  { table: "pi_outcome_events", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  { table: "pi_learning_items", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  { table: "pi_learning_paths", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  { table: "pi_growth_reports", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  { table: "pi_assessment_sessions", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  {
    table: "pi_assessment_items",
    kind: "person_child_via_parent",
    via: "pi_assessment_sessions",
    export: true,
    purge: true,
    notes: "Cascades with session delete",
  },
  {
    table: "pi_assessment_responses",
    kind: "person_child_via_parent",
    via: "pi_assessment_sessions",
    export: true,
    purge: true,
    notes: "Cascades with session delete",
  },
  {
    table: "pi_work_samples",
    kind: "person_child_via_parent",
    via: "pi_assessment_sessions",
    export: true,
    purge: true,
    notes: "Cascades with session delete",
  },
  { table: "pi_review_notifications", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  { table: "pi_review_events", kind: "append_only_person", ownerColumn: "user_id", export: true, purge: true },
  { table: "pi_review_cases", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  { table: "pi_capability_reviews", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  {
    table: "pi_capability_judgements",
    kind: "append_only_person",
    ownerColumn: "user_id",
    export: true,
    purge: true,
  },
  {
    table: "pi_capability_snapshots",
    kind: "append_only_person",
    ownerColumn: "user_id",
    export: true,
    purge: true,
  },
  { table: "pi_capability_score_runs", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  { table: "vpp_shares", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  { table: "vpp_versions", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  {
    table: "vpp_entry_evidence",
    kind: "person_child_via_parent",
    via: "vpp_entries",
    export: true,
    purge: true,
    notes: "Must clear before evidence (RESTRICT FK)",
  },
  { table: "vpp_entries", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  { table: "pi_evidence_challenges", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  {
    table: "pi_evidence_competency_links",
    kind: "person_child_via_parent",
    via: "pi_evidence_records",
    export: true,
    purge: true,
  },
  {
    table: "pi_evidence_interpretations",
    kind: "append_only_person",
    via: "pi_evidence_records",
    export: true,
    purge: true,
  },
  {
    table: "pi_evidence_status_transitions",
    kind: "append_only_person",
    via: "pi_evidence_records",
    export: true,
    purge: true,
  },
  {
    table: "pi_evidence_processing_jobs",
    kind: "person_child_via_parent",
    via: "pi_evidence_records",
    export: true,
    purge: true,
  },
  {
    table: "pi_evidence_provenance",
    kind: "append_only_person",
    via: "pi_evidence_records",
    export: true,
    purge: true,
  },
  {
    table: "pi_evidence_records",
    kind: "append_only_person",
    ownerColumn: "user_id",
    export: true,
    purge: true,
  },
  {
    table: "artefact_status_transitions",
    kind: "append_only_person",
    ownerColumn: "user_id",
    export: true,
    purge: true,
    notes: "T3 append-only submission/state audit; purged before versions",
  },
  {
    table: "artefact_versions",
    kind: "append_only_person",
    ownerColumn: "user_id",
    export: true,
    purge: true,
    notes: "T3 immutable versions; purged after evidence provenance (RESTRICT FK)",
  },
  {
    table: "artefacts",
    kind: "person_row",
    ownerColumn: "user_id",
    export: true,
    purge: true,
    notes: "T3 artefact envelopes; current_version_id cleared before version purge",
  },
  {
    table: "ai_interactions",
    kind: "append_only_person",
    ownerColumn: "user_id",
    export: true,
    purge: true,
    notes: "T4 AI interaction cost/latency log; catalogue ai_agents/ai_prompt_versions excluded",
  },
  { table: "pi_onboarding_sessions", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  { table: "experience_plans", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  {
    table: "experience_sim_events",
    kind: "append_only_person",
    ownerColumn: "user_id",
    export: true,
    purge: true,
  },
  { table: "xperience_evidence", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  { table: "xperience_decisions", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  { table: "xperience_enrolments", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  { table: "xperience_profiles", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  { table: "launchpad_artefacts", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  { table: "launchpad_progress", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  { table: "launchpad_profiles", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  { table: "workspace_contributions", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  { table: "career_activities", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  { table: "career_applications", kind: "person_row", ownerColumn: "user_id", export: true, purge: true },
  {
    table: "pi_domain_events",
    kind: "person_row",
    ownerColumn: "user_id",
    export: true,
    purge: true,
    notes: "Privacy.* events for the request are retained",
  },
  {
    table: "pi_privacy_requests",
    kind: "retain_tombstone",
    ownerColumn: "user_id",
    export: true,
    purge: false,
    notes: "Legal minimum tombstone retained after purge",
  },
] as const;

/** Tables that must never appear in a person purge. */
export const PRIVACY_PURGE_EXCLUSIONS = [
  "pi_cf_frameworks",
  "pi_cf_framework_versions",
  "pi_cf_role_families",
  "pi_cf_seniority_levels",
  "pi_cf_roles",
  "pi_cf_competencies",
  "pi_cf_indicators",
  "pi_cf_rubric_anchors",
  "pi_cf_assessment_content",
  "pi_cf_evidence_rules",
  "pi_cf_portfolio_expectations",
  "pi_cf_readiness_requirements",
  "pi_cf_audit_events",
  "pi_rubric_versions",
  "experience_scenarios",
  "ai_agents",
  "ai_prompt_versions",
] as const;

export const DELETE_CONFIRM_PHRASE = "DELETE_MY_PI_DATA";

export const PRIVACY_EVENT = {
  exportRequested: "privacy.export.requested",
  exportCompleted: "privacy.export.completed",
  deleteRequested: "privacy.delete.requested",
  deleteCompleted: "privacy.delete.completed",
} as const;

export function cascadeTablesForExport(): string[] {
  return PRIVACY_CASCADE_MAP.filter((e) => e.export).map((e) => e.table);
}

export function cascadeTablesForPurge(): string[] {
  return PRIVACY_CASCADE_MAP.filter((e) => e.purge).map((e) => e.table);
}

export function assertCascadeMapComplete(): {
  exportCount: number;
  purgeCount: number;
  exclusions: number;
} {
  const tables = new Set(PRIVACY_CASCADE_MAP.map((e) => e.table));
  for (const excl of PRIVACY_PURGE_EXCLUSIONS) {
    if (tables.has(excl)) {
      throw new Error(`Exclusion ${excl} must not appear in cascade map`);
    }
  }
  const purgeables = cascadeTablesForPurge();
  if (purgeables.length < 20) {
    throw new Error("Cascade purge map looks incomplete");
  }
  return {
    exportCount: cascadeTablesForExport().length,
    purgeCount: purgeables.length,
    exclusions: PRIVACY_PURGE_EXCLUSIONS.length,
  };
}
