
## 2026-07-27 — Phase 4 AI cost-estimate honesty

Founder requested Phase 4 after evidence query bounds. Implemented residual engineering hardening **R-P2-17**: AI usage records and `GET /api/pi/ai/interactions` now disclose that `costEstimateUsd` is a heuristic pilot estimate, not provider billing. Added `src/lib/ai-orchestration/usage-log.test.ts` to lock the semantics.

## 2026-07-27 — Phase 3 evidence query bound hardening

Founder requested Phase 3 after route timeout hardening. Implemented residual engineering hardening **R-P2-04**: product-facing Evidence Ledger list/detail and Portfolio evidence selection reads now use shared caps in `src/lib/evidence-ledger/query-limits.ts`, with a Vitest guard at `src/lib/evidence-ledger/query-limits.test.ts`. Privacy export remains complete rather than silently truncated.

## 2026-07-27 — Phase 2 AI route timeout hardening

Founder requested Phase 2 after the signed-in Product Home slice. Implemented residual engineering hardening **R-P2-05**: AI, transcription, embedding, and agent/orchestration API routes now export an explicit 30s `maxDuration`, with a Vitest source guard at `src/lib/api/ai-route-max-duration.test.ts`. This closes the long-hang / cost-control gap without requiring founder ops or expanding product scope.

## 2026-07-26 — Marketing de-AI copy pass

Founder: remove em dashes, emojis, and anything that looks/sounds like generic AI marketing.

**Scope:** Marketing + public legal surfaces. Em dashes → natural punctuation; strip decorative glyphs (sparkles, checkmarks-as-ornament); replace empty “AI-powered” with evidence-driven / companies with AI colleagues; soften empty journey fluff while keeping Complete Journey SKU naming; role-preview mocks lose unexplained readiness % theatre.

Docs: PD-2026-07-26s.

Verification: `npm test -- --run src/lib/marketing` (26); marketing honesty via test:pi subset; push + Vercel Ready; spot-check homepage / how-it-works / footer.

---

## 2026-07-26 — Marketing type scale +12.5%

Founder: overall marketing text looks small.

**Change:** `html:has(.marketing-page) { font-size: 112.5% }` (16→18px rem root) so marketing rem type scales systematically without touching the signed-in suite. Mono labels `10px` → `0.6875rem`; nav height 64→68px. Hierarchy preserved (body/captions/labels still distinct).

Verification: marketing honesty units; lint; local screenshots under `/tmp/deliverx-type-scale/`; build + Vercel Ready after push.

---

## 2026-07-26 — Marketing header stability + beta readiness

Founder: header/page jumping, responsiveness audit, honest beta-ready verdict (payments may stay off).

**Fixes:** Shared `(marketing)/layout` shell + sticky nav (no remount); full `PRIMARY_NAV` on every product page (removed current-link filter that shortened the bar); stable header CTA “Start”; `aria-current` active state; Next `Link` prefetch; hero motion no longer starts at `opacity: 0`; removed marketing `content-visibility` intrinsic-size scroll jumps; font `display: swap`; reserved `mkt-product-hero` min-heights; primary links from `lg` (hamburger through tablet); footer columns less crushed below `xl`.

**Docs:** [`beta-launch-readiness.md`](./beta-launch-readiness.md) — verdict **Ready with conditions**; canvas `deliverx-beta-launch-readiness.canvas.tsx`. Billing enforce left off.

Verification: marketing honesty units (nav stability); lint; build; browser/Playwright screenshots under `/tmp/deliverx-marketing-header-audit/`.

---

## 2026-07-26 — Marketing footer enhance + shipped-product sync

Founder: enhance marketing footer; sync landing pages with shipped backend/product.

**Scope:** Footer columns Product / Platform / Company / Account (no fake Contact/Portfolio links). Homepage + Experience / Launchpad / Workspace / How it works / Resources copy and platform mocks aligned to shipped loop — remove decorative readiness %, Hiring Partners, Career Twin, mission-control theatre; mention Daily Briefing + explainable recommendations where accurate; payments remain pilot-access until Stripe configured.

Docs: PD-2026-07-26p; screen-pack footer IA note.

Verification: marketing honesty units; lint/typecheck; `npm run build`; Vercel Ready after push.

---

## 2026-07-26 — How it works visual parity with product pages

Founder: `/how-it-works` UI did not match Experience / Launchpad / Professional Workspace.

**Scope:** Refactor How it works onto the same marketing visual system — split hero with brand-scale name, shared `ProductDashboardMock` (new `intelligence` variant + experience/launchpad on steps), narrative sections, pilot access panel, dark CTA. Clear new-visitor guidance: what DeliverX is, what to do first, five-step loop. Removed bespoke SVG diagram language. `/solutions` redirect and `#journey` / `#workflow` anchors retained. No billing or trust-rail changes.

Verification: marketing honesty units; lint/typecheck on touched files; `npm run build`; production `/how-it-works` 200.

---

## 2026-07-26 — Marketing IA simplify (founder request)

Founder: primary marketing nav = How it works · Experience · Launchpad · Professional Workspace (+ Start / Sign in). Secondary links demoted to footer. Experience/Launchpad/Workspace heroes strengthened with product-frame dashboard mocks (no unexplained score theatre). New `/how-it-works` with end-to-end workflow + per-step SVG diagrams; `/solutions` redirects there. Homepage fold trimmed (pricing / Team Copilot mission-control preview off main story).

Screen-pack note: pack-01 listed how-it-works on `/solutions`; canonical public route is now `/how-it-works` (permanent redirect preserves old URL).

Verification: lint + build; browser check of marketing surfaces.

---


Founder feedback: Workspace was not the same designed UI as Experience and Launchpad after suite-shell parity (`74daea5`).

**Scope:** Visual/IA chrome alignment — reuse product-app patterns; no Team Copilot Dashboard 5 / mission-control depth.

Shape:
- Design note: `docs/design/workspace-ui-parity.md` (gap audit + closed gaps)
- Shared CSS `workspace-app.css` (`.pw-root`) + `WorkspaceProductFrame` / `WorkspaceProductShell` / `WorkspacePageHeader`
- Home, module chrome, team, tasks, projects, search, meetings/documents (`OrgListPage`) on product rail + warm surface
- Outer chrome remains `ProductSuiteShell`; legacy AppShell still flag-gated

Verification: focused workspace unit tests; lint; `npm run build`; browser screenshots under `/tmp/deliverx-workspace-ui-parity/`.

---

## 2026-07-26 — Contextual Home + Daily Briefing

Founder dashboard-architecture intent governed by Build Charter (PD-2026-07-26o).

**Scope:** Journey-adaptive Daily Briefing on canonical `/profile` (states A–D). Insights = content only (not a nav product). Team Copilot executive Dashboard 5 deferred — thin Workspace card only. No unexplained % / emoji nav / fake Verified.

