# Product Decisions Log

> **Product Bible:** [`../README.md`](../README.md) (`docs/00`–`docs/15`) is the canonical reading path. This charter/scope/decisions file remains binding in the SoT hierarchy.

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
| **Consequence** | Attestation path implemented under T8 (PD-2026-07-25c). Public copy must disclose when not independently verified. Kill switch `DELIVERX_VERIFIED_BADGE=off`. |

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
| **Consequence** | Slimmer `.github/workflows/verify.yml` (PR + dispatch); new `ci-e2e.yml`; TD-017/TD-018; both workflows disabled until minutes restored. Founder restores Actions billing/minutes → `gh workflow enable` → re-enable `on.push`. |

---

## PD-2026-07-25c — T8 authorized; Verified meaning frozen; T9 still blocked

| Field | Value |
| --- | --- |
| **Date** | 2026-07-25 |
| **Status** | Accepted |
| **Decision** | Founder utterance `t8` **authorizes Technology Phase T8 / product P8 only**: tokenised employer/third-party attestation for a **specific portfolio claim**; ledger write as `external_verification` + actor `external_employer`; `deliverxVerified` lights only when `verifier_status=externally_attested` **and** `evidence_strength=externally_verified` (extends PD-2026-07-06); global kill switch `DELIVERX_VERIFIED_BADGE=off`; dispute opens `pi_review_case` without capability rewrite; share/attest views strip private evidence and never expose attestor PII publicly; attestation person data in privacy export/purge. **Verified means:** an independent named attestor confirmed one claim via the attestation path — not a DeliverX whole-profile audit, not a ScoreRun threshold, not self-report, not learning completion. **T9 (commercial packaging / Stripe) remains blocked** until separate founder approval. No marketplace, networking scrape, or bulk employer accounts. |
| **Why** | Charter required founder approval before lighting Verified; `t8` is that approval for attestation without auto-authorizing monetisation. |
| **Consequence** | Migration `0094_external_attestation.sql`; `src/lib/external-attestation/`; `/api/portfolio/entries/[id]/attestations` + `/api/portfolio/attest/[token]`; `/portfolio/attest/[token]` UX; update build-charter / current-scope / technology-build-phases / next-steps. Do not implement Stripe or entitlements under this decision. |

---

## PD-2026-07-25d — Capability and verification writes are privileged at DB

| Field | Value |
| --- | --- |
| **Date** | 2026-07-25 |
| **Status** | Accepted |
| **Decision** | The database, not only Next.js, enforces the two highest-trust write boundaries. `pi_capability_score_runs` is authenticated-read-only and writable only through the server Capability Engine service-role path. `vpp_entries.verifier_status=externally_attested`, `evidence_strength=externally_verified`, and `pi_evidence_status_transitions.to_status=platform_verified` may be written only by narrow T8 service-role RPCs. ScoreRun UPDATE/DELETE remains forbidden except privacy purge DELETE under `app.pi_privacy_delete`. |
| **Why** | Owner-scoped `ALL` policies proved tenant isolation but did not prove authority. A user could previously fabricate capability or verification against their own rows through PostgREST, bypassing honest app guards. |
| **Consequence** | Migration `0095_db_trust_rail_lockdown.sql`; engine callers use `createAdminClient`; attestation store uses `pi_apply_vpp_attestation_state` and evidence append uses `pi_append_platform_verified_transition`; owner/non-owner live RLS regression tests are part of T6 security journeys. This decision does not authorize T9. |

---

## PD-2026-07-25e — Pilot honesty: no priced claims without checkout

| Field | Value |
| --- | --- |
| **Date** | 2026-07-25 |
| **Status** | Accepted |
| **Decision** | Until T9 / Stripe ships under separate founder approval, public marketing and signup copy must not present purchasable pound prices, “Buy” CTAs, or money-back / refund guarantees. Access language is **pilot access / Join the pilot / Get started**. Privacy, Terms and Cookies are interim pilot policies that describe real practices (PI data, ledger, observation consent default OFF, export/delete, attestation, essential auth cookies + optional Vercel analytics) and must not claim certifications DeliverX does not hold. Archetype stories are illustrative only; `PILOT_QUOTE` stays disabled until a real quote is approved. Launchpad marketing matches Career Intelligence as shipped (labelled readiness, roadmap, evidence CV→VPP, interview lab, applications) — not twin/networking/marketplace depth. |
| **Why** | Audit P0 honesty/legal findings: priced CTAs and refund language without checkout are trust and compliance failures; placeholder legal pages and decorative authority % violate Build Charter principles. |
| **Consequence** | Remediation Batch 2; `marketing-honesty.test.ts`; `/cookies` (+ `/cookie` alias); TD-011 advanced for commercial/marketing honesty (Verified in-app jargon pass remains for Batch 3 UX). Does not authorize T9. |

---

## PD-2026-07-25f — UX language: ScoreRun stays internal; Career Intelligence is the product name

