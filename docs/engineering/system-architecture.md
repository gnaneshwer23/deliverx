# System Architecture

> **Product Bible:** Orientation in [`../README.md`](../README.md). This engineering doc is **canonical detail** for schema/APIs/phases when implementing.

**As of:** 2026-07-25 · modular monolith  
**Stack:** Next.js App Router · Supabase (Postgres + Auth + RLS) · Vitest

---

## Shape

DeliverX runs as a **modular monolith**:

- **Web + API:** Next.js App Router (`src/app/**`) including Route Handlers under `src/app/api/**`
- **Domain logic:** typed libraries under `src/lib/*`
- **Data / auth:** Supabase Postgres with RLS; migrations in `supabase/migrations/`
- **Events:** `pi_domain_events` outbox-style domain events from the Evidence Ledger (and related PI flows) — not a separate message bus service

Prefer this shape until scale, team boundaries, or isolation requirements justify extraction (per Engineering Constitution).

---

## PI domain modules (`src/lib/*`)

| Module | Responsibility |
| --- | --- |
| `evidence-ledger` | Append evidence records, provenance, status transitions, processing jobs, domain events |
| `capability-engine` | ScoreRuns, judgements, snapshots, SnapshotClaims projection, rubric resolve, persist |
| `pi-assessment` | Baseline / item flow; final + transfer assessment; growth report inputs |
| `experience-planner` | Gap-aware plan ranking over seeded scenario catalogue |
| `experience-sim` | Day-1 simulation runtime, MediFlow + multi-company generators |
| `professional-workspace` | Workspace contribution contracts toward ledger |
| `workspace-observation` | Consent-gated observations + intervention drafts |
| `learning-intelligence` | Learning paths/items; knowledge evidence; **no** capability persist |
| `real-world-outcomes` | Outcome events + calibration findings (honest strength; no auto ScoreRun) |
| `career-intelligence` | Readiness matching from SnapshotClaims; labelled heuristic fallback |
| `verified-portfolio` | Portfolio compile, share tokens, `deliverxVerified` gate |
| `pi-review` | Review/challenge cases; emits person attention into `notifications` |
| `notifications` | T5 consolidated person inbox; idempotent review/intervention/privacy projection and read state |
| `admin-framework` | Competency framework graph lifecycle, immutability, seed |
| `pi-profile` | Profile aggregate / next-action views over PI state |
| `pi-onboarding` | PI onboarding sessions |
| `access` | `DELIVERX_PI_*` gate (allowlist / surfaces) |

Supporting product libs still present: `launchpad`, `xperience`, `auth`, `onboarding`, `marketing`, plus legacy delivery/org engines (`founder`, `delivery-pm`, `meetings`, etc.) that are **not** the PI SoT.

---

## API surface (summary)

- **PI core:** `/api/pi/*` — profile, evidence, capability runs, assessment, experience-plan, observation consent, interventions, learning, growth-report, review, notifications
- **Career / portfolio:** `/api/career/*`, `/api/portfolio/*`
- **Experience legacy/runtime:** `/api/xperience/*`, `/api/workspace/contributions`
- **Admin framework:** `/api/admin/framework/*`
- **Broader platform:** large `/api/project/*`, `/api/ai/*`, intelligence/twin/platform routes from pre-pivot delivery OS

Auth expectation: user-session required for person PI routes (unauth → 401). See `api-contracts.md`.

---

## Module boundaries

```
Experience / Workspace / Assessment / Learning / Outcomes
        │
        ▼
  Evidence Ledger  ──events──►  (async process / consumers)
        │
        ▼
  Capability Engine (ScoreRun + SnapshotClaims)
        │
        ├──► Profile / Career / Portfolio / Growth report
        └──► Experience planner gaps / Learning CTAs
```

**Hard boundaries:**

- Only Capability Engine persist paths write capability ScoreRuns / levels
- Learning and outcomes must not silently upgrade capability or verification
- Observation requires consent; coach drafts ≠ verified evidence
- Products read shared SnapshotClaims rather than duplicating capability records

---

## Events

- Table: `pi_domain_events` (ledger migration `0067`)
- Used for evidence lifecycle / processing coordination inside the monolith
- Not a cross-service pub/sub fabric yet

---

## Related docs

- [`data-model.md`](./data-model.md)
- [`api-contracts.md`](./api-contracts.md)
- [`security-model.md`](./security-model.md)
- Architecture vision: `/docs/architecture/00`–`07`