Shape:
- Design: `docs/design/contextual-home-daily-briefing.md`
- Typed SoT `src/lib/contextual-home/` — `resolveHomeState`, `buildDailyBriefing`, signal projection from PI aggregate + Experience enrolment
- `GET /api/pi/profile` attaches `homeBriefing` when `DELIVERX_CONTEXTUAL_HOME` is on (default); kill-switch restores prior Profile
- UI: `DailyBriefingPanel` above-fold on ProfileCentre; screen-bound context rail
- B3 KPIs: `home_briefing_viewed`, `home_primary_cta_clicked`
- Auth redirect unchanged — candidate landing remains `/profile`

Verification: contextual-home unit suite + `test:pi`; lint; `npm run build`.

Next: optional Launchpad-primary heuristic polish; founder ops (TD-018, TD-006); Team Copilot executive remains gated.

---

## 2026-07-26 — Professional Workspace suite parity (thin)

Founder request: enhance Professional Workspace to match signed-in suite pages (Profile, Experience, Launchpad, Portfolio, Help).

**Scope:** UX/polish vertical slice only — not deep Team Copilot / programmes / executive reporting (Screen Pack 01 still build-gated).

Shape:
- `/workspace` layout defaults to `ProductSuiteShell` (Cmd/Ctrl+K search, Help, suite nav). Legacy `AppShell` + Mission Control sidebar restores only when `DELIVERX_LEGACY_WORKSPACE_NAV` / `NEXT_PUBLIC_DELIVERX_LEGACY_WORKSPACE_NAV` is on.
- Workspace home rebuilt with where/what/next orientation, honest empty/partial/error, screen-bound context rail (consent, guidance, related — not floating AI chat), thin meetings + org-structure summary without decorative scores.
- Module chrome + Team page copy aligned to calm suite patterns; Workspace error copy no longer points at “command centre”.

Verification: focused unit + accessibility contracts; lint on touched files; `npm run build`.

---


Production verification found `checkPiApiRateLimit` used read→compute→`update(count+1)` (last-writer-wins). A concurrent burst (130 @ concurrency 8) returned ~129×200 / 0×429 while the DB counter only advanced to ~58.

**Fix:** Migration `0102_pi_api_rate_limit_atomic.sql` adds `pi_api_rate_limit_increment(user_id, window_bucket)` — single SQL upsert `INSERT … ON CONFLICT DO UPDATE SET request_count = request_count + 1 RETURNING request_count`. App decides allow/deny from the returned count. Optional `pi_api_rate_limit_prune_before(timestamptz)` for ops pruning of old buckets (no required cron). Both RPCs are `SECURITY DEFINER`, `EXECUTE` service_role only. Defaults and 429 contract unchanged (90/60s, `DELIVERX_PI_RATE_LIMIT=off`, `code:"rate_limited"` + `Retry-After` + `X-RateLimit-*`).

## 2026-07-26 — B9: Pack-aligned NFR polish (rate limit, failure recovery, activity SM)

Founder reply `b9` authorized six-doc phase B9 scoped to residual R-P2-06 / FLOW-FAIL / TRD-SM-ACTIVITY honesty — no new FD-PACK (PD-2026-07-26m). TD-018 CI darkness remains founder-ops and does **not** block local + Vercel-verified NFR fixes.

**Objective:** Rate-limit / recovery / activity-state honesty matching TRD without new SKUs.

Shape:
- Per-user PI API rate limit — `pi_api_rate_limits` (`0101`); pure engine reuse; `enforcePiApiRateLimit` on capability/run, evidence (+process), search, interventions, recommendations, assessment respond, privacy export. Default **90/60s**; kill-switch `DELIVERX_PI_RATE_LIMIT=off`; thresholds via env.
- Failure polish — shared `src/lib/api/pi-errors.ts` (`code` envelope); AI 429 gains `ai_rate_limited` + `Retry-After`; evidence/process returns honest `pending`/`retryHint` without fake success.
- Activity SM honesty — intervention lifecycle machine (offered→accepted|dismissed|expired; accepted→completed|dismissed); Experience task/meeting/risk transitions enforced in engines; invalid → 409 `invalid_transition`. Never capability / Verified from activity alone.

Verification: B9 unit suites PASS; `test:pi` PASS (461); lint + build PASS. Migration `0101` applied to prod `jibmyxaldetyycmtlxet`. TD-018 still open — no claim that GitHub Actions CI is restored.

Next: founder ops (TD-018, TD-006, SMTP, AT lab) or optional B0 pack archive / FD-PACK-7 PostHog.

## 2026-07-26 — B8 spot-check + org-admin UPDATE RLS (`0100`)

Signed-in production spot-check of Pilot admin found `PATCH /api/org/config` failing with PostgREST `PGRST116` when the actor was an org admin who was not `organisations.created_by` (legacy creator-only UPDATE policy). Migration `0100_organisations_org_admin_update.sql` adds `organisations_admin_update` via `is_org_admin()` and aligns `projects` UPDATE with the same gate (executive as well as pm). Applied to prod `jibmyxaldetyycmtlxet`. App-layer empty-update now returns an honest 403 instead of coerce-to-single noise. Spot-check: admin UI + framework pin + audited org/project PATCH + non-admin 403/redirect; no ScoreRuns/Verified from admin actions; disposable identities purged.

## 2026-07-26 — B8: Thin admin org/project config

Founder reply `B8` (after being shown B8 as needing founder OK on depth) authorized six-doc phase B8 at **thin** pilot depth only — not enterprise mission-control, not a third SKU, not marketplace liquidity (PD-2026-07-26l).

Shape: first-class Pilot admin at `/settings/admin` consolidating org config, project config (name/goal/delivery type/status), org structure (departments/teams via existing `0093`), and membership assign. Typed SoT `src/lib/pilot-admin/`; permissioned `GET/PATCH /api/org/config`, `GET /api/org/projects`, `PATCH /api/org/projects/[id]`; audited mutations append `audit_events` (`event_type=updated`, `source=pilot_admin|org_structure`) with explicit no-evidence / no-Verified metadata. Framework pin shown read-only as `pm-core@2026.1` (reuses admin-framework seed — no full CMS).

Trust rails: org-admin role gate (pm | executive) + kill-switch `DELIVERX_PILOT_ADMIN` defaults **on**; never writes evidence, ScoreRuns, or Verified; no PostHog; no payments. Follow-up migration `0100` (spot-check) unlocks org-admin UPDATE RLS; original ship avoided schema churn.

Verification: focused pilot-admin + a11y units PASS; `test:pi` includes `src/lib/pilot-admin`; lint + build PASS.

Next candidate: **B9** (residual NFR polish / R-P2-06; no new PD if scoped) or founder-ops (TD-018, TD-006, SMTP, AT lab). PostHog remains deferred behind FD-PACK-7.

## 2026-07-26 — B7: App-shell global search + help

Founder reply `B7` (after being shown B7 as gated on FD-PACK-8, default if silent "Defer search") authorized six-doc phase B7 and closed FD-PACK-8 / PACK-E7 (PD-2026-07-26k). Selecting the phase cannot mean the defer default, so shell search + help were **added** as utilities — not an Insights product Home (CX-05).

