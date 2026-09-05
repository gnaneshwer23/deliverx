# DeliverX — Remaining work inventory

**As of:** 2026-07-26  
**Authority:** Build Charter · Current Scope · Product Bible `00`–`15` · audit remediation roadmap  
**Companion:** [`next-steps.md`](./next-steps.md) · [`technical-debt-register.md`](./technical-debt-register.md) · [`../audit/remediation-roadmap.md`](../audit/remediation-roadmap.md)  
**Canvas:** Cursor IDE [`deliverx-remaining-work.canvas.tsx`](../../../.cursor/projects/Users-gnaneshwerjadav-Workspace-deliverx/canvases/deliverx-remaining-work.canvas.tsx)  
**Six-doc pack gap check:** Cursor IDE [`deliverx-six-doc-gap-check.canvas.tsx`](../../../.cursor/projects/Users-gnaneshwerjadav-Workspace-deliverx/canvases/deliverx-six-doc-gap-check.canvas.tsx) · repo archive [`canvases/deliverx-six-doc-gap-check.canvas.tsx`](./canvases/deliverx-six-doc-gap-check.canvas.tsx)

This is the **master remaining-work inventory**. It is docs-only truth for what is still open after P0–P7 product, T0–T9 tech (T9 **code**), remediations Batches 1–6, DB consent `0096`, AI citations, and Batch 1 DB trust rails (`0095`).

**Founder posture (2026-07-26):** Live Stripe / entitlement enforcement is **deferred founder ops** (“payments later”), not missing product engineering. Do not treat unconfigured Stripe as an engineering gap.

**Six-doc pack intake (2026-07-26):** Founder *DeliverX Six Document Build Pack* gap-checked against shipped reality. Most pack requirements are already **Shipped** or **Partial** and map to §A/§B/§C below. Section **E** lists only genuinely new pack-sourced items. Do **not** restart greenfield M0–M7 from the pack Implementation Plan.

**Six-doc build-out phases (2026-07-26):** Candidate B0–B9 plan — [`six-doc-build-phases.md`](./six-doc-build-phases.md) · canvas [`canvases/deliverx-six-doc-build-phases.canvas.tsx`](./canvases/deliverx-six-doc-build-phases.canvas.tsx). **B1–B9 shipped**: confidence bands, recommendation SM, Vercel pilot KPI custom events, human reviewer ops, eight-step onboarding, Xperience entry ceremony, shell search, thin admin, and NFR polish (rate limit / failure / activity SM). PostHog remains deferred pending FD-PACK-7. Other Bn not authorised until founder selects.

**Outcomes & efficiency audit (2026-07-26):** Full B0–B9 scorecard + leverage / waste / pilot-readiness — [`b1-b9-outcomes-efficiency-audit.md`](./b1-b9-outcomes-efficiency-audit.md) · canvas IDE [`deliverx-b1-b9-outcomes-audit.canvas.tsx`](../../../.cursor/projects/Users-gnaneshwerjadav-Workspace-deliverx/canvases/deliverx-b1-b9-outcomes-audit.canvas.tsx) · repo [`canvases/deliverx-b1-b9-outcomes-audit.canvas.tsx`](./canvases/deliverx-b1-b9-outcomes-audit.canvas.tsx). Verdict: **Conditional** pilot-ready; stop Bn expansion; next ROI is founder ops (TD-018, TD-006, SMTP).

**Design Track D1 — Screen Pack 01 (2026-07-26):** Canonical pack: [`../design/screen-pack-01/README.md`](../design/screen-pack-01/README.md) · IDE canvas [`deliverx-screen-pack-01.canvas.tsx`](../../../.cursor/projects/Users-gnaneshwerjadav-Workspace-deliverx/canvases/deliverx-screen-pack-01.canvas.tsx). **Contextual Home + Daily Briefing shipped** on `/profile` (PD-2026-07-26o; [`../design/contextual-home-daily-briefing.md`](../design/contextual-home-daily-briefing.md)). Remaining pack-1 marketing/auth polish may still proceed as separate slices. Launchpad full-suite redesign is phased. Proposed £500/£250/£500/£800 money UI, employer marketplace liquidity, and deep Team Copilot remain **build-gated**; design approval does not supersede T9’s accepted catalogue, payments-later ops, Workspace alias policy, or charter gates.

---

## Shipped baseline (do not re-open without evidence)

