# T0 — Acceptance criteria

**Phase:** Technology T0 (Pilot seal)  
**As of:** 2026-07-25

Use with [`t0-signed-in-checklist.md`](./t0-signed-in-checklist.md). Mark each step **PASS** / **FAIL** / **BLOCKED** in [`t0-results.md`](./t0-results.md).

---

## Trust invariants (must hold for T0 PASS)

| ID | Invariant | Pass condition |
| --- | --- | --- |
| INV-1 | Capability writes only via ScoreRun / Capability Engine | No UI, Learning, or Outcomes path persists judgements/levels outside engine |
| INV-2 | Learning ≠ competency | Learning log does not change SnapshotClaims levels or light Verified |
| INV-3 | Observation consent default OFF | Missing consent row ⇒ denied; no silent Workspace observation |
| INV-4 | No auto `externally_verified` | Outcomes / portfolio / learning never set externally_verified; Verified badge off without attestation |
| INV-5 | Framework pin on ScoreRuns | Every new ScoreRun has `framework_version_id` (pilot `pm-core@2026.1`) |
| INV-6 | Evidence append + provenance | Ledger rows have source provenance; no silent history rewrite |
| INV-7 | Observation ≠ evidence ≠ capability | Coach interventions remain drafts until ledger rules + consent path |

**T0 cannot PASS if any INV-* fails on the signed-in journey.**

---

## Per-step pass/fail

| Step | PASS if | FAIL if |
| --- | --- | --- |
| 1 Onboarding → Profile | Identity + honest empty/ScoreRun guidance | Invented levels; broken auth gate |
| 2 Baseline (opt-in) | Opt-in only; observed evidence in ledger; no levels pre-ScoreRun | Forced baseline; levels assigned without ScoreRun |
| 3 ScoreRun | Engine persist; framework pin; SnapshotClaims update | Pin missing; parallel capability write |
| 4 Profile five questions | Each answered from PI data or honest empty | Marketing claims as proof |
| 5 Experience gap plan | Plan from catalogue; gap-aware when gaps exist; ledger-only completion | Capability assigned from scenario complete |
| 6 Ledger | Provenance present; append-oriented | Silent overwrite / missing provenance |
| 7 Consent → contribution | Default off; ON required for observation | Observation without consent |
| 8 Intervention | Draft only; deep-link to coach preserves `next` when possible | Treated as verified evidence; coach `next` always lost (**TD-002**) |
| 9 Final/transfer | Same framework pin; refuse dishonest cross-version compare | Cross-pin compare allowed silently |
| 10 Growth report | Cites evidence; Verified off | Verified on without attestation |
| 11 Learning | Knowledge evidence only; capability unchanged | Capability/ScoreRun mutated by learning |
| 12 Outcomes | Self-report + diagnostic calibration; no ScoreRun auto-run; no external verify | Auto ScoreRun or externally_verified |
| 13 Portfolio share | Private evidence excluded; Verified off | Leak or Verified overclaim |
| 14 Career readiness | SnapshotClaims-first; heuristic labelled if used | Unlabelled fake readiness / parallel SoT |

---

## Automated / unauth gates (required before claiming engineering readiness)

| Gate | Pass condition |
| --- | --- |
| Prod Ready | https://www.deliverx.dev serves Ready deployment; `main` HEAD matches ship intent |
| Migrations | Prod head through `0085` (PI `0066`–`0085`) |
| Unauth pages | Key PI shells redirect to `/login?next=…` (307) or documented public shells |
| Unauth APIs | PI APIs return **401** (or **405** where method-not-allowed) without session |
| PI unit suites | Focused PI vitest suites green |
| Invariants in tests | INV-1–INV-4 covered by existing unit tests (re-run recorded in results) |

---

## T0 verdict rules

| Verdict | When |
| --- | --- |
| **PASS** | All INV-* hold on signed-in journey; all checklist steps PASS; High defects fixed or accepted with founder note |
| **PARTIAL** | Automated/unauth gates green; signed-in incomplete or Medium defects remain (e.g. TD-002/TD-003) |
| **BLOCKED** | Cannot execute signed-in journey (no credentials) **or** High invariant failure on prod |

Empty ScoreRun / outcome / learning tables after T0 are **FAIL for pilot seal** unless explained (e.g. blocked on founder login) — they mean the happy path was not exercised.
