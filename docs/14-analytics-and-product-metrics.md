# 14 — Analytics & Product Metrics

**Status:** Catalogue + honesty on gaps  
**Audience:** Product, Engineering  
**As of:** 2026-07-25

---

## Purpose

Measure activation, evidence density, judgement quality, privacy honesty, and Verified integrity — without turning unexplained vanity scores into product truth.

## Current instrumentation (honest)

| Present | Gap |
| --- | --- |
| Vercel Analytics / Speed Insights on web | Not a full product event warehouse |
| `pi_domain_events` for PI domain lifecycle | Not all product UX events mirrored |
| `ai_interactions` + `pi_ai_usage_daily` | Cost/latency — not funnel analytics |
| Attestation events (`vpp_attestation_events`) | Good audit; may lack marketing funnel join |
| Privacy request records | Operational, not growth analytics |

**Gap:** Many catalogue events below are **desired schema**; do not assume client `track()` exists for each. Prefer emitting into domain events or a thin analytics helper when implementing slices — do not invent a parallel metrics SKU.

---

## Event catalogue

| Event name | Trigger | Properties (suggested) | Segment | Purpose |
| --- | --- | --- | --- | --- |
| `account_created` | Signup success | `method` | Auth | Top of funnel |
| `onboarding_pi_step_completed` | Each PI step save | `step`, `session_id` | Onboarding | Funnel drop-off |
| `onboarding_pi_completed` | Path chosen | `recommended_path`, `chosen_path` | Onboarding | Activation |
| `experience_plan_generated` | Plan create | `scenario_count` | Experience | Engagement |
| `experience_started` | Scenario/sim start | `company_key`, `scenario_id` | Experience | Activation |
| `artefact_version_submitted` | New artefact version | `artefact_id`, `provenance` | Evidence | Work density |
| `evidence_appended` | Ledger append | `source_type`, `has_artefact_version` | Evidence | Core KPI |
| `evidence_status_transitioned` | Status change | `from`, `to` | Evidence | Trust pipeline |
| `evidence_externally_verified` | T8 confirm path | `entry_id`, `attestation_id` | Trust | Verified integrity |
| `capability_score_run_created` | Engine persist | `run_kind`, `framework_version_id`, `rubric_source` | Judgement | Capability quality |
| `snapshot_claims_refreshed` | Projection update | `claim_count` | Judgement | Downstream freshness |
| `recommendation_viewed` | Plan/readiness shown | `surface`, `readiness_source` | Launchpad/Exp | Explainability |
| `application_submitted` | Career application record | `role_label` | Launchpad | Outcome proxy |
| `collaboration_contribution` | Workspace contribution | `project_id?` | Workspace | Org evidence |
| `observation_consent_changed` | Consent update | `enabled` | Privacy | Expect low opt-in |
| `intervention_draft_created` | Coach draft | `agent` | AI | Coaching usage |
| `learning_item_completed` | Learning progress | `path_id` | Learning | Knowledge only |
| `outcome_event_recorded` | P7 outcome | `outcome_type` | Outcomes | Calibration |
| `attestation_requested` | Owner creates request | `entry_id` | T8 | Funnel |
| `attestation_confirmed` | Attestor confirm | `entry_id` | T8 | Success |
| `attestation_disputed` | Attestor dispute | `entry_id` | T8 | Trust ops |
| `privacy_export_requested` | T1 export | — | Privacy | Compliance |
| `privacy_delete_requested` | T1 delete | — | Privacy | Compliance |
| `ai_agent_run` | `runAgent` | `agent`, `latency_ms`, `cost` | AI | Ops |

---

## Product metrics (definitions)

| Metric | Definition |
| --- | --- |
| Activation | `%` completing PI onboarding who start Experience or open Launchpad within 7d |
| Evidence density | Median evidence records / active user / 30d |
| Judgement coverage | `%` actives with ≥1 ScoreRun under pin |
| Consent opt-in | `%` with observation consent true (monitor; low is OK) |
| Verified integrity | `#` Verified lit without attestation = **0** (invariant) |
| Attestation conversion | confirm / request |

---

## Acceptance for analytics work

- [ ] New events named consistently (`snake_case`)  
- [ ] Never log raw private evidence bodies to third-party analytics  
- [ ] Readiness/Verified properties cannot imply false trust  
