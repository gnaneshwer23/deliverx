# DeliverX — Six-Doc Pack Built vs Missing + Build-Out Phases (B1…)

**As of:** 2026-07-26  
**Authority:** Build Charter · Current Scope · Product Bible · prior gap check (`2fed883`)  
**Source pack:** Desktop `DeliverX_Six_Document_Build_Pack` (docs 01–06; Index 00 advisory)  
**Plain-text extracts:** `/tmp/deliverx-six-doc-pack/`  
**Companion canvas:** Cursor IDE [`deliverx-six-doc-build-phases.canvas.tsx`](../../../.cursor/projects/Users-gnaneshwerjadav-Workspace-deliverx/canvases/deliverx-six-doc-build-phases.canvas.tsx) · repo [`canvases/deliverx-six-doc-build-phases.canvas.tsx`](./canvases/deliverx-six-doc-build-phases.canvas.tsx)  
**Prior gap check:** [`remaining-work.md` §E](./remaining-work.md) · [`canvases/deliverx-six-doc-gap-check.canvas.tsx`](./canvases/deliverx-six-doc-gap-check.canvas.tsx)

**Status of this doc:** Build-out plan for Missing + Partial remainder. **B1 and B2 shipped** (founder `Start Building B1`; founder reply `B2` = FD-PACK-6 / PD-2026-07-26f, 2026-07-26). Other Bn phases remain **not** authorised until founder selection. Does **not** restart pack greenfield M0–M7.

**Migration head (verified in-repo):** `supabase/migrations/0098_pi_recommendations.sql`. New migrations continue at `0099+`. Production apply of `0098` is a founder/ops step if the linked Supabase project has not yet received it.

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
| Built | 30 | Core evidence loop + trust rails + T0–T9 code + B1 bands + B2 recommendation SM |
| Partial | 27 | Remains mapped into Bn or remaining-work A/B |
| Missing | 8 | Aligns with PACK-E1, E4–E9 (E2/E3 done) |
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
| FR-003 | Personalised onboarding with saved/editable progress | Partial | Built: 6-step PI onboarding `src/lib/pi-onboarding/types.ts`, `/onboarding/profile`, `src/app/api/pi-onboarding/`. Remainder: pack 8-step conversation shape (PACK-E6) | Modify |
| FR-004 | Profile without presenting claims as evidence | Built | SnapshotClaims; Verified gate; ledger empty until evidence | Keep |
| FR-005 | Enter simulated org + assigned project | Partial | Built: 12-company catalogue `0079`, Experience planner, Day-1 sim. Remainder: pack entry ceremony screens (PACK-E4); “one org” pack wording conflicts with catalogue PD | Modify |
| FR-006 | Activities + versioned artefact submissions | Built | `0088_artefact_versions.sql`; Experience → ledger | Keep |
| FR-007 | Reviewer/controlled rule verifies → evidence | Partial | Built: Capability Engine persist; consent `0096`; T8 attestation `0094` for Verified. Remainder: human reviewer queue thin (`0073`, `src/lib/pi-review/`) — PACK-E5 | Modify |
| FR-008 | Evidence maps to capability definitions | Built | ScoreRuns pin `pm-core@2026.1`; `src/lib/capability-engine/` | Keep |
| FR-009 | PI updates with explanation | Built | Growth reports; SnapshotClaims; AI citations `src/lib/ai-orchestration/citations.ts` | Keep |
| FR-010 | Next action with rationale (goal/evidence/gap) | **Built** | Formal SM `0098` + `src/lib/recommendations/`; Profile/Career panels (PACK-E2 / B2) | Keep |
| FR-011 | Admin manages org/project config | Partial | Built: thin admin framework seed. Remainder: ops console depth | Defer |
| FR-012 | Launchpad consumes evidence | Partial | Built: T7 readiness honesty; `/launchpad/app`, `/career`, `/portfolio`. Remainder: CV/interview depth; marketplace deferred | Keep |
| BR-001 | Observation ≠ evidence until verification | Built | `0095`, `0096`; observation modules | Keep |
| BR-002 | AI may observe/feedback; not high-confidence verified evidence | Built | AI orchestration `0090`; citations; Capability Engine–only writes | Keep |
| BR-003 | Evidence stores provenance/context/verifier | Built | Evidence ledger + attestation provenance | Keep |
| BR-004 | Capability from evidence; explainable recommendations | Built | Capability path + recommendation SM (FR-010 / B2) | Keep |
| BR-005 | User visibility control | Built | Privacy settings; export/delete `0086` | Keep |
| BR-006 | No marketing of mocked/unbuilt as available | Partial | Batch 2 honesty; residual matrix copy items | Keep |
| NFR-SEC | RLS, least privilege, secrets, rate limits | Partial | Built: RLS/trust rails. Remainder: PI API rate limit R-P2-06; CI secret scanning when TD-018 | Keep |
| NFR-PRIV | Consent, export, deletion | Built | `0086`, `0096`; settings privacy | Keep |
| NFR-A11Y | WCAG 2.2 AA target | Partial | Batch 5–6 core chrome; whole-product AA needs AT lab (ops) | Keep |
| NFR-PERF | Responsive pages; AI non-blocking | Partial | Generally met; AI `maxDuration` R-P2-05 open | Keep |
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
| TRD-SM-ACTIVITY | Activity + reviewer state machine | Partial | Experience/workspace models differ; human under_review path thin | Modify |
| TRD-SEC-RLS | RLS + service-role server-only | Built | `0092`/`0095`; T6 security | Keep |
| TRD-SEC-RATE | Rate limits auth/AI/uploads | Partial | R-P2-06 open | Keep |
| TRD-CI | PR gates + staging Playwright | Partial | Workflows exist but disabled TD-018 | Keep |
| TRD-FLAGS | Feature flags for incomplete modules | Partial | Env gates; progressive flag SaaS deferred MF-D08 | Defer |