Shape: typed catalogue in `src/lib/global-search/` (14 destinations + 7 help articles); Cmd/Ctrl+K dialog + Help link in ProductSuiteShell; `/help` orientation page answering where am I / what next without inventing scores; `GET /api/pi/search?q=` merges catalogue hits with the caller's own evidence, projects (`created_by`), artefacts, and Experience enrolments. Explicit owner filters provide defence in depth beyond RLS.

Trust rails: no Insights nav item; no unexplained scores; no PostHog; no migration (`0099` remains prod head). Kill-switch `DELIVERX_GLOBAL_SEARCH` defaults **on**; set `off`/`0`/`false`/`disabled` to hide chrome and 404 the API with no redeploy.

Verification: focused global-search + a11y contract units PASS (16); `test:pi` PASS (426, including `src/lib/global-search`); touched-source ESLint PASS; production build PASS. No founder env action required — search is the default; the only ops lever is the optional `off` kill-switch.

Next candidate: **B8** (founder OK on admin depth) or **B9** (no new PD if scoped to R-P2-06 + failure polish).

## 2026-07-26 — B6: Xperience entry ceremony

Founder reply `B6` (after being shown B6 as gated on FD-PACK-4, default if silent "Day-1 is enough") authorized six-doc phase B6 and closed FD-PACK-4 / PACK-E4 (PD-2026-07-26j). Selecting the phase cannot mean the no-op default, so a calm entry ceremony was **added** as UX depth around the existing Day-1 loop — Experience was not rebuilt.

Shape: after the offer is accepted and the workspace is generated, a five-step narrative plays before the dashboard — `company → role → team → project → first_activity`. All content is derived from the `ExperienceSimState` the planner/sim already produced (company welcome, role expectations, team + stakeholders, project success metrics/constraints/timeline, and the first decision or scheduled meeting). Reuses the 12-company catalogue (`0079`), Experience planner and Day-1 sim.

Code: typed SoT `src/lib/xperience/entry-ceremony.ts` (step ids, pure transition machine, `deriveCeremonyContent`, kill-switch reader); UI `src/components/xperience/entry-ceremony.tsx` (accessible stepper with `aria-current`, focus moved to each step heading, skip on every step, loading/empty/error fallback copy, mobile single-column); wired into `product-app.tsx` (`Ceremony` screen between offer-accept and dashboard); flag resolved server-side in `src/app/(xperience)/experience/app/page.tsx`.

Trust rails: ceremony is narrative only — no invented scores/readiness %, no capability, no ledger evidence, no `deliverxVerified`; an always-present honesty line says evidence is only recorded once the candidate acts inside the workspace. Observation consent stays default OFF and is untouched. **No migration** (UI-only over existing entities; `0099` remains prod head); **no new API**. Kill-switch `DELIVERX_XP_ENTRY_CEREMONY` defaults **on**; set `off`/`0`/`false`/`disabled` to roll back to direct-to-dashboard with no redeploy and no data change.

Verification: focused ceremony units PASS (17); `test:pi` PASS (416, now including `src/lib/xperience`); touched-source ESLint PASS; production build PASS. Standalone `tsc --noEmit` remains blocked only by the six pre-existing `e2e/t6-security-journeys.test.ts` `never.id` fixture errors, with no B6 source errors. No trust rails touched, so no new release-gate coverage was required. No founder env action required — the ceremony is the default; the only ops lever is the optional `off` kill-switch.

Next candidate: **B7** (needs FD-PACK-8) or **B8** (founder OK on depth); **B9** needs no new PD if scoped to R-P2-06 plus failure polish.

## 2026-07-26 — B5: Onboarding shape — eight-step conversation

Founder reply `b5` (after being told B5 requires FD-PACK-3, default if silent “keep 6-step”) authorized six-doc phase B5 and closed FD-PACK-3 (PD-2026-07-26i). Selecting the phase cannot mean the no-op default, so the shipped six-step PI onboarding was **evolved** — not rebuilt — toward the pack's eight-step discovery conversation: `welcome → identity (background) → targets (career direction) → strengths → evidence → working_style → review → path`. Existing step ids, payload fields, wizard, API route and `pi_onboarding_sessions` are reused; `situation` and `consent` are retired ids whose questions moved onto `identity` and `review`.

New behaviour: a welcome screen that sets time, privacy and save expectations; an optional self-assessment step labelled a self-reported claim (“not a capability level, score or Verified status”); an optional working-style step that shapes briefing and feedback tone only; a review step that reads every answer back with per-row Edit routing before consent and default visibility are confirmed; and a recommendation screen that states its deterministic rationale and admits limited data when optional steps were skipped. `action: "skip"` records skips honestly in `payload.skippedSteps` and is rejected on essential steps. Step ordering is a versioned step set behind `DELIVERX_ONBOARDING_STEP_SET`; `v1-six-step` restores the previous shape with no redeploy or data change, and `resolveStepForSet` maps any persisted step id onto the nearest question in the active set so part-finished sessions resume rather than restart.

Trust rails unchanged: onboarding writes no ScoreRun, capability level, ledger evidence or `deliverxVerified`; consent to analysis and default visibility remain required before completion. Because the step count changed, `onboarding_pi_completed` now carries `step_set`, `step_count` and `steps_skipped` so the B3 activation KPI stays interpretable across shapes.

Migration `0099_pi_onboarding_step_sets.sql` widens the `current_step` check to the union of both step sets; applied to production `jibmyxaldetyycmtlxet` via plugin-supabase MCP (`user-supabase` points at the wrong project and was not used). Verified: constraint now accepts all ten step ids plus `completed`; RLS still enabled; zero existing session rows, so no backfill was required; security advisors show no new findings (pre-existing TD-006 leaked-password WARN and the three intentionally callable RLS helpers unchanged).

Verification: focused onboarding + KPI units PASS (32); `test:pi` PASS (391, now including `src/lib/pi-onboarding`); release-gate PASS; touched-source ESLint PASS; production build PASS. Standalone `tsc --noEmit` remains blocked by six pre-existing `e2e/t6-security-journeys.test.ts` `never.id` fixture errors, with no B5 source errors reported.

Next candidate: **B6** (needs FD-PACK-4) or **B7** (needs FD-PACK-8); **B9** needs no new PD if scoped to R-P2-06 plus failure polish. No founder env action required for B5 — the eight-step shape is the default.

## 2026-07-26 — B4: Human reviewer ops (non-Verified)

Founder reply `B4` (after being told B4 requires FD-PACK-5) authorized six-doc phase B4 and closed FD-PACK-5 (PD-2026-07-26h). Reused `0073` `pi_review_*` (no new migration). Hardened `/api/pi/review/*` behind `DELIVERX_REVIEWER_QUEUE` (default off); trust guards reject Verified/capability write payloads; AI-assisted admin decisions require citations; queue UI shows explicit non-Verified notice; ops playbook `docs/engineering/reviewer-ops-playbook.md`; notifications remain on case transitions. Zero Verified side-effects — T8 attestation remains the only Verified path.

