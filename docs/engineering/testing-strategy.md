# Testing Strategy

**As of:** 2026-07-25 · post-ship audit  
**Runner:** Vitest

---

## Approach

1. **Domain unit/integration tests** colocated under `src/lib/<module>/*.test.ts`
2. **Invariant tests** that lock trust rails (Capability Engine–only writes, learning ≠ competency, verification honesty, consent deny-by-default, framework pin, SnapshotClaims SoT)
3. **Unauth production smoke** of pages (307 → login) and APIs (401)
4. **Auth redirect unit tests** for workspace/settings `loginNext` fallbacks

---

## Current counts (honest)

| Scope | Count | Notes |
| --- | --- | --- |
| PI-domain test files (`src/lib` PI modules) | ~25 | evidence-ledger, capability-engine, pi-assessment, experience-planner, experience-sim, workspace-observation, learning-intelligence, real-world-outcomes, career-intelligence, verified-portfolio, pi-review, admin-framework, pi-profile, pi-onboarding, access, professional-workspace, … |
| PI-domain test cases | **~223** | Matches post-ship “225+ / 226” band including auth-fix coverage |
| Whole-repo `*.test.ts(x)` files | ~164 | Includes pre-pivot delivery/org/marketing suites |
| Approx whole-repo cases | ~800+ | Not all are PI |

Representative greens called out in audit: `snapshot-claims` 9/9, `plan` 12/12, observation 19/19, `final-transfer` 9/9, etc.

---

## Domains with dedicated PI tests

- `capability-engine` — orchestrator, persist, snapshot-claims
- `evidence-ledger` — append / types
- `pi-assessment` — baseline + final-transfer
- `experience-planner` — plan ranking
- `experience-sim` — engines
- `workspace-observation` — consent/observation
- `learning-intelligence` — levels
- `real-world-outcomes` — calibration honesty
- `admin-framework` — lifecycle / seed-graph
- `verified-portfolio`, `career-intelligence`, `pi-profile`, `pi-review`, `access`

---

## Gaps

| Gap | Severity | Notes |
| --- | --- | --- |
| **No signed-in E2E** of full candidate loop | High for pilot seal | Empty ScoreRun/outcome tables in prod at audit — happy path unit-tested only |
| Playwright/Cypress person journey | Deferred | Prefer charter hardening + manual QA checklist first |
| Contract tests for every `/api/pi/*` method matrix | Medium | Unauth 401 smoke exists; signed-in golden paths thin |
| Visual/regression UI | Low | Not blocking invariants |

---

## Required for substantial changes

Per Engineering Constitution:

1. Typecheck  
2. Lint  
3. Unit/integration tests for touched modules  
4. Migration review + RLS/access boundaries  
5. Do not claim “works” without verification  

When changing trust rails: add/extend invariant tests before merge.
