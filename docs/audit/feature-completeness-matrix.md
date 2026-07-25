# Phase 11 — Feature completeness matrix (+ Phases 2–3 evidence)

**Date:** 2026-07-25  
**HEAD at audit:** `c31146a`  
**Statuses allowed:** Complete and verified · Complete but unverified · Partially implemented · UI only · Mocked · Broken · Not started · Deferred by scope · Not required  

**Completion bar:** E2E works · state persisted · permissions enforced · errors handled · tests pass · analytics where required · docs match  

**Evidence keys:**  
- `RG` = `npm run test:release-gate` PASS (242 PI units + unauth + security always-on)  
- `LIVE` = `T6_E2E=1 T6_BASE_URL=https://www.deliverx.dev npm run test:e2e:t6` → **26/26**  
- `UNIT` = `npm test` → **941 pass / 25 skip**  
- `HTTP` = prod curl smoke  
- `SQL` = Supabase MCP `list_tables` / advisors  
- `SRC` = static code review  

---

## Status counts (matrix rows below)

| Status | Count |
| --- | --- |
| Complete and verified | 28 |
| Complete but unverified | 8 |
| Partially implemented | 22 |
| UI only | 6 |
| Mocked | 4 |
| Broken | 1 |
| Not started | 7 |
| Deferred by scope | 9 |
| Not required | 3 |
| **Total rows** | **88** |

---

## Phase 2A — Marketing website

| Feature | Area | Intended | Status | Evidence | Files | Deps | Sev | Action | Milestone |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Homepage composition | Mkt | Answer what/who/problem/how/why/next | Partially implemented | HTTP 200; sections exist; overclaims Twin/guarantee | `homepage-data.ts`, `(marketing)/page.tsx` | — | P0 | Honesty pass TD-011 | Post-T8 copy |
| Product pages | Mkt | Describe Experience/LP/Workspace | Partially implemented | Live pages; feature lists aspirational | `career-suite.ts`, marketing pages | — | P1 | Align includes to shipped | Copy |
| Pricing display | Mkt | Show tiers | Partially implemented | £ prices live; **no Stripe** | `career-suite.ts`, `/pricing` | T9 | P0 | Label “pilot / not purchasable” or remove prices | Founder |
| Money-back guarantee | Mkt | Commercial promise | Broken | Guaranteed in copy; no billing ops | `GUARANTEE` in homepage-data | T9 | P0 | Remove or founder-legal | Now |
| CTA wiring | Mkt | → signup | Complete and verified | HTTP CTAs → `/signup` | marketing nav/sections | Auth | P2 | — | — |
| Legal privacy/terms | Mkt | Policies | Complete but unverified | HTTP 200; content not legal-reviewed here | privacy/terms pages | — | P1 | Founder legal review | Ops |
| Cookie consent + policy | Mkt | Consent UX | Not started | `/cookie` 404; no banner SRC | — | GDPR | P1 | Add policy + banner if required | Ops |
| SEO metadata | Mkt | Titles/OG | Partially implemented | Homepage metadata set; uneven elsewhere | page metadata exports | — | P2 | Sweep | Later |
| Analytics | Mkt | Funnel events | Partially implemented | Vercel + `role_chip_click` only | `marketing/analytics.ts` | — | P2 | Define pilot events | Later |
| Testimonials / logos | Mkt | Social proof | Mocked | `DEMO_STORIES` archetypes; `PILOT_QUOTE.enabled=false` | homepage-data, landing-data | — | P1 | Keep disabled until real quotes | Now |
| Persona preview stats | Mkt | Illustrate Workspace | Mocked | Hardcoded 84%/72% fixtures | `landing-data.ts` | — | P1 | Label “illustration” | Copy |

**Homepage checklist:** what ✓ · who ✓ · problem ✓ · how ✓ · why-different partial (trust claims ahead of attestation) · next-step ✓ (signup) — **truthfulness fails** on commercial + Career Twin breadth.