| Field | Value |
| --- | --- |
| **Date** | 2026-07-25 |
| **Status** | Accepted |
| **Decision** | Founder utterance `approve batch 3` authorizes Remediation Batch 3 only: user-facing copy uses **capability assessment** language (Run assessment / Latest assessment / Update your capability profile) instead of “ScoreRun” as a primary CTA or heading. Internal identifiers (`ScoreRun`, APIs, DB, `runKind`) remain unchanged. **Career Intelligence** is the primary product name in Hub chrome and Launchpad app shell; `/launchpad` stays the route family. Workspace home must not pitch legacy Command Centre / Mission Control. PI review “Seed sample finding” is removed from production UI. Every Career readiness % keeps an explicit source label (assessment projection vs evidence-coverage heuristic); heuristics are never capability truth. Root metadata frames Professional Intelligence, not “AI Delivery Platform”. |
| **Why** | Audit UX P0/P1: engine jargon, dual Launchpad/Career naming, demo seed on a trust surface, and Command Centre pointers undermine T7 Professional Workspace primacy and calm professional language. |
| **Consequence** | `src/lib/ux/capability-assessment-copy.ts` + `capability-assessment-copy.test.ts`; Profile/Evidence/Hub/Career/Learning/Portfolio presentation renames; `review-queue-app` seed removed; readiness-honesty labels humanised. Full multi-shell IA consolidation remains deferred (R-P1-07 partial). Does not authorize T9, Next bump, CI restore, or T8 E2E. |

---

## PD-2026-07-25g — T8 Verified is E2E-gated; Next held at a patched security floor

| Field | Value |
| --- | --- |
| **Date** | 2026-07-25 |
| **Status** | Accepted |
| **Decision** | Founder utterance `approve batch 4` authorizes Remediation Batch 4 only: (1) Next.js is upgraded to a version **≥16.2.11** (shipped `16.2.12`) so the audited proxy/middleware-bypass, SSRF, and Server-Actions-DoS advisories are closed; the repo should not regress below this floor. (2) The `deliverxVerified` badge’s honest gate (`externally_attested` + `externally_verified`, kill switch respected) is now proven end-to-end by `e2e/t8-attestation.test.ts`, which runs in the live release gate. Verified must never light from ScoreRun, learning, self-report, share, or a pending/disputed/expired/fake attestation — only from a completed external attestor confirm. Private evidence must never surface on a public share, and users still cannot self-set Verified-bearing columns at the DB (Batch 1). |
| **Why** | Audit R-P1-02 (Verified-on path unproven live) and R-P1-03 / SEC-P1-01 (Next high advisories). Shipping T8 code without an automated attestor→Verified proof left the platform’s highest trust claim unverified; the Next advisories were an exploitable middleware/SSRF/DoS class. |
| **Consequence** | Next `16.2.9`→`16.2.12` + `eslint-config-next`; `e2e/t8-attestation.test.ts` wired into `test:release-gate:live`; `external-attestation` units added to the always-on gate and `test:pi`; `test:e2e:t8` added. Live gate now 40/40 (18 loop + 12 security + 10 T8). Does not authorize T9, and does not close founder-only TD-006 (Auth toggle) or TD-018 (Actions minutes), which remain documented-open. |

---

## PD-2026-07-26a — One signed-in suite navigation; Launchpad is product chrome

| Field | Value |
| --- | --- |
| **Date** | 2026-07-26 |
| **Status** | Accepted |
| **Decision** | Founder utterance `approve batch 5` authorizes Remediation Batch 5 only: (1) Signed-in primary surfaces share one journey nav — Hub · Profile · Experience · Launchpad · Workspace · Portfolio — via `ProductSuiteShell` / AppShell strip. Local side/rail navigation remains contextual (Workspace modules, Experience tools, Launchpad MVP modules). (2) **Launchpad** is the product chrome name in suite nav/Hub CTA; **Career Intelligence** remains the capability language *inside* Launchpad (clarifies PD-2026-07-25f dual naming). (3) Non-MVP Launchpad modules stay out of primary nav (routes may remain). (4) Public share/attest portfolio token routes stay outside the signed-in shell. (5) WCAG 2.2 AA core chrome/auth gaps close (named controls, skip links, auth live regions, readable chrome type, Launchpad mobile nav, Escape/focus on primary menus); whole-product AA is not claimed. Stable URLs and redirects are preserved. |
| **Why** | Audit R-P1-07 / R-P2-15: competing shells made DeliverX feel stitched together; accessibility gaps blocked a public-beta honesty bar. |
| **Consequence** | Shared suite shell; dead dark WorkspaceSidebar removed; a11y unit contracts; docs updated. Follow-ups: residual AT/axe live QA (Batch 6 closed engineering-owned residuals). Does not authorize T9. |

---

## PD-2026-07-26b — Experience honesty + residual a11y + TD-017 clear

| Field | Value |
| --- | --- |
| **Date** | 2026-07-26 |
| **Status** | Accepted |
| **Decision** | Founder utterance `approve batch 6` authorizes Remediation Batch 6 only: (1) Experience onboarding must not present decorative unexplained readiness % or Experience score as capability — qualitative self-reported setup bands with honesty labels; scenario workplace pulses labelled non-capability. (2) Bookmarkable demoted Twin / PMO / Marketplace surfaces get honest deferred banners, text chart alternatives / empty states, and named decorative icons — without inventing fake data or rewriting Mission Control into new product surfaces. (3) TD-017 fixture ESLint + standalone `tsc` debt is cleared so CI can run clean lint/typecheck when TD-018 restores Actions minutes. (4) TD-006 (leaked-password Auth toggle) and TD-018 (Actions minutes) remain founder-owned and are **not** flipped by this batch — document only. T9 / Stripe remain blocked. |
| **Why** | Constitution “no unexplained scores”; Batch 5 deferred residuals; CI will fail on fixture debt when workflows return. |
| **Consequence** | `setup-signal` helper; demoted banners; Twin KPI text summaries; `scheduleEffectWork`; TD-017 closed. VoiceOver/NVDA + authenticated axe remain founder/QA manual. |

