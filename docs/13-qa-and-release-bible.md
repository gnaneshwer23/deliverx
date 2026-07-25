# 13 — QA & Release Bible

**Status:** Active  
**Canonical detail:** [`qa/release-readiness.md`](./qa/release-readiness.md) · [`engineering/testing-strategy.md`](./engineering/testing-strategy.md) · [`qa/`](./qa/)

---

## Test dimensions

| Dimension | What we verify |
| --- | --- |
| Unit / domain | Ledger append, engine persist, planner, consent, learning≠capability, attestation gates |
| Integration | API handlers + store boundaries |
| Authz / RLS | Self-only person PI; org scoping; purge grants; attestor least privilege |
| Unauth gates | Pages → login; APIs → 401 |
| Signed-in loop | P0–P7 (+ T1–T5/T8 paths as covered) via T6 harness |
| Security negatives | No capability write from forbidden paths; privacy purge residual 0 |
| Honesty / copy | Verified + readiness labels (manual + spot checks; TD-011) |
| Accessibility | Keyboard forms; attestor flow operable |
| Performance / build | `npm run build` production |
| Ops | CI workflows enabled when minutes available (TD-018) |

---

## Release gates (must pass)

1. **Acceptance** for the slice — criteria in PRD chapter met  
2. **No placeholders** in user-facing pilot paths for the change  
3. **No unexplained AI** — drafts labelled; no fabricated verified evidence  
4. **Docs updated** — Product Bible and/or engineering detail  
5. **Automated gates** below green for PI trust changes  

### Commands (T6)

| Gate | Command | Blocking? |
| --- | --- | --- |
| PI invariants | `npm run test:pi` | Yes |
| Unauth | `npm run test:e2e:t6:unauth` | Yes |
| Security | `npm run test:e2e:t6:security` | Yes (live portion when secrets) |
| Composite | `npm run test:release-gate` | Yes |
| Live signed-in | `npm run test:release-gate:live` | Yes when secrets present |
| Build | `npm run build` | Yes |
| Playwright smoke | `npm run test:smoke` | Manual / workflow_dispatch |

**Shipped reality:** T6 shipped; T0 automated PASS; TD-001 closed. CI workflows may be disabled until Actions minutes restored (TD-018).

---

## QA doc index

| Doc | Use |
| --- | --- |
| [`qa/release-readiness.md`](./qa/release-readiness.md) | Pilot seal verdict + gate matrix |
| [`qa/t0-acceptance-criteria.md`](./qa/t0-acceptance-criteria.md) | T0 criteria |
| [`qa/t0-results.md`](./qa/t0-results.md) | T0 evidence |
| [`qa/t0-signed-in-checklist.md`](./qa/t0-signed-in-checklist.md) | Human checklist |
| [`qa/end-to-end-audit.md`](./qa/end-to-end-audit.md) | E2E audit |
| [`qa/security-findings.md`](./qa/security-findings.md) | Findings / baseline debt |
| [`qa/acceptance-test-results.md`](./qa/acceptance-test-results.md) | Acceptance evidence |

---

## Agent / engineer behaviour

- Never claim “works” without running relevant tests  
- Trust-rail changes require invariant tests before merge  
- Prefer disposable live Approach B purge after QA until local Supabase Option A available  

---

## Open non-blockers (honest)

- Full-repo `tsc` / ESLint fixture debt (TD-017)  
- Founder visual QA optional  
- TD-006 Auth leaked-password founder toggle  
- Live CI secrets may be unset  