---

## Phase 2B — Authentication

| Feature | Area | Intended | Status | Evidence | Files | Deps | Sev | Action | Milestone |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Signup email/password | Auth | Create account | Complete and verified | LIVE creates disposable users | signup-form | Supabase | — | — | — |
| Signin | Auth | Session | Complete and verified | LIVE cookie jar | login/actions | — | — | — | — |
| Signout | Auth | Clear session | Complete but unverified | SRC action exists | auth/actions | — | P2 | Spot-check UI | — |
| Password reset | Auth | Forgot → email → reset | Complete but unverified | SRC forms; email delivery not proven | login/forgot, reset | SMTP | P1 | Founder SMTP check | Ops |
| Email verification | Auth | Confirm email | Partially implemented | `/verify` + callback; T6 admin-confirms users | verify, callback | Supabase | P2 | Document pilot policy | — |
| Social OAuth | Auth | Google/GitHub login | Not started | No signInWithOAuth UI | callback only | — | P3 | Not required for pilot | Deferred |
| Session persistence | Auth | Stay signed in | Complete and verified | LIVE multi-step session | SSR cookies | — | — | — | — |
| Protected routes | Auth | Redirect + 401 | Complete and verified | LIVE unauth + HTTP | route-guards, pages | — | — | — | — |
| Error handling | Auth | Clear errors | Partially implemented | Forms show errors | auth-errors | — | P2 | — | — |
| Duplicate signup | Auth | Sensible message | Partially implemented | Supabase behaviour | signup-form | — | P2 | — | — |
| Auth rate limiting | Auth | Brute-force resist | Not started | No app limiter; HIBP off | advisors | TD-006 | P1 | Enable leaked-password | Founder |
| Account deletion | Auth | Delete PI + account | Complete and verified | LIVE #18 | pi-privacy | — | — | — | — |
| Data export | Auth | GDPR export | Complete and verified | LIVE #17 | privacy/export | — | — | — | — |

---

## Phase 2C — Onboarding

| Feature | Area | Intended | Status | Evidence | Files | Deps | Sev | Action | Milestone |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PI onboarding session | Onb | Identity for Profile | Complete and verified | LIVE #02 | pi-onboarding, `/api/pi-onboarding` | — | — | — | — |
| Org/persona onboarding | Onb | Workspace path | Partially implemented | Pages + actions; dual with PI | `/onboarding/*` | Org | P2 | Clarify PI-first path | UX |
| Product-scoped signup next | Onb | Route by product query | Complete but unverified | SRC `postSignupPath` | marketing/role-signup | — | P2 | — | — |

---

## Phase 2D — Profile centre / hub

| Feature | Area | Intended | Status | Evidence | Files | Deps | Sev | Action | Milestone |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Five-question profile | Profile | Real aggregate cards | Complete and verified | LIVE #01/#04 | profile-centre, pi-profile | ScoreRun | — | — | — |
| Empty / loading / error | Profile | Honest states | Complete and verified | LIVE empty before data; SRC UI | profile-centre | — | — | — | — |
| Notification inbox | Profile | T5 inbox | Complete and verified | LIVE #15 | NotificationInbox | notifications | — | — | — |
| Card deep-links | Profile | Next actions | Complete but unverified | SRC hrefs to Experience/ScoreRun/Launchpad | profile-centre | — | P2 | Visual a11y founder | Optional |
| Responsive / a11y | Profile | Usable mobile | Partially implemented | Layout max-w; not WCAG audited | profile-centre | — | P2 | Pair with UX audit | Later |

---

## Phase 2E — Professional Intelligence