| Band | Status |
| --- | --- |
| Product P0–P7 (+ P8 attestation) | Shipped + live-verified (T6 / T8 E2E) |
| Technology T0–T8 | Shipped |
| Technology T9 | **Shipped in code** (`0097`, Checkout, Portal, webhooks, entitlements); live payments **off** until founder Stripe ops |
| Remediation Batches 1–6 | Shipped |
| DB trust rails `0095` | Shipped |
| Observation consent SQL `0096` | Shipped |
| AI citation enforcement | Shipped |
| TD-001, TD-011, TD-017, TD-019 | Closed |

**Release posture:** Testable internally. Controlled pilot still gated primarily by **founder ops** (CI, Auth hygiene), not by missing T9 product code.

---

## A. Founder ops

Blocks live commercial enablement, continuous CI, and/or auth hygiene. Engineering cannot close these without founder action.

| ID | Item | Status | Why it matters | Owner | Effort | Blocks |
| --- | --- | --- | --- | --- | --- | --- |
| **TD-018** / R-P0-07 / MF-003 | Restore GitHub Actions minutes; re-enable `verify.yml` + `ci-e2e.yml` + `on.push` | **Closed 2026-08-26** — workflows active; green dispatch [32986767790](https://github.com/gnaneshwer23/deliverx/actions/runs/32986767790); `on.push` restored | Continuous CI back | Founder minutes + eng enable | S | Was: silent regressions on `main` |
| **TD-006** / R-P1-01 / MF-011 | Enable Auth leaked-password protection (HIBP) | **Open** | Advisor WARN; weak passwords accepted | Founder (Auth Attack Protection) | S | Auth hygiene for pilot / beta |
| **T9 Stripe ops** | Stripe Dashboard prices (test then live); Vercel `STRIPE_*` env; webhook endpoint + secret; Customer Portal; test checkout smoke | **Deferred ops** (code ready) | Without this, checkout stays config-gated; public £ prices stay pilot fallback | Founder | M | Live paid access; honest public pricing |
| **`DELIVERX_BILLING_ENFORCE=on`** | Flip entitlement enforcement after smoke | **Deferred ops** (default off) | Enforcement before ops would lock users out of Experience/Launchpad incorrectly | Founder (after smoke) | S | Paid-product gate behaviour |
| **R-P1-15** / MF-014 | SMTP / password-reset email delivery proof | **Open** | Recovery path unproven in prod | Founder / ops | S | Confident password recovery in pilot |
| **AT lab** | Human VoiceOver/NVDA + keyboard pass on Hub→Profile→Evidence; optional axe on authenticated journeys | **Open** (engineering a11y core closed Batch 5–6) | Whole-product WCAG 2.2 AA must not be claimed without AT evidence | Founder (+ eng support) | M | AA claim; controlled-pilot a11y confidence |
| **Legal counsel** (optional) | Review interim Privacy / Terms / Cookies | **Open** | Policies are practice-accurate interim, not counsel-signed | Founder / counsel | M | “Finished legal posture” claims |
| **TD-007 breadth** | Keep thin `pm-core` seed vs deepen single domain | **Pending decision** | Affects ScoreRun explainability without multi-profession expansion | Founder | S (decision) | Whether eng deepens seed (B-track) |

**Payments later — explicit:** Do **not** schedule engineering remediations whose only goal is “make Stripe live.” Founder will configure payments when ready; inventory item is ops, not a product backlog slice.

---

## B. Engineering optional / residual

Authorized under charter hardening. **Not** blocking “payments later.” Only items still open in debt/audit docs are listed; closed Batch items are omitted.

| ID | Item | Status | Why it matters | Owner | Effort | Blocks |
| --- | --- | --- | --- | --- | --- | --- |
| **R-P1-12** | Bind judgements/snapshots INSERT to Capability Engine / signed ScoreRun (DB-P1-03 follow-on) | **Done (Phase 5)** — `0103` removes authenticated child insert policies/DML; `0104` removes anon SELECT grants; owner reads retained; privacy purge bypass preserved | Child-row fabrication residual after ScoreRun lockdown | Engineering | M | Stronger DB trust (ScoreRuns already locked) |
| **R-P1-13** | AI injection red-team beyond regex lists; keep `DELIVERX_AI_ORCHESTRATION_BYPASS` off in prod | **Done (Phase 6)** — expanded red-team fixtures/patterns and production bypass fail-closed guard; Vercel env verified absent in Production | Jailbreak / skipped T4 guarantees | Engineering | M | Stronger AI trust claims |
| **R-P2-04** | Bound evidence child selects | **Done (Phase 3)** — product/UI evidence child reads capped with shared limits + regression guard | Latent payload / perf risk | Engineering | S | Scale readiness |
| **R-P2-05** | AI route `maxDuration` | **Done (Phase 2)** — explicit 30s route caps + regression guard | Long hangs / cost | Engineering | S | Ops reliability |
| **R-P2-06** | Explicit PI API rate limit | **Done (B9)** — `0101` + atomic `0102` increment RPC; kill-switch + thresholds | Abuse / cost | Engineering | M | Abuse resistance |
| **R-P2-07** | Mutable `search_path` advisor residuals | **Done (Phase 7)** — `0105` pins `search_path=public` on the residual memory-match and PI immutability functions | Advisor hygiene | Engineering | S | Clean security advisors |
| **R-P2-01** | Auth RLS initplan WARN ×N | **Open** (defer until load) | Latent query cost | Engineering | M | Perf at scale |
| **R-P2-02** | Unindexed PI FKs | **Open** (defer until load) | Latent query cost | Engineering | M | Perf at scale |
| **R-P2-03** | Profile/Career aggregate fan-out | **Open** (defer) | Read-path cost | Engineering | M | Perf polish |
| **R-P2-08** / TD-007 | Deepen `pm-core` seed (same pin) | **Open** — needs founder OK | Richer judgements without new professions | Engineering | M | Explainability depth |
| **R-P2-09** | Human review / challenge workflow usage | **Done (B4)** — playbook + queue + flag; Verified ≠ this path | Dispute path usable | Engineering / ops | M | Review ops maturity |
| **R-P2-10** | Org departments/teams seed for Workspace pilot | **Open** (0 rows) | Structure unused | Engineering | S | Workspace org demos |
| **R-P2-11** / TD-012 | Experience → workspace dual-write on remaining pages | **Open** / deferred | Observation coverage gaps | Engineering | M | Full observation coverage |
| **R-P2-16** | Coverage % tooling + Playwright/axe in CI | **In progress (Phase 1 soft launch)** — `@vitest/coverage-v8` floors on capability-engine / ai-orchestration / evidence `query-limits` in `verify.yml`; Playwright axe critical smoke on `/` + `/login` in `ci-e2e.yml` (`npm run test:a11y`). Residual: evidence `append`/`process` behavioural coverage; marketing serious color-contrast; AT lab | Continuous quality signal | Engineering | M | Soft-launch CI quality |
| **R-P2-17** | Soft AI rate / cost-estimate honesty | **Done (Phase 4)** — AI usage records/API disclose heuristic estimates, not provider billing | Heuristic cost copy | Engineering | S | Cost honesty |
| **R-P2-18** | Pre-pivot purge residue (org/delivery) | **Open** | Privacy residual track | Engineering | M | Full purge completeness |
| **TD-003** | Edge proxy anonymous path-guards | **Documented defer** | Layouts own redirects | Engineering | M | Proxy purity (not pilot-blocking) |
| **TD-013** | Full Mermaid ER publish | **Open** / deferred | Docs polish | Engineering | S | Schema docs completeness |
| **Mission Control density** | Further demotion / honesty outside Twin/PMO/Marketplace Batch 6 slice | **Residual** | Pre-pivot surfaces can confuse | Engineering | S–M | UX clarity (not charter expansion) |
| **CI enable follow-through** | After TD-018: keep verify truthful, wire live secrets, raise trust floors | **Partial** — TD-018 closed; coverage floors on verify; axe in ci-e2e; lint now blocks over live code while archived imports/canvas artifacts are ignored. Residual: `T6_SUPABASE_*` secrets and deeper ledger append/process coverage | Makes seal continuous | Engineering | S | Continuous CI |

**Closed — do not list as remaining:** R-P0-01…06/08, R-P1-02…11/14/16, R-P2-12…15 (core), Batches 1–6, citations, `0095`/`0096`, T8 E2E, Next 16.2.12, TD-017.

---

## C. Explicitly deferred / out of charter

Do **not** build without new founder approval recorded in [`../product/product-decisions.md`](../product/product-decisions.md).

| ID | Item | Status | Why deferred | Owner | Effort | Blocks |
| --- | --- | --- | --- | --- | --- | --- |
| MF-D02 / R-P4-02 | Employer marketplace liquidity / opportunity OS | Deferred | Charter out of scope | — | L | Would need new approval |
| MF-D03 / R-P4-03 | Enterprise mission-control depth / third SKU | Deferred | T7 alias only; demoted | — | L | Would need new approval |
| MF-D04 / R-P4-04 | Multi-profession frameworks beyond `pm-core` | Deferred | Founder gate | — | L | Would need new approval |
| MF-D05 / R-P4-05 | Graph DB / microservice split of intelligence domains | Deferred | Taxonomy only | — | L | Would need new approval |
| MF-D06 / R-P4-06 | First-class `messages` table | Deferred | Explicit non-goal | — | M | — |
| MF-D07 / R-P4-07 | Networking / hiring-manager OS | Deferred | Launchpad deferred modules | — | L | Would need new approval |
| MF-D08 / R-P4-08 / TD-008 | Progressive feature-flag SaaS platform | Deferred | Env gates enough for pilot | — | M | — |
| MF-D09 / R-P4-09 | Money-back / job guarantee product | Deferred / rejected | FAQ disclaims; Batch 2 removed offer | — | — | Legal trust if reintroduced |
| R-P4-01 eng expansion | Annual/enterprise packaging, tax/VAT automation, fourth Workspace SKU, custom card forms | Deferred | Beyond PD-2026-07-26d | — | L | Would need new approval |
| — | Agent swarms / chat-as-primary-DB | Deferred | Intelligence belongs to platform | — | — | Principles violation |
| — | Social OAuth (Google/GitHub) | Not required for pilot | Optional ICP need | — | M | Only if ICP requires |

---

## D. Document intake checklist

When the founder adds new documents for a post-audit gap check, compare each doc **systematically** against this inventory and the Product Bible. Do not implement from a new doc until the intake answers below are recorded.

### Compare against

1. **Product Bible** `docs/00`–`docs/15` (vision, PRD, UX, auth, PI, Experience, Launchpad, Team Copilot, AI, eng handbook, architecture, data model, QA, analytics, roadmap)
2. **Build Charter** + **Current Scope** + **Product Decisions**
3. **Feature completeness matrix** statuses (`docs/audit/feature-completeness-matrix.md`)
4. **This file** sections **A / B / C / E** (ops vs residual eng vs deferred vs pack net-new)
5. **Technical debt register** + **remediation roadmap** IDs (avoid duplicate tickets)

### Questions each new document must answer

| # | Question | Pass criterion |
| --- | ---: | --- |
| 1 | What **user problem** does it claim to solve? | Named persona + outcome; not “platform completeness” |
| 2 | Disposition: **keep / modify / defer / reject** relative to shipped loop? | Explicit one of four |
| 3 | Does it **conflict** with Build Charter or Current Scope? | If yes → stop for founder approval |
| 4 | Is the ask **net-new** or already **shipped** (P0–P8 / T0–T9 code / Batches 1–6)? | Cite evidence (matrix row, migration, live gate) |
| 5 | If residual: map to **A** (founder ops), **B** (eng optional), or **C** (out of charter)? | Single bucket |
| 6 | Does it reopen a **closed trust rail** (Verified, capability-only-via-engine, consent default OFF, learning≠capability)? | If yes → refuse or require PD update |
| 7 | Does it imply **live payments / enforcement** before Stripe ops? | Route to section A T9 ops, not new eng |
| 8 | What is the **smallest vertical slice** and acceptance test? | One slice; measurable AC |
| 9 | Effort **S / M / L** and what it **blocks** if skipped? | Honest sizing |
| 10 | Any **legal / commercial honesty** claim (prices, guarantee, Verified, WCAG AA)? | Must match shipped evidence |

### Intake workflow

```text
New doc arrives
  → Answer questions 1–10 in a short intake note (or PR description)
  → Diff claims vs feature matrix + remaining-work A/B/C/E
  → Update this file only if a genuinely new open item appears
  → Do not start implementation without charter fit + (if gated) founder PD
```

---

## E. Six-doc pack — net-new only (sourced 2026-07-26)

Source: Desktop `DeliverX_Six_Document_Build_Pack` (docs 00–06). Full requirement-by-requirement gap tables: gap-check canvas above.

| ID | Item | Status | Verdict | Effort | Notes |
| --- | --- | --- | --- | --- | --- |
| **PACK-E1** | Optional copy of six docs into `docs/build-pack/` + SoT note | **Open** — founder OK | Defer | S | Docs-only; pack Index requests path; Bible remains higher SoT than pack |
| **PACK-E2** | Formal recommendation entity + state machine (generated→viewed→accepted/dismissed) | **Done (B2)** | Keep | M | `0098` + `src/lib/recommendations/`; flag `DELIVERX_RECOMMENDATION_SM`; PD-2026-07-26f |
| **PACK-E3** | Documented, versioned confidence-band algorithm (Schema §5.1) | **Done (B1)** | Keep | S | `confidence-bands@2026.1` — algorithm doc + typed SoT + UI why-copy |
| **PACK-E4** | Xperience entry ceremony (company welcome→role→team→project→activity) | **Done (B6)** | Keep | M | Narrative entry over generated sim state; `src/lib/xperience/entry-ceremony.ts` + UI; kill-switch `DELIVERX_XP_ENTRY_CEREMONY` (default on); no migration/API; PD-2026-07-26j |
| **PACK-E5** | Human reviewer ops playbook + queue usage (not Verified path) | **Done (B4)** | Keep | M | Playbook + hardened queue; flag `DELIVERX_REVIEWER_QUEUE`; PD-2026-07-26h; Verified = T8 only |
| **PACK-E6** | Onboarding shape: keep 6-step PI vs evolve toward pack 8-step conversation | **Done (B5)** | Keep | M | 8-step `v2-conversation` shipped by evolving the existing wizard; migration `0099`; flag `DELIVERX_ONBOARDING_STEP_SET` (rollback `v1-six-step`); PD-2026-07-26i; self-reported strengths never become capability |
| **PACK-E7** | App-shell global search (+ help) | **Done (B7)** | Keep | M | `src/lib/global-search/`; shell Cmd/Ctrl+K + `/help`; `GET /api/pi/search` self-only; flag `DELIVERX_GLOBAL_SEARCH` default on; no Insights product (CX-05); PD-2026-07-26k |
| **PACK-E8** | Pilot success-metric instrumentation (activation / loop completion KPIs) | **Done (B3)** | Keep | M | Typed Vercel event catalogue, real state-transition emission, PII sanitizer, KPI operations note; no DB migration |
| **PACK-E9** | PostHog vs keep Vercel Analytics | **Vercel selected for pilot; PostHog pending** | Keep Vercel now | M | Founder authorized Vercel path; PostHog SDK/sink remains blocked by **FD-PACK-7** |

**Explicitly rejected from pack (do not add as build work):** money-back / guarantee terms on Pricing; schema rename to pack table names; restart M0–M7 greenfield; “one company” seed replacing 12-company catalogue (PD-2026-07-03); Insights as a third product Home; Prisma alongside typed Supabase client.

**Conflicts flagged (founder):** pack SoT order under-ranks Product Bible; Team Copilot “architecture only” vs shipped Workspace alias (keep alias, refuse third SKU); human-reviewer-primary verification vs Capability Engine + T8 Verified rules.

**Build-out sequencing:** See [`six-doc-build-phases.md`](./six-doc-build-phases.md) for the full Built/Partial/Missing ledger and dependency-ordered **B0–B9** phases (not pack M0–M7).

---

## Priority view (max 10)

| Pri | Bucket | Item |
| ---: | --- | --- |
| 1 | A | TD-018 — restore CI minutes / enable workflows |
| 2 | A | TD-006 — leaked-password Auth toggle |
| 3 | A | SMTP password-reset proof |
| 4 | A | VoiceOver/keyboard AT lab (before AA claims) |
| 5 | A | Stripe ops + enforce **when founder chooses “payments later” is now** |
| 6 | B | R-P1-12 judgements/snapshots INSERT binding — **Done (Phase 5)** |
| 7 | B | R-P1-13 AI injection red-team (bypass stays off) — **Done (Phase 6)** |
| 8 | B | R-P2-16 coverage/Playwright CI after TD-018 — **Phase 1 slice in progress** (floors + axe critical smoke) |
| 9 | B | R-P2-06 PI API rate limit | **Done (B9)** |
| 10 | C | Marketplace / mission-control / multi-profession — stay deferred |

---

## Related

- [`../product/current-scope.md`](../product/current-scope.md)  
- [`next-steps.md`](./next-steps.md)  
- [`six-doc-build-phases.md`](./six-doc-build-phases.md)  
- [`b1-b9-outcomes-efficiency-audit.md`](./b1-b9-outcomes-efficiency-audit.md)  
- [`../audit/release-readiness.md`](../audit/release-readiness.md)  
- [`../audit/missing-functionality-register.md`](../audit/missing-functionality-register.md)  
- [`../15-delivery-roadmap.md`](../15-delivery-roadmap.md)  
- Six-doc gap check: [`canvases/deliverx-six-doc-gap-check.canvas.tsx`](./canvases/deliverx-six-doc-gap-check.canvas.tsx)  
- Six-doc B phases: [`canvases/deliverx-six-doc-build-phases.canvas.tsx`](./canvases/deliverx-six-doc-build-phases.canvas.tsx)  
- B0–B9 outcomes audit: [`canvases/deliverx-b1-b9-outcomes-audit.canvas.tsx`](./canvases/deliverx-b1-b9-outcomes-audit.canvas.tsx)  