---

## PD-2026-07-26c — Observation consent enforced at Postgres

| Field | Value |
| --- | --- |
| **Date** | 2026-07-26 |
| **Status** | Accepted |
| **Decision** | Workspace observation consent (default OFF; project override wins; revoke blocks NEW rows only) is enforced at the database boundary via migration `0096_consent_enforcement.sql`. Direct PostgREST and service-role inserts of `workspace_observations` or `workspace_observation` evidence without active consent are denied. There is no service-role GUC bypass for observation creation. Observation remains distinct from evidence and capability. |
| **Why** | Audit DB-P1-01 / R-P1-11 / PRIV-P1-01 — consent was app-only while RLS allowed own-row inserts. |
| **Consequence** | App maps DB consent errors to `consent_denied`; T6 live RLS covers consent negatives; T9 remains blocked. |

---

## PD-2026-07-26d — T9 authorized; Stripe-derived entitlements

| Field | Value |
| --- | --- |
| **Date** | 2026-07-26 |
| **Status** | Accepted |
| **Decision** | Founder utterance `approve t9` authorizes Technology Phase T9 / product P9. Pilot commercial model: **Experience £39/month**, **Launchpad £39/month**, **Complete Journey £59/month**. Complete Journey grants Experience + Launchpad + Professional Workspace. Professional Workspace / Team Copilot remains an included alias, **not a separately sold fourth SKU**. Stripe Checkout collects payment; Stripe Customer Portal manages cancellation. Webhook-confirmed subscriptions are the source of paid entitlements. Price IDs are env configuration. Experience and Launchpad enforce entitlements only when `DELIVERX_BILLING_ENFORCE=on`; default stays off until Stripe ops and test-mode smoke complete. |
| **Honesty / legal** | Public £ prices and “Start checkout” appear only when `STRIPE_SECRET_KEY` and all three `STRIPE_PRICE_*` IDs are configured. Otherwise marketing falls back to pilot access copy. There is **no money-back guarantee**. DeliverX stores Stripe customer/subscription identifiers but never full card numbers. |
| **Webhook policy** | Handle `checkout.session.completed` and `customer.subscription.created|updated|deleted`; verify Stripe signatures against raw request body; persist each Stripe event ID once; grant on active/trialing/past_due and revoke on terminal/non-access statuses. Webhook writes use service role; users have self-only billing reads. |
| **Privacy** | `billing_customers`, `billing_subscriptions`, and `billing_entitlements` are included in export/purge. Operational webhook idempotency rows are retained as non-person-owned audit records and contain no payment method/PAN payload. |
| **Why** | Restore an honest commercial surface only when checkout and access control work together; avoid decorative prices and avoid custom card handling. |
| **Consequence** | Migration `0097_stripe_entitlements.sql`; `src/lib/billing/`; `/api/billing/checkout|portal|entitlements|webhook`; `/billing/checkout|success`; Settings → Billing; Experience/Launchpad entitlement gates. Founder ops must create Stripe prices, configure Vercel env, register the webhook, enable portal, run test checkout, then enable enforcement. No marketplace or enterprise mission-control depth is authorized. |

---

## PD-2026-07-26e — B1 confidence-band algorithm pinned

| Field | Value |
| --- | --- |
| **Date** | 2026-07-26 |
| **Status** | Accepted |
| **Decision** | Founder utterance `Start Building B1` authorizes six-doc phase **B1**. Pin versioned confidence-band algorithm **`confidence-bands@2026.1`**. Capability bands remain existing engine levels (`emerging` / `developing` / `proficient` / `advanced` / `insufficient_evidence`). Internal confidence `[0,1]` maps only to display bands (`higher` / `moderate` / `lower`) — never decorative confidence %. Typed SoT: `src/lib/capability-engine/confidence-bands.ts`. Doc: [`../engineering/confidence-band-algorithm.md`](../engineering/confidence-band-algorithm.md). Extends PD-2026-07-05. |
| **Why** | Unexplained scores destroy trust; Schema §5.1 / SCH-BANDS / PACK-E3 required a versioned, explainable mapping before recommendation SM (B2) cites bands. |
| **Consequence** | SnapshotClaims / Profile / Career expose `confidenceBandAlgorithmVersion`. UI shows “Why this band”. No DB migration. ScoreRun / band mapping alone never lights Verified. Bump version string + doc together when thresholds change. |

---

## PD-2026-07-26f — FD-PACK-6 approved; B2 recommendation state machine