| Feature | Area | Intended | Status | Evidence | Files | Deps | Sev | Action | Milestone |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Evidence ledger append | PI | Provenance persisted | Complete and verified | LIVE #03/#05/#07 | evidence-ledger | DB | — | — | — |
| Claims vs verified separation | PI | No fake Verified | Complete and verified | LIVE asserts deliverxVerified false | verified-gate | T8 | — | — | — |
| ScoreRun + framework pin | PI | pm-core@2026.1 | Complete and verified | LIVE #03/#09 | capability-engine | pi_cf | — | — | — |
| SnapshotClaims SoT | PI | Shared Profile/Career/Portfolio | Complete and verified | LIVE #14 | snapshot-claims | — | — | — | — |
| Explainability | PI | Explanations/citations | Complete and verified | LIVE growth report cites | growth-report APIs | — | — | — | — |
| No decorative capability % | PI | Bands / labelled heuristics | Partially implemented | Career still shows readinessPct with labels | career-intelligence | TD-011 | P1 | UI audit for unlabeled % | Copy |
| Baseline assessment | PI | Opt-in evidence | Complete and verified | LIVE #03 | pi-assessment | — | — | — | — |
| Final/transfer + growth | PI | Same pin growth | Complete and verified | LIVE #09/#10 | final-transfer | — | — | — | — |
| Learning ≠ competency | PI | Knowledge only | Complete and verified | LIVE #11 + security | learning-intelligence | — | — | — | — |
| Outcomes calibration | PI | Self-report honesty | Complete and verified | LIVE #12 | real-world-outcomes | — | — | — | — |
| Artefact versioning | PI | Immutable cite | Complete and verified | LIVE #16 | artefacts | — | — | — | — |
| Human review/challenge | PI | Dispute path | Partially implemented | Tables + APIs; 0 cases | pi-review | — | P2 | Pilot ops playbook | Later |
| Admin framework seed | PI | Rubric graph | Partially implemented | 3 competencies | admin-framework | TD-007 | P2 | Founder breadth | Deferred |
| External attestation T8 | PI | Light Verified honestly | Complete but unverified | SQL tables 0; HTTP token validate; **not in T6 loop** | external-attestation, 0094 | Email/attestor | P1 | Add T8 e2e journey | Now |
| AI orchestration trust | PI | Logged agents | Complete but unverified | Units + seed; 0 interactions post-purge | ai-orchestration | Models | P2 | — | — |

---

## Phase 2F — Experience Platform

| Feature | Area | Intended | Status | Evidence | Files | Deps | Sev | Action | Milestone |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Planner + 12-company catalogue | Exp | Gap-driven plan | Complete and verified | LIVE #05; SQL 16 scenarios | experience-planner, 0079 | — | — | — | — |
| Day-1 decision → ledger | Exp | Evidence from work | Complete and verified | LIVE #05 | experience-sim, xperience APIs | — | — | — | — |
| Full multi-week AI company sim | Exp | Marketing narrative | Partially implemented | Day-1 + catalogue ≠ full journey | marketing vs sim | — | P1 | Narrow marketing claims | Copy |
| Observation dual-write all pages | Exp/WS | Contributions everywhere | Partially implemented | TD-012 | workspace contributions | — | P2 | Wire critical pages | Later |
| Success point | Exp | Plan → decide → evidence | **Works** | LIVE | — | — | — | — | — |
| Failure points | Exp | Empty gaps → no interventions; consent OFF → no obs | Expected | LIVE #06/#08 | — | — | — | Document in UX | — |

---

## Phase 2G — Launchpad

