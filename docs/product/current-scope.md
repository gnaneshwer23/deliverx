# Current Scope

> **Product Bible:** [`../README.md`](../README.md) (`docs/00`–`docs/15`) is the canonical reading path. This charter/scope/decisions file remains binding in the SoT hierarchy.

**Active phase:** **Phase 2 — Discovery content** (flagship Resources guides shipped; GSC submit + keyword retarget remain founder ops). Phase 1 soft-launch CI (R-P2-16 coverage + axe smoke) remains live. Contextual Home + Daily Briefing remain shipped (PD-2026-07-26o). B1–B9 remain live. T9 commercial code remains shipped; **payments later**.
**As of:** 2026-09-04  
**Remaining work SoT:** [`../engineering/remaining-work.md`](../engineering/remaining-work.md)
**Charter:** [`build-charter.md`](./build-charter.md)  
**Technology plan:** [`../engineering/technology-build-phases.md`](../engineering/technology-build-phases.md) (T0–T9)  
**Six-doc build-out:** [`../engineering/six-doc-build-phases.md`](../engineering/six-doc-build-phases.md) (B0–B9)  
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
**B1 status:** **Shipped (founder-authorized 2026-07-26, `Start Building B1`)** — versioned algorithm `confidence-bands@2026.1`; typed SoT in `src/lib/capability-engine/confidence-bands.ts`; Profile / Career / Portfolio / Evidence “Why this band” labels; no DB migration; ScoreRun/bands never light Verified.
**B2 status:** **Shipped + prod flag on (founder-authorized 2026-07-26, reply `B2` = FD-PACK-6 / PD-2026-07-26f)** — migration `0098_pi_recommendations.sql`; typed SoT `src/lib/recommendations/`; lifecycle `generated → viewed → accepted | dismissed` (+ `accepted → completed | dismissed`); `GET/POST/PATCH /api/pi/recommendations`; Profile + Career next-action UI; Vercel Production + Preview `DELIVERX_RECOMMENDATION_SM=on` (2026-07-26); dismiss/accept never mutate capability or Verified.
**B3 status:** **Shipped (founder-authorized 2026-07-26; PD-2026-07-26g)** — typed privacy allowlist `src/lib/analytics/`; Vercel server/client custom events on successful signup, onboarding completion, Experience start/plan, persisted capability assessment, evidence append, artefact version, recommendation viewed/accepted, and outcome record; no DB migration; production-default server events with `DELIVERX_ANALYTICS=off` kill switch; PostHog not wired pending FD-PACK-7.
**B4 status:** **Shipped (founder-authorized 2026-07-26, reply `B4` = FD-PACK-5 / PD-2026-07-26h)** — reuse `0073` `pi_review_*`; hardened `/api/pi/review/*` + queue UI; ops playbook `docs/engineering/reviewer-ops-playbook.md`; trust guards reject Verified/capability writes; AI-assisted decisions require citations; flag `DELIVERX_REVIEWER_QUEUE` default **off** until founder enables; zero Verified side-effects (T8 remains Verified path).
**B5 status:** **Shipped (founder-authorized 2026-07-26, reply `b5` = FD-PACK-3 / PD-2026-07-26i)** — PI onboarding evolved from six steps to the pack's eight-step discovery conversation (`welcome → identity → targets → strengths → evidence → working_style → review → path`); new self-assessment and working-style steps are skippable and explicitly labelled self-reported claims; review step reads back every answer with edit links before consent and default visibility are confirmed; recommendation now states its deterministic rationale and flags limited data; migration `0099_pi_onboarding_step_sets.sql`; step-set flag `DELIVERX_ONBOARDING_STEP_SET` (rollback `v1-six-step`, no redeploy); onboarding creates no capability, no evidence and no Verified status.
**B6 status:** **Shipped (founder-authorized 2026-07-26, reply `B6` = FD-PACK-4 / PD-2026-07-26j)** — Xperience entry ceremony plays after the offer is accepted and before the dashboard: **company welcome → role → team → project → first activity**, all derived from the already-generated `ExperienceSimState` (reuses 12-company catalogue `0079`, Experience planner, Day-1 sim). Typed SoT `src/lib/xperience/entry-ceremony.ts`; UI `src/components/xperience/entry-ceremony.tsx`. Skip allowed on every step; accessible stepper; loading/empty/error fallbacks. **No migration** (UI-only over existing entities; `0099` remains prod head); no new API. Kill-switch `DELIVERX_XP_ENTRY_CEREMONY` defaults **on** (set `off` to roll back, no redeploy). Ceremony is narrative only — no scores/readiness %, no capability, no ledger evidence, no Verified; observation consent stays default OFF.
**B7 status:** **Shipped (founder-authorized 2026-07-26, reply `B7` = FD-PACK-8 / PD-2026-07-26k)** — App-shell global search + help as shell utilities (no Insights product). Typed catalogue `src/lib/global-search/` (14 destinations + 7 help articles); Cmd/Ctrl+K dialog in ProductSuiteShell; `/help` orientation page; `GET /api/pi/search?q=` self-only (evidence / projects `created_by` / artefacts / enrolments). Kill-switch `DELIVERX_GLOBAL_SEARCH` defaults **on** (set `off` to roll back, no redeploy). **No migration.**
**B8 status:** **Shipped (founder-authorized 2026-07-26, reply `B8` = thin depth / PD-2026-07-26l)** — Pilot admin at `/settings/admin` for org + project config, departments/teams, membership assign; typed SoT `src/lib/pilot-admin/`; `GET/PATCH /api/org/config`, `GET /api/org/projects`, `PATCH /api/org/projects/[id]`; audited via `audit_events`; framework pin `pm-core@2026.1` read-only; kill-switch `DELIVERX_PILOT_ADMIN` defaults **on** + org-admin role gate. Follow-up `0100` org-admin UPDATE RLS. Never rewrites verified evidence or lights Verified. Not enterprise mission-control / third SKU / marketplace.
**B9 status:** **Shipped (founder-authorized 2026-07-26, reply `b9` / PD-2026-07-26m)** — Pack-aligned NFR polish: per-user PI API rate limit (`0101`, default 90/60s, kill-switch `DELIVERX_PI_RATE_LIMIT`); shared PI error contracts + AI 429 `Retry-After`; intervention + Experience activity state-machine honesty (409 on invalid). No capability/Verified from activity alone. TD-018 CI remains founder-ops (not claimed restored).
**Contextual Home status:** **Shipped (PD-2026-07-26o)** — journey-adaptive Daily Briefing on `/profile`; states A–D; Team Copilot executive deferred; kill-switch `DELIVERX_CONTEXTUAL_HOME` default on; no Insights nav product.
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
| **B1** | Shipped | Confidence bands `confidence-bands@2026.1` — algorithm doc + UI “Why this band” |
| **B2** | Shipped | Recommendation SM `0098` — Profile / Career next actions with accept/dismiss |
| **B3** | Shipped | Vercel pilot KPI custom events — typed catalogue, no PII, no DB/PostHog sink |
| **B4** | Shipped | Human reviewer queue + ops playbook (non-Verified), flag-gated |
| **B5** | Shipped | Eight-step PI onboarding conversation `0099` — claim labels, skippable steps, review before use |
| **B6** | Shipped | Xperience entry ceremony — company→role→team→project→first activity; no migration; kill-switch default on |
| **B7** | Shipped | Suite shell Cmd/Ctrl+K search + `/help`; `GET /api/pi/search` self-only; no Insights product; kill-switch default on |
| **B8** | Shipped | `/settings/admin` thin pilot org/project config; audited; org-admin + `DELIVERX_PILOT_ADMIN`; no evidence rewrite |
| **B9** | Shipped | PI API rate limit `0101` (90/60s); failure codes + AI 429; intervention + Experience activity SM honesty |
| **Contextual Home** | Shipped | `/profile` Daily Briefing — journey states A–D; `DELIVERX_CONTEXTUAL_HOME`; no Insights nav / no Team Copilot executive |

