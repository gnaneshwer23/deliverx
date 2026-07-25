# 01 — Master PRD

**Status:** Active product requirements  
**Audience:** Product, Engineering, UX, QA, Leadership  
**Not:** A feature dump or long-term vision dump  
**Canonical detail:** [`architecture/01-product-architecture.md`](./architecture/01-product-architecture.md) · [`product/current-scope.md`](./product/current-scope.md)

---

## Why

Professionals cannot prove capability across tools that do not share evidence. Employers cannot trust self-declared skills. DeliverX connects identity, realistic work, evidence, judgement, and career packaging into one loop.

## Vision

A professional can open DeliverX and see an explainable picture of what they have demonstrated, what to practice next, and how to package readiness — without decorative scores or unverified badges.

## Philosophy

See [`00-vision-and-principles.md`](./00-vision-and-principles.md). Non-negotiables are also in the [Build Charter](./product/build-charter.md).

---

## Target users (pilot ICP)

| Persona | Intent | Primary surfaces |
| --- | --- | --- |
| **Aspiring / early PM** | Build evidence through Experience; understand gaps | Profile, Experience planner/sim, Learning CTAs |
| **Career switcher** | Convert adjacent experience into demonstrated PM evidence | Onboarding → Experience; baseline opt-in |
| **Practicing PM** | Package evidence; calibrate with outcomes; seek attestation | Portfolio, Launchpad, Outcomes, T8 attestation |
| **Org collaborator** (bounded) | Work in Professional Workspace; optional observation consent | Workspace; Team Copilot alias |

**Out of pilot ICP default:** employer marketplace liquidity, multi-profession platforms, enterprise mission-control depth, paid SKUs (T9).

---

## Core journeys (shipped)

1. **Signup → PI onboarding** (`/onboarding/profile`) → recommended path (Experience / Launchpad / Profile hub)  
2. **Baseline (opt-in)** → ScoreRun `run_kind=baseline` under `pm-core@2026.1`  
3. **Experience plan** → scenario catalogue (12 companies) → sim work → evidence → judgements  
4. **Workspace contribution / observation** (consent OFF by default) → interventions as drafts  
5. **Final / transfer assessment** → growth report with citations  
6. **Learning** → knowledge / apply CTAs — **never** capability persist  
7. **Outcomes** → calibration findings — honest strength, no auto ScoreRun  
8. **Portfolio compile + share** → **external attestation (T8)** → `deliverxVerified` only when attested  

---

## Ecosystem

Professional Intelligence is the SoT. Experience generates evidence. Launchpad packages and routes career actions. Team Copilot / Professional Workspace is collaborative delivery (**alias only** — PD-2026-07-11 / T7); not a third product SKU under charter.

---

## Business goals (pilot)

- Trustworthy candidate loop for limited pilot on https://www.deliverx.dev  
- Evidence and Verified meaning legally and product-safe  
- Ops readiness (CI, Auth hygiene, honesty copy) before commercial expansion  

## Success metrics

| Metric | Intent |
| --- | --- |
| Onboarding completion → first Experience start | Activation |
| Evidence records with provenance | Evidence density |
| ScoreRuns pinned + explainable | Judgement quality |
| Observation consent opt-in rate (expect low) | Privacy honesty |
| Attestation confirmations lighting Verified | Trust signal integrity |
| Zero incidents of learning/ScoreRun lighting Verified | Invariant |

Instrumentation gaps: see [`14-analytics-and-product-metrics.md`](./14-analytics-and-product-metrics.md).

---

## Functional requirements (pilot)

1. Person PI profile aggregate with next actions  
2. Append-only evidence ledger with provenance and status transitions  
3. Capability ScoreRuns only via Capability Engine; framework pin required  
4. SnapshotClaims as shared claim projection (Profile / Career / Portfolio)  
5. Assessments: baseline / final / transfer with distinct `run_kind`  
6. Experience planner + multi-company catalogue + Day-1 sim  
7. Consent-gated workspace observation; interventions ≠ verified evidence  
8. Learning paths without capability writes  
9. Outcome events + calibration without auto capability upgrade  
10. Portfolio packaging, share tokens, external attestation (T8)  
11. Privacy export/delete (T1); notifications inbox (T5)  
12. Org departments/teams foundations (T7) without capability assignment  

## Non-functional requirements

| Area | Requirement |
| --- | --- |
| Security | Session auth on person APIs (401 anon); RLS self-only for person PI; least-privilege public tokens |
| Privacy | Evidence private by default; observation consent default OFF; purge cascade documented |
| Explainability | No unexplained scores; heuristic readiness labelled |
| Reliability | Modular monolith on Vercel + Supabase; migrations reviewed |
| Accessibility | Professional UI usable with keyboard; forms labelled; calm contrast |
| Performance | Prefer server routes + typed libs; avoid chat-as-DB |

---

## Security & privacy (summary)

See [`engineering/security-model.md`](./engineering/security-model.md). Kill switches: `DELIVERX_VERIFIED_BADGE`, optional PI allowlist gates, AI orchestration bypass for legacy only.

## Accessibility

Calm professional UI; no emoji gamification; every screen states where / what matters / what next. Forms and attestor flows must be operable without pointer-only traps.

## AI principles

- Intelligence belongs to the platform; LLMs reason over structured context  
- Agents: Manager / Stakeholder / Observer (+ coaches) via `ai-orchestration`  
- Never auto-verify; never write capability; consequential actions need confirmation  

---

## Acceptance criteria (platform-level)

- [ ] Candidate can complete onboarding and reach a meaningful next action without inventing capability  
- [ ] Evidence append and ScoreRun persist respect ledger / engine invariants (tested)  
- [ ] Learning and outcomes never light Verified or write ScoreRuns  
- [ ] `deliverxVerified` only after external attestation confirm + strength  
- [ ] Unauth person APIs return 401; sensitive pages redirect to login with `next`  
- [ ] Release gate green: `npm run test:release-gate` (+ live when secrets present)  

## Definition of Done

Matches Engineering Handbook ([`10-engineering-handbook.md`](./10-engineering-handbook.md)): typecheck, lint, tests, migrations/RLS, docs, decisions if architectural, verified claims only.

---

## Shipped reality

Do **not** write or implement as if P0–P7 / T0–T8 do not exist. Prefer hardening and honesty (TD-011/017/018, TD-006) over new product surfaces. T9 blocked.
