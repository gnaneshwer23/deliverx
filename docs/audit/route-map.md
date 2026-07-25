# Phase 1 — Route map

**Date:** 2026-07-25 · Prod smoke where noted · Auth = page redirects anonymous → `/login?next=…` unless stated

Status legend: **Live** (200/working) · **Gated** (auth redirect / 401 API) · **Thin** (UI exists, shallow backend) · **Legacy** (pre-pivot) · **Deferred** (charter) · **Missing** (404 / absent)

---

## A. Marketing & legal

| Route | Purpose | Status | Truthfulness risk | Source |
| --- | --- | --- | --- | --- |
| `/` | Suite homepage | Live 200 | Overclaims Career Twin / guarantee / prices without Stripe | `src/app/(marketing)/page.tsx`, `homepage-data.ts` |
| `/about` | About | Live 200 | — | `(marketing)/about` |
| `/experience` | Experience marketing | Live | AI companies narrative aspirational vs planner depth | `(marketing)/experience` |
| `/launchpad` | Launchpad marketing | Live | Lists mock interviews, salary, readiness score | `(marketing)/launchpad` |
| `/professional-workspace` | Workspace marketing | Live | Mission-control panels marketed | `(marketing)/professional-workspace` |
| `/team-copilot` | Alias marketing | Live | Alias OK (T7); depth overclaimed | `(marketing)/team-copilot` |
| `/solutions` | Solutions | Live 200 | — | `(marketing)/solutions` |
| `/resources` | Resources | Live 200 | — | `(marketing)/resources` |
| `/pricing` | Pricing £500/£250/£500/£800 | Live | **CTAs → signup only; no payment** | `(marketing)/pricing`, `career-suite.ts` |
| `/privacy` | Privacy policy | Live 200 | Must stay aligned with T1 purge | `(marketing)/privacy` |
| `/terms` | Terms | Live 200 | Money-back claims elsewhere | `(marketing)/terms` |
| `/cookie` `/cookies` | Cookie policy | **Missing 404** | No cookie consent banner found | — |

Primary CTAs: `/signup`, product-scoped `/signup?product=…`. Wired; no checkout.

---

## B. Authentication

| Route | Purpose | Status | Notes |
| --- | --- | --- | --- |
| `/login` | Sign in | Live | Email/password |
| `/login/forgot` | Reset request | Live | Supabase email |
| `/login/reset` | Set new password | Live | |
| `/signup` | Register | Live | Product/role query params |
| `/verify` | Email verification UX | Present | |
| `/auth/callback` | Auth code / OAuth callback | Live | OAuth error handling; **no social buttons** |
| `signOutAction` | Sign out | Working | `src/app/auth/actions.ts` |

---

## C. Onboarding

| Route | Purpose | Status |
| --- | --- | --- |
| `/onboarding/profile` | Profile details | Gated / used |
| `/onboarding/persona` | Persona pick | Gated |
| `/onboarding/role` | Role | Gated |
| `/onboarding/organisation` | Org create/join | Gated |
| `/onboarding/team` | Team | Gated |
| `/onboarding/invite` | Invite accept path | Gated |
| `/onboarding/complete` | Completion | Gated |
| `/join` | Invite join | Present |
| `/invite/[token]` | Token invite | Present |
| `/start/{experience,launchpad,bundle}` | Marketing start deep-links | Present |

PI onboarding also via `/api/pi-onboarding` (T6 step 02).

---

## D. Professional Intelligence (person)

| Route | Purpose | Status | Evidence |
| --- | --- | --- | --- |
| `/hub` | Product hub | Gated | |
| `/profile` | Profile centre (5 questions) | Gated · **verified API** | T6 #01/#04 |
| `/profile/evidence` | Evidence + ScoreRun UI | Gated | |
| `/profile/baseline` | Baseline assessment | Gated · verified | T6 #03 |
| `/profile/final` | Final/transfer | Gated · verified | T6 #09 |
| `/profile/learning` | Learning alias | Gated | |
| `/profile/outcomes` | Outcomes alias | Gated | |
| `/learning` | Learning Intelligence | Gated · verified | T6 #11 |
| `/career/outcomes` | Real-world outcomes | Gated · verified | T6 #12 |
| `/portfolio` | Verified portfolio owner | Gated · verified | T6 #13 |
| `/portfolio/v/[token]` | Public share | Live (token) | Private stripped |
| `/portfolio/attest/[token]` | Attestor UI (T8) | Live page | API rejects fake token `not_found` |
| `/pi/review` | Review challenge | Gated · thin usage | 0 cases |
| `/pi/review/admin` | Admin review | Gated · thin | |
| `/settings` `/settings/profile` | Settings + privacy | Gated | Export/delete |
| `/settings/workspace` `/settings/developer` | Workspace / developer | Gated | |

