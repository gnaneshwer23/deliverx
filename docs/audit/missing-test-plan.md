# Missing test plan — Phase 10

**Date:** 2026-07-25 (UTC)  
**Rule:** Plan only — do **not** implement broadly in this pass. Prefer smallest files that lock trust rails and pilot blockers.  
**Related:** [`test-coverage-report.md`](./test-coverage-report.md), [`docs/engineering/testing-strategy.md`](../engineering/testing-strategy.md)

---

## Priority legend

| P | Meaning |
| --- | --- |
| P0 | Pilot trust / charter invariant — block ship regressions |
| P1 | High-value integration before next charter slice |
| P2 | Hardening / scale / UX quality |

---

## P0 — add or restore first

| Proposed file | What to assert | Why |
| --- | --- | --- |
| *(ops)* Re-enable CI + secrets — not a test file | `verify.yml` runs `test:release-gate`; when `T6_SUPABASE_*` present, live job runs | Coverage without enforcement is theatre (TD-018) |
| `src/lib/pi-profile/aggregate.integration.test.ts` | Mocked Supabase client: `buildPiProfileAggregate` issues expected table calls; evidence capped at 100; career failure soft-catches to null; never sets `deliverxVerified` / `capabilityAssigned` true | Profile is the fan-out hub; pure projection tests skip I/O |
| `src/app/api/pi/profile/route.test.ts` | 401 without user; 200 shape keys with stubbed aggregate | Contract lock for ProfileCentre |
| `e2e/t6-security-journeys.test.ts` (ensure CI live) | Already exists — assert CI secrets configured so 5 skipped tests run on main | RLS / purge denial must not stay skip-forever |
| `src/lib/evidence-ledger/append.idempotency.test.ts` | Same `idempotencyKey` twice → one row / no duplicate transition storm | Duplicate submission reliability |

---

## P1 — critical workflows lacking durable tests

| Proposed file | What to assert | Workflow |
| --- | --- | --- |
| `src/lib/pi-onboarding/store.integration.test.ts` | Complete session persists payload; incomplete → profile nextAction onboarding | Onboarding |
| `src/app/api/pi/assessment/complete.route.test.ts` | Complete creates evidence + does not write capability outside engine; framework pin present | Evidence + capability boundary |
| `src/lib/capability-engine/persist.concurrency.test.ts` | Parallel ScoreRuns don’t corrupt snapshot claims ordering | Capability update |
| `src/lib/career-intelligence/context.integration.test.ts` | SnapshotClaims preferred; heuristic labelled `evidence_coverage`; no unexplained % as capability | Recommendation explanation |
| `src/lib/ai-orchestration/run.live-contract.test.ts` | With mock clock: timeout path returns guarded failure; never `mayWriteCapability` | AI output validation |
| `src/app/api/pi/privacy/export.route.test.ts` | Authz; export contains declared tables only; no other user ids | Data export |
| `src/app/api/pi/privacy/delete.route.test.ts` | Wrong confirm → 400; correct path invokes service role only (mock) | Account deletion |
| `src/lib/workspace-observation/consent.default.test.ts` | Default OFF; observe no-ops without consent (extend if thin) | Permissions / consent |
| `src/app/api/pi/artefacts/version.route.test.ts` | Identical content → idempotent version; immutability of prior version | Artefact submission |
| `scripts/release-gate.mjs` doc + optional `--with-playwright` | Document that Playwright remains manual until TD-018 | E2E policy clarity |

---

## P1 — API / DB contract matrix (thin today)

| Proposed file | What to assert |
| --- | --- |
| `e2e/t6-pi-api-matrix.test.ts` | For each `/api/pi/*` and `/api/career/*`: method × auth → 401/405 matrix (unauth always-on) |
| `src/lib/access/gate.test.ts` (extend) | Each PI surface reason codes for deny |
| `supabase` RLS fixture tests (Option A local) | When local Supabase exists: policy deny cross-user select on `pi_evidence_records` without live prod |

---

## P2 — reliability / performance / a11y / AI eval

| Proposed file | What to assert |
| --- | --- |
| `src/app/api/cron/notifications.route.test.ts` | Missing bearer → 401; valid secret → service called once |
| `src/app/api/cron/loops.route.test.ts` | Same; partial failure returns 500 with message |
| `src/lib/pi-privacy/export.unbounded.test.ts` | Document/guard max rows or streaming — prevent accidental full-table blowups in tests with fixtures |
| `src/app/api/pi/evidence/route.limit.test.ts` | Transitions query uses parent id set; optional `.limit` or latest-per-id behaviour |
| `e2e/a11y/profile.axe.spec.ts` | Playwright + axe on `/login` and marketing `/` — landmark/name contrast smoke |
| `src/lib/ai-orchestration/eval/fixtures/*.json` + `eval.test.ts` | Frozen prompts → mock or recorded outputs score against contract schema (not live quality) |
| Enable `vitest --coverage` (devDep `@vitest/coverage-v8`) | Publish floor for `src/lib/capability-engine` / `evidence-ledger` / `ai-orchestration` only |

---

## Playwright gaps (browser)

Existing `e2e/acceptance/*.spec.ts` and smoke are **delivery-persona / auth-gate** oriented. Missing for PI pilot:

| Proposed file | What to assert | P |
| --- | --- | --- |
| `e2e/smoke/pi-profile-auth.spec.ts` | `/profile` → login next= | P1 |
| `e2e/acceptance/pi-consent-toggle.spec.ts` | Live optional: consent OFF/ON copy + network | P2 |
| Do **not** duplicate full 18-step in Playwright | Vitest HTTP harness already owns P0–P7 | — |

---

## Explicit non-goals (this plan)

- Broad snapshot UI tests  
- Expanding delivery/org suite as if it were PI SoT  
- Live model grading against Anthropic in CI (cost/flake) — keep mocks + optional nightly  
- Implementing TD-017 fixture lint fixes here (separate chore)

---

## Suggested implementation order

1. CI re-enable + live secrets (ops)  
2. `aggregate.integration.test.ts` + `/api/pi/profile` 401/shape  
3. Unauth PI API method matrix  
4. Idempotency append + artefact version route tests  
5. Cron auth tests  
6. Coverage tooling for trust-rail packages only  
7. Axe smoke on public pages  

---

## Acceptance for “coverage improved”

- `npm run test:release-gate` still green  
- At least one new integration test fails if profile aggregate drops evidence `.limit(100)` or sets `deliverxVerified: true`  
- Unauth matrix fails if a PI GET stops returning 401  
- Docs in `docs/qa/release-readiness.md` updated when CI live job is proven