### 2.3 UI/UX (03)

| ID | Requirement | Status | Evidence / remainder | Verdict |
| --- | --- | --- | --- | --- |
| UX-PRINCIPLES | Calm, evidence-distinct, explainable | Built | UX bible; Batch 3 language; suite shell | Keep |
| UX-SHELL | Top bar: search, notifications, help, account | Partial | Notifications + account in shell. Remainder: global search + help (PACK-E7) | Modify |
| UX-NAV | Home/PI/Xperience/Launchpad/Team Copilot/Portfolio/Insights/Settings | Partial | Built: `src/config/product-suite-nav.ts` (Hub/Profile/Experience/Launchpad/Workspace/Portfolio). Remainder: Insights-as-product = reject; Settings exists | Modify |
| UX-MKT | Marketing page set | Partial | Most `(marketing)` routes live; Enterprise/Contact depth varies | Keep |
| UX-ONB-8 | 8-step conversation onboarding | Partial / Missing shape | 6-step shipped; 8-step not (PACK-E6) | Defer |
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
| FLOW-REVIEWER | Human reviewer queue workflow | Partial | `pi_review_*` thin / 0 cases; Verified ≠ this path | Modify |
| FLOW-ADMIN | Admin configures org/role/project/activities | Partial | Seed + thin admin (FR-011) | Defer |
| FLOW-LP-UNLOCK | Launchpad after min evidence or choice | Partial | Entitlements `0097` + readiness honesty; unlock rules not pack-literal | Keep |
| FLOW-FAIL | AI timeout, upload, duplicate submit, session recovery | Partial | AI fallback units; idempotency/recovery polish residual | Keep |

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
| **B3** | Pilot KPI event layer (provider-agnostic; PostHog optional) | M | METRICS / NFR-OBS / PACK-E8 | FD-PACK-7 for PostHog sink only |
| **B4** | Human reviewer ops playbook + thin queue (non-Verified) | M | FR-007 remainder / FLOW-REVIEWER / M5 review | FD-PACK-5 |
| **B5** | Onboarding shape (keep 6-step **or** rebuild toward 8-step) | M | FR-003 / UX-ONB-8 / M3 | FD-PACK-3 |
| **B6** | Xperience entry ceremony screens | M | FR-005 / FLOW-XP-ENTRY / M4 | FD-PACK-4 |
| **B7** | App-shell global search + help (no Insights product) | M | UX-SHELL / PACK-E7 | FD-PACK-8 |
| **B8** | Thin admin org/project config for pilot | M | FR-011 / FLOW-ADMIN / M4 admin | Founder OK depth |
| **B9** | Pack-aligned NFR polish (rate limit, failure recovery, activity SM honesty) | M | NFR-SEC rate / FLOW-FAIL / TRD-SM-ACTIVITY | Prefer after TD-018 for CI proof |

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
11. **Flag:** `DELIVERX_RECOMMENDATION_SM=on` default off until pilot.  
12. **DoD:** **Met** — SM persisted; UI wired; dismiss does not alter evidence; tests pass.  
13. **Size / approval:** M · founder reply `B2` = **FD-PACK-6** (PD-2026-07-26f).

**Pack theme:** M7 next-action / TRD recommendation SM.

**Ship artefact:** Lifecycle `generated → viewed → accepted | dismissed` (+ `accepted → completed | dismissed`); migration `0098`.

---

### B3 — Pilot KPI instrumentation