Verification: focused B4 trust + status-machine units PASS (39); `test:pi` PASS (364); release-gate PASS (includes `src/lib/pi-review`); touched-source ESLint PASS; production build PASS. Standalone `tsc --noEmit` remains blocked by six pre-existing `e2e/t6-security-journeys.test.ts` `never.id` fixture errors, with no B4 source errors reported. Build retains the pre-existing `phaseIHealth.ts` whole-project NFT trace warning. No DB migration.

Next candidate: **B5** (needs FD-PACK-3) or founder-ops residual. Founder action to open queue in prod: set Vercel `DELIVERX_REVIEWER_QUEUE=on` and redeploy.

## 2026-07-26 — B3: Pilot KPI instrumentation (Vercel)

Founder authorized the Vercel Analytics path for B3 and kept a PostHog sink behind FD-PACK-7 (PD-2026-07-26g). Shipped a typed event catalogue and privacy sanitizer in `src/lib/analytics/`; best-effort Vercel server events after successful onboarding, Experience, capability assessment, evidence, artefact, recommendation and outcome state changes; client event after successful signup; no PII/free-text properties, user IDs, DB migration, or PostHog dependency. `DELIVERX_ANALYTICS=off` is the server kill switch; production defaults on. Event operations and KPI mapping: `docs/engineering/pilot-kpi-instrumentation.md`.

Verification: focused KPI units PASS (5); `test:pi` PASS (325); touched-source ESLint PASS; non-live release gate PASS; production build PASS. Standalone `tsc --noEmit` remains blocked by six pre-existing `e2e/t6-security-journeys.test.ts` `never.id` fixture errors, with no B3 source errors reported. Build retains the pre-existing `phaseIHealth.ts` whole-project NFT trace warning.

## 2026-07-26 — B2 flag on in production

Founder request to deploy all built work enabled Vercel `DELIVERX_RECOMMENDATION_SM=on` for Production + Preview. Redeployed production so the env takes effect. `DELIVERX_BILLING_ENFORCE` left unset (payments still off). Migration `0098` already on `jibmyxaldetyycmtlxet`. Code HEAD already on `main` (`b48a790` and predecessors B1/B2/deploy fix) — no new feature commit required for enablement.

## 2026-07-26 — B2 prod DB: migration `0098` applied

Applied `0098_pi_recommendations` to production Supabase `jibmyxaldetyycmtlxet` via plugin-supabase MCP (`apply_migration`; `user-supabase` was linked to wrong project `acakthpxhnymdqtprocz` and was not used). Verified: tables `pi_recommendations` / `pi_recommendation_evidence` / `pi_recommendation_events` exist; RLS on (3+2+2 policies); triggers `trg_pi_recommendation_guard_update` + `trg_pi_recommendation_audit_insert`; purge EXECUTE anon=false, authenticated=false, service_role=true; SM helper allows generated→viewed and accepted→completed, rejects generated→completed. Advisors: no new CRITICAL; new WARN `function_search_path_mutable` on `pi_recommendation_transition_allowed` (immutable SQL helper); TD-006 leaked-password WARN unchanged. Flag later enabled 2026-07-26 (see entry above).

## 2026-07-26 — B2: Recommendation state machine (founder-authorized)

Founder reply `B2` (after being told B2 requires FD-PACK-6) authorized six-doc phase B2 and closed FD-PACK-6 (PD-2026-07-26f). Shipped migration `0098_pi_recommendations.sql` (entity + evidence links + append-only events; self-only RLS; immutable rationale; privacy purge wrapper over T9); typed SoT `src/lib/recommendations/` (lifecycle `generated → viewed → accepted | dismissed`, plus `accepted → completed | dismissed`); deterministic generation from SnapshotClaims; `GET/POST/PATCH /api/pi/recommendations`; Profile + Career next-action panels; flag `DELIVERX_RECOMMENDATION_SM` default off. Accept/dismiss never mutate capability or Verified. Focused 15 tests + `test:pi` 320 PASS; release-gate PASS; local SQL validation PASS. Production apply of `0098` completed 2026-07-26 on `jibmyxaldetyycmtlxet`; flag enablement remains founder/ops. Next candidate: B3 (FD-PACK-7 only for PostHog sink).

## 2026-07-26 — B1: Confidence-band algorithm (founder-authorized)

Founder utterance `Start Building B1` authorized six-doc phase B1. Shipped versioned algorithm `confidence-bands@2026.1` (`docs/engineering/confidence-band-algorithm.md`); typed SoT `src/lib/capability-engine/confidence-bands.ts` (mapping + labels + why-copy); rubric-judge uses `mapSignalsToCapabilityBand`; SnapshotClaims / Profile / Career expose `confidenceBandAlgorithmVersion`; Profile, Career, Portfolio, Evidence surfaces show “Why this band”; unit tests + `test:pi`. No DB migration. Does not light Verified. Next candidate: B2 (needs FD-PACK-6).

## 2026-07-26 — Technology T9: Stripe commercial packaging (founder-authorized)

Founder utterance `approve t9` authorized P9/T9. Implemented migration `0097_stripe_entitlements.sql`; `src/lib/billing/`; Stripe Checkout + Customer Portal + raw-signature webhook; idempotent subscription sync; Experience/Launchpad entitlement gates; Settings billing; privacy export/purge; commercial honesty tests. Pricing decision: Experience £39/month, Launchpad £39/month, Complete Journey £59/month including Professional Workspace. No money-back guarantee and no card/PAN storage.

Live payments remain **TEST-ONLY / OFF** until founder creates Stripe prices, sets Vercel keys, registers the production webhook, enables Customer Portal, proves test checkout, and turns on `DELIVERX_BILLING_ENFORCE`.

# Implementation Log — PI Pivot P0–P7

Ship log for the Professional Intelligence candidate loop. SHAs are from `main` history (July 2026).

**Production:** https://www.deliverx.dev
**Supabase:** `jibmyxaldetyycmtlxet`
**Migrations:** `0066`–`0091`
**Post-ship HEAD (audit):** `f3ac383`

---

## Foundations (pre-phase packaging)

| SHA | Summary | Migrations / notes |
| --- | --- | --- |
| `6acb8d9` | feat(pi): Professional Intelligence foundations + wire ScoreRun/evidence loop | Ledger + engine foundations |
| `bff9d2d` | fix(pi): seed admin framework before immutability triggers | Seed ordering |

---

## P0–P3

| SHA | Summary | Migrations |
| --- | --- | --- |
| `b5ded43` | feat(pi): ship P0–P3 profile, baseline, and Experience planner | `0066`–`0078` family (onboarding, ledger, engine, sim, workspace, portfolio, career, review, admin framework, assessment, planner) |
| `6da1b50` | feat(experience): expand P3 planner to 12-company catalogue | `0079` |
| `3409ec1` | fix(experience): re-export MediFlow generator for production build | build fix |

