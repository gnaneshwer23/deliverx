# Phase 12 — Prioritised remediation roadmap

**Date:** 2026-07-25  
**Authority:** Build Charter · Current Scope · Product Bible `00`/`13`/`15` · specialist audits under `docs/audit/`  
**Constraint:** Audit synthesis only — **no product code or migrations in this pass**  
**Migration head:** `0095_db_trust_rail_lockdown.sql` (production, 2026-07-25)
**T8 status:** **Shipped** in code/docs (`0094`, attestation store, Verified gate). **Not** in T6 signed-in harness — treat as **Complete but unverified E2E** (units strong; live attestor → Verified-on journey not automated). Do not invent E2E pass.

Severity (this roadmap):

| Sev | Meaning |
| --- | --- |
| **P0 Blocker** | Security / data integrity / broken auth / cross-user / unusable core / legal-commercial contradiction that must not face external users |
| **P1 Critical** | Core evidence-loop gaps, misleading AI/copy, serious UX trust issues, auth hardening ops |
| **P2 Major** | Significant polish, partial features, latent scale risk |
| **P3 Minor** | Nice-to-have, thin surfaces |
| **P4 Future** | Charter-deferred architecture / T9+ |

**Finding counts (unique remediation items below):** P0 **8** · P1 **16** · P2 **18** · P3 **8** · P4 **9** · **Total 59**

---

## Severity inventory

### P0 Blockers (8)

| ID | Problem | Impact | Evidence | Proposed solution | Affected files (expected) | Deps | Acceptance | Size | Now/defer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **R-P0-01 — Closed** | Own-row `ALL` RLS on `pi_capability_score_runs`; no forbid-mutation trigger | Authenticated JWT could invent/alter/delete ScoreRuns outside Capability Engine | `0095`: SELECT-only owner policy, authenticated DML revoked, immutable trigger with purge-only bypass; all engine callers use service role | `0095_db_trust_rail_lockdown.sql`; capability persist callers; live RLS tests | None | Owner/non-owner PostgREST mutation denied; service-role engine write and purge pass | M | **Resolved — Batch 1** |
| **R-P0-02 — Closed** | Own-row `ALL` on `vpp_entries` allowed client-set `externally_attested` / `externally_verified` | Self-Verified badge without attestation | `0095`: explicit owner CRUD plus protected-column trigger; service-role-only attestation state RPC | `0095`; `external-attestation/store.ts`; VPP store/tests | R-P0-01 | Owner/non-owner protected writes denied; privileged attestation path passes | M | **Resolved — Batch 1** |
| **R-P0-03 — Closed** | Evidence transitions allowed client `to_status=platform_verified` | API verification-honesty bypass | `0095`: RLS excludes elevated status, trigger denies direct inserts, narrow service-role append RPC | `0095`; `evidence-ledger/append.ts`; live security tests | Batch 1 | Owner/non-owner elevated insert denied; attestation append passes | M | **Resolved — Batch 1** |
| **R-P0-04 — Closed** | Priced CTAs + money-back guarantee with **no Stripe / T9** | Legal & trust; sells what cannot be fulfilled | Batch 2 honesty pass: pilot access labels; no £ checkout prices; no money-back offer | Marketing `career-suite.ts`, homepage, `/pricing`, start pages | T9 blocked | No unpaid guarantee claim; no “buy” implication without entitlement | S | **Resolved — Batch 2** |
| **R-P0-05 — Closed** | Privacy / Terms are placeholders while product implies finished legal posture | Compliance / credibility | Interim pilot Privacy + Terms with practice-accurate copy + contact | `(marketing)/privacy`, `terms` | Legal counsel later | No false finished-policy claim; interim markers present | S–M | **Resolved — Batch 2** |
| **R-P0-06 — Closed** | Unexplained decorative % on marketing/auth | Violates “no unexplained scores” | Removed AuthBrandPanel 40%/3x/97% and landing problem %; qualitative copy only | `home-sections`, heroes, `AuthBrandPanel`, `landing-sections` | — | No bare capability-like % without method label | S | **Resolved — Batch 2** |
| **R-P0-07** | CI workflows disabled (TD-018) | Regressions silent on `main` | `release-readiness`; MF-003 | Founder restore Actions minutes → enable `verify.yml` + `ci-e2e.yml` → re-add `on.push` | `.github/workflows/*` | Billing | Push runs release gate | S (ops) | **Fix now** (founder) |
| **R-P0-08 — Closed** | Archetype `DEMO_STORIES` read as testimonials | Misleading social proof | Relabelled “Illustrative journeys / Example path”; `PILOT_QUOTE` remains disabled | `homepage-data`, landing | — | No fake-testimonial reading | S | **Resolved — Batch 2** |

### P1 Critical (16)