| Field | Value |
| --- | --- |
| **Date** | 2026-07-26 |
| **Status** | Accepted |
| **Decision** | Founder reply **`B2`** (after being told B2 requires FD-PACK-6) is treated as **explicit approval of FD-PACK-6** and authorization to build six-doc phase **B2**. Ship a canonical Professional Intelligence recommendation entity with lifecycle **`generated → viewed → accepted \| dismissed`**, plus **`accepted → completed \| dismissed`** so an accepted next action can be closed without silently mutating capability. One typed SoT (`src/lib/recommendations/`); products consume it and must not invent parallel recommendation truth. |
| **Chosen behavior** | Materialise recommendations from the latest capability snapshot (rationale + evidence references retained). User actions: mark viewed, accept, dismiss, complete. Accepting records intent and offers a deterministic internal `href` — it does **not** create plans, write capability, or light Verified. Feature flag `DELIVERX_RECOMMENDATION_SM` defaults **off** until pilot. Append-only `pi_recommendation_events` audit. Self-only RLS. Migration `0098_pi_recommendations.sql`. |
| **Why** | FR-010 / TRD-SM-REC / PACK-E2 require explainable, dismissible next actions with retained rationale; Profile/Career CTAs alone were Partial. |
| **Consequence** | B2 authorized and shipped under this decision. FD-PACK-6 closes. Remaining FD-PACK-* stay pending. |

---

## PD-2026-07-26g — B3 pilot KPIs use Vercel Analytics; PostHog deferred

| Field | Value |
| --- | --- |
| **Date** | 2026-07-26 |
| **Status** | Accepted |
| **Decision** | Founder message **“B3 pilot KPIs — Vercel Analytics path can start now; PostHog sink needs FD-PACK-7”** authorizes six-doc phase **B3** on the existing Vercel Analytics path. Pilot KPI events use one typed, privacy-allowlisted catalogue and emit only after real state changes. No analytics database table is added. PostHog is not installed or configured as a product analytics sink; FD-PACK-7 remains open for that separate decision. |
| **Privacy / control** | Third-party event properties exclude PII and free-text evidence. No user ID is required. Server emission defaults on only in Vercel production and can be killed with `DELIVERX_ANALYTICS=off`; client signup emission can be killed with `NEXT_PUBLIC_DELIVERX_PILOT_KPIS=off`. Setting `DELIVERX_ANALYTICS=posthog` emits nothing. |
| **Why** | Existing Vercel Web Analytics provides the smallest coherent PACK-E8 path without adding a second SDK, event warehouse, or speculative abstraction. Real transitions provide pilot evidence-loop signal; page-view theatre does not. |
| **Consequence** | B3 / PACK-E8 ships with `src/lib/analytics/` and [`../engineering/pilot-kpi-instrumentation.md`](../engineering/pilot-kpi-instrumentation.md). PACK-E9 is resolved only for the current pilot path (Vercel now); PostHog remains explicitly deferred pending FD-PACK-7. |

---

## PD-2026-07-26h — FD-PACK-5 approved; B4 human reviewer ops (non-Verified)

| Field | Value |
| --- | --- |
| **Date** | 2026-07-26 |
| **Status** | Accepted |
| **Decision** | Founder reply **`B4`** (after being told B4 requires FD-PACK-5) is treated as **explicit approval of FD-PACK-5** and authorization to build six-doc phase **B4**. Ship human reviewer ops as a **pilot dispute path that does not grant `deliverxVerified`**. Verified remains T8 external attestation only (CX-04 modify). |
| **Chosen behavior** | Reuse `0073` `pi_review_*` + `src/lib/pi-review/`; harden `/api/pi/review/*` behind `DELIVERX_REVIEWER_QUEUE` (default **off**); queue UI with mandatory rationale and explicit “does not grant Verified” copy; ops playbook `docs/engineering/reviewer-ops-playbook.md`; notifications on case transitions; trust guards reject Verified/capability write payloads; AI-assisted admin decisions require citations. No new capability writer; revise queues reassessment only. No DB migration required (prefer reuse). |
| **Why** | FR-007 remainder / FLOW-REVIEWER / PACK-E5 / R-P2-09 required a usable ops queue without replacing Capability Engine + T8. |
| **Consequence** | B4 authorized and shipped under this decision. FD-PACK-5 closes. Founder must set `DELIVERX_REVIEWER_QUEUE=on` in Vercel to open the queue in production. Remaining FD-PACK-* stay pending. |

---

## PD-2026-07-26i — FD-PACK-3 approved; B5 eight-step conversational onboarding

| Field | Value |
| --- | --- |
| **Date** | 2026-07-26 |
| **Status** | Accepted |
| **Decision** | Founder reply **`b5`** (after being told B5 requires FD-PACK-3, default if silent “keep 6-step”) is treated as **explicit approval of FD-PACK-3** and authorization to build six-doc phase **B5**. Selecting the phase cannot mean the no-op default, so the direction is: **evolve** the shipped six-step PI onboarding toward the pack's eight-step discovery conversation. Modify, do not rebuild — existing step ids, payload fields, API and session table are reused. |
| **Chosen shape** | `welcome → identity (background) → targets (career direction) → strengths → evidence → working_style → review → path (recommendation)`. Pack steps map onto shipped ids: Background = `identity` (name, professional identity, current situation), Career direction = `targets` (objective, target role, seniority, timeframe, industries), Review = `review` (read-back summary **plus** the consent and visibility rail moved off the retired `consent` step). `strengths` and `working_style` are new; `situation` and `consent` are retired ids that stay resolvable so in-progress sessions resume instead of restarting. |
| **Trust rails** | Self-assessed strengths are recorded as a **self-reported claim** and are explicitly labelled as “not a capability level, score or Verified status”. Onboarding writes no ScoreRun, no capability, no ledger evidence and cannot light `deliverxVerified`. Consent to analysis and default visibility remain mandatory before completion. `strengths`, `evidence` and `working_style` are skippable without penalty; skips are recorded honestly and reported in the recommendation rationale as limited data. |
| **Why** | FR-003 / UX-ONB-8 / PACK-E6 required a discovery conversation rather than an administrative form, with explicit claim labels, an editable identity summary and an explained first recommendation. The prior six-step set had no welcome, no self-assessment, no working-style personalisation and no review-before-use. |
| **Rollback / flag** | `DELIVERX_ONBOARDING_STEP_SET` selects the step-set version: unset (or `v2-conversation`) ships the eight-step shape; `v1-six-step` restores the previously shipped set with no redeploy, no migration and no data loss. Migration `0099_pi_onboarding_step_sets.sql` widens the `current_step` check to the union of both sets. |
| **Consequence** | B5 authorized and shipped under this decision. FD-PACK-3 closes; PACK-E6 closes. Onboarding step count changes, so `onboarding_pi_completed` now carries `step_set`, `step_count` and `steps_skipped` to keep the B3 activation KPI interpretable across shapes. Remaining FD-PACK-* stay pending. |