**P0** — Profile centre, framework pin, evidence relocate
**P1** — SnapshotClaims coherence
**P2** — Baseline assessment
**P3** — Experience planner + 12-company catalogue

---

## P4

| SHA | Summary | Migrations |
| --- | --- | --- |
| `3e5fd90` | feat(pi): ship P4 continuous Workspace observation under consent | `0080` |

---

## P5

| SHA | Summary | Migrations |
| --- | --- | --- |
| `beebcc3` | feat(pi): ship P5 final assessment, transfer tasks, and growth reports | `0081`+ |
| `ea35e55` | fix(db): split P5 enum migration from body for PG 55P04 | `0081`/`0082` split |

---

## P6

| SHA | Summary | Migrations |
| --- | --- | --- |
| `34442c4` | feat(pi): ship P6 Learning Intelligence with gap→apply CTAs | `0083` |

---

## P7

| SHA | Summary | Migrations |
| --- | --- | --- |
| `bdc7706` | feat(pi): ship P7 real-world outcome loop with honest calibration | `0084`/`0085` |

---

## Post-ship auth hardening (audit)

| SHA | Summary |
| --- | --- |
| `8aff4df` | fix(auth): preserve next path on workspace/settings login redirect |
| `446348e` | fix(auth): edge-redirect workspace/settings with next preserved |
| `2e9673c` | test(auth): cover workspace/settings path guards |
| `f3ac383` | fix(auth): pass loginNext fallbacks for workspace/settings shells |

---

## Technology T0 — Pilot seal (2026-07-25)

| SHA | Summary | Notes |
| --- | --- | --- |
| `c5d2b9f` | docs(qa): T0 signed-in pack + release readiness; fix path headers for coach deep-link | Automated/unauth PASS; signed-in **BLOCKED** (founder login). See `docs/qa/t0-results.md`. TD-001 still open. |

**T0 verdict:** PARTIAL — do not start T1 until T0 PASS or founder override.

---

## Technology T1 — Privacy, consent, export & deletion (2026-07-25)

| SHA | Summary | Migrations / notes |
| --- | --- | --- |
| `22ce7ed` | feat(privacy): T1 person PI export/delete + advisor hygiene | `0086`; `src/lib/pi-privacy/`; `/api/pi/privacy/*`; settings UX; TD-004/005 closed; TD-006 documented |

**T1 verdict:** Shipped under founder override while T0 signed-in QA remains open.

---

## Technology T2 — Framework / rubric coherence (2026-07-25)

| SHA | Summary | Migrations / notes |
| --- | --- | --- |
| `8a41caf` | feat(capability): T2 rubric DB SoT + labelled fallback + golden harness | `0087`; `rubric-resolve-policy`; pin assert on `/api/pi/capability/run`; TD-009 closed |

**T2 verdict:** Shipped. DB `pi_cf_*` preferred for ScoreRuns; `in_code_fallback` labelled + measurable; do not start T3 until asked. T0 signed-in QA remains open.

---

## Technology T3 — Artefact versioning & submission coherence (2026-07-25)

| SHA | Summary | Migrations / notes |
| --- | --- | --- |
| `c2819b3` | Ship T3 artefact versioning + submission coherence | `0088`; `src/lib/artefacts/`; `POST/GET /api/pi/artefacts` + `/[id]/versions`; evidence provenance cites `artefact_version_id`; privacy cascade extended; settings UX panel |
| `9eae533` | Lock down person-purge RPC to service_role (hotfix) | `0089`; revokes anon/authenticated EXECUTE on `pi_privacy_purge_person_data` (default-privilege leak found during T3 access-control check) |

**Scope:** First-class `artefacts` + immutable `artefact_versions` (content hash, user-vs-AI provenance) with append-only prior versions (DB trigger + purge bypass) and an append-only `artefact_status_transitions` submission audit. Evidence citing an artefact must reference a specific version (DB CHECK + app guard). Artefact tables added to the T1 export/purge cascade. Self-only RLS, private by default. No capability writes; observation ≠ evidence.

**Verification:** typecheck (no new errors) · lint clean on touched files · 890 vitest pass (21 new artefact tests) · migrations `0088`/`0089` applied to prod + `list_migrations` confirmed · schema verified (3 tables, 8 policies, RLS on, evidence FK + CHECK, 2 immutability triggers, purge covers versions) · purge RPC now `service_role`-only (anon/authenticated EXECUTE = false) · Vercel prod READY (`deliverx-bpv6yl695`) · unauth smoke: `/api/pi/artefacts` (+`/versions`) 401, `/settings/profile` 307.

**T3 verdict:** Shipped. Do not start T4 (AI agent registry) unless asked. T0 signed-in QA remains open.

---

## Technology T4 — AI orchestration trust layer (2026-07-25)

| SHA | Summary | Migrations / notes |
| --- | --- | --- |
| `5a6e51c` | feat(ai): T4 agent registry, guardrails, provenance, usage log | `0090`; `src/lib/ai-orchestration/`; `GET /api/pi/ai/interactions`; consolidates Experience/Helm/Interview Lab personas |
| `518d405` | fix(ai): OutputValidationResult narrowing for production build | Type-safe `contractFallback`; Vercel prod READY |

**Founder override:** User said `t4` — explicit override of the T0–T3 audit gate while TD-001 signed-in QA remains open; pre-existing typecheck/lint debt (TD-016 residual) not blocking under override.

**Scope:** Formal §11 agent framework without chat-as-DB: role registry (line_manager / stakeholder / observer + experience_coach / workspace_coach / interview_lab), immutable prompt versions, context builder (system instructions separate from org data), structured output contracts, prompt-injection guardrails, authority boundaries (no capability / verified-evidence writes; consequential actions need confirmation), mandatory cost/latency logging on `ai_interactions`. App registry is runtime SoT; DB catalogue seeded for ops. Existing Experience/coach/Helm behaviour wrapped, not rewritten.

**Verification:** focused vitest 16 new orchestration tests (mock-model, injection, output validation, cascade) · migration `0090` (+ purge extend) applied to prod `jibmyxaldetyycmtlxet` (6 agents, 6 prompts, RLS on, purge covers `ai_interactions`, service_role-only EXECUTE) · Vercel prod READY (`4UYPiSFLEtKPLR4hfhJUpbNQ3VLV` / SHA `518d405`) · unauth smoke: `/api/pi/ai/interactions` 401, `/api/pi/artefacts` 401, `/settings/profile` 307. Pre-existing lint debt still fails GitHub `verify` job (not introduced by T4); not blocking under founder override.

**T4 verdict:** Shipped. Do not start T5 (notifications) unless asked. T0 signed-in QA + TD-006/TD-016 remain open.

---

## Technology T5 — Notifications & PI observability (2026-07-25)

| SHA | Summary | Migrations / notes |
| --- | --- | --- |
| `5c71edd` | feat(pi): ship T5 consolidated notifications and observability | `0091`; `src/lib/notifications/`; `GET/PATCH /api/pi/notifications`; Profile bell/list/mark-read; `pi_ai_usage_daily` |

