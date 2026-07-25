# Test coverage report — Phase 10

**Date:** 2026-07-25 (UTC)  
**Auditor:** Senior QA Lead + Performance Engineer  
**Runner:** Vitest 3.2.6 · Playwright present but not executed this pass  
**Coverage tooling:** **Absent** — no `@vitest/coverage-*`, `c8`, or `istanbul` in `package.json`; `vitest.config.ts` has no `coverage` block. Line/% coverage **UNMEASURED**; report is **structural + executed counts**.

---

## What actually ran (this session)

| Command | Passed | Skipped | Failed | Notes |
| --- | ---: | ---: | ---: | --- |
| `npm test` | **941** | **25** | 0 | 178 files pass; 1 file skip (`e2e/t0-signed-in-loop.test.ts` — needs `T6_E2E=1`) |
| `npm run test:release-gate` | **278** assert units across layers* | 5 live security | 0 | Gate **PASS**; live loop not invoked |
| `npm run test:release-gate:live` | — | — | — | **Not run** this pass |
| `npm run test:smoke` / `test:e2e` | — | — | — | **Not run** (Playwright) |
| `vitest --coverage` | — | — | — | **Unavailable** (tooling absent) |

\*Release-gate layers measured: PI units **242** + unauth **3** + security/privacy/orchestration file run **33 passed / 5 skipped** = gate content. Overlap with full `npm test` exists (same files).

**Skipped in full suite (25):** primarily gated live E2E (`T6_E2E`/`T0_E2E`), optional AI live cases (`OPENAI_API_KEY`), and 18 signed-in loop tests when flag off.

Prior claim of “927 unit tests” is **superseded** by this run: **941 passed** (repo grew / count drift).

---

## Coverage by domain (structural verdict)

Legend: **Strong** = behavioural unit/integration with invariants; **Moderate** = some tests, gaps on I/O or routes; **Thin** = mostly pure helpers / smoke; **Absent** = no dedicated automated coverage found.

| Domain | Files (approx) | Verdict | Notes |
| --- | --- | --- | --- |
| Capability Engine | 5 test files | **Strong** | Orchestrator, persist, snapshot-claims, rubric, golden ScoreRun |
| Evidence ledger | 2 | **Strong** | Types + process/append behaviour |
| PI privacy (export/purge hygiene) | 1 (+ live) | **Strong** units; live gated | Units always-on; purge RPC denial live |
| AI orchestration / guardrails | 1 | **Strong** (mocked model) | Prompt-injection / contracts; not live model eval |
| External attestation (T8) | 1 (14 tests) | **Strong** units | Path honesty |
| PI assessment | 4 | **Moderate–Strong** | Final-transfer, select, evidence; session I/O thinner |
| Learning intelligence | 2 | **Moderate** | Levels/privacy; path persist thinner |
| Real-world outcomes | 2 | **Moderate** | Calibration honesty covered |
| Career intelligence | 1 | **Moderate** | Matching/readiness honesty; context I/O mocked lightly |
| Verified portfolio | 1 | **Moderate** | Compile/store units |
| Workspace observation | 1 | **Moderate** | Consent/observe invariants |
| Experience planner / sim | 1+1 | **Moderate** | Plan ranking + engines |
| Artefacts / notifications | 1+1 | **Moderate** | Version idempotency tested |
| Auth helpers | 5 | **Moderate** | Redirect/path/timeout/SSO cache — not full auth UI |
| Access gates | 1 | **Moderate** | |
| Admin framework | 2 | **Moderate** | Lifecycle/seed |
| PI onboarding / review | 1+1 | **Thin–Moderate** | Types/store fragments |
| Pre-pivot delivery/org/marketing | many | **Mixed** | Large historical suite; not PI SoT |
| API route contracts (signed-in) | sparse | **Thin** | Unauth 401 smoke strong; golden path via T6 live only |
| Database / RLS | live suite | **Strong when live** | Skipped without secrets |
| Playwright browser E2E | 22 specs | **Thin in CI** | Auth-gate oriented; live persona flows skip without creds; **not run today** |
| Accessibility automated | — | **Absent** | No axe/jest-axe suite (separate a11y audit doc may exist) |
| AI evaluation harness | — | **Thin** | Mock contracts ≠ offline eval set / scoring rubric for model quality |
| Security testing | T6 journeys | **Strong always-on subset**; live RLS gated | |

---

## Depth: behavioural vs shallow

| Style | Examples | Assessment |
| --- | --- | --- |
| Behavioural / invariant | Capability engine refuses non-engine writes; learning ≠ capability; SnapshotClaims SoT; consent default; privacy grant hygiene | **Primary strength of PI suite** |
| Golden / deterministic | `golden-score-run.test.ts`, mock AI invoker | Good for regression |
| Pure projection | `pi-profile/aggregate.test.ts` `projectPiProfileFromParts` | Valuable but **does not hit DB fan-out** |
| Route smoke | `t6-unauth-gates`, Playwright auth gates | Shallow by design |
| Snapshot/UI | Minimal | Not a snapshot-heavy repo — good |
| Full browser PI loop | Playwright | **Does not replace** Vitest T6 live HTTP loop |

---

## Critical workflow matrix

| Workflow | Automated coverage today | Gap severity |
| --- | --- | --- |
| Authentication (login/session) | Redirect helpers + unauth gates; Playwright login smoke exists | Medium — no always-on signed-in session unit without live |
| Onboarding complete | T6 live step 02; thin unit types | Medium if live skipped |
| Permissions / RLS | Live security suite | High if CI lacks secrets |
| Project state transitions (delivery) | Pre-pivot services tests mixed | Medium (charter: not PI core) |
| Artefact submission / versioning | Units + T6 live step 16 | Low–Med |
| Evidence verification honesty | Units + live | Low when gate run |
| Capability update (ScoreRun) | Strong units + live | Low when gate run |
| AI output validation | Orchestration contracts | Med — no live model quality gate |
| Recommendation explanation | Career/outcomes units | Med |
| Account deletion / purge | Units + live negatives | Low when live run |
| Data export | Units + live step 17 | Low when live run |

---

## CI posture impact on coverage trust

`.github/workflows/verify.yml` and `ci-e2e.yml` are **disabled** (TD-018). Coverage on `main` is only as good as the last local/manual gate run. Release gate script itself is sound; **enforcement is not continuous**.

---

## Honest summary

- **Quantity:** ~179 Vitest files; **941** passing assertions this session.  
- **Quality (PI trust rails):** High for pure/domain logic; live end-to-end depends on secrets + intentional `--live`.  
- **Blind spots:** line coverage %, Playwright this pass, a11y automation, AI eval, signed-in API contract matrix, cron/jobs, many `/api/*` delivery routes.  
- **Biggest untested / under-tested critical workflows when live gate is off:** full onboarding→ScoreRun→purge loop; cross-user RLS; signed-in profile aggregate integration; AI live paths.
