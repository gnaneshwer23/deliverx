# DeliverX — Six-Doc Pack Built vs Missing + Build-Out Phases (B1…)

**As of:** 2026-07-26  
**Authority:** Build Charter · Current Scope · Product Bible · prior gap check (`2fed883`)  
**Source pack:** Desktop `DeliverX_Six_Document_Build_Pack` (docs 01–06; Index 00 advisory)  
**Plain-text extracts:** `/tmp/deliverx-six-doc-pack/`  
**Companion canvas:** Cursor IDE [`deliverx-six-doc-build-phases.canvas.tsx`](../../../.cursor/projects/Users-gnaneshwerjadav-Workspace-deliverx/canvases/deliverx-six-doc-build-phases.canvas.tsx) · repo [`canvases/deliverx-six-doc-build-phases.canvas.tsx`](./canvases/deliverx-six-doc-build-phases.canvas.tsx)  
**Prior gap check:** [`remaining-work.md` §E](./remaining-work.md) · [`canvases/deliverx-six-doc-gap-check.canvas.tsx`](./canvases/deliverx-six-doc-gap-check.canvas.tsx)

**Status of this doc:** Build-out plan for Missing + Partial remainder. **B1–B9 shipped** (B9 founder-authorized 2026-07-26 via reply `b9`). Optional **B0** remains founder-optional. Does **not** restart pack greenfield M0–M7.

**Migration head (repo files):** `supabase/migrations/0105_fix_mutable_search_path_residuals.sql` (Phase 7 advisor hygiene; `0105` pins `search_path=public` on residual memory-match and PI immutability functions). **Prod `jibmyxaldetyycmtlxet` — schema-level state confirmed (verified 2026-09-15, PD-2026-09-15d):** the end-state of `0103`–`0105` (capability-child insert lockdown, anon-SELECT revoke, `search_path=public` pins) is enforced in production; the Supabase security advisor flags no `search_path` residuals. Distinguish **schema vs ledger**: the migration **history ledger** (`schema_migrations`) lags at `0102` with timestamp-style versions that never matched the numeric file prefixes (a pre-existing divergence), so the ledger does not list `0103`–`0105` even though their effect is live. This is a bookkeeping gap, not a security gap; no prod DDL is run to close it (see [`../product/current-scope.md`](../product/current-scope.md) and [`lovable-enhancement-phases.md`](./lovable-enhancement-phases.md) Phase 1). B2 pilot flag **on** in Vercel Production + Preview (`DELIVERX_RECOMMENDATION_SM=on`, 2026-07-26). B4 flag `DELIVERX_REVIEWER_QUEUE` defaults **off** until founder enables. B5 flag `DELIVERX_ONBOARDING_STEP_SET` defaults to the shipped 8-step set; set `v1-six-step` to roll back. B6 flag `DELIVERX_XP_ENTRY_CEREMONY` is a kill-switch defaulting **on**; set `off` to roll back. B7 flag `DELIVERX_GLOBAL_SEARCH` defaults **on**. B8 flag `DELIVERX_PILOT_ADMIN` defaults **on** (+ org-admin role gate). B9 flag `DELIVERX_PI_RATE_LIMIT` defaults **on** (thresholds via `DELIVERX_PI_RATE_LIMIT_MAX` / `_WINDOW_MS`).

**Payments:** Deferred founder ops. T9 code shipped; no Bn phase enables live Stripe.

---

## 0. How to read this

| Layer | Meaning |
| --- | --- |
| **Verified codebase facts** | Paths, migrations, routes checked in-repo on 2026-07-26 |
| **Product assumptions** | Pack hypothesises one-org / human-reviewer-primary / 8-step onboarding |
| **Technical recommendations** | Phase ordering below |
| **Founder decisions required** | FD-PACK-* and ops gates — see §4 |

**Status vocabulary (this ledger):**

| Status | Meaning |
| --- | --- |
| **Built** | Requirement met for pilot; evidence cited |
| **Partial** | Core exists; named remainder listed |
| **Missing** | Not built (pack net-new / not inventoried before §E) |
| **Conflicts** | Contradicts Charter / PD / trust rails — reject or modify only with PD |
| **Out of charter** | Needs new founder approval; do not schedule as Bn |

**Reconciliation with gap check `2fed883`:** Counts below stay in the same band (~28 Built, ~28 Partial, ~9 Missing, handful Conflicts). One explicit correction: marketing **GUARANTEE** copy is already honest (no money-back) in `src/lib/marketing/homepage-data.ts` — the **conflict** is the pack UI spec asking for guarantee terms, not a live product defect. Classification of that pack claim remains **Conflicts → Reject**.

---

## 1. Status summary counts

| Status | Count | Notes |
| --- | ---: | --- |
| Built | 37 | Core evidence loop + trust rails + T0–T9 code + B1–B9 (bands, recommendations, KPIs, reviewer ops, onboarding, ceremony, search, thin admin, NFR polish) |
| Partial | 20 | Remains mapped into Bn or remaining-work A/B |
| Missing | 5 | Aligns with PACK-E1, E4, E7/E9 (E2/E3/E5/E6/E8 done) |
| Conflicts | 5 | Reject / modify-with-PD |
| Out of charter | 4 | Marketplace, third SKU depth, multi-profession, microservices |
| **Total material rows** | **74** | De-duplicated across docs 01–06 |

