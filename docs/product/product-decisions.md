# Product Decisions Log

Decisions already taken during the PI pivot build. New architectural decisions must be appended here.

**Status values:** Accepted · Superseded · Pending founder

---

## PD-2026-07-01 — Dependency-ordered phases (P0→P7)

| Field | Value |
| --- | --- |
| **Date** | Jul 2026 |
| **Status** | Accepted |
| **Decision** | Ship Professional Intelligence in dependency order: Profile/framework → SnapshotClaims → baseline → Experience planner → observation → final/transfer → Learning → real-world outcomes. |
| **Why** | Prevents building consumers before ledger/engine invariants exist. |
| **Consequence** | Later phases must not bypass earlier trust rails. |

---

## PD-2026-07-02 — Experience-first **and** baseline (baseline opt-in)

| Field | Value |
| --- | --- |
| **Date** | Jul 2026 |
| **Status** | Accepted |
| **Decision** | Support both Experience-first practice and an opt-in baseline assessment. Baseline is available; not a mandatory gate before Experience. |
| **Why** | Users may generate evidence through realistic work without forcing an assessment wall; baseline remains for validity when chosen. |
| **Consequence** | `/profile/baseline` gated; Experience planner can run from gaps or empty ScoreRun guidance. |

---

## PD-2026-07-03 — MediFlow + 11 companies (12-company catalogue)

| Field | Value |
| --- | --- |
| **Date** | Jul 2026 |
| **Status** | Accepted |
| **Decision** | Seed Experience planner across 12 distinct `company_key` values, including MediFlow, with multi-industry scenarios. |
| **Why** | Blueprint/catalogue hypothesis: reusable organisations beat one-off quizzes. |
| **Consequence** | Migration `0079`; planner ranks across catalogue; Day-1 runtime shared. |

---

## PD-2026-07-04 — Observation consent default OFF

| Field | Value |
| --- | --- |
| **Date** | Jul 2026 |
| **Status** | Accepted |
| **Decision** | Continuous Workspace observation and coach interventions require explicit consent. No consent row = denied. |
| **Why** | Privacy built-in; observation ≠ evidence. |
| **Consequence** | `pi_observation_consent`; interventions remain drafts until consented flow; prod consented rows expected ~0 until users opt in. |

---

## PD-2026-07-05 — Confidence bands over fake percentages

| Field | Value |
| --- | --- |
| **Date** | Jul 2026 |
| **Status** | Accepted |
| **Decision** | Prefer explainable confidence bands / cited claims over decorative readiness percentages as capability truth. |
| **Why** | Unexplained scores destroy trust faster than missing features. |
| **Consequence** | SnapshotClaims + citations; marketing % treated as secondary/hidden unless founder overrides. |

---

## PD-2026-07-06 — `deliverxVerified` requires external attestation

| Field | Value |
| --- | --- |
| **Date** | Jul 2026 |
| **Status** | Accepted |
| **Decision** | `deliverxVerifiedClaim` lights only when verifier status is `externally_attested` **and** evidence strength is `externally_verified`. Experience heuristic `platform_verified` never upgrades to external verification. |
| **Why** | Badge without attestation is decorative trust / legal risk. |
| **Consequence** | P8 attestation portal not authorised until founder approves meaning + path; public copy must disclose when not independently verified. |

---

## PD-2026-07-07 — ScoreRun `run_kind`: standard / baseline / final / transfer

| Field | Value |
| --- | --- |
| **Date** | Jul 2026 |
| **Status** | Accepted |
| **Decision** | Capability ScoreRuns declare `run_kind` ∈ {`standard`, `baseline`, `final`, `transfer`}. |
| **Why** | Growth reports and validity require distinguishing assessment contexts under the same framework pin. |
| **Consequence** | Persist paths write `run_kind`; cross-version compare refused. |

---

## PD-2026-07-08 — Framework pin `pm-core@2026.1`

| Field | Value |
| --- | --- |
| **Date** | Jul 2026 |
| **Status** | Accepted |
| **Decision** | Pilot ScoreRuns pin to published framework version `pm-core` / `2026.1` (via `framework_version_id`). |
| **Why** | Frameworks must be versioned; judgements are meaningless without a pin. |
| **Consequence** | Admin framework seed + backfill migrations; thin competency graph acceptable for pilot narrative. |

---

## PD-2026-07-09 — Heuristic fallbacks must be labelled

| Field | Value |
| --- | --- |
| **Date** | Jul 2026 |
| **Status** | Accepted |
| **Decision** | Where ScoreRun projection is thin/absent, Career readiness may show evidence-coverage heuristics only if labelled (`evidence_coverage_heuristic`) and never presented as capability truth. |
| **Why** | Preserve evidence-before-claims when capability data is empty. |
| **Consequence** | `readinessSource` discrimination in career-intelligence; UI must not strip labels. |

---

## PD-2026-07-10 — Learning ≠ competency