---

## PD-2026-07-26j — FD-PACK-4 approved; B6 Xperience entry ceremony

| Field | Value |
| --- | --- |
| **Date** | 2026-07-26 |
| **Status** | Accepted |
| **Decision** | Founder reply **`B6`** (after being shown B6 as gated on FD-PACK-4, default if silent "Day-1 is enough") is treated as **explicit approval of FD-PACK-4** and authorization to build six-doc phase **B6**. Selecting the phase cannot mean the no-op default, so the direction is: **add** a calm entry ceremony as UX depth around the existing Day-1 Experience loop. Reuse the 12-company catalogue (`0079`), Experience planner and Day-1 sim — do not rebuild Experience. |
| **Chosen shape** | A narrative entry that plays after the offer is accepted and the workspace is generated, before the dashboard opens: **company welcome → role → team → project → first activity**. All content is derived from the already-generated `ExperienceSimState` (company, role, team/stakeholders, project, first decision/meeting). Typed SoT `src/lib/xperience/entry-ceremony.ts` (step machine + content derivation + flag); UI `src/components/xperience/entry-ceremony.tsx`. Skip is allowed on every step; the stepper allows jumping between steps; the last step's CTA enters the workspace. |
| **Trust rails** | Ceremony is narrative only. It invents no scores or readiness %, writes no capability, creates no ledger evidence and cannot light `deliverxVerified`. An always-present honesty line states evidence is only recorded once the candidate acts inside the workspace. Observation consent stays default OFF and is untouched — no auto-observation. Copy must not market Day-1 depth as a full multi-week simulation. |
| **DB / API** | **None.** The ceremony is UI-only over existing entities; the sim state is already returned by `POST /api/xperience/experience/start` and held client-side. No migration (`0099` remains prod head); no new API route. |
| **Rollback / flag** | `DELIVERX_XP_ENTRY_CEREMONY` is a kill-switch that **defaults ON** so the ceremony ships with the Experience entry; set `off` (or `0`/`false`/`disabled`) to roll back to the previous direct-to-dashboard flow with no redeploy and no data change. Resolved server-side in the Experience app page and passed to the client. |
| **Why** | FR-005 remainder / FLOW-XP-ENTRY / UX-XP / PACK-E4 required a coherent organisation→project entry narrative. Day-1 + catalogue already proved the loop, but arrival jumped straight to the dashboard with no sense of company, role, team or project. |
| **Consequence** | B6 authorized and shipped under this decision. FD-PACK-4 closes; PACK-E4 closes. `src/lib/xperience` joins the `test:pi` gate. No founder env action required — the ceremony is the default; the only ops lever is the optional `off` kill-switch. Remaining FD-PACK-* (1/2/7/8) stay pending. |

---

## PD-2026-07-26k — FD-PACK-8 approved; B7 app-shell global search + help

| Field | Value |
| --- | --- |
| **Date** | 2026-07-26 |
| **Status** | Accepted |
| **Decision** | Founder reply **`B7`** (after being shown B7 as gated on FD-PACK-8, default if silent "Defer search") is treated as **explicit approval of FD-PACK-8** and authorization to build six-doc phase **B7**. Selecting the phase cannot mean the defer default, so the direction is: **add** app-shell global search + help as shell utilities — not an Insights product Home (CX-05). |
| **Chosen shape** | Typed searchable catalogue of destinations + help articles in `src/lib/global-search/`; Cmd/Ctrl+K dialog in ProductSuiteShell; `/help` orientation page; `GET /api/pi/search?q=` returns catalogue hits plus the caller's own evidence, projects (`created_by`), artefacts, and Experience enrolments. Routes only into Profile, Experience, Launchpad, Workspace, Portfolio, Settings, and Help. |
| **Trust rails** | Self-only search (explicit owner filters + auth); no Insights nav item; no unexplained scores or decorative readiness; no PostHog (FD-PACK-7); no payments / marketplace; no third SKU. |
| **DB / API** | **No migration.** New `GET /api/pi/search?q=` only. |
| **Rollback / flag** | `DELIVERX_GLOBAL_SEARCH` kill-switch **defaults ON**; set `off` (or `0`/`false`/`disabled`) to hide shell search/help chrome and 404 the API with no redeploy and no data change. |
| **Why** | UX-SHELL / PACK-E7 required findability without inventing a third product surface. |
| **Consequence** | B7 authorized and shipped under this decision. FD-PACK-8 closes; PACK-E7 closes. `src/lib/global-search` joins the `test:pi` gate. Remaining FD-PACK-* (1/2/7) stay pending. |