1. **Objective / value:** Measure activation / loop completion against PRD targets without vanity dashboards.  
2. **IDs:** METRICS, NFR-OBS, PACK-E8; sink choice PACK-E9.  
3. **Reuse:** Existing domain events where present; Vercel Analytics.  
4. **Code areas:** `src/lib/analytics/` event catalogue; emit on signup, onboarding complete, activity start, submission, evidence verify, PI update.  
5. **DB:** Optional `0098+` `analytics_events` if server-side store desired; else client/provider only.  
6. **APIs:** Internal emit helper; no public analytics API.  
7. **AI:** Log schema-failure/cost already in `ai_interactions` — link funnel events to interaction IDs where useful.  
8. **UX:** None (or internal ops view later — out of Bn unless asked).  
9. **Deps/risks:** Privacy — no PII in event props; consent for marketing analytics if added. PostHog MCP authenticated in workspace — **adapter optional** after FD-PACK-7.  
10. **AC/tests:** Event name contract tests; no PII fixture asserts.  
11. **Flag:** `DELIVERX_ANALYTICS=vercel|posthog|off`.  
12. **DoD:** Catalogue documented; core funnel events emit; provider selectable.  
13. **Size / approval:** M · PostHog sink needs **FD-PACK-7**; Vercel-only path can proceed without it.

**Pack theme:** PRD §7 metrics / TRD observability.

---

### B4 — Human reviewer ops (non-Verified)

1. **Objective / value:** Structured review for disputes/submissions without pretending reviewers light `deliverxVerified`.  
2. **IDs:** FR-007 remainder, FLOW-REVIEWER, PACK-E5, R-P2-09.  
3. **Reuse:** `src/lib/pi-review/`, `0073`, admin review API.  
4. **Code areas:** Reviewer queue UI; playbook doc; notifications on case transitions.  
5. **DB:** Prefer reuse `pi_review_*`; maybe `0098+` indexes/status only.  
6. **APIs:** Existing `/api/pi/review/*` hardened; no Verified write path.  
7. **AI:** Observer may propose observations; reviewer decide; citations if AI-assisted.  
8. **UX:** Queue + reason-mandatory decisions; clear “does not grant Verified badge”.  
9. **Deps/risks:** **Trust:** must not bypass Capability Engine or T8 attestation rules (CX-04).  
10. **AC/tests:** RLS cross-user; Verified remains false without attestation; release-gate trust tests.  
11. **Flag:** `DELIVERX_REVIEWER_QUEUE=on`.  
12. **DoD:** Playbook + usable queue; zero Verified side-effects; tests pass.  
13. **Size / approval:** M · **FD-PACK-5**.

**Pack theme:** M5 review — without replacing T8.

---

### B5 — Onboarding shape decision slice

1. **Objective / value:** Clearer first-run personalisation **or** confirm shipped 6-step is enough.  
2. **IDs:** FR-003, UX-ONB-8, PACK-E6, FLOW onboarding exceptions.  
3. **Reuse:** `src/lib/pi-onboarding/`, wizard component, API.  
4. **Code areas:** Onboarding wizard steps only if rebuild approved.  
5. **DB:** Likely none (payload JSON already flexible).  
6. **APIs:** Existing `/api/pi-onboarding`.  
7. **AI:** Wording assist only; no evidence creation from self-report.  
8. **UX:** Either polish 6-step copy **or** expand toward pack 8-step with claim labels.  
9. **Deps/risks:** Overlong onboarding hurts activation METRICS.  
10. **AC/tests:** Persist/resume tests; claim-vs-evidence labels.  
11. **Flag:** step-set version env.  
12. **DoD:** Founder-chosen shape shipped + tests.  
13. **Size / approval:** M · **blocked FD-PACK-3**.

**Pack theme:** M3 onboarding.

---

### B6 — Xperience entry ceremony

1. **Objective / value:** Coherent company→role→team→project→first activity narrative.  
2. **IDs:** FR-005 remainder, FLOW-XP-ENTRY, UX-XP, PACK-E4.  
3. **Reuse:** Catalogue `0079`, Experience planner, Day-1 sim, org knowledge.  
4. **Code areas:** `src/app` Experience entry routes/components.  
5. **DB:** Optional progress flags on assignment; else client+existing assignment status.  
6. **APIs:** Thin progress PATCH if persisted.  
7. **AI:** Stakeholder intro may use bounded agents + citations.  
8. **UX:** Multi-step entry; skip allowed; mobile prioritises start activity.  
9. **Deps/risks:** Must not market as full multi-week sim if still Day-1 depth.  
10. **AC/tests:** E2E reaches first activity; no fake evidence.  
11. **Flag:** `DELIVERX_XP_ENTRY_CEREMONY=on`.  
12. **DoD:** Ceremony complete or explicitly deferred with FD.  
13. **Size / approval:** M · **blocked FD-PACK-4**.

**Pack theme:** M4 organisation/project entry.

---

### B7 — Shell search + help