---

## 2. Built vs Missing ledger (de-duplicated)

Evidence paths verified present unless noted.

### 2.1 Master PRD (01)

| ID | Requirement | Status | Evidence / remainder | Verdict |
| --- | --- | --- | --- | --- |
| FR-001 | Visitor understands product; clear CTAs | Partial | Built: `src/app/(marketing)/`, CTAs → signup. Remainder: residual aspirational copy vs feature matrix | Keep |
| FR-002 | Create/verify account; session; protected routes | Built | Supabase Auth; `e2e/t0-signed-in-loop.test.ts`; route guards | Keep |
| FR-003 | Personalised onboarding with saved/editable progress | **Built** | 8-step conversation `v2-conversation` in `src/lib/pi-onboarding/types.ts`, `/onboarding/profile`, `src/app/api/pi-onboarding/`; review step is the editable identity summary; progressive save + cross-set resume (PACK-E6 / B5) | Keep |
| FR-004 | Profile without presenting claims as evidence | Built | SnapshotClaims; Verified gate; ledger empty until evidence | Keep |
| FR-005 | Enter simulated org + assigned project | Partial | Built: 12-company catalogue `0079`, Experience planner, Day-1 sim. Remainder: pack entry ceremony screens (PACK-E4); “one org” pack wording conflicts with catalogue PD | Modify |
| FR-006 | Activities + versioned artefact submissions | Built | `0088_artefact_versions.sql`; Experience → ledger | Keep |
| FR-007 | Reviewer/controlled rule verifies → evidence | **Built** (ops path) | Capability Engine persist; consent `0096`; T8 attestation `0094` for Verified; human reviewer queue + playbook (PACK-E5 / B4) — **non-Verified** | Keep |
| FR-008 | Evidence maps to capability definitions | Built | ScoreRuns pin `pm-core@2026.1`; `src/lib/capability-engine/` | Keep |
| FR-009 | PI updates with explanation | Built | Growth reports; SnapshotClaims; AI citations `src/lib/ai-orchestration/citations.ts` | Keep |
| FR-010 | Next action with rationale (goal/evidence/gap) | **Built** | Formal SM `0098` + `src/lib/recommendations/`; Profile/Career panels (PACK-E2 / B2) | Keep |
| FR-011 | Admin manages org/project config | **Built** (thin) | `/settings/admin` + `src/lib/pilot-admin/` + permissioned `/api/org/config` + `/api/org/projects`; audited; no evidence rewrite (PACK B8) | Keep |
| FR-012 | Launchpad consumes evidence | Partial | Built: T7 readiness honesty; `/launchpad/app`, `/career`, `/portfolio`. Remainder: CV/interview depth; marketplace deferred | Keep |
| BR-001 | Observation ≠ evidence until verification | Built | `0095`, `0096`; observation modules | Keep |
| BR-002 | AI may observe/feedback; not high-confidence verified evidence | Built | AI orchestration `0090`; citations; Capability Engine–only writes | Keep |
| BR-003 | Evidence stores provenance/context/verifier | Built | Evidence ledger + attestation provenance | Keep |
| BR-004 | Capability from evidence; explainable recommendations | Built | Capability path + recommendation SM (FR-010 / B2) | Keep |
| BR-005 | User visibility control | Built | Privacy settings; export/delete `0086` | Keep |
| BR-006 | No marketing of mocked/unbuilt as available | Partial | Batch 2 honesty; residual matrix copy items | Keep |
| NFR-SEC | RLS, least privilege, secrets, rate limits | **Built** (pilot) | Built: RLS/trust rails + PI API rate limit R-P2-06 / B9. Remainder: CI secret scanning when TD-018 | Keep |
| NFR-PRIV | Consent, export, deletion | Built | `0086`, `0096`; settings privacy | Keep |
| NFR-A11Y | WCAG 2.2 AA target | Partial | Batch 5–6 core chrome; whole-product AA needs AT lab (ops) | Keep |
| NFR-PERF | Responsive pages; AI non-blocking | **Built** (pilot) | AI route `maxDuration` R-P2-05 closed in Phase 2; remaining perf work is scale/CI-led | Keep |
| NFR-OBS | Logs, analytics, AI cost/latency | Partial | AI interactions logged; product funnel KPIs thin (PACK-E8) | Modify |
| NFR-QA | Typed contracts, tests, no placeholder release actions | Partial | Release-gate + units; CI dark TD-018 | Keep |
| METRICS | Activation ≥70%, loop ≥50%, etc. | Missing | Targets in PRD only; not instrumented as product KPIs (PACK-E8) | Defer |

### 2.2 TRD (02)