**Founder override:** User said `t5` — T5 shipped while T0 signed-in QA, TD-006 and TD-016 remain open. This does not claim T0 PASS and does not authorise T6.

**Scope:** One self-only person inbox consolidates migrated review history, future review writes, intervention offers and privacy domain events. Every item has an internal contextual route, source identity, idempotency key, delivery timestamp and read state. Organisation Slack/Teams deliveries remain a separate tenant concern; no new email provider or channel fan-out. Notification guards never assign capability or verification. T1 export/purge now includes `pi_notifications`. A `security_invoker` daily AI usage view gives pilot ops token/cost/latency queries without bypassing `ai_interactions` RLS.

**Verification:** 41 focused tests pass (5 new T5 tests); touched-file lint clean; production Next.js build passes. Full Vitest reached 910 pass / 2 skipped with one unrelated `portfolio.test.ts` timeout, then that test passed alone (2/2). Standalone `tsc --noEmit` retains only the documented pre-existing test-fixture errors. Migration `0091_pi_notifications` applied to `jibmyxaldetyycmtlxet`; `pi_notifications` RLS + three self-only policies verified; privacy purge wrapper grants verified anon=false, authenticated=false, service_role=true (old implementation also not client-executable); security advisors show no new T5 finding and existing TD-006/TD-016 warnings remain. Vercel production deployment `dpl_3euGrKM5yLKMqnBnqAM1SyK9pPq4` is READY. Unauth smoke: `/api/pi/notifications` 401, legacy review notifications 401, `/profile` 307 → login.

**T5 verdict:** Shipped. Do not proceed to T6 unless asked. Open debt unchanged.

---

## Security hardening — TD-016 SECURITY DEFINER grants (2026-07-25)

| SHA | Summary | Migration / notes |
| --- | --- | --- |
| `096fb72` | Close anonymous SECURITY DEFINER EXECUTE exposure without breaking RLS | `0092`; anonymous EXECUTE false for all nine inventoried functions; authenticated retained only for three RLS helpers |

**Verification:** production inventory queried from `pg_proc` plus routine/effective privileges · active `pg_policy` dependencies mapped · authenticated read probes unchanged before/after for evidence, artefacts, notifications, ScoreRuns, Workspace, requirements and `pi_cf_*` · rollback-only authenticated inserts passed for evidence, artefacts, notifications and workspace contributions · 914 tests passed (2 skipped) · migration history confirms `0092_security_definer_grants` · advisor 0028 anonymous findings cleared; three advisor 0029 findings intentionally remain for RLS-critical read helpers.

**TD-016 verdict:** Closed. The authenticated findings are a documented, tested RLS requirement rather than unclassified residual exposure.

---

## Technology T6 — Signed-in E2E & release gates (2026-07-25)

| Artefact | Summary |
| --- | --- |
| `e2e/t0-signed-in-loop.test.ts` | Signed-in P0–P7 + T1–T5 happy path (18 steps); disposable user + T1 purge |
| `e2e/t6-security-journeys.test.ts` | Prompt-injection always-on; live RLS / purge denial / no capability write |
| `e2e/t6-unauth-gates.test.ts` | CI-safe 401 + login redirects |
| `scripts/release-gate.mjs` | `npm run test:release-gate` / `:live` |
| `.github/workflows/verify.yml` | T6 release gate job; optional live secrets |
| `docs/qa/*` | end-to-end-audit, acceptance-test-results, security-findings, release-readiness, t0-results |

**Approach:** Option B (prod disposable identity + purge) — local Supabase (Option A) blocked by disk/Docker. No runtime product code changes; no migration; no deploy required.

**Verification:** Live 26/26 pass (`t0` 18 + security 8); release-gate non-live PASS (242 PI units + unauth + security always-on); post-purge person-PI counts = 0.

**T6 verdict:** Shipped. TD-001 closed. T0 PASS (automated). Do not proceed to T7 without founder approval.

---

## Technology T7 — Launchpad & Team Copilot foundations (2026-07-25)

| Artefact | Summary |
| --- | --- |
| `0093_org_structure.sql` | `departments`, `teams`, membership; `is_org_admin` / membership helpers; privacy purge chain; TD-016 grants |
| `src/lib/org-structure/` | Domain lib — no capability/evidence writes |
| `/api/org/structure\|departments\|teams\|members` | Org-member read; org-admin write |
| Launchpad readiness | `mixed` source + labelled % (not capability) |
| Workspace nav | Legacy Mission Control / Ecosystem demoted; opt-in `NEXT_PUBLIC_DELIVERX_LEGACY_WORKSPACE_NAV` |
| PD-2026-07-25 | T7 authorized; T8/T9 still blocked; not third SKU |

**Verification:** focused vitest 249 PI incl. 7 T7 org-structure cases · migration `org_structure` on `jibmyxaldetyycmtlxet` (head after `0092`) · advisors: no anon EXECUTE regression; authenticated 0029 for new RLS helpers (`is_org_admin`, `is_department_member`, `is_team_member`) intentional (same TD-016 posture) · TD-006 WARN unchanged · prod deploy `dpl` Ready (`7f24974`) · unauth smoke 401 on `/api/org/*` · `npm run test:release-gate` PASS (live signed-in suites skipped without `T6_E2E` secrets).

**T7 verdict:** Shipped (founder-authorized). Do not proceed to T8/T9 without separate founder approval. TD-006 remains founder-only.

---

## Technology T8 — External attestation (2026-07-25)

| Artefact | Summary |
| --- | --- |
| `0094_external_attestation.sql` | `vpp_attestation_requests`, `vpp_attestations`, `vpp_attestation_events`; privacy purge chain; TD-016 grants |
| `src/lib/external-attestation/` | Domain lib — gate, privacy view, store; never writes capability |
| `/api/portfolio/entries/[id]/attestations` | Owner request / list / revoke (consent required) |
| `/api/portfolio/attest/[token]` | Public tokenised confirm/dispute; self-attest denied |
| `/portfolio/attest/[token]` | Minimal calm attestor UX |
| Kill switch | `DELIVERX_VERIFIED_BADGE=off` |
| PD-2026-07-25c | T8 authorized; Verified meaning frozen; T9 still blocked |

**Verification:** focused vitest attestation + VPP + privacy cascade · migration `external_attestation` (`0094`) on `jibmyxaldetyycmtlxet` · purge EXECUTE anon/auth false, service_role true · advisors: no anon EXECUTE regression; TD-006 WARN unchanged · intentional authenticated 0029 helpers unchanged · prod deploy Ready (`75295c6`) · unauth smoke: owner attestation APIs 401; public invalid attest token 404; `/portfolio` → login · `npm run test:release-gate` PASS.

**T8 verdict:** Shipped (founder-authorized). Do not proceed to T9 without separate founder approval. TD-006 remains founder-only.

---

## Ops — CI / Vercel failure storm (2026-07-25)