| ID | Problem | Impact | Evidence | Solution | Files | Deps | Acceptance | Size | Now/defer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **R-P1-01** | TD-006 leaked-password protection OFF | Weak passwords accepted | Advisors; TD-006 | Founder Auth Attack Protection toggle | Supabase dashboard | Founder | Advisor WARN cleared | S | **Now** (founder) |
| **R-P1-02** | T8 attestation E2E not in T6 | Verified-on path unproven live | Matrix; MF-012; 0 attestation rows | Add harness: request → confirm → Verified on → dispute | `e2e/t0-*` or `e2e/t8-attestation.test.ts` | Mail/token | Live or local suite asserts Verified lights only via attest | M | **Now** |
| **R-P1-03** | Next.js **16.2.9** high advisories | Middleware/SSRF/DoS class | `npm audit`; SEC-P1-01 | Upgrade ≥**16.2.11**; re-audit | `package.json` / lockfile | Build | `npm audit` Next highs closed; build + gate pass | S | **Soon** (optional attach if tiny; prefer after batch 1) |
| **R-P1-04 — Closed** | Cookie consent + `/cookies` missing | GDPR/analytics risk | `/cookies` (+ `/cookie` alias); essential auth + honest Vercel analytics note; no fake banner | New page + footer link | Legal | Policy reachable; analytics gated if required | M | **Resolved — Batch 2** |
| **R-P1-05** | ScoreRun jargon user-facing | Unprofessional; engine leak | UX P0-3 | Human labels; engine name admin-only | Profile, Evidence, Hub, Launchpad CTAs | — | No primary CTA says “ScoreRun” | S | Honesty/UX |
| **R-P1-06 — Closed** | Launchpad / Experience marketing ahead of shipped depth | Expectation gap | Launchpad includes → Career Intelligence (readiness/roadmap/CV→VPP/interview/applications); twin/salary/LinkedIn demoted | `career-suite`, Experience/Launchpad marketing | TD-011 | Marketing matches LIVE | S | **Resolved — Batch 2** |
| **R-P1-07** | Multi-shell / duplicated nav | Coherence failure | UX P1-1 | One primary IA for pilot; demote legacy | AppShell, WorkspaceSidebar, product shells | T7 | Single clear nav story | L | Defer full; small demotion now OK |
| **R-P1-08** | Workspace points at Command Centre | Undermines T7 demotion | UX P1-2 | Remove pointer; hide demoted routes | `workspace/page.tsx` | — | No Command Centre pitch on home | S | Now |
| **R-P1-09** | Launchpad vs Career Intelligence naming | Confused SKU | UX P1-5 | Hub/Launchpad single primary label | Hub, career-intelligence-app | — | Consistent product name | S | Now |
| **R-P1-10** | PI review “Seed sample finding” | Demo affordance in trust surface | UX P1-4 | Gate to admin/dev or remove | `review-queue-app.tsx` | — | No seed in production UX | S | Now |
| **R-P1-11** | `workspace_observations` ALL without SQL consent | Consent bypass via PostgREST | DB-P1-01 | INSERT trigger requiring consented row | **`0096+`** after batch 1 | Batch 1 | No observe without consent row | M | After batch 1 |
| **R-P1-12** | Judgements/snapshots INSERT own under invented ScoreRuns | Capability child fabrication | DB-P1-03 | Bind to engine role / signed run | Migration + persist | R-P0-01 | Child rows only via engine | M | With/after batch 1 |
| **R-P1-13** | AI injection = regex lists; bypass flag | Jailbreak / skipped T4 guarantees | AI-P1-01/02 | Keep bypass off prod; expand patterns + red-team | `guardrails.ts`, `run.ts` | — | Bypass off; tests for known injections | M | Now (config) / later (red-team) |
| **R-P1-14** | Empty citations allowed on coach outputs | Fake evidence-backed feel | AI-P1-03 | Require citations when evidence bound; UI “uncited” | Coach validators + UI | — | Uncited labelled | M | Soon |
| **R-P1-15** | Password-reset email not proven | Recovery may fail | MF-014 | Founder SMTP send test | Auth config | Founder | Reset mail received | S | Ops |
| **R-P1-16** | Unlabeled `readinessPct` risk | Trust if labels strip | MF-013; TD-011 | Audit Career UI for source labels | career-intelligence UI | — | Every % has source label | S | Now |

### P2 Major (18) — summary

| ID | Problem | Size | Now/defer |
| --- | --- | --- | --- |
| R-P2-01 | Auth RLS initplan WARN ×106 (latent) | M | Defer until load |
| R-P2-02 | Unindexed PI FKs (~61) | M | Defer until load |
| R-P2-03 | Profile/Career aggregate fan-out | M | Defer |
| R-P2-04 | Unbounded child selects on evidence | S | Soon |
| R-P2-05 | AI `maxDuration` absent | S | Soon |
| R-P2-06 | No PI API rate limit | M | Soon |
| R-P2-07 | Mutable `search_path` advisors | S | Soon |
| R-P2-08 | Framework seed thin (TD-007) | M | Founder |
| R-P2-09 | Human review workflow unused | M | Later |
| R-P2-10 | Org departments/teams 0 rows | S | When Workspace pilot |
| R-P2-11 | TD-012 dual-write incomplete | M | Later |
| R-P2-12 | TD-017 fixture lint/tsc debt | M | Before CI returns |
| R-P2-13 | Launchpad non-MVP “later” modules | S | Hide |
| R-P2-14 | Root metadata “AI Delivery Platform” | S | Now |
| R-P2-15 | WCAG gaps (icon name, alerts, tiny text) | M | Parallel a11y |
| R-P2-16 | No coverage tooling / Playwright CI | M | After TD-018 |
| R-P2-17 | Soft AI rate / cost estimate honesty | S | Later |
| R-P2-18 | Pre-pivot purge residue (org/delivery) | M | Privacy residual track |