---

## PD-2026-07-26l — B8 thin admin org/project config (founder OK on depth)

| Field | Value |
| --- | --- |
| **Date** | 2026-07-26 |
| **Status** | Accepted |
| **Decision** | Founder reply **`B8`** (after being shown B8 as needing founder OK on depth) is treated as **authorization to build six-doc phase B8 at the thin depth** specified in the phase plan — not enterprise mission-control, not a third SKU, not marketplace liquidity, not a full competency CMS. |
| **Chosen shape** | First-class Pilot admin at `/settings/admin`: organisation config, project config (name/goal/delivery type/status), departments/teams (reuse `0093` org-structure), membership assign. Typed SoT `src/lib/pilot-admin/`; permissioned `/api/org/config` + `/api/org/projects`; audited via existing `audit_events`. Framework pin `pm-core@2026.1` shown read-only (reuses admin-framework seed). |
| **Trust rails** | Org-admin gate (pm \| executive) + kill-switch `DELIVERX_PILOT_ADMIN` (default on). Config mutations never write evidence, ScoreRuns, or light Verified. Explicit audit note on the surface. No PostHog; no payments; no migration. |
| **DB / API** | **No migration** (`0099` remains prod head). New permissioned APIs only; org-structure create paths also append audit metadata. |
| **Rollback / flag** | `DELIVERX_PILOT_ADMIN=off` (or `0`/`false`/`disabled`) hides `/settings/admin` and 404s config APIs with no redeploy. |
| **Why** | FR-011 / FLOW-ADMIN required a permissioned, audited pilot operator path. Existing pieces were scattered (settings org form, workspace team structure, framework seed APIs) without a first-class thin admin surface. |
| **Consequence** | B8 authorized and shipped under this decision. FR-011 / FLOW-ADMIN marked Built (thin). Remaining FD-PACK-* (1/2/7) stay pending. Enterprise CMS / mission-control depth stays founder-gated. |

---

## PD-2026-07-26m — B9 NFR polish authorized (founder reply `b9`)

| Field | Value |
| --- | --- |
| **Date** | 2026-07-26 |
| **Status** | Accepted |
| **Decision** | Founder reply **`b9`** is treated as **authorization to build six-doc phase B9** scoped to residual rate-limit / failure-recovery / activity-SM honesty (R-P2-06, FLOW-FAIL, TRD-SM-ACTIVITY). **No new FD-PACK** required per phase plan. |
| **Chosen shape** | Per-user PI API rate limit (`0101` + `DELIVERX_PI_RATE_LIMIT*` env); shared PI error codes + AI 429 `Retry-After`; intervention + Experience activity state-machine honesty with clear 409 on invalid transitions. |
| **Trust rails** | Limits must not break legitimate pilot flows (default 90/min); kill-switch available; honest failures only; activity transitions never assign capability or light Verified. TD-018 stays founder-ops — shipping does not claim CI restored. |
| **DB / API** | Migration `0101_pi_api_rate_limits.sql`. Same PI routes; documented 429/409 contracts. |
| **Rollback / flag** | `DELIVERX_PI_RATE_LIMIT=off` (or `0`/`false`/`disabled`) bypasses PI rate limiting with no redeploy. |
| **Why** | Pack NFR-SEC / TRD-SEC-RATE / FLOW-FAIL / TRD-SM-ACTIVITY remainder needed pilot hardening without new SKUs. |
| **Consequence** | B9 authorized and shipped under this decision. R-P2-06 closed. Remaining FD-PACK-* (1/2/7) stay pending. |

---

## PD-2026-07-26n — Screen Pack 01 accepted as design source of truth

| Field | Value |
| --- | --- |
| **Date** | 2026-07-26 |
| **Status** | Accepted |
| **Decision** | Founder request for the “first complete screen pack” accepts [`../design/screen-pack-01/README.md`](../design/screen-pack-01/README.md) as the design source of truth for marketing, authentication, the shipped eight-step PI onboarding evolution, and the unified signed-in `/profile` home. The same pack design-approves future money UI, an employer evidence proposition, deep Team Copilot / Professional Workspace, and a full Launchpad suite IA, while explicitly separating design approval from build authorization. |
| **Build disposition** | Homepage, How it works, honest current-product marketing, auth, eight-step onboarding refinements and a unified `/profile` home are **Pack-1 implementable now** as separate vertical slices. Launchpad redesign must be phased over shipped foundations, not a big-bang rewrite. Proposed pricing amounts, employer marketplace liquidity and deep programme / delivery-health / executive Team depth remain **build-gated** and require separate founder build approval plus relevant operations. |
| **Commercial constraint** | The pack records the founder draft £500 / £250 / £500 / £800 table as **proposed packaging only**. It does not supersede PD-2026-07-26d’s accepted T9 catalogue. No proposed amount or purchase CTA may go public until a later packaging decision reconciles the catalogue, live Stripe is configured and smoke-tested, and `DELIVERX_BILLING_ENFORCE` is explicitly decided. No money-back or job guarantee. |
| **Trust rails** | Work, self-report, imports, AI observation, learning and capability assessments never light Verified alone. Source labels remain explicit; capability is written only by the Capability Engine; observation consent defaults OFF; AI remains contextual and draft-labelled; no unexplained scores. |
| **Why** | A complete design reference reduces page-by-page drift while preserving the Build Charter’s distinction between design exploration and authorised product expansion. |
| **Consequence** | Future Cursor implementation prompts must cite the pack screen and implement one bounded slice at a time. Existing routes/data are evolved rather than rebuilt. Marketplace liquidity, fourth-SKU packaging and enterprise mission-control remain blocked until separately decided. |