| Source | What failed | Status after fix |
| --- | --- | --- |
| GitHub Actions `verify.yml` | Pre-T6: lint blocked job. Post-T6: runs fail in **0s with zero jobs** (Actions minutes exhausted on private repo). Removing `on.push` insufficient — GitHub still synthesized failures. | Slimmed gate; Playwright → `ci-e2e.yml`; **both workflows `disabled_manually`** until TD-018 minutes restored (`gh workflow enable` + re-add `on.push`). |
| Vercel production | T7 early SHAs (`2b6ef8f`, `5db5ef5`) failed Next typecheck on org create payloads | Fixed on later SHAs; HEAD **READY**; https://www.deliverx.dev HTTP 200 |
| Local gates | — | `test:release-gate` PASS; `npm test` 927 pass; `npm run build` PASS; production `src/` tsc clean; ~16 test-fixture tsc errors remain (TD-017) |

**Emails:** primarily GitHub Actions (0-job failures while minutes exhausted); intermittent Vercel Error during T7 typecheck. Workflows disabled → push no longer creates Actions runs. Product HEAD healthy.

**Verified HEAD:** Vercel production READY; www.deliverx.dev 200; unauth `/profile` → login; `/api/pi/notifications` + `/api/org/structure` 401. Local release-gate / unit / build PASS. Re-enable Actions only after TD-018.

---

## Ops — TD-006 leaked-password protection (2026-07-25)

| Check | Result |
| --- | --- |
| Advisor before | `auth_leaked_password_protection` WARN present on `jibmyxaldetyycmtlxet` |
| MCP enable | Not possible — no Auth-config write tool |
| Management API | `PATCH /v1/projects/{ref}/config/auth` + `password_hibp_enabled: true` documented; blocked here (no `SUPABASE_ACCESS_TOKEN`) |
| Disposition | **Open — founder action required**; runbook [`runbook-leaked-password-protection.md`](./runbook-leaked-password-protection.md) |

Do not mark TD-006 Closed until advisors clear after the dashboard (or PAT) enable.

---

## Remediation Batch 1 — DB trust-rail lockdown (2026-07-25)

| Artefact | Summary |
| --- | --- |
| `0095_db_trust_rail_lockdown.sql` | ScoreRun authenticated DML revoke + immutable trigger; VPP protected-column trigger; elevated evidence trigger; two service-role-only RPCs |
| `b96e538` | Server write paths moved to service-role clients / narrow attestation RPCs; live RLS regressions added |
| `e2e/t6-security-journeys.test.ts` | Owner + non-owner negatives for all three P0s; service-role positives |

**Pre-change write paths:** Capability run, baseline completion, and final completion passed the authenticated SSR client to `persistCapabilityRun`; T8 confirmation already used `createAdminClient` but wrote protected columns and `platform_verified` directly; ordinary evidence transitions used the authenticated client and relied on the API guard.

**Post-change write paths:** all ScoreRun persistence receives `createAdminClient`; T8 uses `pi_apply_vpp_attestation_state` and `pi_append_platform_verified_transition`; ordinary user transitions remain authenticated and cannot request `platform_verified`.

**Verification:** focused 32 pass / 9 live-skipped; touched-file ESLint clean; non-live release gate PASS (248 PI + unauth + security); Next production build PASS; migration head `0095` confirmed on `jibmyxaldetyycmtlxet`; ScoreRun grants show authenticated SELECT but no INSERT/UPDATE/DELETE/TRUNCATE; advisors show no new finding; post-deploy live release gate PASS **30/30** (18 signed-in loop + 12 security, including owner/non-owner negatives and privileged positives).

**Batch 1 verdict:** Shipped. Remaining remediation batches require founder approval; T9 remains blocked.

---

## Remediation Batch 2 — Product honesty + legal surface (2026-07-25)

| Artefact | Summary |
| --- | --- |
| Marketing data | `career-suite`, `homepage-data`, Launchpad/Experience/Workspace pages — pilot access; no £ checkout prices; no money-back offer |
| Auth / landing chrome | Removed decorative 40%/3x/97% authority stats; qualitative principles only |
| Legal | Interim `/privacy`, `/terms`, `/cookies` (+ `/cookie` alias); footer links; no certification overclaims |
| Tests | `src/lib/marketing/marketing-honesty.test.ts` |
| Decision | PD-2026-07-25e |

**Verification:** marketing honesty units PASS; `npm run test:release-gate` PASS (248 PI + unauth + security); `npm run build` PASS.

**Batch 2 verdict:** Shipped. Next remediation batch requires founder approval; T9 remains blocked.

---

## Remediation Batch 3 — UX clarity & product language (2026-07-25)

| Artefact | Summary |
| --- | --- |
| Copy module | `src/lib/ux/capability-assessment-copy.ts` — presentation labels; ScoreRun stays internal |
| App UI | Profile, Evidence, Hub, Career Intelligence, Learning, Portfolio, Baseline/Final, Experience, Outcomes, Workspace coach — human assessment language |
| Naming | Hub + Launchpad app chrome = **Career Intelligence**; `/launchpad` route retained |
| Workspace | Removed Command Centre / Mission Control pitch from Professional Workspace home |
| Review | Removed “Seed sample finding” from PI review queue |
| Metadata | Root title → Professional Intelligence Platform; Launchpad app → Career Intelligence |
| Readiness | Source labels via `readiness-honesty` + Career UI; heuristic never capability truth |
| Tests | `capability-assessment-copy.test.ts`; aggregate/snapshot/matching/plan expectations updated |
| Decision | PD-2026-07-25f |

**Verification:** UX language units PASS; marketing honesty PASS; `npm run test:release-gate` PASS (248 PI + unauth + security); `npm run build` PASS.

**Batch 3 verdict:** Shipped. Next remediation batch requires founder approval; T9 remains blocked.

---

## Remediation Batch 4 — Pilot seal engineering (2026-07-25)

| Artefact | Summary |
| --- | --- |
| `package.json` / lockfile | **Next.js `16.2.9` → `16.2.12`** (+ `eslint-config-next` `16.2.12`); closes the four high advisories (proxy/middleware bypass, SSRF ×2, Server Actions DoS) + five moderate from `v16.2.11` |
| `e2e/t8-attestation.test.ts` | **T8 attestation → Verified E2E** — compile entry → share → request (token) → external attestor confirm → `deliverxVerified` lights; negatives (self-attest, fake token, expired token, consent-required); private evidence never on public share; Batch-1 self-set columns still DB-denied; ledger `external_verification`/`platform_verified` asserted; no ScoreRun written |
| `src/lib/external-attestation/attestation.test.ts` | Always-on unit coverage extended: `pending_external` / `disputed` never light Verified |
| `scripts/release-gate.mjs` | `external-attestation` units added to always-on suite; T8 live suite wired into `--live` |
| `package.json` | `test:pi` includes `external-attestation`; new `test:e2e:t8` |
| Decision | PD-2026-07-25g (Verified E2E gating clarified; kept honest) |