### P3 Minor (8)

| ID | Item |
| --- | --- |
| R-P3-01 | Social OAuth not offered (OK for pilot) |
| R-P3-02 | `xperience` URL spelling |
| R-P3-03 | Marketing purple accents vs calm green |
| R-P3-04 | Product analytics catalogue thin |
| R-P3-05 | SEO uneven beyond homepage |
| R-P3-06 | Settings Phase B–H health jargon |
| R-P3-07 | Brief v2 onboarding jargon |
| R-P3-08 | Twin/PMO/marketplace cron surfaces ignore for pilot |

### P4 Future / deferred (9)

| ID | Item | Why |
| --- | --- | --- |
| R-P4-01 | T9 Stripe / commercial packaging | Charter — separate founder approval |
| R-P4-02 | Employer marketplace liquidity | Out of scope |
| R-P4-03 | Mission-control depth | T7 demoted |
| R-P4-04 | Multi-profession frameworks | Founder gate |
| R-P4-05 | Graph DB / microservice split | Taxonomy only |
| R-P4-06 | First-class `messages` table | Explicit non-goal |
| R-P4-07 | Networking / hiring-manager OS | Deferred Launchpad |
| R-P4-08 | Progressive feature-flag SaaS (TD-008) | Env gates enough |
| R-P4-09 | Job guarantee product | FAQ disclaims — keep out |

---

## Roadmap by workstream

### 1. Release blockers

1. **DB trust-rail lockdown** (R-P0-01…03) — **shipped in `0095`**
2. Commercial honesty (R-P0-04, R-P0-08) + decorative % (R-P0-06) — **shipped Batch 2**
3. Legal Privacy/Terms/Cookies (R-P0-05, R-P1-04) — **shipped Batch 2**
4. Restore CI (R-P0-07) + TD-006 (R-P1-01)  
5. Next patch ≥16.2.11 (R-P1-03)

### 2. Core workflow fixes

- T8 E2E harness (R-P1-02)  
- Consent SQL (R-P1-11) + judgement binding (R-P1-12)  
- Readiness label audit (R-P1-16)  
- Password-reset ops proof (R-P1-15)

### 3. Data / security fixes

- Batch 1 migration `0095`  
- Follow-on observation consent trigger  
- Advisors: search_path, rate-limit explicit deny policies  
- npm audit Next bump

### 4. UX improvements

- ScoreRun language (R-P1-05)  
- Nav / Command Centre / naming (R-P1-07…09)  
- Remove review seed (R-P1-10)  
- Metadata title (R-P2-14)  
- A11y P2 items (R-P2-15)

### 5. AI quality improvements

- Bypass off in prod (verify)  
- Citation requirement / uncited label  
- Red-team injection suite  
- Optional PI rate limit

### 6. Missing tests

- PostgREST RLS regression for ScoreRun / VPP / transitions (batch 1 AC)  
- T8 attestation journey  
- Profile aggregate integration; PI API matrix (see `missing-test-plan.md`)  
- Re-enable live gate secrets when CI returns  
- axe smoke after TD-018

### 7. Documentation

- Update `docs/qa/release-readiness.md` after batch 1  
- TD register: open DB trust class; close items when fixed  
- Marketing vs ledger honesty (TD-011) completion note  
- Product Decisions if Verified DB enforcement wording changes

### 8. Deferred architecture

- All R-P4-*  
- Perf indexes / initplan rewrite until real row volume  
- Pre-pivot delivery OS expansion  
- Full WCAG AA programme as a project (not a single slice)

---

## Recommended sequence

```text
Batch 1 (founder approve): DB trust-rail lockdown 0095 + RLS/regression tests — SHIPPED
     ↓
Batch 2 (founder approve): Honesty + legal — prices/guarantee/demo %/Launchpad includes + Privacy/Terms/Cookies — SHIPPED
     ↓
Founder ops: TD-018 CI · TD-006 HIBP · SMTP reset test
     ↓
T8 E2E harness + Next ≥16.2.11
     ↓
UX naming / ScoreRun language / Command Centre demotion
     ↓
DB-P1 consent + judgement binding · AI citations · a11y smoke
     ↓
(Only with founder): T9 commercial
```

**Do not start T9.** Do not expand marketplace / mission-control / multi-profession without approval.

**Batch 2 shipped.** Remaining batches require founder approval.
