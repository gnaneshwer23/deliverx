# Current Scope

> **Product Bible:** [`../README.md`](../README.md) (`docs/00`–`docs/15`) is the canonical reading path. This charter/scope/decisions file remains binding in the SoT hierarchy.

**Active phase:** **Technology T9 commercial packaging shipped in code** (founder-authorized 2026-07-26); **payments later** — live Stripe / `DELIVERX_BILLING_ENFORCE` are founder ops, not missing product engineering
**As of:** 2026-07-26  
**Remaining work SoT:** [`../engineering/remaining-work.md`](../engineering/remaining-work.md)
**Charter:** [`build-charter.md`](./build-charter.md)  
**Technology plan:** [`../engineering/technology-build-phases.md`](../engineering/technology-build-phases.md) (T0–T9)  
**T0 status:** **PASS (automated)** — signed-in P0–P7 loop verified by T6 harness (`docs/qa/t0-results.md`). Optional founder visual review remains.  
**T1 status:** **Shipped** — person PI export/delete (`0086`, `/api/pi/privacy/*`, settings UX); TD-004/005 closed; TD-006 documented (Auth dashboard).  
**T2 status:** **Shipped** — rubric/DB coherence (`0087`, resolve source `db | in_code_fallback`, pin assert on capability run, golden ScoreRun harness); TD-009 closed.  
**T3 status:** **Shipped** — artefact versioning + submission coherence (`0088`; `artefacts` / `artefact_versions` / `artefact_status_transitions`; immutable prior versions; evidence cites `artefact_version_id`; privacy cascade extended; settings panel). Hotfix `0089` locks the person-purge RPC to `service_role` only.  
**T4 status:** **Shipped** — AI orchestration trust layer (`0090`; `ai_agents` / `ai_prompt_versions` / `ai_interactions`; `src/lib/ai-orchestration/`; Manager/Stakeholder/Observer + consolidated coaches; guardrails; mock-model tests; `GET /api/pi/ai/interactions`).  
**T5 status:** **Shipped** — person PI notifications + observability (`0091`; `pi_notifications`; legacy review migration; intervention/privacy sources; `GET/PATCH /api/pi/notifications`; Profile inbox; `pi_ai_usage_daily`).  
**T6 status:** **Shipped** — signed-in E2E + release gates (`e2e/t0-signed-in-loop.test.ts`, `e2e/t6-security-journeys.test.ts`, `e2e/t6-unauth-gates.test.ts`, `npm run test:release-gate`); TD-001 closed.  
**T7 status:** **Shipped (founder-authorized 2026-07-25)** — org departments/teams (`0093`); Launchpad readiness honesty (`mixed` source); Professional Workspace nav demotion (legacy opt-in); Team Copilot = Workspace alias (not third SKU); membership privacy cascade.  
**T8 status:** **Shipped (founder-authorized 2026-07-25)** — external attestation (`0094`); tokenised attestor flow; `deliverxVerified` only when `externally_attested` + `externally_verified`; kill switch `DELIVERX_VERIFIED_BADGE`; dispute → review case; attestation privacy cascade.
**T9 status:** **Shipped in code (founder-authorized 2026-07-26, `approve t9`)** — migration `0097`; Stripe Checkout + Customer Portal; idempotent subscription webhooks; Experience / Launchpad / Complete Journey entitlements; optional enforcement via `DELIVERX_BILLING_ENFORCE=on`; honest prices appear only when all Stripe price IDs exist. **Live Stripe is TEST-ONLY / OFF until founder configures Stripe + Vercel env and webhook.**
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
| **P8 / T8** | Shipped | External attestation — `/portfolio/attest/[token]`, ledger `external_verification`, Verified gate |

**Also present (partial / supporting):** Professional Workspace (`/workspace`), Verified Portfolio packaging (`/portfolio`), Career Intelligence readiness (ScoreRun-preferring; labelled heuristic fallback), admin competency framework seed (`pm-core`), PI review/challenge.