| ID | Requirement | Status | Evidence / remainder | Verdict |
| --- | --- | --- | --- | --- |
| TRD-STACK | Next/React/TS/Tailwind/Supabase/Vitest/Playwright/GHA | Partial | Built: Next **16.2.12** (pack said 15), stack otherwise. Remainder: GHA disabled TD-018 | Modify |
| TRD-ORM | Prisma **or** typed Supabase client | Built | Typed Supabase client chosen — do not add Prisma | Keep |
| TRD-ANALYTICS | PostHog product events | Missing | `@vercel/analytics` + Speed Insights only (`src/components/vercel-observability.tsx`). PostHog MCP now available — PACK-E9 founder decision | Defer |
| TRD-EMAIL | Resend transactional | Partial | `src/lib/email/resend.ts`. Remainder: SMTP reset proof R-P1-15 | Keep |
| TRD-PAY | Stripe deferred unless commercial | Built (code) / Ops | `0097`, `src/lib/billing/`; payments later — **not** a Bn eng phase | Keep |
| TRD-AI-AGENTS | Manager/Stakeholder/Observer; structured + provenance | Built | `0090`; citations enforcement | Keep |
| TRD-AI-BOUND | Agents propose; verification creates evidence | Built | Consent + engine + T8 rules | Keep |
| TRD-SM-ARTEFACT | draft→submitted→superseded immutable | Built | `0088` | Keep |
| TRD-SM-REC | Recommendation generated→viewed→accepted/dismissed | **Built** | `0098` + typed SM; accepted→completed|dismissed for close-out (PACK-E2 / B2) | Keep |
| TRD-SM-ACTIVITY | Activity + reviewer state machine | **Built** (pilot) | Intervention SM + Experience task/meeting/risk SM honesty (B9); reviewer path via B4 | Keep |
| TRD-SEC-RLS | RLS + service-role server-only | Built | `0092`/`0095`; T6 security | Keep |
| TRD-SEC-RATE | Rate limits auth/AI/uploads | **Built** (pilot) | PI per-user `0101` + org AI + platform key limits (B9 / R-P2-06) | Keep |
| TRD-CI | PR gates + staging Playwright | Partial | Workflows exist but disabled TD-018 | Keep |
| TRD-FLAGS | Feature flags for incomplete modules | Partial | Env gates; progressive flag SaaS deferred MF-D08 | Defer |

### 2.3 UI/UX (03)

| ID | Requirement | Status | Evidence / remainder | Verdict |
| --- | --- | --- | --- | --- |
| UX-PRINCIPLES | Calm, evidence-distinct, explainable | Built | UX bible; Batch 3 language; suite shell | Keep |
| UX-SHELL | Top bar: search, notifications, help, account | **Built** | Global search + Help in ProductSuiteShell (PACK-E7 / B7); notifications + account remain | Keep |
| UX-NAV | Home/PI/Xperience/Launchpad/Team Copilot/Portfolio/Insights/Settings | Partial | Built: suite nav without Insights (CX-05 reject). Settings + Help shell links exist | Modify |
| UX-MKT | Marketing page set | Partial | Most `(marketing)` routes live; Enterprise/Contact depth varies | Keep |
| UX-ONB-8 | 8-step conversation onboarding | **Built** | `welcome → identity → targets → strengths → evidence → working_style → review → path`; claim labels, skippable non-essentials, explained recommendation (PACK-E6 / B5) | Keep |
| UX-HOME | Today/journey/PI snapshot/experience/≤3 recs | Partial | `/hub` + profile-centre; not pack zone layout 1:1 | Modify |
| UX-PI | Overview/Capabilities/Evidence/Growth/Portfolio/Privacy | Built | `/profile`, ledger, growth, `/portfolio`, settings privacy | Keep |
| UX-XP | Company/project/activity/meetings/evidence screens | Partial | Day-1 + planner + workspace; ceremony thinner (PACK-E4) | Modify |
| UX-PRICING-G | Pricing includes guarantee terms | Conflicts | Pack asks for guarantees; product **rejects** money-back (`GUARANTEE` in `homepage-data.ts`, Batch 2, MF-D09) | Reject |
| UX-A11Y | AA acceptance checklist | Partial | Core chrome done; AT lab before claim | Keep |
| UX-TYPE | Inter or Geist | Partial | Existing design system prevails; do not force Inter restyle | Defer |

### 2.4 App Flow (04)

| ID | Requirement | Status | Evidence / remainder | Verdict |
| --- | --- | --- | --- | --- |
| FLOW-E2E | Primary visitor→…→PI→next action | Built | T6 LIVE + T8 attestation E2E; release-gate | Keep |
| FLOW-PUBLIC | Marketing→signup with product context | Partial | `postSignupPath` / `start/*`; residual polish | Keep |
| FLOW-XP-ENTRY | Welcome→role→team→project→activity | Partial | Catalogue + Day-1; ceremony Missing (PACK-E4) | Modify |
| FLOW-REVIEWER | Human reviewer queue workflow | **Built** (ops) | `pi_review_*` + playbook + flag; Verified ≠ this path (PACK-E5 / B4) | Keep |
| FLOW-ADMIN | Admin configures org/role/project/activities | **Built** (thin) | Pilot admin org/project/structure + membership; activities remain Experience/workspace create paths — not enterprise CMS (B8) | Keep |
| FLOW-LP-UNLOCK | Launchpad after min evidence or choice | Partial | Entitlements `0097` + readiness honesty; unlock rules not pack-literal | Keep |
| FLOW-FAIL | AI timeout, upload, duplicate submit, session recovery | **Built** (pilot) | AI fallback + B9 pending/retry codes + 429 honesty; residual polish open | Keep |