---

## E. Experience

| Route | Purpose | Status |
| --- | --- | --- |
| `/experience/app` | Experience app shell | Gated · planner verified via API |
| `/api/xperience/*` | Legacy sim bridge | Present |
| `/api/pi/experience-plan` | PI planner | **Verified** T6 #05 |

---

## F. Launchpad

| Route | Purpose | Status |
| --- | --- | --- |
| `/launchpad/app` | Readiness home | Gated · **readiness verified** T6 #14 |
| `/launchpad/app/[module]` | cv, interview, roadmap, opportunities, … | **Thin / partial** — shell + CareerIntelligenceApp modules; marketplace/networking deferred |

`CAREER_MODULES` in `src/lib/career-intelligence/types.ts` marks mvp flags; several modules are presentation over ScoreRun/heuristic, not full “Career Twin OS”.

---

## G. Team Copilot / Professional Workspace

| Route pattern | Purpose | Status |
| --- | --- | --- |
| `/workspace` | Workspace home | Gated |
| `/workspace/coach` | Observation coach | Gated · redirect `next=` OK |
| `/workspace/evidence` `/artefacts` `/inbox` … | PI-aligned modules | Partial |
| `/workspace/{pm-mission,founder,executive,twin,marketplace,global,…}` | Mission-control depth | **Legacy / demoted** (T7); not charter expansion |
| `/workspace/settings/organisation` | Org settings + T7 structure | Partial (0 depts) |

---

## H. Project delivery OS (legacy)

| Pattern | Count (approx) | Status |
| --- | --- | --- |
| `/project/[id]/{tasks,meetings,raid,…}` | 20+ pages | Legacy partial |
| `/project/new` | Create project | Legacy |
| `/share/[token]` | Stakeholder share | Legacy |
| `/brain` `/brain/ingest` | Delivery brain | Empty |

---

## I. API map (grouped)

### PI / career / portfolio / org (charter)

| Prefix | Examples | Unauth |
| --- | --- | --- |
| `/api/pi/*` | profile, evidence, assessment/*, capability/run, experience-plan, learning, observation/consent, interventions, growth-report, artefacts, notifications, privacy/*, review/*, ai/interactions | **401** (T6 unauth) |
| `/api/career/*` | intelligence, outcomes | 401 |
| `/api/portfolio/*` | entries, attest/[token], health | attest public-ish with token validation |
| `/api/workspace/contributions` | Contribution → observation path | 401 |
| `/api/org/*` | structure, departments, teams, members | 401 |
| `/api/admin/framework/*` | Framework admin | Auth/admin |
| `/api/pi-onboarding` | Onboarding session | Auth |
| `/api/xperience/*` | Experience bridge | Auth |
| `/api/launchpad/*` | me, onboarding, progress, artefacts | Auth |

### Pre-pivot (do not count as PI completeness)

`/api/project/**` (~50+), `/api/ai/**`, `/api/agents/**`, `/api/twin/**`, `/api/global/**`, `/api/coordination/**`, `/api/intelligence/**`, `/api/marketplace/**`, `/api/platform/**`, `/api/founder/**`, `/api/cron/**`, `/api/setup/**`, invites, documents, forecast, programme, etc.

---

## J. Analytics / redirects smoke (this audit)

| Check | Result |
| --- | --- |
| `/profile` anonymous | 307 → `/login?next=%2Fprofile` |
| `/workspace/coach` anonymous | 307 → `login?next=/workspace/coach` |
| `/launchpad/app` anonymous | 307 → login |
| `/api/pi/profile` anonymous | 401 |
| Fake attestation token API | 400 `Invalid attestation link` |
| Cookie policy routes | 404 |
