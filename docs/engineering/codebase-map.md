# Codebase Map

**As of:** 2026-07-25 · HEAD ~`f3ac383`

Orientation map for agents. Prefer domain libs over hunting through unrelated delivery OS code when working under the Build Charter.

---

## Top-level

| Path | Role |
| --- | --- |
| `src/app/` | Next.js App Router — pages, layouts, Route Handlers |
| `src/lib/` | Domain modules (PI + legacy delivery) |
| `src/components/` | UI components (incl. `dx` design system pieces) |
| `src/config/` | Nav, persona, dashboard config |
| `supabase/migrations/` | Schema — PI pivot `0066`–`0085` |
| `docs/architecture/` | Product architecture 00–07 (vision) |
| `docs/product/` | Build Charter, scope, decisions |
| `docs/engineering/` | This folder — implementation truth |
| `.cursor/rules/deliverx.mdc` | Engineering Constitution (always apply) |

---

## PI app routes (person journey)

| Area | Routes (representative) |
| --- | --- |
| Profile | `/profile`, `/profile/evidence`, `/profile/baseline`, `/profile/final` |
| Experience | `/experience`, `/experience/app`, xperience sim surfaces |
| Learning | `/learning` |
| Career / outcomes | `/career/*`, `/career/outcomes` |
| Portfolio | `/portfolio`, `/portfolio/v/[token]` |
| Workspace | `/workspace/*` (Professional Workspace / Team Copilot alias) |
| Launchpad | `/launchpad/app` |
| Hub | `/hub` |
| Settings | `/settings/*` |
| PI review | `/pi/review` |
| Marketing | `/`, product marketing pages |

---

## PI libraries (`src/lib`)

See [`system-architecture.md`](./system-architecture.md) for module responsibilities.

**Start here for charter work:**

- `evidence-ledger/` · `capability-engine/` · `pi-assessment/`  
- `experience-planner/` · `experience-sim/` · `workspace-observation/`  
- `learning-intelligence/` · `real-world-outcomes/`  
- `pi-profile/` · `verified-portfolio/` · `career-intelligence/`  
- `admin-framework/` · `access/gate.ts`

---

## API entrypoints

- PI: `src/app/api/pi/**`  
- Career/outcomes: `src/app/api/career/**`  
- Portfolio: `src/app/api/portfolio/**`  
- Admin framework: `src/app/api/admin/framework/**`  
- Experience bridge: `src/app/api/xperience/**`, `src/app/api/workspace/contributions`

Full method table: [`api-contracts.md`](./api-contracts.md).

---

## Pre-pivot / adjacent (do not confuse with PI SoT)

Large surfaces still in-tree:

- `src/app/api/project/**` — delivery project OS  
- `src/lib/founder|delivery-pm|meetings|scrum|qa|engineer|brain|…`  
- Twin / intelligence / platform / marketplace APIs  

These may remain for org delivery workflows; they must **not** duplicate or override Professional Intelligence capability records.

---

## Tests

- Colocated `*.test.ts` under each `src/lib/<domain>`  
- Strategy: [`testing-strategy.md`](./testing-strategy.md)

---

## Canvases (analysis artefacts, not runtime)

Under Cursor project canvases: full-build-phases, e2e-workflow-alignment, pi-hypotheses-decisions, post-ship-audit, desktop-doc-review, implementation roadmap. Prefer committed `/docs` for ongoing governance; canvases are historical analysis.
