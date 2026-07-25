# Current Scope

**Active phase:** Post-P7 pilot hardening — **Technology T1 shipped**; T0 signed-in QA still open (PARTIAL)  
**As of:** 2026-07-25  
**Charter:** [`build-charter.md`](./build-charter.md)  
**Technology plan:** [`../engineering/technology-build-phases.md`](../engineering/technology-build-phases.md) (T0–T9)  
**T0 status:** PARTIAL — automated/unauth gates green; **signed-in QA BLOCKED (needs founder login)**. Founder override authorised T1 while T0 remains open. See [`../qa/t0-results.md`](../qa/t0-results.md).  
**T1 status:** **Shipped** — person PI export/delete (`0086`, `/api/pi/privacy/*`, settings UX); TD-004/005 closed; TD-006 documented (Auth dashboard). Do **not** start T2 until asked.

---

## What is live (by phase)

| Phase | Status | Live surfaces / artefacts |
| --- | --- | --- |
| **P0** | Shipped | `/profile`, framework pin on ScoreRuns, evidence relocate, migrations `0066`–`0076` |
| **P1** | Shipped | SnapshotClaims shared by Profile, Career, Portfolio |
| **P2** | Shipped | `/profile/baseline`, assessment APIs, migration `0077` |
| **P3** | Shipped | Experience planner, 16 scenarios / 12 companies, migrations `0078`–`0079` |
| **P4** | Shipped | Observation consent (default OFF), workspace observations, interventions, `0080` |
| **P5** | Shipped | Final/transfer assessment, growth reports, `0081`–`0082` |
| **P6** | Shipped | `/learning`, learning paths/items, `0083` — no capability assignment |
| **P7** | Shipped | `/career/outcomes`, outcome events + calibration findings, `0084`–`0085` |

**Also present (partial / supporting):** Professional Workspace (`/workspace`), Verified Portfolio packaging (`/portfolio`), Career Intelligence readiness (ScoreRun-preferring; labelled heuristic fallback), admin competency framework seed (`pm-core`), PI review/challenge.

**Post-ship audit:** Pass for engineering pilot gate (225+ PI-domain tests; invariants hold; unauth smoke locked).  
**T0 (2026-07-25):** Unauth smoke + migrations `0085` + focused PI vitest re-verified; prod person-PI tables still empty; signed-in checklist not executed (no test credentials). TD-001 still open.  
**T1 (2026-07-25):** Privacy export/deletion shipped (`0086`); TD-004/005 resolved; TD-006 documented for Auth dashboard.

---

## Out of scope (this phase)

- P8 external attestation / lighting `deliverxVerified`
- P9 commercial / packaging expansion
- Multi-profession framework expansion beyond thin pilot seed
- Employer attest portal
- Team Co-pilot enterprise mission-control depth as a separate Home
- Speculative intelligence microservices
- Rewriting pre-PI delivery/org engines unless required to protect the candidate loop

---

## Founder decisions pending

These block roadmap weight and copy honesty (defaults if silent are in the hypotheses canvas):

| ID | Decision | Impact if undecided |
| --- | --- | --- |
| **ICP** | Pre-job / early PM vs employed teams for next 90 days | Career vs Workspace investment weight |
| **Product count / SKU** | Team Co-pilot merge to Workspace vs third SKU vs sunset | Nav, pricing, Hub cards |
| **Verification meaning** | Legal/product definition of Verified / `deliverxVerified` | Portfolio badge, marketing, P8 timing |
| **Workspace scope** | Is employed Workspace in pilot ICP? | Observation/coach polish vs hide |
| **Roadmap approval** | Explicit authorisation for P8 / P9 | No external verification or commercial expansion until approved |
| **Framework breadth** | Single seeded domain (`pm-core`) enough for pilot? | Admin seed depth |
| **Marketing vs ledger** | Suite marketing aspirational vs committed scope | Copy audit |

---

## Working rules for agents

1. Read this file + Build Charter before implementing.
2. Prefer smallest change that hardens the shipped loop.
3. Do not start P8/P9 without founder approval recorded in `product-decisions.md`.
4. Update this file when the active phase changes.