**Also present (partial / supporting):** Professional Workspace (`/workspace`) — product-app UI parity with Experience/Launchpad (shared `.pw-root` chrome + side rail; ProductSuiteShell outer nav; legacy Mission Control nav opt-in); Verified Portfolio packaging (`/portfolio`); Career Intelligence readiness (ScoreRun-preferring; labelled heuristic fallback); admin competency framework seed (`pm-core`); PI review/challenge.

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

**Candidate next scope:** Contextual Home shipped (PD-2026-07-26o). Optional follow-ups: tighten Launchpad-primary heuristics; founder-authorized Team Copilot executive later. [`../engineering/six-doc-build-phases.md`](../engineering/six-doc-build-phases.md) — **B1–B9 shipped.** Other candidates: optional **B0** pack archive, residual founder-ops, or FD-PACK-7 PostHog. Does **not** authorise pack M0–M7 restart or live payments.

1. **Founder:** ~~restore GitHub Actions minutes / spending (TD-018)~~ **Done 2026-08-26** — CI active; green verify after restore. Residual: optional `T6_SUPABASE_*` Actions secrets for live signed-in job.
2. **Founder:** enable Auth leaked-password protection (TD-006) — [Attack Protection](https://supabase.com/dashboard/project/jibmyxaldetyycmtlxet/auth/protection).
3. **Founder / ops:** prove SMTP password-reset delivery; optional VoiceOver/keyboard AT lab before claiming whole-product AA.
4. **B2 pilot UI:** **Done (ops)** — migration `0098` on prod `jibmyxaldetyycmtlxet`; Vercel Production + Preview `DELIVERX_RECOMMENDATION_SM=on` (redeployed 2026-07-26).
5. **B4 pilot queue:** **Code shipped** — set Vercel `DELIVERX_REVIEWER_QUEUE=on` (Production ± Preview) and redeploy when ready to open the ops queue. Default remains off.
6. **Payments later (founder ops, when ready):** Stripe test then live prices; Vercel `STRIPE_*`; webhook + Customer Portal; test checkout smoke; only then `DELIVERX_BILLING_ENFORCE=on`. Not an engineering blocker.
7. **Engineering (Phase 1 soft launch):** R-P2-16 started — trust coverage floors in `verify.yml` + public axe critical smoke in `ci-e2e.yml`. Residual: ledger append/process floors, marketing serious contrast, AT lab. Do **not** flip `DELIVERX_REVIEWER_QUEUE` without staffing.
8. **Engineering (optional):** **B0** pack archive if founder wants docs intake; FD-PACK-7 if PostHog sink desired.

Defer marketplace, graph DB, multi-profession expansion, and microservice splits without new approval.

---

## Working rules for agents

1. Read this file + Build Charter before implementing.
2. Prefer smallest change that hardens the shipped loop.
3. T9 is authorized and recorded in `product-decisions.md`; do not expand beyond its bounded SKU/entitlement decision.
4. Update this file when the active phase changes.
5. T9 commercial code is shipped; **payments later** — do not claim live payments until Stripe founder ops and production smoke pass; do not invent eng work whose only goal is enabling Stripe.
6. Follow [`../engineering/remaining-work.md`](../engineering/remaining-work.md) and [`../engineering/next-steps.md`](../engineering/next-steps.md) for residual hardening.
7. Treat [`../engineering/six-doc-build-phases.md`](../engineering/six-doc-build-phases.md) as **candidate** scope only — implement a Bn only after founder selection and Charter fit. **B1–B9 are authorized and shipped.**
