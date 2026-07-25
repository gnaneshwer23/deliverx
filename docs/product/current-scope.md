# Current Scope

**Active phase:** Post-P7 pilot hardening — **Technology T7 shipped** (founder-authorized 2026-07-25); T0 PASS (automated); TD-001 closed; T1–T6 shipped; TD-016 closed  
**As of:** 2026-07-25  
**Charter:** [`build-charter.md`](./build-charter.md)  
**Technology plan:** [`../engineering/technology-build-phases.md`](../engineering/technology-build-phases.md) (T0–T9)  
**T0 status:** **PASS (automated)** — signed-in P0–P7 loop verified by T6 harness (`docs/qa/t0-results.md`). Optional founder visual review remains.  
**T1 status:** **Shipped** — person PI export/delete (`0086`, `/api/pi/privacy/*`, settings UX); TD-004/005 closed; TD-006 documented (Auth dashboard).  
**T2 status:** **Shipped** — rubric/DB coherence (`0087`, resolve source `db | in_code_fallback`, pin assert on capability run, golden ScoreRun harness); TD-009 closed.  
**T3 status:** **Shipped** — artefact versioning + submission coherence (`0088`; `artefacts` / `artefact_versions` / `artefact_status_transitions`; immutable prior versions; evidence cites `artefact_version_id`; privacy cascade extended; settings panel). Hotfix `0089` locks the person-purge RPC to `service_role` only.  
**T4 status:** **Shipped** — AI orchestration trust layer (`0090`; `ai_agents` / `ai_prompt_versions` / `ai_interactions`; `src/lib/ai-orchestration/`; Manager/Stakeholder/Observer + consolidated coaches; guardrails; mock-model tests; `GET /api/pi/ai/interactions`).  
**T5 status:** **Shipped** — person PI notifications + observability (`0091`; `pi_notifications`; legacy review migration; intervention/privacy sources; `GET/PATCH /api/pi/notifications`; Profile inbox; `pi_ai_usage_daily`).  
**T6 status:** **Shipped** — signed-in E2E + release gates (`e2e/t0-signed-in-loop.test.ts`, `e2e/t6-security-journeys.test.ts`, `e2e/t6-unauth-gates.test.ts`, `npm run test:release-gate`); TD-001 closed.  
**T7 status:** **Shipped (founder-authorized 2026-07-25)** — org departments/teams (`0093`); Launchpad readiness honesty (`mixed` source); Professional Workspace nav demotion (legacy opt-in); Team Copilot = Workspace alias (not third SKU); membership privacy cascade. **T8/T9 still require separate founder approval.**  
**Post-T5 security hardening:** **Shipped** — TD-016 closed by `0092`; anonymous EXECUTE removed from all SECURITY DEFINER functions while three authenticated RLS helpers remain intentionally callable and regression-tested.

---

## What is live (by phase)

| Phase | Status | Live surfaces / artefacts |
| --- | --- | --- |
| **P0** | Shipped | `/profile`, framework pin on ScoreRuns, evidence relocate, migrations `0066`–`0076` |
| **P1** | Shipped | SnapshotClaims shared by Profile, Career, Portfolio |
| **P2** | Shipped | `/profile/baseline`, assessment APIs, migration `0077` |
| **P3** | Shipped | Experience planner, 16 scenarios / 12 companies, migrations `0078`–`0079` |
| **P4** | Shipped | Observation consent (default OFF), workspace observations, interventions, `0080` |
| **P5** | Shipped | Final/transfer assessment, growth reports, `0081`–`0082` |
| **P6** | Shipped | `/learning`, learning paths/items, `0083` — no capability assignment |
| **P7** | Shipped | `/career/outcomes`, outcome events + calibration findings, `0084`–`0085` |

**Also present (partial / supporting):** Professional Workspace (`/workspace`), Verified Portfolio packaging (`/portfolio`), Career Intelligence readiness (ScoreRun-preferring; labelled heuristic fallback), admin competency framework seed (`pm-core`), PI review/challenge.