| Field | Value |
| --- | --- |
| **Date** | Jul 2026 |
| **Status** | Accepted |
| **Decision** | Learning paths create knowledge / application evidence routes; they must not call Capability Engine persist or light Verified. |
| **Why** | Course completion is not demonstrated capability. |
| **Consequence** | P6 levels/persist invariants; gap → apply CTAs into Experience. |

---

## PD-2026-07-11 — Professional Workspace branding alias

| Field | Value |
| --- | --- |
| **Date** | Jul 2026 |
| **Status** | Accepted (interim; SKU ADR still pending founder) |
| **Decision** | In-app / Hub naming prefers **Professional Workspace**; marketing may alias Team Co-pilot → Workspace. Product id `team-copilot` may remain as alias. |
| **Why** | Reduce twin Homes while founder decides SKU fate. |
| **Consequence** | Do not expand mission-control as PI work packages under current charter. |

---

## PD-2026-07-12 — T1 privacy: export/delete with legal tombstone

| Field | Value |
| --- | --- |
| **Date** | Jul 2026 |
| **Status** | Accepted |
| **Decision** | Person PI export and deletion are first-class (`pi_privacy_requests`, `/api/pi/privacy/*`). Delete requires password re-auth + confirm phrase. Append-only person rows may be purged only under `app.pi_privacy_delete` in a service-role RPC. Shared `pi_cf_*` catalogue is never deleted. Privacy request tombstones + `privacy.*` domain events are retained as the legal minimum. |
| **Why** | GDPR-style operationalisation for pilot trust; Identity & Access was Partial without export/deletion. |
| **Consequence** | Migration `0086`; settings UX on `/settings/profile`; T0 signed-in QA may remain open while T1 is shipped under founder override. |

---

## PD-2026-07-13 — T2 rubric: DB SoT with labelled in-code fallback

| Field | Value |
| --- | --- |
| **Date** | Jul 2026 |
| **Status** | Accepted |
| **Decision** | Published `pi_cf_*` graph is the source of truth for ScoreRun rubrics. In-code `getRubric` / assessment catalogues remain only as **labelled** `in_code_fallback` (never silent). ScoreRuns record `rubric_resolve_source` and prefer `framework_version_id`. Production may fail-closed via `DELIVERX_RUBRIC_REQUIRE_DB`. Multi-profession / seed-depth expansion stays founder-gated (TD-007). |
| **Why** | TD-009 drift between DB seed and in-code pins destroys ScoreRun reproducibility and explainability. |
| **Consequence** | Migration `0087`; hardened `resolve-rubric` / capability run pin assert; golden ScoreRun harness in CI. |

---

## PD-2026-07-14 — T3 artefacts: immutable versions cited by evidence

| Field | Value |
| --- | --- |
| **Date** | Jul 2026 |
| **Status** | Accepted |
| **Decision** | Artefacts are first-class (`artefacts` envelope + immutable `artefact_versions`). New content = new version; prior versions never mutate (append-only DB trigger with a purge-only delete bypass). Each version records user-vs-AI provenance and a content hash. Submissions / state changes are recorded append-only in `artefact_status_transitions`. Evidence that references an artefact **must** cite a specific `artefact_version_id` (DB CHECK on `pi_evidence_provenance` + app guard) — never a mutable envelope. Artefacts are private by default, self-only RLS, and are included in the T1 export/delete cascade (transitions → versions → envelopes, purged after evidence to respect the RESTRICT FK). No capability is assigned by artefact creation; observation ≠ evidence. |
| **Why** | Step 7 (Artefact Submission) was Partial with no versioning; evidence packaging trust requires immutable, provenance-bearing versions that the ledger can cite deterministically. |
| **Consequence** | Migration `0088`; `src/lib/artefacts/`; `POST/GET /api/pi/artefacts` + `/[id]/versions`; settings UX panel. Legacy `documents` / `launchpad_artefacts` remain; new PI submissions use the versioned model. |

---

## PD-2026-07-15 — Person-purge RPC is service_role only (hotfix)

| Field | Value |
| --- | --- |
| **Date** | Jul 2026 |
| **Status** | Accepted |
| **Decision** | `pi_privacy_purge_person_data` (SECURITY DEFINER) is executable by `service_role` only. `revoke ... from public` is insufficient because Supabase default privileges grant EXECUTE to `anon`/`authenticated`; those grants are explicitly revoked (`0089`). |
| **Why** | The purge RPC bypasses RLS; anonymous/authenticated PostgREST RPC access could delete another person's PI. Found during the T3 access-control boundary check. |
| **Consequence** | Migration `0089`; verified on prod that anon/authenticated EXECUTE = false. Future SECURITY DEFINER person functions must explicitly revoke anon/authenticated. |

---

## Pending founder (not decided)

See `current-scope.md` — ICP, product count, verification legal meaning, Workspace pilot inclusion, P8/P9 roadmap approval.
