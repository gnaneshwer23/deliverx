# T0 — Results log

**Phase:** Technology T0 (Pilot seal)  
**Date:** 2026-07-25  
**Executor (automated portion):** Agent  
**Executor (signed-in):** **BLOCKED — needs founder login**  
**Repo HEAD at verification:** `c5d2b9f` (T0 pack + path-header fix; confirm after push)  
**Prod:** https://www.deliverx.dev · redeploy expected after this push  
**Git:** T0 start `adbf7f9` → T0 commit on `main` (see implementation-log)

---

## Verdict

### **T0 — BLOCKED / PARTIAL**

| Dimension | Status |
| --- | --- |
| Automated / unauth gates | **PASS** (with notes) |
| Invariant unit re-verify | **PASS** |
| Signed-in P0–P7 journey | **BLOCKED: needs founder login** |
| Overall T0 | **PARTIAL** — engineering gates green; pilot seal incomplete until founder completes checklist |

**Do not start T1** until T0 PASS or founder explicitly overrides.

---

## A. Credentials

| Check | Result |
| --- | --- |
| `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD` in `.env.local` / production local / vercel local | **Absent** |
| Documented TEST_USER in `.env.example` | **Not present** (E2E vars documented in `docs/E2E.md` only) |
| Agent-browser signed-in attempt | **Skipped** — no secrets invented |

---

## B. Automated / unauth verification

### Production

| Check | Result |
| --- | --- |
| https://www.deliverx.dev | **200** Ready (Vercel) |
| Latest prod alias | Ready · aliases include www.deliverx.dev |
| `main` vs `origin/main` | **Match** at T0 start (`adbf7f9`) |

### Unauth page smoke (2026-07-25)

| Path | Status | Location / notes |
| --- | --- | --- |
| `/profile` | 307 | `/login?next=%2Fprofile` |
| `/profile/baseline` | 307 | `/login?next=%2Fprofile%2Fbaseline` |
| `/experience` | 200 | Public marketing/shell (not app gate) — documented |
| `/workspace` | 307 | `/login?next=%2Fworkspace` |
| `/workspace/coach` | 307 | `/login?next=%2Fworkspace` — **TD-002 confirmed** (coach deep-link lost) |
| `/learning` | 307 | `/login?next=%2Flearning` |
| `/career` | 404 | No index route; `/career/outcomes` exists |
| `/career/outcomes` | 307 | `/login?next=%2Fcareer%2Foutcomes` |
| `/portfolio` | 307 | `/login?next=%2Fportfolio` |
| `/launchpad` | 200 | Public marketing shell — documented |
| `/settings` | 307 | `/login?next=%2Fsettings%2Fprofile` |
| `/` `/login` | 200 | Public |

### Unauth API smoke

| Path | GET | Notes |
| --- | --- | --- |
| `/api/pi/profile` | 401 | OK |
| `/api/pi/evidence` | 401 | OK |
| `/api/pi/capability/run` | 401 | OK |
| `/api/pi/learning` | 401 | OK |
| `/api/pi/observation/consent` | 401 | OK |
| `/api/pi/growth-report` | 401 | OK |
| `/api/pi/interventions` | 401 | OK |
| `/api/pi/experience-plan` | 401 | OK |
| `/api/career/outcomes` | 401 | OK |
| `/api/pi/outcomes` | 404 | No such route (outcomes live under `/api/career/outcomes`) |
| `/api/pi/consent` | 404 | Use `/api/pi/observation/consent` |

### Supabase `jibmyxaldetyycmtlxet`

| Check | Result |
| --- | --- |
| Migration head | **Through `0085_real_world_outcomes_body`** (also `0084`, learning, final/transfer, observation, planner, PI `0066`–`0077` family present) |
| `pi_capability_score_runs` | **0** |
| `pi_evidence_records` | **0** |
| `pi_learning_items` | **0** |
| `pi_outcome_events` | **0** |
| `pi_observation_consent` | **0** |
| `pi_capability_judgements` | **0** |
| `workspace_observations` | **0** |
| `pi_learning_paths` | **0** |
| `experience_scenarios` | **16** |
| `pi_cf_competencies` | **3** |
| `pi_cf_framework_versions` | **1** |

Empty person-PI tables = happy path **not yet exercised** on prod (expected until signed-in QA).

### Focused PI vitest

```
Test Files  20 passed (20)
Tests       163 passed (163)
```

Suites: capability-engine, evidence-ledger, learning-intelligence, workspace-observation, pi-assessment, pi-profile, verified-portfolio, real-world-outcomes, experience-planner, career-intelligence/matching, auth route-guards + require-onboarding.

Additional after TD-002 fix prep:

```
src/lib/auth/request-path.test.ts — 4 passed
```

### Invariant re-verify (unit)

| Invariant | Evidence |
| --- | --- |
| Capability via ScoreRun only | `capability-engine/persist.test.ts`, orchestrator, baseline-path |
| Learning ≠ competency | `learning-intelligence/levels.test.ts` (“learning ≠ competency hard rule”) |
| Consent default off | `workspace-observation` + consent module (“No row = not consented”) |
| No auto externally_verified | `verified-portfolio/compile.test.ts`, `real-world-outcomes/*` |

---

## C. Signed-in checklist results

| Step | Result | Notes |
| --- | --- | --- |
| 1 Onboarding → Profile | **BLOCKED** | Needs founder login |
| 2 Baseline | **BLOCKED** | |
| 3 ScoreRun | **BLOCKED** | |
| 4 Profile five questions | **BLOCKED** | |
| 5 Experience | **BLOCKED** | |
| 6 Ledger | **BLOCKED** | |
| 7 Consent → contribution | **BLOCKED** | |
| 8 Intervention / coach | **BLOCKED** | Unauth: TD-002 confirmed |
| 9 Final/transfer | **BLOCKED** | |
| 10 Growth report | **BLOCKED** | |
| 11 Learning | **BLOCKED** | |
| 12 Outcomes | **BLOCKED** | |
| 13 Portfolio share | **BLOCKED** | |
| 14 Career readiness | **BLOCKED** | |

---

## D. Defects observed during T0

| ID | Severity | Finding | Disposition |
| --- | --- | --- | --- |
| TD-001 | High | No signed-in E2E / empty person-PI tables | **Still open** — blocked on founder login; T6 automates later |
| TD-002 | Medium | `/workspace/coach` → `login?next=/workspace` | Fix shipped: prefer `x-matched-path` when proxy headers missing + proxy marker header; **re-verify on prod after deploy** |
| TD-003 | Medium | Proxy anon redirects appear ineffective (layout owns `next=`; settings uses layout fallback) | **Documented**; not expanded in T0 beyond observability header |
| TD-011 | Medium | Marketing still uses “readiness score you can trust” style copy | **Still open** — not a loop-blocker; honesty pass deferred |

---

## E. Fixes shipped in T0

| Change | SHA | Deploy |
| --- | --- | --- |
| `getRequestPathFromHeaders` + `x-matched-path` fallback; request-path unit tests; `x-dx-proxy` marker on proxy responses; T0 QA pack | `c5d2b9f` (+ follow-up SHA fix if amended) | Push to main → Vercel prod |

---

## F. Founder next actions

1. Sign in to https://www.deliverx.dev  
2. Execute [`t0-signed-in-checklist.md`](./t0-signed-in-checklist.md) end-to-end  
3. Update this file step results → target **T0 PASS**  
4. After deploy of TD-002 fix: confirm `/workspace/coach` unauth Location is `/login?next=%2Fworkspace%2Fcoach` **or** post-login return lands on coach  
5. Only then authorise **T1** (privacy export/delete) unless overriding
