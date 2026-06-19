# DeliverX Architecture Audit

**Last updated:** 2026-06-18  
**Production `main`:** see latest merge on GitHub  
**Build:** `npm run build` — passing  
**Estimated diagram coverage:** ~78%

This audit maps the **End-to-End AI Delivery Intelligence OS** flowchart to what is implemented, wired in navigation, and connected in feedback loops.

---

## Executive summary

| Area | Status |
|------|--------|
| Auth & onboarding | Complete (org + role required; no skip) |
| Project setup | ~85% — guided chat + Q&A + AI review/structure; PDF/PPT missing |
| Delivery workspace (tasks, RAID, governance) | ~85% |
| Intelligence loops (coordination, global, twin, adaptive) | ~80% |
| Alert queue + delivery coach | Built |
| Benefits & milestones | Built — CRUD UI + migration applied |
| Resource capacity | Built — rebalance apply action |
| Governance approvals | Built |
| Reporting pipeline | Draft → reviewed → published; **no outbound email** |
| Executive portfolio | Built |
| Closure package | Built |
| AI provider | **OpenAI** (`OPENAI_API_KEY` or `open_api_key` alias) |
| Persona mission controls (7 roles) | Built — see `docs/I4_STAKEHOLDER_MATRIX.md` |

---

## API keys

| Location | Purpose |
|----------|---------|
| `.env.local` (from `.env.example`) | Local development |
| Vercel → project **deliverx** → Environment Variables | Production |
| `/workspace/settings` → **Setup audit** | Live diagnostics |
| `docs/API_KEYS.md` | Full reference |
| `docs/SETUP_AUDIT.md` | OpenAI + auth troubleshooting |

**Required:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`, **`OPENAI_API_KEY`** (or Vercel `open_api_key`).

**Optional:** `OPENAI_MODEL` (default `gpt-4o-mini`), `CRON_SECRET`, legacy `MINIMAX_*` / `ANTHROPIC_*`.

---

## Loop coverage

### Loop 1 — Project inception & AI structuring

| Node | Route / service | Status |
|------|-----------------|--------|
| Business case paste & review | `/project/new` → `POST /api/ai/review-business-case` | Built |
| Guided questionnaire (chat) | `/project/new?mode=chat` | Built |
| AI discovery Q&A (form step) | `POST /api/ai/project-discovery` | Built |
| AI structure generation | `POST /api/ai/structure-project` | Built |
| Apply structure | `applyProjectStructure` | Built |
| Publish project | Create form checkbox | Built |
| Document intelligence (PDF/PPT/Word) | — | **Missing** — `.txt/.md/.csv` only |

### Loop 2 — Governance & steering

| Node | Status |
|------|--------|
| RAID, decisions, changes, meetings, standups | Built |
| Steering approvals | `/workspace/governance/approvals` |
| Auto approval on proposed decision / submitted CR | Built |

### Loop 3 — Delivery execution

| Node | Status |
|------|--------|
| Tasks & kanban | Built |
| Milestones CRUD | `/project/[id]/milestones` |
| Traceability, playbooks | Built |

### Loop 4 — Resource & capacity

| Node | Status |
|------|--------|
| Workload + suggestions | Built |
| Apply rebalance | `/workspace/capacity` → server action |

### Loop 5 — Benefits realisation

| Node | Status |
|------|--------|
| Benefit hypotheses CRUD | `/project/[id]/benefits` |
| Org benefits list | `/workspace/benefits` |
| Full KPI editor (baseline/target) | Partial — current value update built |

### Loop 6 — Reporting

| Node | Status |
|------|--------|
| AI reports, review workflow, publish | Built |
| Email to stakeholders on publish | **Missing** |

### Loops 7–10, closure

Portfolio, programmes, PMO, executive, coordination, global, twin, adaptive, alerts, closure AI — **built** (see prior audit sections in git history).

---

## Phase 0 verification

| Item | Status |
|------|--------|
| PR #11 merged to `main` | Done |
| Migration `architecture_os` on Supabase | Applied (`20260523100932`) |
| OpenAI env on Vercel (`open_api_key`) | Present |
| Setup audit + sign-out + AI route auth | Shipped in PR #11 |
| E2E browser smoke test | **Manual** — see `docs/PHASE0_CHECKLIST.md` |

---

## Known gaps (post Phase 2)

1. **Phase 1 product workflows** — see PR #12 / `docs/PHASE1.md` (may be on a separate branch until merged).
2. **Assistant action types** beyond RAID/tasks (milestones, stakeholders).
3. **Search** — embeddings / semantic search across memory.
4. **E2E tests** and rate limits on AI routes.

---

## Related docs

- `docs/COLLABORATIVE_LOOP_STATUS.md` — collaborative loop built vs spec matrix and J1–J4 next steps
- `docs/BUILD_REPORT.md` — sprint index (I1–I5, I4, S1-A/B/C/D), PR numbers, deferred items
- `docs/I4_STAKEHOLDER_MATRIX.md` — seven personas: routes, onboarding, mission dashboards, proposals/audit access
- `docs/PHASE0_CHECKLIST.md` — ship checklist
- `docs/SETUP_AUDIT.md` — production AI/auth
- `docs/API_KEYS.md` — environment variables
- `src/app/api/README.md` — API route index