---

## PD-2026-07-26o — Contextual Home + Daily Briefing (founder dashboard architecture)

| Field | Value |
| --- | --- |
| **Date** | 2026-07-26 |
| **Status** | Accepted |
| **Decision** | Ship a **contextual Home + Daily Briefing** as the next vertical slice on canonical `/profile` (post-login candidate landing). Home adapts to journey state (A–D) and answers five questions in under ~10s. Insights remain **content inside Home / PI / Launchpad** — not a fifth suite nav product (reaffirms B7 / CX-05). |
| **Chosen shape** | Typed SoT `src/lib/contextual-home/`; deterministic `resolveHomeState` + `buildDailyBriefing` (template prose v1, no LLM); ProfileCentre above-fold briefing; kill-switch `DELIVERX_CONTEXTUAL_HOME` default **on**. Design: [`../design/contextual-home-daily-briefing.md`](../design/contextual-home-daily-briefing.md). |
| **Charter gates (enforced)** | No unexplained % / “Excellent” health; no nav emoji; Verified counts only from T8 attestation; Learning ≠ capability; ScoreRun ≠ Verified; Team Copilot **executive** Dashboard 5 **deferred** — thin Workspace summary card + link only. |
| **Trust rails** | Briefing cites real entities; `capabilityAssigned: false`; never inflates Verified; fails independently without blanking Profile; reuses SnapshotClaims / recommendations / Experience / onboarding — no parallel PI truth. |
| **Analytics** | B3 catalogue adds privacy-safe `home_briefing_viewed` + `home_primary_cta_clicked` (`surface`, `home_state`, `cta_kind`). |
| **Why** | Founder dashboard architecture hypothesis: static widget homes fail; Daily Briefing gives start-of-workday clarity while staying inside Build Charter. |
| **Consequence** | Contextual Home authorized and shipped under this decision. Team Copilot executive OS and Insights-as-product remain gated. Launchpad-primary heuristics may be tightened later without a new SKU. |

---

## PD-2026-07-26p — Marketing footer IA + shipped-product sync

| Field | Value |
| --- | --- |
| **Date** | 2026-07-26 |
| **Status** | Accepted |
| **Decision** | Public marketing footer follows the simplified IA: **Product** (Experience, Launchpad, Professional Workspace, How it works), **Platform** (Professional Intelligence anchor, Pilot access, Resources, Team Copilot as Workspace alias), **Company** (About + Privacy / Terms / Cookies), **Account** (Sign in / Start). No Contact or public Portfolio footer links until those routes exist. Marketing homepage + product pages sync to **verified shipped** capabilities only. |
| **Sync rules** | May mention Daily Briefing on `/profile`, explainable recommendations (B2 flag on), evidence ledger, Capability Engine bands, Experience ceremony/sim, Launchpad Career Intelligence modules, thin Professional Workspace, privacy export/delete, observation consent default OFF. Must not present live purchasable £ checkout, employer marketplace liquidity, Insights-as-product, Career Twin naming, decorative readiness %, or enterprise mission-control as shipped depth. Team Copilot remains alias — not a third SKU. |
| **Why** | Founder asked to enhance the footer and keep landing copy honest against the backend/product that is actually shipped. |
| **Consequence** | `src/lib/marketing/footer-data.ts` + `MarketingFooter`; honesty tests cover footer routes + sync claims; screen-pack footer notes updated. Does not authorize Stripe live enablement, marketplace, or deep Team Copilot. |

---

## PD-2026-07-26q — Marketing header shell + invite-only beta gate

| Field | Value |
| --- | --- |
| **Date** | 2026-07-26 |
| **Status** | Accepted |
| **Decision** | Marketing chrome (shell + sticky primary nav) lives in `(marketing)/layout` so route changes do not remount/jump the header. Primary nav always shows the full four links (How it works · Experience · Launchpad · Professional Workspace) with active page indication — never filter out the current route. Header CTA stays **Start → /signup**; product-specific CTAs remain in heroes. Invite-only beta may proceed with payments off; founder ops (SMTP, TD-006, invite list) gate invites. |
| **Why** | Founder reported jumpy/incomplete header pages and asked for a production-ready beta verdict. |
| **Consequence** | [`beta-launch-readiness.md`](../engineering/beta-launch-readiness.md). Does not enable billing, reviewer queue, or claim WCAG AA without AT lab. |

---

## PD-2026-07-26r — Marketing type scale +12.5%

| Field | Value |
| --- | --- |
| **Date** | 2026-07-26 |
| **Status** | Accepted |
| **Decision** | While `.marketing-page` is mounted, set `html { font-size: 112.5% }` (16px → 18px) so rem-based marketing type scales ~12.5%. Convert fixed `10px` marketing labels to `0.6875rem` so they track the scale. Raise marketing nav height 64→68px. Signed-in suite keeps the default root size. |
| **Why** | Founder: marketing text looks small; prefer systematic rem bump over one-off class spam. |
| **Consequence** | `globals.css` `html:has(.marketing-page)`; `mktClass.label` + marketing mono labels; `mkt.navH`. Product-mock microcopy and any remaining `px` labels stay intentionally small. |

