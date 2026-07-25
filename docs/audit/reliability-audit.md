# Reliability audit — Phase 9

**Date:** 2026-07-25 (UTC)  
**Auditor:** Senior QA Lead + Performance Engineer (read-only on `src/`)  
**Companion:** [`performance-audit.md`](./performance-audit.md)

---

## Verdict

Trust-rail reliability for the **PI happy path** is strong in automation (release gate always-on re-verified this session; live signed-in historically 18/18). Operational reliability gaps: **CI disabled (TD-018)**, **no continuous error-rate telemetry pulled this pass**, **AI/cron paths lightly instrumented for failure modes**, and several write paths rely on application idempotency keys rather than DB unique constraints (not fully inventoried).

---

## What was re-verified this session

| Check | Result |
| --- | --- |
| `npm test` (Vitest) | **941 passed**, **25 skipped**, 178 files passed / 1 skipped (`t0-signed-in-loop` entire file) |
| `npm run test:release-gate` | **PASS** — PI units **242**, unauth **3**, security always-on + privacy/orchestration **33 passed / 5 skipped** (live negatives gated) |
| Live `test:release-gate:live` | **Not re-run this pass** (secrets present in `.env.local`; skipped to avoid another prod disposable-user cycle). Prior QA pack: 18/18 + security negatives |
| `npm run build` | **PASS** |
| Playwright smoke/acceptance | **Not run** (CI workflow disabled; manual suite deferred this pass) |

---

## Error handling & timeouts

| Area | Finding | Path / evidence |
| --- | --- | --- |
| Auth network timeout helper | Present + unit-tested | `src/lib/auth/timeout.ts`, `timeout.test.ts` |
| AI route `maxDuration` | **Absent** — Vercel default limits apply; long AI calls may 504 without explicit budget | `src/app/api/ai/**` |
| AI orchestration failures | Guardrails → validate → log; contract fallback; refuses capability writes | `src/lib/ai-orchestration/run.ts` |
| Cron auth | Bearer `CRON_SECRET` gate; 401/500 JSON | `src/app/api/cron/notifications/route.ts`, `loops/route.ts` |
| Cron schedules | Twin 06:00, loops 07:00, notifications 08:00 UTC | `vercel.json` |
| Cron success/failure rates | **UNMEASURED** (no Vercel cron log pull) | — |
| Platform error rates / 5xx | **UNMEASURED** (no Analytics/Sentry dump this pass; `@vercel/analytics` + `speed-insights` are dependencies) | `package.json` |

Unauth API probes consistently returned **401** (not 500) for PI surfaces — good fail-closed behaviour for anonymous callers.

---

## Idempotency & duplicate submissions

| Mechanism | Where | Assessment |
| --- | --- | --- |
| Evidence append `idempotencyKey` | `src/lib/evidence-ledger/types.ts`, append path | Designed for dedupe |
| Workspace observation key | `workspace-obs:${contributionId}` | `observe.ts` |
| Experience decision/reflection keys | `experience-sim/runtime.ts` | Present |
| Learning item key | `learning-intelligence/persist.ts` | Present |
| Artefact version idempotency | Covered by unit test | `artefacts.test.ts` |
| Client double-submit guards | **UNMEASURED** across all forms | Some panels disable during fetch; not exhaustively audited |
| Privacy delete confirm phrase | Wrong phrase → 400 (live security suite) | Documented in QA pack |

**Risk:** Without DB unique constraints on every idempotency key (not verified here), racey double POSTs could still duplicate under concurrency — **UNMEASURED** under load.

---

## Background jobs

| Job | Schedule | Reliability notes |
| --- | --- | --- |
| `/api/twin/snapshot` | daily 06:00 | Auth pattern assumed similar; **runtime UNMEASURED** |
| `/api/cron/loops` | daily 07:00 | Fans out coordination + global + agents + learning sync in `Promise.all` — partial failure handling depends on service implementations |
| `/api/cron/notifications` | daily 08:00 | Digests + overdue reminders |

No dedicated cron unit/integration tests found via `*.test.ts` search for `runNotificationCron` / cron routes — **coverage gap** (see Phase 10).

Evidence processing jobs table exists (`pi_evidence_processing_jobs` ≈ 0 rows) — queue reliability **UNMEASURED** (idle).

---

## Retries

| Layer | Observation |
| --- | --- |
| Client fetch retries | Generally **absent** (single-shot `fetch` in PI panels) |
| AI provider retries | **UNMEASURED** / not clearly centralised in orchestration runner |
| Supabase client | SDK defaults; no app-level retry wrapper found in PI stores |

Transient network blips on `/api/pi/profile` will surface as ProfileCentre error UI (no automatic retry).

---

## Data / trust reliability (cross-check)

- Empty ScoreRun/evidence tables in prod after purge means **pilot path works in tests but has no sustained prod traffic sample**.  
- Release gate does **not** include Playwright or full-repo `tsc` (TD-017 fixture debt classified separately).  
- CI workflows **disabled** (TD-018) — regressions can land on `main` without automated gate until minutes restored.

---

## Top reliability risks (ordered)

1. **CI off (TD-018)** — release gate trustworthy only when someone runs it locally/manually.  
2. **Live signed-in suite optional in default gate** — always-on path skips 18-step + live RLS unless `--live` / secrets.  
3. **AI routes without explicit `maxDuration` / retry policy** — opaque production failures under model latency.  
4. **Cron fan-out without measured alerting** — silent partial failure possible.  
5. **Profile client error path** — single fetch failure blocks whole centre; no stale-while-revalidate.  
6. **Idempotency vs concurrent writes** — logic present; load-tested uniqueness **UNMEASURED**.

---

## UNMEASURED (explicit)

- Vercel / Supabase error-rate dashboards  
- Cron execution history and durations  
- Live AI timeout/504 frequency  
- Chaos/injection of duplicate POSTs  
- Memory growth under long session  
- Playwright flaky-rate (suite not executed this pass)  
- Re-run of live T6 loop this session
