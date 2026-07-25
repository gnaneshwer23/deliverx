# 08 — Team Copilot / Professional Workspace (PRD)

**Status:** Implementation-ready · **bounded foundations shipped (T7); alias policy**  
**Canonical detail:** [`architecture/05-team-copilot-delivery-intelligence.md`](./architecture/05-team-copilot-delivery-intelligence.md)

---

## Purpose

Team Copilot is DeliverX’s collaborative delivery experience. Under the current charter it is an **alias of Professional Workspace**, not a third product SKU (PD-2026-07-11, T7). Focus: contribute real work, optionally consent to observation, generate organisational and person evidence without inventing capability.

## User story

As a practitioner on a delivery team, I want a calm workspace to contribute artefacts and decisions, with optional coaching observation, so my Professional Intelligence can grow from authentic work — without a separate “Team Copilot product” twin.

## Business rules

1. In-app naming prefers **Professional Workspace**; marketing may say Team Copilot → Workspace  
2. No third SKU / no mission-control expansion without approval  
3. Observation + interventions require consent (default OFF)  
4. Org departments/teams (T7) never assign capability  
5. Pre-pivot delivery OS routes may remain; they must not override PI SoT  
6. Legacy Mission Control / Ecosystem nav demoted (opt-in flag)  

---

## Shipped modules & routes

| Piece | Location |
| --- | --- |
| Workspace app | `/workspace/*` (large surface) |
| Contributions | `src/lib/professional-workspace` · `POST /api/workspace/contributions` |
| Observation | `src/lib/workspace-observation` · `/api/pi/observation/consent`, interventions |
| Org structure (T7) | `src/lib/org-structure` · `/api/org/structure`, departments/teams/members |
| Marketing | `/team-copilot`, `/professional-workspace` |

---

## UI states

| State | Behaviour |
| --- | --- |
| Consent OFF | No continuous observation; coach explains how to enable |
| Consent ON | Observations + draft interventions; not auto-verified |
| Org member | Can read structure; admin writes departments/teams |
| Legacy nav hidden | Default; enable only via env flag |

---

## API contracts

- Workspace contributions + PI observation/consent/interventions  
- `GET /api/org/structure` · `POST /api/org/departments|teams|members`  
- Large pre-pivot `/api/project/*` — adjacent, not PI SoT  

## Permissions

- Org-scoped RLS for departments/teams; `is_org_admin` for writes  
- Person membership rows in privacy export/purge  
- Project access helpers for delivery tables  

## Events

Observation and intervention flows; privacy domain events; no capability events from org structure.

## AI behaviour

Workspace coach / assistant bound to tasks and evidence; orchestration guardrails apply; drafts ≠ verified.

---

## Acceptance criteria

- [ ] Team Copilot marketing does not claim a separate SKU beyond Workspace  
- [ ] Consent default deny verified in tests  
- [ ] Org APIs refuse capability assignment (`capabilityAssigned: false` posture)  
- [ ] Mission-control depth not expanded under this PRD  

## Edge cases

- Twin Homes residual — prefer Hub/Profile as person home  
- First-class `messages` table deferred — reuse meetings/contributions/notifications  

---

## Aspirational

Full delivery intelligence OS (programme portfolios, executive mission control). Explicitly deferred by Build Charter.
