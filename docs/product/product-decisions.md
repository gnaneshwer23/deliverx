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

## PD-2026-07-16 — TD-006 leaked-password: founder dashboard (or PAT), not agent SQL

| Field | Value |
| --- | --- |
| **Date** | Jul 2026 |
| **Status** | Pending founder |
| **Decision** | Keep HaveIBeenPwned leaked-password protection as a **founder/ops Auth toggle** (or Management API `password_hibp_enabled` with a personal access token). Do not invent SQL/MCP workarounds; do not mark TD-006 Closed until security advisors clear. |
| **Why** | Advisor WARN remains; feature is Pro+ Auth config; agent env has no Management API token and MCP only reads advisors. |
| **Consequence** | Runbook [`docs/engineering/runbook-leaked-password-protection.md`](../engineering/runbook-leaked-password-protection.md); one-click [Attack Protection](https://supabase.com/dashboard/project/jibmyxaldetyycmtlxet/auth/protection). |

---

## PD-2026-07-17 — T4 AI orchestration trust layer (registry, not chat-as-DB)

| Field | Value |
| --- | --- |
| **Date** | Jul 2026 |
| **Status** | Accepted |
| **Decision** | Ship founder §11 agent framework as **trust infrastructure**: in-code + DB agent registry (`line_manager`, `stakeholder`, `observer`, plus consolidated `experience_coach` / `workspace_coach` / `interview_lab`), immutable prompt versions, request-time context builder (system instructions separate from organisation data), structured output contracts, prompt-injection guardrails, authority boundaries (no capability writes outside ScoreRun; no verified-evidence mutation; consequential actions need explicit confirmation), and mandatory cost/latency logging on `ai_interactions`. Chat history is not the primary database — conversations are bound to project/activity. Existing Experience / Helm / Interview Lab behaviour is consolidated into the registry, not rewritten. Full “AI Line Manager product UX” Home remains approval-gated. |
| **Why** | Step 11 was Partial (delivery prompts + `agent_workflow_runs` without formal PI agent/prompt/cost registry). Pilot trust requires provenance, guardrails, and explainable structured outputs before expanding agent surfaces. |
| **Consequence** | Migration `0090`; `src/lib/ai-orchestration/`; `GET /api/pi/ai/interactions`; mock-model CI tests. Founder override (`t4`) of T0–T3 audit gate while TD-001 remains open. Do not start T5 until asked. |

---

## PD-2026-07-18 — Founder override of T0 gate for T4

| Field | Value |
| --- | --- |
| **Date** | Jul 2026 |
| **Status** | Accepted |
| **Decision** | User utterance `t4` is an explicit override of the T0–T3 audit gate (TD-001 signed-in QA still open; pre-existing typecheck errors and lint debt flagged but not blocking under override). Same pattern as T1–T3 founder overrides. |
| **Why** | Pilot hardening of the AI trust layer is authorised now; signed-in QA remains a parallel open track (T0 → T6). |
| **Consequence** | Document override in technology-build-phases, current-scope, implementation-log; do not claim T0 PASS. |

---

## PD-2026-07-19 — T5 notifications consolidate person attention

| Field | Value |
| --- | --- |
| **Date** | Jul 2026 |
| **Status** | Accepted |
| **Decision** | Use one self-only `pi_notifications` inbox for person Professional Intelligence. Migrate legacy `pi_review_notifications` history, route future review writes into the consolidated module, project intervention offers and privacy domain events idempotently, and keep tenant-scoped Slack/Teams `notification_deliveries` separate. T5 is in-app only; no new email provider or channel expansion. Every item has an internal contextual link and delivery/read audit. Notifications never write capability, verified evidence, or verification state. |
| **Why** | Review stubs, intervention prompts and privacy events were fragmented. A third parallel inbox or speculative email infrastructure would increase ambiguity and privacy risk without improving the pilot loop. |
| **Consequence** | Migration `0091`; `src/lib/notifications/`; `GET/PATCH /api/pi/notifications`; Profile bell/list/mark-read; T1 export/purge extended; `pi_ai_usage_daily` security-invoker ops read model. |

---

## PD-2026-07-20 — Founder override of T0 gate for T5

| Field | Value |
| --- | --- |
| **Date** | Jul 2026 |
| **Status** | Accepted |
| **Decision** | User utterance `t5` explicitly authorises T5 while T0 signed-in QA and TD-006/TD-016 remain open. |
| **Why** | T5 is authorized pilot observability work and the user explicitly directed shipment without waiting for the parallel T0 founder-login dependency. |
| **Consequence** | T5 may ship; do not claim T0 PASS and do not proceed to T6 unless asked. Open debt remains unchanged. |

---

## PD-2026-07-21 — RLS helpers retain authenticated EXECUTE

| Field | Value |
| --- | --- |
| **Date** | Jul 2026 |
| **Status** | Accepted |
| **Decision** | Every DeliverX SECURITY DEFINER function must deny anonymous/PUBLIC execution. Privileged mutations remain service-role or owner-only. `current_org_id`, `is_workspace_project_member`, and `pi_cf_version_is_readable` retain authenticated EXECUTE only because active RLS policies depend on them. |
| **Why** | Blanket revocation would break organisation, requirements and framework RLS. The three helpers are narrow, caller-scoped/read-only policy primitives; direct anonymous RPC exposure is unnecessary. |
| **Consequence** | Migration `0092`; TD-016 closed. Advisor 0028 findings clear, while the three advisor 0029 findings remain intentionally documented and protected by role-simulation regression probes. Future SECURITY DEFINER functions must declare a fixed `search_path` and explicit EXECUTE grants in the creating migration. |

---

## PD-2026-07-25 — T7 authorized; T8/T9 still blocked

| Field | Value |
| --- | --- |
| **Date** | 2026-07-25 |
| **Status** | Accepted |
| **Decision** | Founder utterance `t7` **authorizes Technology Phase T7 only**: Launchpad packaging honesty (SnapshotClaims + labelled / mixed heuristic readiness), Professional Workspace foundations (demote legacy Mission Control / Ecosystem / marketplace nav), and thin org structure (`departments`, `teams`, membership) under existing org RLS + org-admin write gates. **Team Copilot is not a third SKU** — it remains the Professional Workspace alias (extends PD-2026-07-11). Org data is structured and retrieved at request time; no PI data duplication; observation ≠ evidence; capability only via ScoreRun. **T8 (external attestation / Verified lighting) and T9 (commercial packaging) remain blocked** until separate founder approval. TD-006 remains founder-only. |
| **Why** | Charter marked T7–T9 as requiring founder approval; `t7` is that approval for T7 depth without auto-authorizing attestation or monetisation. |
| **Consequence** | Migration `0093_org_structure.sql`; `src/lib/org-structure/`; `/api/org/*`; workspace nav policy; readiness `mixed` source; privacy cascade for membership rows; update build-charter / current-scope / technology-build-phases. Do not implement employer attestation, networking scrape, or Stripe under this decision. |

---

## PD-2026-07-25b — Push CI gate is release-gate + build (Playwright manual)

| Field | Value |
| --- | --- |
| **Date** | 2026-07-25 |
| **Status** | Accepted |
| **Decision** | Default GitHub Actions runs unit tests, `npm run test:release-gate`, and `npm run build` on pull requests and `workflow_dispatch`. Full-repo ESLint stays advisory. Playwright smoke/17-AC runs only via `.github/workflows/ci-e2e.yml` (`workflow_dispatch`). **Push-to-main auto-CI is temporarily disabled** until private-repo Actions minutes/spending limit are restored (TD-018); then re-enable `on.push`. |
| **Why** | Private-repo Actions minutes were exhausted (0-job failures emailing on every push). Chromium install + dual Playwright suites burned the included pool without improving the T6 release signal already covered by `release-gate`. Continuing push triggers while jobs cannot schedule only spam failure emails. |
| **Consequence** | Slimmer `.github/workflows/ci.yml` (PR + dispatch); new `ci-e2e.yml`; TD-017/TD-018; docs in release-readiness + implementation-log. Founder restores Actions billing/minutes, then re-enables `on.push`. |

---

## Pending founder (not decided)

See `current-scope.md` — ICP weight, commercial SKU packaging (T9), verification legal meaning (T8), TD-006 (leaked-password protection), TD-018 (Actions minutes). T8/T9 require explicit separate approval.
