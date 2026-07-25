# Current State Audit

**Audit date:** 2026-07-25  
**HEAD:** `f3ac383`  
**Prod:** https://www.deliverx.dev  
**Supabase:** `jibmyxaldetyycmtlxet`  
**Verdict:** Pilot-ready (engineering gate) — **signed-in human QA still required**

Source: post-ship audit canvas (`deliverx-pi-post-ship-audit`).

---

## Phase matrix

| Phase | Scope | Status | Evidence |
| --- | --- | --- | --- |
| P0 | Profile centre, framework pin, evidence relocate | PASS | Migrations `0066`–`0076`; profile routes → login?next= |
| P1 | SnapshotClaims coherence | PASS | Shared `loadRecentSnapshotClaims`; snapshot-claims tests |
| P2 | Baseline assessment | PASS | `0077`; `/profile/baseline` gated; start API 401 unauth |
| P3 | Experience planner + 12-company catalogue | PASS | 16 scenarios / 12 companies; plan tests |
| P4 | Workspace observation + consent | PASS | Consent default off; observation tests; consent API 401 |
| P5 | Final/transfer + growth reports | PASS | `0081`/`0082`; final-transfer tests; growth-report 401 |
| P6 | Learning Intelligence | PASS | `0083`; learning ≠ competency; `/learning` gated |
| P7 | Real-world outcomes + calibration | PASS | `0084`/`0085`; outcomes never auto-externally_verified |

P8/P9: **not started** (out of charter).

---

## Invariants

| Invariant | Result |
| --- | --- |
| Capability writes only via ScoreRun persist | Hold |
| Learning ≠ competency | Hold |
| Outcomes ≠ externally_verified without attestation | Hold |
| Observation consent default OFF | Hold |
| Framework pin on ScoreRuns | Hold |
| SnapshotClaims single SoT | Hold |
| Public portfolio privacy | Hold |

---

## Repo / deploy health

- Migrations `0066`–`0085` present locally and applied on prod (some enum/body splits)
- Prod data sanity at audit: 16 scenarios / 12 companies · 1 published framework · 3 competencies · empty ScoreRuns/outcomes/learning/consents (empty pilot DB — expected)
- Unauth page smoke: PI surfaces 307 → `/login?next=…`
- Unauth API smoke: PI endpoints 401 (assessment GET 405 as expected)

---

## Residual risks (from audit — not fabricated)

1. No signed-in end-to-end exercised  
2. Coach deep-link returns to `/workspace` (not `/workspace/coach`) after login when pathname header missing  
3. Session proxy anonymous path-guards appear ineffective in prod — pages/layouts own redirects  
4. Supabase advisor warnings (search_path, audit_events RLS, leaked-password protection)  
5. Framework seed thin (3 competencies) — fine for pilot narrative, not full role graph  
6. No feature-flag system for gradual PI surface rollout beyond env gate helpers  
7. In-code rubric / catalogue fallbacks vs DB seed drift risk (admin-framework / experience packs)

---

## Manual signed-in QA checklist (last gate)

- [ ] Sign in → `/profile` shows identity + empty ScoreRun guidance without inventing levels  
- [ ] Run baseline → ledger evidence appears; levels absent until ScoreRun  
- [ ] Experience plan from 12-company catalogue; complete scenario → ledger only  
- [ ] ScoreRun pins `framework_version_id`; gaps feed Experience + Learning CTAs  
- [ ] Observation consent OFF by default; ON → Coach interventions as drafts only  
- [ ] Final/transfer → growth report under same framework pin; refuse cross-version compare  
- [ ] Learning log → knowledge evidence; capability unchanged  
- [ ] Career outcomes → self-reported ledger row; calibration diagnostic only; no ScoreRun auto-run  
- [ ] Portfolio share link → no private evidence; Verified badge off without attestation  

---

## Recommended next action

Per Build Charter: **complete signed-in human QA** and file defects under pilot hardening — do not start P8/P9.
