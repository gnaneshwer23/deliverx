# T0 — Results log

**Phase:** Technology T0 (Pilot seal) — closed via Technology T6 automation  
**Date:** 2026-07-25  
**Executor (automated):** Agent  
**Executor (signed-in):** Automated disposable identity (`t0-qa+<ts>@deliverx.test`) — purged after run  
**Prod:** https://www.deliverx.dev  
**Harness:** `e2e/t0-signed-in-loop.test.ts` · `npm run test:e2e:t6`

---

## Verdict

### **T0 — PASS (automated)**

| Dimension | Status |
| --- | --- |
| Automated / unauth gates | **PASS** |
| Invariant unit re-verify | **PASS** |
| Signed-in P0–P7 journey | **PASS** (18/18 via T6 harness) |
| Overall T0 | **PASS** — TD-001 closed by T6 |

Subjective visual/UX judgement remains optional founder review (non-blocking).

---

## A. Credentials strategy

| Check | Result |
| --- | --- |
| Founder interactive login | Not required for functional seal |
| Disposable harness user | Created via admin API; email `t0-qa+<ts>@deliverx.test` |
| Post-run purge | T1 privacy delete + auth user delete; person-PI tables = 0 |

---

## B. Automated / unauth verification

Unauth and unit results from earlier T0 pack remain valid. See also [`end-to-end-audit.md`](./end-to-end-audit.md).

---

## C. Signed-in checklist results (automated)

| Step | Result | Notes |
| --- | --- | --- |
| 1 Onboarding → Profile | **PASS** | |
| 2 Baseline | **PASS** | Provenance + observed status |
| 3 ScoreRun | **PASS** | `run_kind=baseline`, pin + `rubric_resolve_source=db` |
| 4 Profile five questions | **PASS** | |
| 5 Experience | **PASS** | `brightpath-adaptive` (non-MediFlow) |
| 6 Ledger | **PASS** | |
| 7 Consent → contribution | **PASS** | OFF then ON |
| 8 Intervention / coach | **PASS** | Honest empty when gaps=0 |
| 9 Final/transfer | **PASS** | Different industry; same pin |
| 10 Growth report | **PASS** | Citations; Verified off |
| 11 Learning | **PASS** | No ScoreRun delta |
| 12 Outcomes | **PASS** | Volume floor; not externally_verified |
| 13 Portfolio share | **PASS** | Private marker excluded |
| 14 Career readiness | **PASS** | Same snapshot as Profile |

T6 additions (notifications, artefact versions, privacy export/delete, RLS, purge denial): see [`acceptance-test-results.md`](./acceptance-test-results.md).

---

## D. Defects

| ID | Severity | Finding | Disposition |
| --- | --- | --- | --- |
| TD-001 | High | No signed-in E2E | **Closed** by T6 |
| TD-002 | Medium | Coach deep-link | Fixed earlier |
| TD-006 | Medium | Leaked-password | Open — founder |
| SF-T6-01 | Low | Gaps may be empty for strong answers | Documented honesty |

---

## E. Founder optional next

1. Spot-check UI calmness on Profile / Portfolio.  
2. Enable TD-006 leaked-password protection.  
3. Do not start T7 without charter approval.