| Feature | Area | Intended | Status | Evidence | Files | Deps | Sev | Action | Milestone |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Role readiness | LP | ScoreRun-preferring | Complete and verified | LIVE #14; honesty labels | career-intelligence | SnapshotClaims | — | — | — |
| Career roadmap | LP | Gap → Experience CTAs | Partially implemented | Module present | CAREER_MODULES | — | P2 | — | — |
| Evidence-backed CV | LP | CV from evidence | Partially implemented | Module UI + aggregate | launchpad app | — | P1 | Verify export quality | Later |
| Interview lab | LP | Mock interviews | Partially implemented | Agent slug exists; not full product | interview_lab agent | AI | P1 | Scope honesty | Copy |
| Opportunities marketplace | LP | Job matching liquidity | Deferred by scope | Empty tables; charter blocks marketplace | launchpad opportunities | Founder | — | Do not build | Deferred |
| Salary insights | LP | Comp data | UI only / Mocked | Marketing lists; no real salary DB | career-suite includes | — | P1 | Remove from marketing | Copy |
| Networking / hiring managers | LP | Network OS | Deferred by scope | Module ids exist; out of charter | types.ts | — | — | Keep deferred | Deferred |
| Launchpad artefacts store | LP | Persist LP artefacts | Partially implemented | Tables 0 rows | launchpad_artefacts | — | P2 | — | — |

---

## Phase 2H — Team Copilot / Professional Workspace