1. **Objective / value:** Find profile/evidence/projects without new product Home.  
2. **IDs:** UX-SHELL, PACK-E7; CX-05 reject Insights product.  
3. **Reuse:** ProductSuiteNav, notifications, settings.  
4. **Code areas:** `src/components/dx/` shell; search API limited to own resources.  
5. **DB:** None (or extend existing search indexes later).  
6. **APIs:** `GET /api/pi/search?q=` self-only.  
7. **AI:** None required.  
8. **UX:** Search + help link; **no Insights nav item**.  
9. **Deps/risks:** Data leak if search ignores RLS.  
10. **AC/tests:** Cross-user search negatives; a11y for dialog.  
11. **Flag:** `DELIVERX_GLOBAL_SEARCH=on`.  
12. **DoD:** Search self-only; help page linked.  
13. **Size / approval:** M · **blocked FD-PACK-8**.

**Pack theme:** UX shell (not M-series).

---

### B8 — Thin admin config

1. **Objective / value:** Operate one pilot org/project safely without enterprise CMS.  
2. **IDs:** FR-011, FLOW-ADMIN.  
3. **Reuse:** Admin framework seed, org structure `0093`.  
4. **Code areas:** Admin settings surfaces.  
5. **DB:** Seed scripts; avoid schema churn.  
6. **APIs:** Permissioned admin routes only.  
7. **AI:** None.  
8. **UX:** Calm admin forms; audit note on changes.  
9. **Deps/risks:** Admin must not rewrite verified evidence (pack rule).  
10. **AC/tests:** Permission tests; no evidence mutation.  
11. **Flag:** admin role gate.  
12. **DoD:** Pilot operator can edit allowed config.  
13. **Size / approval:** M · founder OK for depth.

**Pack theme:** M4 admin.

---

### B9 — Pack-aligned NFR polish

1. **Objective / value:** Rate-limit / recovery / activity-state honesty matching TRD without new SKUs.  
2. **IDs:** TRD-SEC-RATE, FLOW-FAIL, TRD-SM-ACTIVITY, NFR-SEC remainder.  
3. **Reuse:** Existing API routes, Experience activity models.  
4. **Code areas:** PI API middleware rate limit; clearer pending/error states.  
5. **DB:** Optional rate-limit tables; prefer edge/KV if already available.  
6. **APIs:** Same routes; 429 behaviour documented.  
7. **AI:** Rate-limit AI routes; keep bypass off in prod.  
8. **UX:** Explicit pending/retry copy.  
9. **Deps/risks:** Prefer CI (TD-018) to prove continuously.  
10. **AC/tests:** Rate-limit unit/integration; failure-path tests; release-gate if authz touched.  
11. **Flag:** limit thresholds via env.  
12. **DoD:** Documented limits + tests; no trust-rail bypass.  
13. **Size / approval:** M · no new PD if scoped to residual R-P2-06 / failure polish.

**Pack theme:** M8 hardening.

---

## 4. Founder decisions & ops gates

### 4.1 Decisions (product) — recorded as pending in `product-decisions.md`

| ID | Decision | Default if silent | Blocks |
| --- | --- | --- | --- |
| FD-PACK-1 | Pack advisory vs elevate into SoT under Bible | Advisory | B0 framing |
| FD-PACK-2 | Copy pack into `docs/build-pack/`? | Skip until asked | B0 |
| FD-PACK-3 | Keep 6-step vs 8-step onboarding | Keep 6-step | B5 |
| FD-PACK-4 | Xperience entry ceremony vs Day-1 enough | Day-1 enough | B6 |
| FD-PACK-5 | Human reviewer ops path (non-Verified)? | Leave thin | B4 |
| FD-PACK-6 | Formal recommendation SM now? | **Settled — yes (PD-2026-07-26f)** | — |
| FD-PACK-7 | PostHog vs Vercel Analytics | Stay Vercel | B3 PostHog sink |
| FD-PACK-8 | Global search/help (no Insights product)? | Defer search | B7 |

### 4.2 Founder ops (not Bn)

| Item | Blocks |
| --- | --- |
| TD-018 CI minutes / re-enable workflows | Continuous proof for B9; release confidence |
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

**B1 and B2 shipped.** Next eng candidate: **B3 (pilot KPI instrumentation)** — Vercel-only path can proceed without FD-PACK-7; PostHog sink needs **FD-PACK-7**.

Optional parallel: **B0** (pack archive) if founder wants docs intake.

Do **not** start B4–B7 without the matching FD-PACK decision. Do **not** treat Stripe as next eng work.

---

## 6. Related

- [`remaining-work.md`](./remaining-work.md) §E  
- [`next-steps.md`](./next-steps.md)  
- [`../product/current-scope.md`](../product/current-scope.md)  
- [`../product/build-charter.md`](../product/build-charter.md)  
- [`../product/product-decisions.md`](../product/product-decisions.md)  