### 2.5 Backend Schema (05)

| ID | Requirement | Status | Evidence / remainder | Verdict |
| --- | --- | --- | --- | --- |
| SCH-PRINCIPLES | Postgres SoT; claims≠obs≠evidence≠capability; immutability | Built | Bible 12; `0095`/`0088` | Keep |
| SCH-NAMING | Pack generic table names | Partial | Shipped `pi_*` / ScoreRun — conceptual map only; **do not rename** | Modify |
| SCH-BANDS | Versioned confidence-band algorithm | **Built** | `confidence-bands@2026.1` — [`confidence-band-algorithm.md`](./confidence-band-algorithm.md) + `src/lib/capability-engine/confidence-bands.ts` (PACK-E3 / B1) | Keep |
| SCH-AI-PROV | AI provenance fields | Built | `0090` ai_agents / prompts / interactions | Keep |
| SCH-DELETE | Export/delete + storage cascade | Built | `0086` + cascade maps | Keep |
| SCH-SEED-ONE | Seed one company + three activities | Conflicts | `0079` 12-company catalogue; PD-2026-07-03 | Reject |
| SCH-INTEGRITY | Cross-user denial; verification; append-only | Built | T6 security + `0095` | Keep |
| SCH-AUDIT | First-class `audit_events` table | Partial | Domain events / privacy tombstones / AI logs; unified table not 1:1 | Defer |

### 2.6 Implementation Plan (06) — process only

| ID | Requirement | Status | Evidence / remainder | Verdict |
| --- | --- | --- | --- | --- |
| IMPL-M0 | Audit baseline | Built | `docs/audit/*`; remaining-work | Keep |
| IMPL-M1-M7 | Foundation through PI loop | Built | P0–P8 + T0–T8 — **do not rebuild** | Keep |
| IMPL-M8 | Pilot hardening | Partial | Batches 1–6 done; founder ops gate controlled pilot | Keep |
| IMPL-M9 | Launchpad foundation | Partial | T7 + Career/Portfolio; marketplace deferred | Keep |
| IMPL-CURSOR | Permanent Cursor product-team rule | Built | `.cursor/rules/deliverx.mdc` | Keep |
| IMPL-PATH | Store pack in `/docs/build-pack/` | Missing | Directory absent (PACK-E1) | Defer |

### 2.7 Conflicts & out of charter (pack claims)

| ID | Claim | Status | Disposition |
| --- | --- | --- | --- |
| CX-01 | Pricing guarantee terms | Conflicts | **Reject** — MF-D09 / Batch 2 / `GUARANTEE` honesty |
| CX-02 | One-company seed | Conflicts | **Reject** — keep `0079` catalogue |
| CX-03 | Pack SoT above Product Bible | Conflicts | **Modify** — pack advisory under Bible + Charter |
| CX-04 | Human reviewer as primary Verified path | Conflicts | **Modify** — reviewer optional ops; Verified = T8 attestation only |
| CX-05 | Insights as primary nav product | Conflicts | **Reject** as third Home; suite IA stands |
| OOC-01 | Employer marketplace liquidity | Out of charter | Deferred MF-D02 |
| OOC-02 | Enterprise Team Copilot / third SKU | Out of charter | Alias only T7; MF-D03 |
| OOC-03 | Multi-profession beyond `pm-core` | Out of charter | MF-D04 |
| OOC-04 | Graph DB / intelligence microservices | Out of charter | MF-D05 |

---

## 3. Build-out phases (B0…B9) — Missing + Partial remainder only

**Do not reuse pack M0–M7.** Each phase notes which pack milestone *themes* it satisfies without implying restart.

**Parallel tracks (not Bn):** Founder ops A (TD-018, TD-006, SMTP, AT lab, Stripe later) and residual eng remaining-work §B (R-P1-12, R-P1-13, …) continue independently.

### Phase index