**Next before/after:** `16.2.9` → `16.2.12` (≥16.2.11 required by SEC-P1-01 / R-P1-03). Production Next build clean — no compile breaks. Remaining `npm audit` `next` flag is transitive `postcss`/`sharp` (libvips) only — a separate class from the audited proxy/SSRF/DoS advisories, which are now patched.

**Verification:** `npm run build` PASS (no breaks from bump) · non-live `npm run test:release-gate` PASS (263 PI/unit incl. new external-attestation + attestation-state cases + unauth + security always-on) · **live gate PASS 40/40** against https://www.deliverx.dev (18 signed-in loop + 12 security + 10 T8 attestation), disposable identities purged after each run.

**Batch 4 verdict:** Shipped. Next remediation batch requires founder approval; T9 remains blocked. TD-006 (founder Auth toggle) and TD-018 (founder Actions minutes) remain founder-only — documented, not in scope.

---

## Remediation Batch 5 — Navigation coherence + accessibility (2026-07-26)

| Artefact | Summary |
| --- | --- |
| `ProductSuiteShell` / `product-suite-nav` | Shared journey nav: Hub · Profile · Experience · Launchpad · Workspace · Portfolio |
| Layouts | Hub, Profile, Learning, Career outcomes, Experience app, Launchpad app, Portfolio (auth only) wrap shared shell |
| Workspace chrome | Suite nav in AppNav (xl+) + mobile drawer; skip link; focus trap/Escape on drawer; removed duplicate Alerts/`Full view` |
| Launchpad | MVP-only module nav; mobile horizontal switcher; `h1` = Launchpad |
| Experience | Tool rail under shared shell; green accent alignment; status live region |
| A11y | Named user menu; Escape menus; auth error alerts; skip links; ≥12px chrome labels; auth contrast; focus-visible |
| Dead chrome | Removed unused dark `WorkspaceSidebar` + `sidebar-nav-section` |
| Tests | `product-suite-nav.test.ts`, `accessibility-contract.test.ts` |
| Decision | PD-2026-07-26a |

**Verification:** new units PASS; `npm run test:release-gate` PASS; `npm run build` PASS.

**Batch 5 verdict:** Shipped. Next remediation batch requires founder approval; T9 remains blocked.

---

## Remediation Batch 6 — Residual a11y + honesty polish + TD-017 (2026-07-26)

| Artefact | Summary |
| --- | --- |
| Experience honesty | Removed decorative Experience score / interview readiness %; qualitative setup bands + honesty labels (`setup-signal`) |
| Scenario pulses | Product-app illustrative signals qualitative; sim pulses labelled “scenario — not capability” |
| Demoted surfaces | Twin / PMO / Marketplace banners + Hub CTAs; Twin KPI text alternatives; honest empty marketplace |
| A11y polish | Decorative Lucide `aria-hidden`; alert “View all” hit area; accessibility contracts extended |
| TD-017 | `tsc --noEmit` 0; eslint 0 — fixture types + `scheduleEffectWork` for mount fetches |
| Decision | PD-2026-07-26b |

**Verification:** targeted units PASS; `npx tsc --noEmit` 0; `npm run lint` 0; `npm run test:release-gate` PASS; `npm run build` PASS. Shipped `3b596d9` → production Ready (`www.deliverx.dev`).

**Batch 6 verdict:** Shipped. Next remediation batch requires founder approval. TD-006 / TD-018 remain founder-owned (not flipped). T9 remains blocked.

---

## DB consent enforcement — `0096` (2026-07-26)

| Artefact | Summary |
| --- | --- |
| `0096_consent_enforcement.sql` | INSERT triggers on `workspace_observations` + `workspace_observation` evidence; effective-consent helper; no service-role bypass; capability CHECK |
| App | `consent-errors.ts`; observe/contribution map DB consent denials to `consent_denied` |
| Tests | `consent-enforcement.test.ts`; T6 live consent OFF/ON/override/revoke/cross-user/capability negatives |

**Bypass audit (pre-0096):** Authenticated PostgREST own-row `ALL` on `workspace_observations` and direct `pi_evidence_records` insert with `source_type=workspace_observation` skipped app consent. Service-role likewise bypassed RLS (not triggers). After `0096`, both paths require active consent; other evidence sources unchanged.

**Verification:** focused observation units PASS (30); migration applied to `jibmyxaldetyycmtlxet`; triggers + EXECUTE=false confirmed; advisors introduce no new consent-function findings; non-live release gate PASS (268 PI); build PASS; production deploy Ready (`005f0a9` / follow-up docs `37d3b63`); live release gate PASS (18 signed-in + 14 security incl. consent DB negatives + 10 T8).

**Verdict:** DB consent enforcement shipped. T9 not started.

---

## AI citation requirements — pre-T9 hardening (2026-07-26)

| Artefact | Summary |
| --- | --- |
| `src/lib/ai-orchestration/citations.ts` | Citation policy + `enforceCitations` against exact run context; optional class documented narrowly (`conversational_ack_v1` only) |
| `output-contracts.ts` / `types.ts` | Structured `AiCitation` (`sourceType`, `sourceId`, optional excerpt/hash/label); `citationInsufficientFallback` |
| `run.ts` | Missing/empty/unknown citations → `validation_failed` + `invalid_output` flags + honest non-claiming fallback; `runResultToEvidenceProvenance` |
| `prompt-registry.ts` | Prompt **v2** (CITATION_RULES) for all 6 agents; v1 retained immutably |
| `guardrails.ts` | Payload enumerates `## Citable sources` |
| Observation / UI | `aiProvenance` (model/prompt/context/citation ids) on workspace observe; `AiCitationStrip` on PI interventions, Interview Lab, opportunity matching, recommendations |
| Tests | Valid known citation; missing rejected; fabricated id rejected; fallback non-claiming; injection still blocked; optional class; legacy coaches; provenance helper |
| Docs | AI quality audit, prompt register, risk register, bible `09`, engineering AI notes, release readiness |

**No schema migration** — validation reason logged in existing `ai_interactions.error_message` + `guardrail_flags` JSON. Do not take `0096` (consent owns it; already shipped).

**Verification:** `orchestration.test.ts` 26 PASS · observation units PASS · `npm run test:release-gate` PASS · `npm run build` PASS. Production deploy **Ready** `dpl_Gvr1H56hZQLKZPyuKAuPfMQ5yyYd` (`41a290b`) → https://www.deliverx.dev.

**Verdict:** AI citation requirements — shipped. **T9 not started.**

---

## Not started (charter)

- **P9 / T9** — Commercial (requires separate founder approval)

Do not append ship rows for P9 until Build Charter authorises them.
## 2026-07-27 — Phase 5 capability child insert lockdown

Closed R-P1-12 by adding migration `0103_capability_child_insert_lockdown.sql`. Authenticated users now retain owner SELECT on `pi_capability_judgements` and `pi_capability_snapshots`, but client INSERT/UPDATE/DELETE/TRUNCATE is revoked and the old owner insert policies are removed. The shared child immutability trigger now honours the existing transaction-local `app.pi_privacy_delete` delete bypass so service-role privacy purge remains compatible with append-only capability artefacts.