| Feature | Area | Intended | Status | Evidence | Files | Deps | Sev | Action | Milestone |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Alias = Workspace not 3rd SKU | WS | Branding | Complete and verified | Charter/PD + nav policy | workspace-nav-policy | T7 | — | — | — |
| Coach + consent observation | WS | Draft interventions | Complete and verified | LIVE #06–#08 | workspace-observation | — | — | — | — |
| Org departments/teams | WS | Structure | Complete but unverified | 0093 shipped; 0 rows | org-structure | — | P2 | Seed pilot org | Later |
| Mission-control depth | WS | Enterprise OS | Deferred by scope | Pages exist; charter blocks expansion | `/workspace/*` many | — | — | Demote further if confusing | Deferred |
| Delivery project OS | WS | Real team delivery | Partially implemented | Legacy data sparse | project/*, services | — | P2 | Don’t market as PI | — |
| Marketplace / twin / global | WS | Platform extras | Partially implemented | Cron history; empty marketplace | twin/global APIs | — | P3 | Ignore for pilot | — |

---

## Cross-cutting platform

| Feature | Area | Intended | Status | Evidence | Files | Deps | Sev | Action | Milestone |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Release gate automation | QA | Protect invariants | Complete and verified | RG + LIVE | release-gate.mjs, e2e/* | Secrets | — | Restore CI TD-018 | Founder |
| CI on push | QA | Continuous verify | Broken | Workflows disabled | `.github/workflows` | Billing | P0 | Re-enable minutes | Founder |
| Stripe / commercial | Biz | Paid plans | Deferred by scope | No Stripe code; prices shown | pricing | T9 | P0 | Don’t sell until T9 | Charter |
| Feature flag framework | Ops | Gradual rollout | Not started | Env gates only | access/gate | TD-008 | P3 | Deferred OK | Deferred |
| Product analytics catalogue | Ops | Funnel SoT | Not started | Docs exist; code thin | docs/14 | — | P2 | Implement sparingly | Later |
| Leaked-password protection | Sec | Auth hardening | Not started | Advisor WARN | Supabase Auth | TD-006 | P1 | Founder toggle | Now |

---

## Phase 3 — Functional workflow testing

### Harness used

| Mode | Result |
| --- | --- |
| `npm run test:release-gate` | PASS |
| Live signed-in + security | PASS 26/26 against `https://www.deliverx.dev` using `.env.local` service role + anon |
| Playwright smoke/acceptance | **Not re-run** (optional; CI disabled) |
| Interactive founder browser | **Not required** for functional seal; subjective UX remains optional |
| Mobile device lab | **BLOCKED** — no device farm; responsive SRC only |
| Real reviewer/manager human | **BLOCKED** — no second human account; RLS cross-user covered by LIVE security |
| Real attestor email delivery | **BLOCKED** — T8 not in harness; would need mail sink |

### Persona coverage

| Persona | Result |
| --- | --- |
| New professional | LIVE disposable user full loop PASS |
| Returning professional | Inferred (multi-step same session) PASS |
| Reviewer/manager | LIVE RLS attacker exclusion PASS; admin review UI unverified |
| Admin content/audit | Framework seed present; admin UX thin — **partial** |
| Unauthorised visitor | LIVE unauth + HTTP redirects PASS |
| Incomplete profile | LIVE #01 honest empty PASS |
| No evidence / multiple evidence | LIVE before/after baseline PASS |
| AI failure | Guardrail units PASS; live model outage **not injected** |
| Mobile | **BLOCKED** (no device run) |

### Journey 1 — Visitor → dashboard

| Step | Expected | Actual | Evidence | Fail | Sev | Files | Fix |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 Open `/` | Marketing loads | 200 | HTTP | — | — | marketing page | — |
| 2 CTA signup | Reach `/signup` | Wired | SRC/HTTP | — | — | career-suite | — |
| 3 Auth → hub/profile | Land in PI | LIVE #01–02 | LIVE | — | — | profile | — |
| 4 Marketing honesty | Claims match product | Prices/guarantee/Twin overclaim | SRC | **Truth** | P0 | homepage-data | TD-011 |

### Journey 2 — Org → project → artefact → feedback → evidence → capability

| Step | Expected | Actual | Evidence | Fail | Sev | Files | Fix |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PI artefact → evidence cite | Versioned artefact | LIVE #16 | LIVE | — | — | artefacts | — |
| Experience → ledger → ScoreRun | Capability via engine | LIVE #03/#05/#09 | LIVE | — | — | capability-engine | — |
| Full org delivery project path | End-to-end delivery OS | Sparse prod data; not PI SoT | SQL | Partial legacy | P2 | project/* | Out of charter |
| Feedback as verified evidence | Human verify | Review cases 0; observation ≠ verified | LIVE #07 | Expected | — | observation | — |

**Core evidence loop status: WORKING and VERIFIED on prod.**

### Journey 3 — PI → evidence detail → explanation → recommendation

| Step | Expected | Actual | Evidence | Fail | Sev |
| --- | --- | --- | --- | --- | --- |
| Profile aggregate | Five answers from data | PASS | LIVE #04 | — | — |
| Growth report citations | Explainable | PASS | LIVE #10 | — | — |
| Career recommendations | Same SnapshotClaims | PASS | LIVE #14 | — | — |

### Journey 4 — Reviewer verification

| Step | Expected | Actual | Evidence | Fail | Sev |
| --- | --- | --- | --- | --- | --- |
| Cross-user cannot read evidence | RLS deny | PASS | LIVE security | — | — |
| External attestor confirm | Lights Verified | **Not executed** | BLOCKED / incomplete harness | No T8 e2e | P1 |
| Experience heuristic upgrade | Must NOT verify | PASS | LIVE Verified false | — | — |

### Journey 5 — Admin content / audit

| Step | Expected | Actual | Evidence | Fail | Sev |
| --- | --- | --- | --- | --- | --- |
| Framework readable | pm-core published | PASS | SQL 1 framework | — | — |
| Admin review console | Operate cases | Thin / 0 cases | SRC | Unverified | P2 |
| Security advisors clean | No critical | WARN leaked-password + search_path | Advisors | TD-006 | P1 |
| CI audit trail | Green checks | Workflows disabled | TD-018 | Broken CI | P0 |

---

## Core evidence loop — final call

| Criterion | Met? |
| --- | --- |
| E2E workflow works | **Yes** (LIVE 18/18) |
| Real state persisted | **Yes** (then purged) |
| Permissions enforced | **Yes** (401 + RLS negatives) |
| Errors handled | **Mostly** (API); marketing errors N/A |
| Tests pass | **Yes** (941 + gate + live) |
| Analytics recorded | **No** (not required for loop trust) |
| Docs match | **Mostly** engineering docs; **marketing docs/copy diverge** |

**Verdict:** Core PI evidence loop is **Complete and verified**. Product-as-marketed is **not**.