| Phase | One-liner | Size | Pack themes satisfied | Blocked on |
| --- | --- | --- | --- | --- |
| **B0** | Archive pack into `docs/build-pack/` + advisory SoT note | S | Index / IMPL-PATH | FD-PACK-1/2 (optional) |
| **B1** | Document + label versioned confidence-band algorithm | S · **Shipped** | Schema 5.1 / SCH-BANDS / explainability | — |
| **B2** | Formal recommendation entity + state machine | M · **Shipped** | FR-010 / TRD-SM-REC / M7 “next action” | — |
| **B3** | Pilot KPI event layer (Vercel; PostHog deferred) | M · **Shipped** | METRICS / NFR-OBS / PACK-E8 | — |
| **B4** | Human reviewer ops playbook + thin queue (non-Verified) | M · **Shipped** | FR-007 remainder / FLOW-REVIEWER / M5 review | — |
| **B5** | Onboarding shape — evolved to the 8-step conversation | M · **Shipped** | FR-003 / UX-ONB-8 / M3 | — |
| **B6** | Xperience entry ceremony screens | M · **Shipped** | FR-005 / FLOW-XP-ENTRY / M4 | — |
| **B7** | App-shell global search + help (no Insights product) | M · **Shipped** | UX-SHELL / PACK-E7 | — |
| **B8** | Thin admin org/project config for pilot | M | FR-011 / FLOW-ADMIN / M4 admin | **Shipped** (founder reply `B8`) |
| **B9** | Pack-aligned NFR polish (rate limit, failure recovery, activity SM honesty) | M · **Shipped** | NFR-SEC rate / FLOW-FAIL / TRD-SM-ACTIVITY | Prefer after TD-018 for CI proof (shipped without CI; TD-018 still open) |

---

### B0 — Pack archive (docs only)

1. **Objective / value:** Founder-accessible pack in-repo without elevating it above Bible.  
2. **IDs:** IMPL-PATH, PACK-E1, CX-03.  
3. **Reuse:** Existing `docs/product/*` SoT hierarchy.  
4. **Code areas:** `docs/build-pack/*` (copies), short README pointing to Charter > Bible > pack.  
5. **DB:** None.  
6. **APIs:** None.  
7. **AI:** None.  
8. **UX:** None.  
9. **Deps/risks:** SoT confusion if README omits advisory status.  
10. **AC/tests:** Docs review only.  
11. **Flag/rollback:** Delete folder.  
12. **DoD:** Pack text + advisory SoT note committed.  
13. **Size / approval:** S · optional founder OK (FD-PACK-1/2).

---

### B1 — Confidence-band algorithm (**shipped** 2026-07-26)

1. **Objective / value:** Candidates and employers can understand confidence bands without pseudo-% theatre.  
2. **IDs:** SCH-BANDS, PACK-E3, BR-004 (explainability), UX-PRINCIPLES.  
3. **Reuse:** `src/lib/capability-engine/` levels (`emerging`, etc.), SnapshotClaims, PD-2026-07-05.  
4. **Code areas:** [`confidence-band-algorithm.md`](./confidence-band-algorithm.md); `confidence-bands.ts`; Profile / Career / Portfolio / Evidence label strings.  
5. **DB:** **None** (no enum migration).  
6. **APIs:** None required; SnapshotClaims / Profile / Career expose `confidenceBandAlgorithmVersion`.  
7. **AI:** No new agents.  
8. **UX:** “Why this band” copy where bands appear; no decorative confidence %.  
9. **Deps/risks:** Must not invent unexplained scores; must not light Verified.  
10. **AC/tests:** Unit tests for band mapping + algorithm version; `test:pi`.  
11. **Flag:** None.  
12. **DoD:** **Met** — versioned algorithm documented; UI labels match; tests green.  
13. **Size / approval:** S · founder selected B1 (`Start Building B1`).

**Pack milestone theme:** M7 explainability / Schema §5.1 — without rebuilding M7.

**Ship artefact:** Algorithm version `confidence-bands@2026.1` (PD-2026-07-26e).

---

### B2 — Recommendation state machine (**shipped** 2026-07-26)

1. **Objective / value:** Explainable, dismissible next actions with retained rationale (FR-010 literal).  
2. **IDs:** FR-010, TRD-SM-REC, PACK-E2, UX-HOME (≤3 recs).  
3. **Reuse:** Capability snapshot `recommendations`, Career matching recommendations, Profile CTAs.  
4. **Code areas:** `src/lib/recommendations/` (new), Profile/Hub surfaces, notifications optional.  
5. **DB:** `0098_pi_recommendations.sql` — entity + status enum + evidence link table + append-only events; RLS self-only; immutable rationale.  
6. **APIs:** `GET/POST/PATCH /api/pi/recommendations` (list/sync, accept, dismiss, complete, viewed).  
7. **AI:** None in this slice — generation is deterministic from SnapshotClaims; no capability writes.  
8. **UX:** Profile + Career “Recommended next actions” with why + accept/dismiss.  
9. **Deps/risks:** Must not mutate verified evidence; recommendations reversible. Depends on B1 if bands cited (payload may include band algorithm version).  
10. **AC/tests:** State transition unit tests; SQL contract / RLS negatives; `test:pi`; release-gate PASS.  
11. **Flag:** `DELIVERX_RECOMMENDATION_SM=on` — enabled in Vercel Production + Preview (2026-07-26).  
12. **DoD:** **Met** — SM persisted; UI wired; dismiss does not alter evidence; tests pass.  
13. **Size / approval:** M · founder reply `B2` = **FD-PACK-6** (PD-2026-07-26f).

**Pack theme:** M7 next-action / TRD recommendation SM.

**Ship artefact:** Lifecycle `generated → viewed → accepted | dismissed` (+ `accepted → completed | dismissed`); migration `0098`.

