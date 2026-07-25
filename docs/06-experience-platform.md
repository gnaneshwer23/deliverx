# 06 — Experience Platform (PRD)

**Status:** Implementation-ready · **shipped P3 planner + catalogue + sim; bridges live**  
**Canonical detail:** [`architecture/03-experience-platform.md`](./architecture/03-experience-platform.md)

---

## Purpose

Experience is where capability develops through realistic professional work. It is not a course player. Every meaningful interaction should be able to generate trustworthy evidence for Professional Intelligence.

## User story

As a candidate, I want to practice PM work inside realistic company scenarios matched to my gaps, so that my profile reflects demonstrated work — not quiz completion.

## Business rules

1. Experience-first **and** optional baseline (PD-2026-07-02)  
2. Planner ranks across seeded catalogue (12 companies / multi-scenario — PD-2026-07-03)  
3. Work products / contributions feed Evidence Ledger with provenance  
4. Simulation events are not automatically verified capability  
5. Observation of workspace work requires consent (default OFF)  
6. No silent capability writes from Experience UI  

---

## Shipped modules & routes

| Piece | Location |
| --- | --- |
| Planner | `src/lib/experience-planner` · `GET|POST /api/pi/experience-plan` |
| Catalogue seed | Migrations `0078`–`0079` · `experience_scenarios` / `experience_plans` |
| Day-1 sim | `src/lib/experience-sim` · `/api/xperience/sim/*`, decide/start routes |
| App shell | `/experience/app`, marketing `/experience`, `/start/experience` |
| Contributions | `professional-workspace` · `POST /api/workspace/contributions` |

---

## UI states

| State | Behaviour |
| --- | --- |
| No plan | Explain ranking inputs; CTA to generate plan |
| Plan ready | Ranked scenarios with gap rationale |
| In sim | Clear company context; next task; reflect path |
| Evidence submitted | Link to profile evidence; not instant Verified |
| Empty catalogue (should not happen in prod) | Fail soft with ops message |

---

## API contracts

- `GET|POST /api/pi/experience-plan`  
- `GET /api/xperience/me` · `POST /api/xperience/onboarding` · `POST /api/xperience/experience/start` · `POST /api/xperience/scenarios/decide`  
- `GET /api/xperience/sim/state` · `POST /api/xperience/sim/reflect`  
- `POST /api/workspace/contributions`  

Full notes: [`engineering/api-contracts.md`](./engineering/api-contracts.md).

## Validation & permissions

- Plans and sim state owned by user (RLS)  
- Planner may use ScoreRun gaps when present; empty ScoreRun still allows practice  

## Events

Sim events (`experience_sim_events`); contributions may emit/process into ledger jobs — never skip provenance.

## AI behaviour

Stakeholders / manager agents may coach inside Experience under orchestration; drafts ≠ verified evidence.

---

## Acceptance criteria

- [ ] User can generate a ranked plan against catalogue  
- [ ] Starting a scenario does not require baseline  
- [ ] Reflections/contributions can become ledger evidence with provenance  
- [ ] No Experience path writes capability directly  

## Edge cases

- Dual-write Experience ↔ workspace (TD-012) — deferred; not pilot-blocking  
- MediFlow generator must remain importable for production build  

---

## Aspirational

Full seven-layer Experience OS (long-running employment, multi-stakeholder org intelligence). Charter: deepen within pilot; do not expand to multi-profession platforms without approval.
