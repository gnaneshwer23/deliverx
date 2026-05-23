# DeliverX Architecture Audit

**Date:** 2026-05-22  
**Build:** `npm run build` — passing  
**Estimated diagram coverage:** ~72%

This audit maps the **End-to-End AI Delivery Intelligence OS** flowchart to what is implemented, wired in navigation, and connected in feedback loops.

---

## Executive summary

| Area | Status |
|------|--------|
| Auth & onboarding | Complete |
| Project setup (AI structure + discovery Q&A) | ~75% — Q&A wired; PDF/PPT upload missing |
| Delivery workspace (tasks, RAID, governance) | ~85% |
| Intelligence loops (coordination, global, twin, adaptive) | ~80% |
| Alert queue + delivery coach | Built |
| Benefits & milestones | Schema + pages; KPI edit UI partial |
| Resource capacity | Workload view + suggestions; no auto-reassign |
| Governance approvals | Auto-request on proposed decisions / submitted CRs |
| Reporting pipeline | Draft → reviewed → published (UI); no outbound email |
| Executive portfolio | Built (`/workspace/executive`) |
| Closure package | AI generation + project page |
| Database migration `0020_architecture_os.sql` | **Must be applied** to Supabase |

---

## API keys

| Location | Purpose |
|----------|---------|
| `.env.local` (from `.env.example`) | Local development |
| Vercel → Project → Environment Variables | Production |
| `/workspace/settings` | In-app AI status + env key guide |
| `docs/API_KEYS.md` | Full reference |

**Required:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`, and **one of** `MINIMAX_API_KEY` or `ANTHROPIC_API_KEY`.

**Optional:** `OPENAI_API_KEY`, `CRON_SECRET`.

---

## Loop coverage

### Loop 1 — Project inception & AI structuring

| Node | Route / service | Status |
|------|-----------------|--------|
| Business case upload & review | `/project/new` → `POST /api/ai/review-business-case` | Built |
| AI discovery Q&A | `/project/new` step 3 → `POST /api/ai/project-discovery` | Built |
| AI structure generation | `POST /api/ai/structure-project` | Built |
| Apply structure (M1–M9 entities) | `applyProjectStructure` | Built (graceful if migration missing) |
| Publish project | Create form checkbox → `status: active` | Built |
| Document intelligence (PDF/PPT/Word) | — | **Missing** — `.txt/.md/.csv` only |

### Loop 2 — Governance & steering

| Node | Route / service | Status |
|------|-----------------|--------|
| RAID | `/workspace/raid`, `/project/[id]/raid` | Built |
| Decisions | `/workspace/decisions`, project decisions | Built |
| Changes | `/workspace/changes`, project changes | Built |
| Steering approvals | `/workspace/governance/approvals` | Built |
| Auto approval request | `createDecision` (proposed), `createChangeRequest` (submitted) | Built |
| Meetings / standups | `/workspace/meetings` | Built |

### Loop 3 — Delivery execution

| Node | Route / service | Status |
|------|-----------------|--------|
| Tasks & kanban | `/workspace/tasks?view=kanban` | Built |
| Workstreams | Project workstreams page | Built |
| Milestones | `/project/[id]/milestones` | Built (needs migration) |
| Traceability | Project traceability | Built |
| Playbooks | `/workspace/playbooks` + apply API | Built |

### Loop 4 — Resource & capacity

| Node | Route / service | Status |
|------|-----------------|--------|
| Workload aggregation | `src/services/capacity.ts` | Built |
| Capacity dashboard | `/workspace/capacity` | Built |
| Rebalance suggestions | Capacity service | Built |
| One-click task reassignment | — | **Missing** |

### Loop 5 — Benefits realisation

| Node | Route / service | Status |
|------|-----------------|--------|
| Benefit hypotheses | `benefit_hypotheses` table + `benefits.ts` | Built (needs migration) |
| Project benefits | `/project/[id]/benefits` | Built |
| Org benefits | `/workspace/benefits` | Built |
| KPI baseline/target/current edit UI | — | Partial |

### Loop 6 — Reporting & stakeholder comms

| Node | Route / service | Status |
|------|-----------------|--------|
| AI report generation | `POST /api/ai/reports/generate` | Built |
| Org report list | `/workspace/reports` | Built |
| Review workflow | Mark reviewed action | Built |
| Publish + stakeholder emails | Report detail panel | Built (stores emails; **no SMTP send**) |

### Loop 7 — Portfolio & programme intelligence

| Node | Route / service | Status |
|------|-----------------|--------|
| Portfolio rollup | `/workspace/portfolio` | Built |
| Programmes | `/workspace/programmes` | Built |
| PMO snapshot | `/workspace/pmo` | Built |
| Executive command | `/workspace/executive` | Built |

### Loop 8 — Coordination & multi-agent

| Node | Route / service | Status |
|------|-----------------|--------|
| Coordination loop | `/workspace/coordination`, `/api/coordination/loop` | Built |
| Agent graph | `/api/coordination/graph` | Built |

### Loop 9 — Global & digital twin

| Node | Route / service | Status |
|------|-----------------|--------|
| Global intelligence | `/workspace/global` | Built |
| Digital twin | `/workspace/twin` | Built |
| Simulate / optimize | `/api/twin/simulate`, `/api/twin/optimize` | Built |

### Loop 10 — Adaptive learning & delivery coach

| Node | Route / service | Status |
|------|-----------------|--------|
| Adaptive recommendations | `/api/adaptive/*` | Built |
| Alert queue | `src/services/alerts.ts`, `/workspace/alerts` | Built |
| Delivery coach | Dashboard + alerts page | Built |

### Closure (CL1–CL10)

| Node | Route / service | Status |
|------|-----------------|--------|
| Closure package AI | `POST /api/ai/closure-package` | Built |
| Closure UI | `/project/[id]/closure` | Built |
| Persist `closure_package` on project | Migration column | Needs migration applied |

---

## Navigation & routing audit

All primary workspace sections have **distinct routes** (no redirect loops observed):

- Dashboard, projects, tasks, RAID, decisions, changes, meetings, documents, reports, team
- Intelligence: global, twin, coordination, memory, benchmarking, marketplace
- OS extensions: alerts, benefits, capacity, executive, governance/approvals

Auth guards: workspace layout, project/new layout, onboarding steps, executive role gate.

---

## Known gaps (priority order)

1. **Apply migration** `supabase/migrations/0020_architecture_os.sql` (local + remote).
2. **PDF/PPT/Word extraction** for project brief upload (document intelligence node).
3. **Outbound email** when publishing reports (currently records `stakeholder_emails` only).
4. **Benefits KPI editor** — update baseline/target/current from UI.
5. **Capacity rebalance action** — apply suggested task reassignment.
6. **Cron jobs** — scheduled loop runners (coordination/global) need `CRON_SECRET` + Vercel cron config for production automation.

---

## Verification checklist

- [x] Production build passes
- [x] Alert queue surfaces health, governance, standup gaps
- [x] Discovery Q&A in project wizard
- [x] Approvals auto-created for proposed decisions / submitted changes
- [x] Report draft → reviewed → published workflow
- [ ] Migration 0020 applied to database
- [ ] E2E browser test of full project create → publish → alert flow

---

## Related docs

- `docs/API_KEYS.md` — environment variables
- `src/app/api/README.md` — API route index
- `supabase/migrations/0020_architecture_os.sql` — latest OS schema