---

### B3 — Pilot KPI instrumentation (**shipped** 2026-07-26)

1. **Objective / value:** Measure activation / loop completion against PRD targets without vanity dashboards.  
2. **IDs:** METRICS, NFR-OBS, PACK-E8; sink choice PACK-E9.  
3. **Reuse:** Existing domain events where present; Vercel Analytics.  
4. **Code areas:** `src/lib/analytics/` typed event catalogue + privacy sanitizer; emit on successful signup, onboarding complete, Experience start/plan, persisted capability assessment, evidence append, artefact version, recommendation viewed/accepted, outcome record.
5. **DB:** **None** — Vercel custom events only.
6. **APIs:** Internal emit helper; no public analytics API.  
7. **AI:** Log schema-failure/cost already in `ai_interactions` — link funnel events to interaction IDs where useful.  
8. **UX:** None (or internal ops view later — out of Bn unless asked).  
9. **Deps/risks:** Privacy — typed allowlist excludes PII/free text; Vercel custom-event plan availability and protected-preview delivery must be confirmed operationally. PostHog adapter remains blocked by FD-PACK-7.
10. **AC/tests:** Event-name contracts + PII stripping + kill-switch tests; `test:pi`.
11. **Flag:** `DELIVERX_ANALYTICS=vercel|off` (production default Vercel); `NEXT_PUBLIC_DELIVERX_PILOT_KPIS=off` for client signup kill switch. `posthog` intentionally emits nothing.
12. **DoD:** **Met** — catalogue + KPI map documented; core state transitions emit; no migration or PostHog dependency.
13. **Size / approval:** M · founder authorized Vercel path; PostHog still needs **FD-PACK-7**.

**Pack theme:** PRD §7 metrics / TRD observability.

---

### B4 — Human reviewer ops (non-Verified) (**shipped** 2026-07-26)

1. **Objective / value:** Structured review for disputes/submissions without pretending reviewers light `deliverxVerified`.  
2. **IDs:** FR-007 remainder, FLOW-REVIEWER, PACK-E5, R-P2-09.  
3. **Reuse:** `src/lib/pi-review/`, `0073`, admin review API.  
4. **Code areas:** Reviewer queue UI; playbook doc; notifications on case transitions.  
5. **DB:** Reused `pi_review_*` (no new migration).  
6. **APIs:** `/api/pi/review/*` hardened behind flag; no Verified write path; trust guards.  
7. **AI:** Observer may propose observations; reviewer decide; citations required if AI-assisted.  
8. **UX:** Queue + reason-mandatory decisions; clear “does not grant Verified badge”.  
9. **Deps/risks:** **Trust:** must not bypass Capability Engine or T8 attestation rules (CX-04).  
10. **AC/tests:** Trust-rail units + status machine; Verified remains false without attestation; `pi-review` in `test:pi` / release-gate.  
11. **Flag:** `DELIVERX_REVIEWER_QUEUE=on` — **default off**; founder enables in Vercel when ready.  
12. **DoD:** Playbook + usable queue; zero Verified side-effects; tests pass.  
13. **Size / approval:** M · **FD-PACK-5** (PD-2026-07-26h).

**Pack theme:** M5 review — without replacing T8.

---

### B5 — Onboarding shape decision slice (**shipped** 2026-07-26)

1. **Objective / value:** Clearer first-run personalisation **or** confirm shipped 6-step is enough.  
2. **IDs:** FR-003, UX-ONB-8, PACK-E6, FLOW onboarding exceptions.  
3. **Reuse:** `src/lib/pi-onboarding/`, wizard component, API — **modified, not rebuilt**.  
4. **Code areas:** `src/lib/pi-onboarding/types.ts` (step sets + review summary + recommendation rationale), `src/lib/pi-onboarding/flag.ts` (new), wizard, `/api/pi-onboarding`, `/onboarding/profile`.  
5. **DB:** `0099_pi_onboarding_step_sets.sql` — widens the `current_step` check to the union of both step sets. No data change; `payload` JSON already flexible.  
6. **APIs:** Existing `/api/pi-onboarding` plus an explicit `action: "skip"` for non-essential steps.  
7. **AI:** None in this slice — recommendation rationale is deterministic; no evidence created from self-report.  
8. **UX:** Expanded to the pack 8-step conversation with claim labels, review-before-use and an explained recommendation.  
9. **Deps/risks:** Overlong onboarding hurts activation METRICS — mitigated by three skippable steps, progressive save and `steps_skipped` in the KPI event.  
10. **AC/tests:** Step-set walk, cross-set resume mapping, per-set validation, claim-vs-evidence labels, flag resolution — `src/lib/pi-onboarding/types.test.ts` (now inside `test:pi`).  
11. **Flag:** `DELIVERX_ONBOARDING_STEP_SET` — unset/`v2-conversation` ships the 8-step shape; `v1-six-step` rolls back with no redeploy.  
12. **DoD:** **Met** — founder-chosen shape shipped; sessions resume across step sets; no capability/Verified side-effects; tests green.  
13. **Size / approval:** M · **FD-PACK-3** (PD-2026-07-26i).

