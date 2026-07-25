# Acceptance test results — Technology T6

**Date:** 2026-07-25  
**Executor:** Agent (automated)  
**Repo HEAD at verification:** post-T6 commit on `main`  
**Prod target:** https://www.deliverx.dev

---

## Summary counts

| Layer | Passed | Failed | Skipped / blocked |
| --- | --- | --- | --- |
| T6 release gate (non-live) | PI units **242** + unauth **3** + security always-on **33** | 0 | live suites skipped by design |
| T6 live signed-in loop | **18** | 0 | 0 |
| T6 live security negatives | **5** (+ 3 always-on) | 0 | 0 |
| T6 unauth (prod) | **3** | 0 | 0 |
| **Combined live T6** | **26** | **0** | — |

Commands:

```text
npm run test:release-gate
T6_BASE_URL=https://www.deliverx.dev T6_E2E=1 npx vitest run e2e/t0-signed-in-loop.test.ts e2e/t6-security-journeys.test.ts
```

Post-run prod person-PI counts (MCP): evidence/score_runs/learning/outcomes/artefacts/notifications = **0**; `t0-qa*` / `t6-*` auth users = **0**; privacy request tombstones retained.

---

## Signed-in loop (18)

| # | Step | Result |
| --- | --- | --- |
| 01 | Auth + honest empty Profile | Pass |
| 02 | Onboarding complete | Pass |
| 03 | Baseline evidence + baseline ScoreRun pin | Pass |
| 04 | Profile five questions from real data | Pass |
| 05 | Gap Experience + Day-1 ledger | Pass |
| 06 | Consent OFF → no observation | Pass |
| 07 | Consent ON → observation + evidence | Pass |
| 08 | Intervention (gaps-dependent) | Pass |
| 09 | Final/transfer + framework pin | Pass |
| 10 | Growth report; Verified off | Pass |
| 11 | Learning ≠ capability | Pass |
| 12 | Outcomes + volume floor | Pass |
| 13 | Portfolio share privacy | Pass |
| 14 | Career SnapshotClaims consistency | Pass |
| 15 | Notifications inbox | Pass |
| 16 | Artefact versioning | Pass |
| 17 | Privacy export | Pass |
| 18 | Privacy purge | Pass |

---

## Security / negatives

| Check | Result |
| --- | --- |
| Prompt-injection hard blocks | Pass |
| Cross-user evidence list | Pass |
| Cross-user PostgREST RLS | Pass |
| Purge RPC anon denied | Pass |
| Purge RPC authenticated denied | Pass |
| Wrong delete confirm phrase → 400 | Pass |
| Learning/outcomes ScoreRun count unchanged | Pass |

---

## Remaining human acceptance

1. Visual/UX calmness of Profile / Experience / Portfolio (charter UI principles).  
2. Founder TD-006 Auth leaked-password toggle.  
3. Optional: one founder walk of `docs/qa/t0-signed-in-checklist.md` for subjective trust (automation now covers functional loop).