**T0–T7:** See prior ship notes in [`../engineering/implementation-log.md`](../engineering/implementation-log.md).  
**T8 (2026-07-25):** Founder-authorized external attestation — `vpp_attestation_requests` / `vpp_attestations` / `vpp_attestation_events` (`0094`); consent-gated request; tokenised no-account attestor confirm/dispute; confirm appends ledger evidence (`external_verification` / `external_employer`); dispute opens `pi_review_case`; `deliverxVerified` + kill switch; share views strip private evidence and attestor PII; privacy export/purge; no marketplace / networking / Stripe.

---

## Out of scope (this phase)

- Multi-profession framework expansion beyond thin pilot seed
- Bulk employer accounts / dashboards / networking scrape / marketplace liquidity
- Team Co-pilot enterprise mission-control depth as a separate Home / third SKU
- Speculative intelligence microservices
- Rewriting pre-PI delivery/org engines unless required to protect the candidate loop
- First-class `messages` table (reuse meetings / contributions / notifications)
- Enterprise pricing depth, annual contracts, discounts beyond Stripe promotion codes, tax/VAT automation, and a fourth Workspace SKU

---

## Founder decisions pending

These block roadmap weight and copy honesty (defaults if silent are in the hypotheses canvas):

| ID | Decision | Impact if undecided |
| --- | --- | --- |
| **ICP** | Pre-job / early PM vs employed teams for next 90 days | Career vs Workspace investment weight |
| **Product count / SKU** | **Settled for T9:** Experience £39/mo; Launchpad £39/mo; Complete Journey £59/mo includes Experience + Launchpad + Professional Workspace. Workspace is not sold separately. | Three Stripe prices; no fourth SKU |
| **Verification meaning** | **Settled for T8 (PD-2026-07-25c):** Verified = named third-party attestation of a specific claim; kill switch available | Marketing copy must match |
| **Workspace scope** | Employed Workspace in pilot via Professional Workspace modules; mission-control demoted | Observation/coach remain; legacy nav opt-in |
| **Roadmap approval** | **T7 + T8 authorized 2026-07-25; T9 authorized 2026-07-26.** | T9 bounded to Stripe + entitlements |
| **Framework breadth** | Single seeded domain (`pm-core`) enough for pilot? | Admin seed depth |
| **Marketing vs ledger** | Suite marketing aspirational vs committed scope | Copy audit (TD-011) |

---

## Recommended next actions

Full inventory: [`../engineering/remaining-work.md`](../engineering/remaining-work.md) · ordered plan: [`../engineering/next-steps.md`](../engineering/next-steps.md).

1. **Founder:** restore GitHub Actions minutes / spending (TD-018), then engineering re-enables `verify.yml` + `ci-e2e.yml` and `on.push`.
2. **Founder:** enable Auth leaked-password protection (TD-006) — [Attack Protection](https://supabase.com/dashboard/project/jibmyxaldetyycmtlxet/auth/protection).
3. **Founder / ops:** prove SMTP password-reset delivery; optional VoiceOver/keyboard AT lab before claiming whole-product AA.
4. **Payments later (founder ops, when ready):** Stripe test then live prices; Vercel `STRIPE_*`; webhook + Customer Portal; test checkout smoke; only then `DELIVERX_BILLING_ENFORCE=on`. Not an engineering blocker.
5. **Engineering (optional residual):** R-P1-12 judgement/snapshot INSERT binding; AI red-team; coverage tooling after CI returns — see remaining-work §B.

Defer marketplace, graph DB, multi-profession expansion, and microservice splits without new approval.

---

## Working rules for agents

1. Read this file + Build Charter before implementing.
2. Prefer smallest change that hardens the shipped loop.
3. T9 is authorized and recorded in `product-decisions.md`; do not expand beyond its bounded SKU/entitlement decision.
4. Update this file when the active phase changes.
5. T9 commercial code is shipped; **payments later** — do not claim live payments until Stripe founder ops and production smoke pass; do not invent eng work whose only goal is enabling Stripe.
6. Follow [`../engineering/remaining-work.md`](../engineering/remaining-work.md) and [`../engineering/next-steps.md`](../engineering/next-steps.md) for residual hardening.