**Pack theme:** M3 onboarding.

**Ship artefact:** Step set `v2-conversation` = `welcome → identity → targets → strengths → evidence → working_style → review → path`; migration `0099`.

---

### B6 — Xperience entry ceremony (**shipped** 2026-07-26)

1. **Objective / value:** Coherent company→role→team→project→first activity narrative.  
2. **IDs:** FR-005 remainder, FLOW-XP-ENTRY, UX-XP, PACK-E4.  
3. **Reuse:** Catalogue `0079`, Experience planner, Day-1 sim, generated `ExperienceSimState` — **not rebuilt**.  
4. **Code areas:** `src/lib/xperience/entry-ceremony.ts` (step machine + content derivation + flag); `src/components/xperience/entry-ceremony.tsx`; wired into `src/components/xperience/product-app.tsx`; flag resolved in `src/app/(xperience)/experience/app/page.tsx`.  
5. **DB:** **None** — ceremony is UI-only over the sim state already returned by `POST /api/xperience/experience/start`. `0099` remains prod head.  
6. **APIs:** **None new** — reuses the existing start response state.  
7. **AI:** None in this slice — narrative is deterministic from generated state; no agent calls, no evidence.  
8. **UX:** Five-step entry (`company → role → team → project → first_activity`) after offer-accept and before the dashboard; skip on every step; accessible stepper (`aria-current`, focus moves to each step heading); loading/empty/error fallback copy when state is missing; mobile collapses to a single column so the first activity stays reachable.  
9. **Deps/risks:** Copy states the workplace is simulated and Day-1 depth; must not imply a full multi-week sim. Ceremony invents no scores and lights nothing.  
10. **AC/tests:** `src/lib/xperience/entry-ceremony.test.ts` (17) covers step order, transitions (next/back/skip/goto/complete, finished immutability), progress, content derivation from state, safe fallback, meeting-vs-decision first activity, and flag resolution; `src/lib/xperience` added to `test:pi`.  
11. **Flag:** `DELIVERX_XP_ENTRY_CEREMONY` — kill-switch defaulting **on**; set `off`/`0`/`false`/`disabled` to roll back to direct-to-dashboard with no redeploy, no data change.  
12. **DoD:** **Met** — ceremony reaches the first activity and enters the workspace; no fake evidence, no capability, no Verified; consent default OFF untouched; tests green; build passes.  
13. **Size / approval:** M · **FD-PACK-4** (PD-2026-07-26j).

**Pack theme:** M4 organisation/project entry.

**Ship artefact:** Step machine `xp-entry-ceremony@2026.1` = `company → role → team → project → first_activity`; no migration.

---

### B7 — Shell search + help

1. **Objective / value:** Find profile/evidence/projects without new product Home.  
2. **IDs:** UX-SHELL, PACK-E7; CX-05 reject Insights product.  
3. **Reuse:** ProductSuiteNav, notifications, settings.  
4. **Code areas:** `src/components/dx/` shell; `src/lib/global-search/`; search API limited to own resources.  
5. **DB:** None.  
6. **APIs:** `GET /api/pi/search?q=` self-only.  
7. **AI:** None required.  
8. **UX:** Search + help link; **no Insights nav item**.  
9. **Deps/risks:** Data leak if search ignores RLS — mitigated by explicit `user_id` / `created_by` filters.  
10. **AC/tests:** Cross-user search negatives; a11y for dialog; catalogue filter + keyboard index units.  
11. **Flag:** `DELIVERX_GLOBAL_SEARCH` kill-switch **defaults ON**; set `off` to roll back.  
12. **DoD:** **Met** — Search self-only; help page linked (`/help`).  
13. **Size / approval:** M · **FD-PACK-8 settled (PD-2026-07-26k)**.

**Pack theme:** UX shell (not M-series). **Shipped 2026-07-26.**

---

### B8 — Thin admin config

1. **Objective / value:** Operate one pilot org/project safely without enterprise CMS.  
2. **IDs:** FR-011, FLOW-ADMIN.  
3. **Reuse:** Admin framework seed, org structure `0093`, existing `/api/org/*`, Settings shell.  
4. **Code areas:** `src/lib/pilot-admin/`; `/settings/admin`; `/api/org/config`; `/api/org/projects`.  
5. **DB:** None — seed documentation only; avoid schema churn (`0099` remains head).  
6. **APIs:** Permissioned admin routes only (org-admin + flag).  
7. **AI:** None.  
8. **UX:** Calm admin forms; audit note on changes; link to `/workspace/audit`.  
9. **Deps/risks:** Admin must not rewrite verified evidence (pack rule) — enforced by invariants + audit metadata.  
10. **AC/tests:** Permission tests; no evidence mutation; a11y note + alerts.  
11. **Flag:** `DELIVERX_PILOT_ADMIN` kill-switch defaults **on** + org-admin role gate.  
12. **DoD:** **Met** — Pilot operator can edit allowed org/project/structure config.  
13. **Size / approval:** M · **founder OK depth (PD-2026-07-26l)**.