**T0 (2026-07-25):** Unauth smoke + migrations re-verified.  
**T1 (2026-07-25):** Privacy export/deletion shipped (`0086`); TD-004/005 resolved; TD-006 documented for Auth dashboard.  
**T2 (2026-07-25):** Framework/rubric coherence — DB `pi_cf_*` SoT for ScoreRuns; labelled `in_code_fallback`; `rubric_resolve_source` on ScoreRuns (`0087`); pin assert on `POST /api/pi/capability/run`; golden reproducibility harness; TD-009 closed. TD-007 (seed depth) remains deferred.  
**T3 (2026-07-25):** Artefact versioning — `artefacts` + immutable `artefact_versions` + append-only `artefact_status_transitions` (`0088`); user-vs-AI provenance + content hash; evidence provenance must cite `artefact_version_id` (DB CHECK + app guard); artefact tables added to T1 export/purge cascade; `/api/pi/artefacts` (+`/[id]/versions`); settings panel. Access-control check found and fixed a default-privilege leak: person-purge RPC EXECUTE revoked from anon/authenticated (`0089`).  
**T4 (2026-07-25):** AI orchestration trust layer — agent registry (line_manager / stakeholder / observer + experience_coach / workspace_coach / interview_lab), prompt versioning, context builder, structured output contracts, prompt-injection guardrails, cost/latency logging (`ai_interactions`), mock-model CI tests. Existing Experience/Helm/Interview Lab surfaces consolidated into the registry (not rewritten). `GET /api/pi/ai/interactions` (self-only). Migration `0090`.
**T5 (2026-07-25):** Consolidated person inbox — self-only `pi_notifications`, migrated `pi_review_notifications` history, intervention-offer trigger, idempotent privacy event consumption, contextual in-app links, Profile bell/list/mark-read, and security-invoker daily AI usage read model. No email/channel expansion; no capability or verification writes. Migration `0091`.
**TD-016 (2026-07-25):** Exhaustive production SECURITY DEFINER inventory (nine functions) + `0092`; anonymous EXECUTE now false for all. Authenticated EXECUTE retained only for `current_org_id`, `is_workspace_project_member`, and `pi_cf_version_is_readable` because active RLS policies depend on them; before/after role-simulation probes passed.
**T6 (2026-07-25):** Signed-in E2E + release gates — disposable-user happy path (18/18), security negatives (RLS, purge denial, prompt-injection), unauth gates, `npm run test:release-gate`; TD-001 closed; T0 PASS (automated). Docs: `docs/qa/end-to-end-audit.md`, `acceptance-test-results.md`, `security-findings.md`, `release-readiness.md`.
**T7 (2026-07-25):** Founder-authorized org + Workspace foundations — `departments` / `teams` / membership (`0093`); org-admin gated APIs; Launchpad `mixed` readiness honesty; legacy Mission Control / Ecosystem nav demoted (opt-in via `NEXT_PUBLIC_DELIVERX_LEGACY_WORKSPACE_NAV`); Team Copilot remains Professional Workspace alias (not third SKU); membership rows in privacy export/purge; org structure tables excluded from person purge. No marketplace, messages SKU, attestation, or commercial packaging.

---

## Out of scope (this phase)

- P8 / **T8** external attestation / lighting `deliverxVerified`
- P9 / **T9** commercial / packaging expansion
- Multi-profession framework expansion beyond thin pilot seed
- Employer attest portal
- Team Co-pilot enterprise mission-control depth as a separate Home / third SKU
- Speculative intelligence microservices
- Rewriting pre-PI delivery/org engines unless required to protect the candidate loop
- First-class `messages` table (reuse meetings / contributions / notifications)
- **T8–T9** until separate founder approval

---

## Founder decisions pending

These block roadmap weight and copy honesty (defaults if silent are in the hypotheses canvas):

| ID | Decision | Impact if undecided |
| --- | --- | --- |
| **ICP** | Pre-job / early PM vs employed teams for next 90 days | Career vs Workspace investment weight |
| **Product count / SKU** | **Settled for T7 (alias):** Team Co-pilot = Professional Workspace; not a third SKU. Full pricing SKU ADR still open for commercial (T9). | Nav prefers Professional Workspace |
| **Verification meaning** | Legal/product definition of Verified / `deliverxVerified` | Portfolio badge, marketing, **T8** timing |
| **Workspace scope** | Employed Workspace in pilot via Professional Workspace modules; mission-control demoted | Observation/coach remain; legacy nav opt-in |
| **Roadmap approval** | **T7 authorized 2026-07-25.** Explicit authorisation still required for **T8 / T9** (P8 / P9) | No external verification or commercial expansion until approved |
| **Framework breadth** | Single seeded domain (`pm-core`) enough for pilot? | Admin seed depth |
| **Marketing vs ledger** | Suite marketing aspirational vs committed scope | Copy audit |

---

## Working rules for agents

1. Read this file + Build Charter before implementing.
2. Prefer smallest change that hardens the shipped loop.
3. Do not start P8/P9 without founder approval recorded in `product-decisions.md`.
4. Update this file when the active phase changes.
5. Do not start **T8–T9** until separate founder approval; T7 is shipped.
