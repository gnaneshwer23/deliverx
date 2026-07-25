# T0 — Signed-in production QA checklist

**Phase:** Technology T0 (Pilot seal)  
**Authority:** Build Charter · `docs/engineering/technology-build-phases.md`  
**Production:** https://www.deliverx.dev  
**Supabase:** `jibmyxaldetyycmtlxet`  
**As of:** 2026-07-25

This checklist proves the shipped **P0–P7** Professional Intelligence loop with a real signed-in journey. It does **not** authorise P8/P9 or T1+ feature work.

**Founder path:** Complete every step below on production while signed in. Record pass/fail in [`t0-results.md`](./t0-results.md) against criteria in [`t0-acceptance-criteria.md`](./t0-acceptance-criteria.md).

---

## Preconditions

- [ ] You can sign in to https://www.deliverx.dev (founder or documented pilot account)
- [ ] Browser private window recommended (clean session)
- [ ] Keep DevTools Network open for API status codes when useful
- [ ] Do **not** invent capability levels, Verified badges, or external attestation

---

## Journey

### 1. Onboarding → Profile centre

1. Sign in (or complete `/onboarding` if prompted).
2. Open `/profile`.
3. Confirm identity is shown.
4. If no ScoreRun yet: guidance explains empty state **without inventing competency levels**.

**Expect:** Profile centre loads; no fabricated bands/levels.

---

### 2. Baseline assessment (opt-in)

1. Open `/profile/baseline` (or Profile CTA).
2. Start baseline only if you opt in.
3. Complete enough of the flow to produce observed evidence.
4. Return to ledger / profile evidence.

**Expect:** Ledger evidence appears as **observed** / self-reported. Levels absent until a ScoreRun.

---

### 3. ScoreRun (Capability Engine)

1. Trigger capability run via the product path (Profile / assessment complete → ScoreRun).
2. Confirm the run pins `framework_version_id` (pilot: `pm-core@2026.1`).
3. Confirm SnapshotClaims update on `/profile`.

**Expect:** Capability changes **only** via ScoreRun persist. Gaps feed Experience + Learning CTAs.

---

### 4. Profile five questions

On `/profile`, verify the five centre questions are answerable from live data (or honest empty states):

1. Who am I?
2. What can I prove?
3. What is holding me back?
4. What next?
5. Which opportunities fit?

**Expect:** Answers cite evidence / ScoreRun / gaps — not marketing fluff.

---

### 5. Experience (gap-planned company)

1. Open Experience planner (`/experience` → app / plan surfaces as shipped).
2. Build or accept a plan from the **12-company** catalogue (16 scenarios).
3. Prefer a company/scenario that addresses a **ScoreRun gap** when gaps exist.
4. Complete (or substantially progress) a scenario.

**Expect:** Completion writes **ledger evidence only** — not silent capability assignment.

---

### 6. Ledger evidence

1. Open profile evidence / ledger views.
2. Confirm new rows have provenance (source, timestamps).
3. Confirm no silent rewrite of prior rows.

**Expect:** Append-oriented ledger; private by default.

---

### 7. Observation consent ON → Workspace contribution

1. Confirm observation consent is **OFF by default** (no row or `consented=false`).
2. Turn consent **ON** (settings / observation consent UI).
3. In `/workspace`, submit a contribution / work artefact on a project.
4. Confirm observation may run only with consent.

**Expect:** Without consent, no silent observation. With consent, observations are **not** auto-verified evidence.

---

### 8. Intervention (Coach)

1. Open `/workspace/coach` (deep link should survive login — see TD-002).
2. If interventions exist, open one.
3. Confirm coach drafts are **drafts / interventions**, not verified ledger evidence and not capability.

**Expect:** Observation ≠ evidence ≠ capability.

---

### 9. Final / transfer assessment

1. Start final/transfer assessment from Profile / assessment CTAs.
2. Complete under the **same** framework pin as baseline/ScoreRun.
3. Confirm cross-version compare is refused if pins differ.

**Expect:** Final run_kind + framework pin honesty.

---

### 10. Growth report

1. Open growth report surface after final/transfer.
2. Confirm transferable strengths cite evidence; Verified stays **off**.

**Expect:** `deliverxVerified` remains false without attestation (P8 blocked).

---

### 11. Learning Intelligence

1. Open `/learning`.
2. Log or follow a learning path from a ScoreRun gap CTA.
3. Confirm learning items are knowledge — **capability unchanged**.

**Expect:** Learning ≠ competency. No Capability Engine persist from learning APIs.

---

### 12. Outcomes / calibration

1. Open `/career/outcomes`.
2. Record a self-reported outcome.
3. Confirm calibration findings are **diagnostic only**.
4. Confirm **no** automatic ScoreRun and **no** `externally_verified`.

**Expect:** Outcomes never auto-verify or assign capability.

---

### 13. Portfolio compile + public share privacy

1. Open `/portfolio` and compile / refresh packaging from SnapshotClaims / evidence.
2. Create or open a public share link.
3. Confirm private/confidential evidence is **not** exposed.
4. Confirm Verified badge is **off** without attestation.

**Expect:** Share is privacy-safe; no Verified overclaim.

---

### 14. Career readiness from SnapshotClaims

1. Open Career / Launchpad readiness surfaces that consume SnapshotClaims.
2. Confirm readiness prefers ScoreRun-backed claims.
3. If heuristic fallback appears, it must be **labelled** (not presented as verified capability).

**Expect:** Career packaging reads intelligence — does not invent a parallel capability store.

---

## After the journey

- [ ] Paste notes + screenshots references into [`t0-results.md`](./t0-results.md)
- [ ] File any High/Medium defects against TD register
- [ ] Do **not** start T1 until T0 is PASS or founder explicitly overrides