---

## PD-2026-07-26s — Marketing copy: no em dashes, emojis, or AI garnish

| Field | Value |
| --- | --- |
| **Date** | 2026-07-26 |
| **Status** | Accepted |
| **Decision** | Public marketing and legal surfaces avoid em dashes, emojis, decorative symbols, empty “AI-powered” garnish, and buzzword stacks. Prefer plain punctuation (period, comma, colon, parentheses) and calm product English. Honest mentions of AI colleagues, AI drafts, and AI teammates stay where accurate. Product name **Complete Journey** and brand line **AI Product Experience Company** remain. |
| **Why** | Founder: remove em dashes, emojis, and anything that looks or sounds like generic AI marketing. |
| **Consequence** | Marketing data + components updated; role-preview mocks drop decorative glyphs and unexplained readiness %; honesty tests remain the gate. Engineering comments and Product Bible not rewritten wholesale. |

---

## PD-2026-09-04 — Phase 2 discovery flagship guides

| Field | Value |
| --- | --- |
| **Date** | 2026-09-04 |
| **Status** | Accepted |
| **Decision** | Ship two charter-honest flagship marketing guides under Resources: `/resources/pm-portfolio` and `/resources/star-interview-stories`. Link from Resources, About, home CTA band, and Launchpad secondary CTA. Add both paths to `sitemap.ts`. No billing, marketplace, fake scores, or Phase 3 payments work. |
| **Why** | Founder authorized Phase 2 discovery content after soft-launch SEO tech work; organic reach needs depth without inventing product capabilities. |
| **Consequence** | GSC sitemap resubmit + Ubersuggest keyword retarget remain founder ops. Honesty tests cover guide copy. |

---

## Pending founder (not decided)

See `current-scope.md` — ICP weight, TD-006 (leaked-password protection), TD-018 (Actions minutes). T8 Verified meaning is frozen in PD-2026-07-25c; its E2E gating is clarified in PD-2026-07-25g. T9 commercial packaging is settled in PD-2026-07-26d. B1 bands algorithm is settled in PD-2026-07-26e. **FD-PACK-6 / B2** is settled in PD-2026-07-26f. B3's Vercel path is settled in PD-2026-07-26g; **FD-PACK-7 remains pending only for a PostHog sink**. **FD-PACK-5 / B4** is settled in PD-2026-07-26h. **FD-PACK-3 / B5** is settled in PD-2026-07-26i. **FD-PACK-4 / B6** is settled in PD-2026-07-26j. **FD-PACK-8 / B7** is settled in PD-2026-07-26k. **B8 thin admin depth** is settled in PD-2026-07-26l. **B9 NFR polish** is settled in PD-2026-07-26m.

### Pending — Six-doc pack build-out (FD-PACK-*, 2026-07-26)

Recorded from the founder Six Document Build Pack gap check + [`../engineering/six-doc-build-phases.md`](../engineering/six-doc-build-phases.md). Defaults apply if silent; **B1–B9 shipped**; no Bn beyond those should start without the matching decision.

| ID | Decision | Default if silent | Blocks |
| --- | --- | --- | --- |
| **FD-PACK-1** | Treat six-doc pack as advisory under Bible + Charter, or elevate into SoT? | Advisory under Bible | B0 framing |
| **FD-PACK-2** | Copy pack into `docs/build-pack/`? | Skip until asked | B0 |
| **FD-PACK-3** | Keep shipped 6-step PI onboarding vs evolve toward pack 8-step conversation? | **Settled — evolve to 8-step (PD-2026-07-26i)** | — |
| **FD-PACK-4** | Invest in Xperience entry ceremony vs Day-1 sufficiency for pilot? | **Settled — build ceremony (PD-2026-07-26j)** | — |
| **FD-PACK-5** | Human reviewer queue as pilot ops path (**not** Verified badge path)? | **Settled — yes, non-Verified ops (PD-2026-07-26h)** | — |
| **FD-PACK-6** | Formal recommendation state machine (FR-010) now? | **Settled — yes (PD-2026-07-26f)** | — |
| **FD-PACK-7** | Add a PostHog product analytics sink after the Vercel pilot path? | Stay Vercel; PostHog optional later | PostHog sink only (B3 Vercel path shipped) |
| **FD-PACK-8** | App-shell global search/help (explicitly **no** Insights product Home)? | **Settled — build search + help (PD-2026-07-26k)** | — |

**Already settled (do not reopen via pack):** money-back/guarantee rejected; 12-company catalogue; Verified = T8 attestation; Team Copilot = Workspace alias not third SKU; learning ≠ capability; consent default OFF; T9 SKUs / payments-later ops; **B1 confidence bands `confidence-bands@2026.1`**; **B2 recommendation SM (FD-PACK-6)**; **B4 reviewer ops non-Verified (FD-PACK-5)**; **B5 eight-step onboarding (FD-PACK-3)**; **B6 Xperience entry ceremony (FD-PACK-4)**; **B7 shell search + help (FD-PACK-8)**; **B8 thin pilot admin (PD-2026-07-26l)**; **B9 NFR polish (PD-2026-07-26m)**; **Contextual Home + Daily Briefing (PD-2026-07-26o)** — Insights not a nav product; Team Copilot executive deferred.