**Pack theme:** M4 admin. **Shipped 2026-07-26.**

---

### B9 — Pack-aligned NFR polish (**shipped** 2026-07-26)

1. **Objective / value:** Rate-limit / recovery / activity-state honesty matching TRD without new SKUs.  
2. **IDs:** TRD-SEC-RATE, FLOW-FAIL, TRD-SM-ACTIVITY, NFR-SEC remainder.  
3. **Reuse:** Existing API routes, Experience activity models, `platformRateLimitEngine`, recommendation SM pattern.  
4. **Code areas:** `src/services/piApiRateLimit.ts`, `src/lib/pi/rate-limit-*`, `src/lib/api/pi-errors.ts`, intervention + Experience activity SMs; wired PI routes.  
5. **DB:** `0101_pi_api_rate_limits.sql` — per-user window counters; RLS on, no client policies. `0102` — atomic `pi_api_rate_limit_increment` (+ optional prune RPC); service_role only.  
6. **APIs:** Same routes; 429 `{code:"rate_limited"}` + `Retry-After`; 409 `{code:"invalid_transition"}`.  
7. **AI:** Org AI 429 now includes `ai_rate_limited` + `Retry-After`; bypass stays off in prod.  
8. **UX:** Calm retry copy; evidence/process honest pending/retryHint.  
9. **Deps/risks:** Prefer CI (TD-018) to prove continuously — **not claimed restored**.  
10. **AC/tests:** Rate-limit + SM + error-contract units; `test:pi` includes `src/lib/pi` + `experience-sim`.  
11. **Flag:** `DELIVERX_PI_RATE_LIMIT` kill-switch defaults **on**; thresholds via `DELIVERX_PI_RATE_LIMIT_MAX` / `_WINDOW_MS`.  
12. **DoD:** **Met** — documented limits + tests; no trust-rail bypass.  
13. **Size / approval:** M · founder reply `b9` = PD-2026-07-26m (no new FD-PACK).

**Pack theme:** M8 hardening. **Shipped 2026-07-26.**

**Ship artefact:** Default 90 req / 60s per user; migration `0101`.

---

## 4. Founder decisions & ops gates

### 4.1 Decisions (product) — recorded as pending in `product-decisions.md`

| ID | Decision | Default if silent | Blocks |
| --- | --- | --- | --- |
| FD-PACK-1 | Pack advisory vs elevate into SoT under Bible | Advisory | B0 framing |
| FD-PACK-2 | Copy pack into `docs/build-pack/`? | Skip until asked | B0 |
| FD-PACK-3 | Keep 6-step vs 8-step onboarding | **Settled — 8-step (PD-2026-07-26i)** | — |
| FD-PACK-4 | Xperience entry ceremony vs Day-1 enough | **Settled — build ceremony (PD-2026-07-26j)** | — |
| FD-PACK-5 | Human reviewer ops path (non-Verified)? | **Settled — yes (PD-2026-07-26h)** | — |
| FD-PACK-6 | Formal recommendation SM now? | **Settled — yes (PD-2026-07-26f)** | — |
| FD-PACK-7 | PostHog vs Vercel Analytics | Stay Vercel | B3 PostHog sink |
| FD-PACK-8 | Global search/help (no Insights product)? | **Settled — build search + help (PD-2026-07-26k)** | — |

### 4.2 Founder ops (not Bn)

| Item | Blocks |
| --- | --- |
| CI follow-through (`T6_SUPABASE_*` live secrets) | Continuous proof for B9; release confidence |
| TD-006 leaked-password Auth | Pilot auth hygiene |
| SMTP password-reset proof | Recovery confidence |
| AT lab (VoiceOver/keyboard) | Whole-product AA claim |
| Stripe ops + enforce | Live paid access only — **payments later** |

### 4.3 Explicit not-in-scope

- Employer marketplace / opportunity liquidity  
- Third SKU / enterprise mission-control depth  
- Multi-profession frameworks beyond `pm-core`  
- Graph DB / intelligence microservices  
- Money-back / job guarantee claims  
- Live payments / `DELIVERX_BILLING_ENFORCE` engineering chase  
- Pack greenfield M0–M7 restart  
- Schema rename to pack table names  
- Insights as a product Home  
- Prisma alongside typed Supabase client  

---

## 5. Recommended next phase

**B1–B9 shipped.** Next eng candidates: optional **B0** (pack archive) if founder wants docs intake, or residual founder-ops (TD-018, TD-006, SMTP, AT lab). PostHog remains deferred pending FD-PACK-7.

Do **not** expand into enterprise mission-control without new founder approval. Do **not** treat Stripe as next eng work.

---

## 6. Related

- [`remaining-work.md`](./remaining-work.md) §E  
- [`next-steps.md`](./next-steps.md)  
- [`../product/current-scope.md`](../product/current-scope.md)  
- [`../product/build-charter.md`](../product/build-charter.md)  
- [`../product/product-decisions.md`](../product/product-decisions.md)  
