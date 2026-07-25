# Current Scope

**Active phase:** Post-P7 pilot hardening — **Technology T3 shipped**; T0 signed-in QA still open (PARTIAL); T1 + T2 shipped  
**As of:** 2026-07-25  
**Charter:** [`build-charter.md`](./build-charter.md)  
**Technology plan:** [`../engineering/technology-build-phases.md`](../engineering/technology-build-phases.md) (T0–T9)  
**T0 status:** PARTIAL — automated/unauth gates green; **signed-in QA BLOCKED (needs founder login)**. Founder override authorised T1 while T0 remains open. See [`../qa/t0-results.md`](../qa/t0-results.md).  
**T1 status:** **Shipped** — person PI export/delete (`0086`, `/api/pi/privacy/*`, settings UX); TD-004/005 closed; TD-006 documented (Auth dashboard).  
**T2 status:** **Shipped** — rubric/DB coherence (`0087`, resolve source `db | in_code_fallback`, pin assert on capability run, golden ScoreRun harness); TD-009 closed.  
**T3 status:** **Shipped** — artefact versioning + submission coherence (`0088`; `artefacts` / `artefact_versions` / `artefact_status_transitions`; immutable prior versions; evidence cites `artefact_version_id`; privacy cascade extended; settings panel). Hotfix `0089` locks the person-purge RPC to `service_role` only. Do **not** start T4 until asked.

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
**T2 (2026-07-25):** Framework/rubric coherence — DB `pi_cf_*` SoT for ScoreRuns; labelled `in_code_fallback`; `rubric_resolve_source` on ScoreRuns (`0087`); pin assert on `POST /api/pi/capability/run`; golden reproducibility harness; TD-009 closed. TD-007 (seed depth) remains deferred.  
**T3 (2026-07-25):** Artefact versioning — `artefacts` + immutable `artefact_versions` + append-only `artefact_status_transitions` (`0088`); user-vs-AI provenance + content hash; evidence provenance must cite `artefact_version_id` (DB CHECK + app guard); artefact tables added to T1 export/purge cascade; `/api/pi/artefacts` (+`/[id]/versions`); settings panel. Access-control check found and fixed a default-privilege leak: person-purge RPC EXECUTE revoked from anon/authenticated (`0089`).

---

## Out of scope (this phase)

- P8 external attestation / lighting `deliverxVerified`
- P9 commercial / packaging expansion
- Multi-profession framework expansion beyond thin pilot seed
- Employer attest portal
- Team Co-pilot enterprise mission-control depth as a separate Home
- Speculative intelligence microservices
- Rewriting pre-PI delivery/org engines unless required to protect the candidate loop
- **T4+** until explicitly asked (AI agent/prompt/cost registry, notifications, signed-in E2E)

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
5. Do not start T4–T9 until asked; T0 signed-in QA remains open.
