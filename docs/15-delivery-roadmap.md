# 15 — Delivery Roadmap

**Status:** Active  
**Authority:** [Build Charter](./product/build-charter.md) · [Current Scope](./product/current-scope.md) · [Next steps](./engineering/next-steps.md)  
**As of:** 2026-07-25 · **T8 shipped** · **T9 blocked**

---

## Snapshot

| Band | Items |
| --- | --- |
| **Shipped** | P0–P7 product loop · T0–T8 technology · migrations `0066`–`0094` |
| **Authorized next** | Ops + trust hardening (TD-006, SMTP proof, AT lab, CI secrets / coverage follow-through, …) |
| **Gated** | T9 / P9 commercial |
| **Deferred** | Marketplace, mission-control depth, multi-profession, graph DB, agent swarms, Stripe |

Do not rebuild shipped phases. Prompts request the **next vertical slice** only.

---

## Shipped milestones

### P0–P7 — Professional Intelligence candidate loop

| Milestone | Goal | Scope (shipped) | Acceptance (historical) |
| --- | --- | --- | --- |
| **P0** | Profile centre | Framework pin, evidence relocate | Profile live |
| **P1** | Claim coherence | SnapshotClaims across Profile/Career/Portfolio | Shared projection |
| **P2** | Baseline | Opt-in assessment | `/profile/baseline` |
| **P3** | Experience | Planner + 12-company catalogue | Plan + sim |
| **P4** | Observation | Consent default OFF + interventions | Consent deny-by-default |
| **P5** | Growth | Final/transfer + growth reports | Citation-backed reports |
| **P6** | Learning | Paths/items; no capability | Learning ≠ competency |
| **P7** | Outcomes | Outcome events + calibration | No auto ScoreRun |

**Deps:** Ordered P0→P7 (PD-2026-07-01).  
**Demo:** Candidate loop on www.deliverx.dev.  
**Deferred then:** External Verified (became T8).

### T0–T8 — Technology hardening

| Milestone | Goal | Status | Notes |
| --- | --- | --- | --- |
| **T0** | Pilot seal QA | PASS automated | Optional founder visual |
| **T1** | Privacy export/delete | Shipped | `0086` |
| **T2** | Rubric/DB coherence | Shipped | `0087` |
| **T3** | Artefact versioning | Shipped | `0088`–`0089` |
| **T4** | AI orchestration trust | Shipped | `0090` |
| **T5** | Notifications + usage | Shipped | `0091` |
| **T6** | E2E + release gates | Shipped | `test:release-gate` |
| **T7** | Launchpad honesty + org structure + Workspace alias | Shipped | `0093`; not third SKU |
| **T8** | External attestation / Verified | **Shipped** | `0094`; PD-2026-07-25c |

**Risks closed:** Verified meaning frozen to attestation.  
**Demo:** Attestor token flow + badge gate + kill switch.

---

## Authorized next (ops + trust)

Each item: goal · scope · deps · acceptance · risks · demo · deferred.

### A1 / TD-006 — Leaked-password protection

| Field | Content |
| --- | --- |
| Goal | Auth advisor WARN cleared |
| Scope | Supabase Auth Attack Protection toggle |
| Deps | Founder one-click |
| Acceptance | Advisor clear; runbook followed |
| Risks | None significant |
| Demo | Dashboard screenshot / advisor |
| Deferred | — |

### A2 / SMTP password-reset proof

| Field | Content |
| --- | --- |
| Goal | Recovery path is proven in production |
| Scope | Founder sends a real password-reset email and records proof |
| Deps | SMTP provider / inbox access |
| Acceptance | Reset email received successfully |
| Risks | Invitees can get stuck without recovery |
| Demo | Received reset email / note filed |
| Deferred | — |

### B1 / CI follow-through — Live signed-in secrets + coverage

| Field | Content |
| --- | --- |
| Goal | Continuous CI matches shipped trust claims |
| Scope | Add `T6_SUPABASE_*` Actions secrets so the live signed-in job can run; optionally raise coverage floors with targeted ledger tests |
| Deps | Founder / ops secrets for live job |
| Acceptance | `test:release-gate:live` green in CI at least once when secrets are present |
| Risks | Secret handling; over-tight floors without focused tests |
| Demo | Green CI run with live leg enabled |
| Deferred | — |

### B1 / TD-017 — Test fixture lint/tsc

| Field | Content |
| --- | --- |
| Goal | Full-repo lint/tsc honest |
| Scope | Fix or documented exclude policy for fixtures |
| Deps | None — can start now |
| Acceptance | Previously failing fixtures clean |
| Risks | Scope creep into unrelated debt |
| Demo | `eslint` / `tsc` on fixtures |
| Deferred | Non-fixture baseline debt triage |

### B2 / TD-011 — Marketing vs ledger honesty

| Field | Content |
| --- | --- |
| Goal | Verified + capability copy match T8 |
| Scope | Marketing + in-app strings |
| Deps | T8 shipped |
| Acceptance | No Verified-without-attestation implication; no unexplained % |
| Risks | Tone debates |
| Demo | Page copy review |
| Deferred | Broader brand redesign |

### A2 / A4 — Re-enable CI + live secrets

| Field | Content |
| --- | --- |
| Goal | Automated signed-in release signal in CI |
| Scope | Workflow enable + `T6_*` secrets |
| Deps | A1 preferred |
| Acceptance | Live gate job green once |
| Risks | Secret mishandling |
| Demo | CI live job |
| Deferred | Local Supabase Option A until disk allows |

### B3 / TD-007 — Thin `pm-core` deepen (optional)

| Field | Content |
| --- | --- |
| Goal | Richer competency graph under same pin |
| Scope | Seed only; no new professions |
| Deps | **Founder OK** |
| Acceptance | Pin unchanged; ScoreRuns still explainable |
| Risks | Scope explosion |
| Demo | ScoreRun citations |
| Deferred | Multi-profession platforms |

---

## Gated — T9 / P9 Commercial

| Field | Content |
| --- | --- |
| Goal | Entitlements / pricing beyond hardcoded open |
| Scope | Commercial packaging; possibly Stripe |
| Deps | **Separate founder approval** + decision log |
| Acceptance | TBD in approval record |
| Risks | Monetising before pilot trust; SKU ADR open |
| Demo | — |
| Deferred until approval | All checkout / paywalls |

**Agents: refuse to implement T9 without explicit founder approval.**

---

## Explicitly deferred

| Item | Why |
| --- | --- |
| Employer marketplace liquidity | Charter |
| Lighting Verified without attestation | PD frozen |
| Graph DB | Relational preferred |
| Multi-profession frameworks | Pilot `pm-core` |
| Agent swarms / chat-as-DB | Platform owns intelligence |
| Microservice split of ten domains | Taxonomy only |
| First-class `messages` table | Reuse existing |
| Enterprise mission-control depth / third SKU | T7 alias only |
| Full feature-flag platform | Env gates suffice |
| Experience↔workspace dual-write everywhere | TD-012 low–med |

---

## Ordered execution

1. Founder: TD-006 Auth toggle + SMTP proof  
2. Engineering / ops: wire T6 live secrets and keep CI truthful  
3. Optional founder visual QA / AT lab  
4. TD-007 only with founder OK  
5. T9 live Stripe ops only when founder is ready  

Detail checklist: [`engineering/next-steps.md`](./engineering/next-steps.md).
