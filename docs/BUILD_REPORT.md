# DeliverX build report

**Last updated:** 2026-06-22 (R11 — post R10)  
**Production:** https://www.deliverx.dev  
**Current `main` SHA:** `a550972` (PR [#116](https://github.com/gnaneshwer23/deliverx/pull/116)) — or `git log -1 origin/main`

This report summarises sprints **I1–I5**, **Horizon 1–3 (S1, J, K)**, **P-PM / P-Founder**, and **R1–R10** (role-differentiated dashboard rebuild + real data wiring). For persona routes and one-line IA per dashboard, see [Dashboard IA](./DASHBOARD_IA.md) and [I4 stakeholder matrix](./I4_STAKEHOLDER_MATRIX.md). For collaborative loop built-vs-spec detail, see [Collaborative loop status](./COLLABORATIVE_LOOP_STATUS.md).

---

## Executive summary

| Horizon | Status | Notes |
|---------|--------|-------|
| **I1–I2** | ✅ Shipped | Mission KPI cards, feed cards, portfolio grid, UX parity |
| **I3** | ✅ Shipped | Marketing landing, role-switcher hero, dark sections |
| **I4** | ✅ Shipped | Persona onboarding, gateway routing, dashboard polish, governance audit |
| **I5** | ✅ Shipped | Persona headers, dashboard customize, copy reduction, visual polish |
| **H (collaborative loop)** | ✅ Infra shipped | Engine, propagation, realtime impact, orchestration (PRs #33–38) |
| **S1-A** | ✅ Complete | Production parity — `main` deployed to deliverx.dev |
| **S1-B** | ✅ Shipped | Vercel Analytics + Speed Insights, preview env parity docs (PR #67) |
| **S1-C** | ✅ Shipped | Phase I health smoke checks (I5 + loop + observability) |
| **S1-D** | ✅ Shipped | This report + collaborative loop status doc |
| **S1-E** | ✅ Shipped | Post-audit prod deploy parity + BUILD_REPORT refresh (this update) |
| **J1–J4** | ✅ Shipped | Event propagation, live narrative threads, founder command, bootstrap parity |
| **K1–K2** | ✅ Shipped | Next-up strip + essential panel defaults |
| **K3** | ✅ Shipped | Nav path simplification + Command Centre next-up |
| **Organic loop** | ✅ Shipped | Remaining domain mutations emit without demo seed |
| **Mobile UX** | ✅ Shipped | Mission fallback CTAs, auth layout, nav lint (PRs #86–#88) |
| **P-PM-0–4** | ✅ Shipped | PM dual-mode shell, day-one/steady-state panels, visual KPI upgrade |
| **P-Founder-0–3** | ✅ Shipped | Founder mode bridge, day-one components, steady-state board-memo layout |
| **K5** | ✅ Shipped | Persona visual accents + day-one welcome bridges (PR [#103](https://github.com/gnaneshwer23/deliverx/pull/103)) |
| **R1–R7** | ✅ Shipped | Settings split, Command Centre, PM/Founder/5-persona IA rebuilds, governance merge, portfolio, coord intel |
| **R8–R10** | ✅ Shipped | Real data wiring (Scrum/PM/QA), Product/Engineer KPIs, honest KPI cleanup, mobile pass |
| **Onboarding #98** | ✅ Shipped | Founder onboarding clarity — unified steps, plain-language copy |
| **BA fix #105** | ✅ Shipped | Bootstrap summary crash on malformed AI payloads |

**Build:** `npm run build` — passing  
**Tests:** `npm test -- --run` — see CI / local run for current count  
**Prod smoke (2026-06-22):** `/`, `/login` → 200; phase health routes → 401 without auth (expected)

---

## Sprint I1 — Mission KPI foundation

| Item | PR | Production |
|------|-----|------------|
| Mission KPI cards with deltas and progress bars | [#40](https://github.com/gnaneshwer23/deliverx/pull/40) | ✅ |

---

## Sprint I2 — UX parity

| Item | PR | Production |
|------|-----|------------|
| Mission KPIs, feed cards, portfolio grid | [#41](https://github.com/gnaneshwer23/deliverx/pull/41) | ✅ |

---

## Sprint I3 — Marketing & foundation

| Item | PR | Production |
|------|-----|------------|
| Landing data, theme tokens, layout primitives (I3.1) | [#43](https://github.com/gnaneshwer23/deliverx/pull/43) | ✅ |
| Role-switcher hero and dashboard preview (I3.2) | [#44](https://github.com/gnaneshwer23/deliverx/pull/44) | ✅ |
| Dark landing sections and page wiring (I3.3) | [#45](https://github.com/gnaneshwer23/deliverx/pull/45) | ✅ |
| Contrast tokens and professional copy (polish.1) | [#47](https://github.com/gnaneshwer23/deliverx/pull/47) | ✅ |
| Section contrast and readable KPI styling (polish.2) | [#48](https://github.com/gnaneshwer23/deliverx/pull/48), [#49](https://github.com/gnaneshwer23/deliverx/pull/49) | ✅ |
| Platform overview product section (polish.3) | [#48](https://github.com/gnaneshwer23/deliverx/pull/48) | ✅ |

---

## Sprint I4 — Persona onboarding & polish

| Item | PR | Production |
|------|-----|------------|
| Landing nav parity — mobile drawer, OG image, legal stubs (I4-A) | [#50](https://github.com/gnaneshwer23/deliverx/pull/50) | ✅ |
| Centralize persona OB config (I4-B.1) | [#52](https://github.com/gnaneshwer23/deliverx/pull/52) | ✅ |
| Role-based gateway routing (I4-B.2) | [#53](https://github.com/gnaneshwer23/deliverx/pull/53) | ✅ |
| Persona wizard and role-specific completion (I4-B.3) | [#54](https://github.com/gnaneshwer23/deliverx/pull/54) | ✅ |
| Persona sidebar filter and pending review strips (I4-C) | [#55](https://github.com/gnaneshwer23/deliverx/pull/55) | ✅ |
| Responses-audit rollout with audit trail (I4-D) | [#56](https://github.com/gnaneshwer23/deliverx/pull/56) | ✅ |
| Mission nav badges, proposal project filter, gateway hardening (I4-E) | [#57](https://github.com/gnaneshwer23/deliverx/pull/57) | ✅ |
| Stakeholder matrix, landing audit, mission fallback banners (I4-F) | [#58](https://github.com/gnaneshwer23/deliverx/pull/58) | ✅ |

**Reference:** [docs/I4_STAKEHOLDER_MATRIX.md](./I4_STAKEHOLDER_MATRIX.md)

---

## Sprint I5 — Dashboard identity & copy

| Item | PR | Production |
|------|-----|------------|
| **I5-A** — Persona identity headers on mission dashboards | [#59](https://github.com/gnaneshwer23/deliverx/pull/59) | ✅ |
| **I5-B** — Dashboard panel collapse and hide customization | [#65](https://github.com/gnaneshwer23/deliverx/pull/65) | ✅ |
| **I5-C.1** — Shared clamp and AI insight components | [#61](https://github.com/gnaneshwer23/deliverx/pull/61) | ✅ |
| **I5-C.2** — Clamp mission AI summaries | [#62](https://github.com/gnaneshwer23/deliverx/pull/62) | ✅ |
| **I5-C.3** — Compact panel AI insights | [#63](https://github.com/gnaneshwer23/deliverx/pull/63) | ✅ |
| **I5-C.4** — Page copy cleanup and KPI dedup | [#64](https://github.com/gnaneshwer23/deliverx/pull/64) | ✅ |
| **I5-D** — Visual density and hierarchy polish | [#66](https://github.com/gnaneshwer23/deliverx/pull/66) | ✅ |

## Horizon 2 — Collaborative loop live wiring (J1–J4)

| Item | PR | Production |
|------|-----|------------|
| **J1-A** — Loop propagation core + demo seed gate | [#74](https://github.com/gnaneshwer23/deliverx/pull/74) | ✅ |
| **J1-B** — Domain mutation propagation | [#76](https://github.com/gnaneshwer23/deliverx/pull/76) | ✅ |
| **J2-A** — Semantic narrative thread signals | [#78](https://github.com/gnaneshwer23/deliverx/pull/78) | ✅ |
| **J2-B** — J2 narrative smoke in phase health | [#79](https://github.com/gnaneshwer23/deliverx/pull/79) | ✅ |
| **J2-C** — Collaborative loop status doc update | [#80](https://github.com/gnaneshwer23/deliverx/pull/80) | ✅ |
| **J3** — Founder Decision Centre + intelligence feed | [#83](https://github.com/gnaneshwer23/deliverx/pull/83) | ✅ |
| **J4** — Post-GO bootstrap checklist (live counts) | [#84](https://github.com/gnaneshwer23/deliverx/pull/84) | ✅ |
| **Organic loop** — Remaining mutations without demo seed | [#85](https://github.com/gnaneshwer23/deliverx/pull/85) | ✅ |

---

## Horizon 3 — UX reduction (K1–K4)

| Item | PR | Production |
|------|-----|------------|
| **K2** — Essential panel defaults per persona (~4–6 visible) | [#81](https://github.com/gnaneshwer23/deliverx/pull/81) | ✅ |
| **K1** — Next-up strip + role home routing | [#82](https://github.com/gnaneshwer23/deliverx/pull/82) | ✅ |
| **K3** — Nav path simplification + Command Centre next-up | [#91](https://github.com/gnaneshwer23/deliverx/pull/91) | ✅ |
| **K4** — Inline edit on mission dashboards | — | — |

Config: `dashboard-essential-panels.ts`. **Key files:** `mission-persona-header.tsx`, `mission-persona-meta.ts`, `nav-path.ts`, `mission-nav-path.tsx`, `command-centre-next-up.ts`, `app-shell.tsx`, `dashboard-prefs.ts`, `dashboard-inline-edit.ts`, `inline-editable-text.tsx`, `editable-mission-ai-summary.tsx`, `dashboard-essential-panels.ts`, `dashboard-panel-shell.tsx`.

**K4 persistence:** localStorage keyed by persona (`dx-dashboard-inline-edit:{personaId}`), matching `dashboard-prefs.ts`. Server-side sync deferred to H4.

---

## Post-audit mobile polish

| Item | PR | Production |
|------|-----|------------|
| Mock → Live CTAs (persona mission fallback banners) | [#86](https://github.com/gnaneshwer23/deliverx/pull/86) | ✅ |
| Mobile auth layout + workspace sidebar | [#87](https://github.com/gnaneshwer23/deliverx/pull/87) | ✅ |
| Mobile nav lint (route-change reset) | [#88](https://github.com/gnaneshwer23/deliverx/pull/88) | ✅ |

---

## PM mission dual-mode (P-PM)

| Item | PR | What shipped |
|------|-----|--------------|
| **P-PM-0** — Dual-mode shell | [#94](https://github.com/gnaneshwer23/deliverx/pull/94) | `resolvePmDashboardMode`, welcome bridge, `data-pm-mode`, `PmMissionShell` |
| **P-PM-1** — Day-one panels | [#95](https://github.com/gnaneshwer23/deliverx/pull/95) | KPI strip, grouped AI review, RAID snapshot, team roster, milestones, 2-column layout |
| **P-PM-2** — Steady-state panels | [#96](https://github.com/gnaneshwer23/deliverx/pull/96) | Needs-attention strip, governance-oriented steady layout |
| **P-PM-3** — Polish | [#97](https://github.com/gnaneshwer23/deliverx/pull/97) | Project chip dropdown, generate report CTA |
| **P-PM-4** — Visual upgrade | [#104](https://github.com/gnaneshwer23/deliverx/pull/104) | Visual KPI bars, deduplicated panels |

**Key files:** `pm-dashboard-mode.ts`, `pm-day-one-panels.ts`, `pm-day-one-panels.tsx`, `pm-mission-panel-switch.tsx`, `pm-mission/page.tsx`.

---

## Founder mission dual-mode (P-Founder)

| Item | PR | What shipped |
|------|-----|--------------|
| **P-Founder-0** — Mode bridge | [#99](https://github.com/gnaneshwer23/deliverx/pull/99) | `resolveFounderDashboardMode`, welcome bridge |
| **P-Founder-1** — Header + panel switch | [#100](https://github.com/gnaneshwer23/deliverx/pull/100) | Header polish, day-one panel switching |
| **P-Founder-2** — Day-one components | [#101](https://github.com/gnaneshwer23/deliverx/pull/101) | Day-one mission components |
| **P-Founder-3** — Steady-state | [#102](https://github.com/gnaneshwer23/deliverx/pull/102) | Board-memo steady-state layout |

**Onboarding clarity:** [#98](https://github.com/gnaneshwer23/deliverx/pull/98) — unified founder step indicators, plain-language project form copy.

**Key files:** `founder-dashboard-mode.ts`, `founder-day-one-panels.tsx`, `founder-mission-panel-switch.tsx`, `founder/page.tsx`.

---

## Horizon 4 — Role-differentiated dashboard rebuild (R1–R7)

| Item | PR | What shipped |
|------|-----|------------|
| **R1** — Settings split + jargon | [#106](https://github.com/gnaneshwer23/deliverx/pull/106) | Settings IA split, New Project collapse, jargon cleanup |
| **R2** — Command Centre | [#107](https://github.com/gnaneshwer23/deliverx/pull/107) | Command Centre IA, honest KPI strip |
| **R3** — PM dashboard rebuild | [#108](https://github.com/gnaneshwer23/deliverx/pull/108) | Control room layout, Team Needs feed |
| **R4** — Founder board-memo | [#109](https://github.com/gnaneshwer23/deliverx/pull/109) | Founder dashboard IA rebuild |
| **R5** — Five persona rebuilds | [#110](https://github.com/gnaneshwer23/deliverx/pull/110) | BA, Product, Engineer, QA, Scrum dashboard IA |
| **R6** — Governance merge | [#111](https://github.com/gnaneshwer23/deliverx/pull/111) | Merged governance tabs, Team Needs feed cleanup |
| **R7** — Portfolio + coord intel | [#112](https://github.com/gnaneshwer23/deliverx/pull/112) | Portfolio auto-create, Coord Intel promotion, jargon cleanup |

**Visual polish:** [#113](https://github.com/gnaneshwer23/deliverx/pull/113) — Monday-inspired status pills, widget headers, card rhythm.

**Bugfix:** [#105](https://github.com/gnaneshwer23/deliverx/pull/105) — BA mission dashboard crash on malformed bootstrap summaries.

→ Persona one-liners: [DASHBOARD_IA.md](./DASHBOARD_IA.md)

---

## Horizon 4 — Real data wiring (R8–R10)

| Item | PR | What shipped |
|------|-----|------------|
| **R8** — Core real data | [#114](https://github.com/gnaneshwer23/deliverx/pull/114) | Scrum burndown, PM team capacity, QA release readiness from live DB |
| **R9** — Product + Engineer | [#115](https://github.com/gnaneshwer23/deliverx/pull/115) | Product/Engineer real data KPIs, welcome bridges, honest labels |
| **R10** — Honest KPI + mobile | [#116](https://github.com/gnaneshwer23/deliverx/pull/116) | Final honest KPI cleanup, mission dashboard mobile pass |

**Key files:** `sprint-metrics.ts`, `pm-team-capacity.ts`, `qa-release-kpis.ts`, `product-dashboard-kpis.ts`, `engineer-dashboard-kpis.ts`, `live-data-prompt-ctas.ts`.

---

## Key milestones — PRs #98–#116

| PR | Theme | Summary |
|----|-------|---------|
| [#98](https://github.com/gnaneshwer23/deliverx/pull/98) | Onboarding | Founder onboarding clarity |
| [#99](https://github.com/gnaneshwer23/deliverx/pull/99) | P-Founder | Mode bridge + welcome |
| [#100](https://github.com/gnaneshwer23/deliverx/pull/100) | P-Founder | Header + panel switch |
| [#101](https://github.com/gnaneshwer23/deliverx/pull/101) | P-Founder | Day-one components |
| [#102](https://github.com/gnaneshwer23/deliverx/pull/102) | P-Founder | Steady-state layout |
| [#103](https://github.com/gnaneshwer23/deliverx/pull/103) | K5 | Persona visual accents |
| [#104](https://github.com/gnaneshwer23/deliverx/pull/104) | P-PM | Visual KPI upgrade |
| [#105](https://github.com/gnaneshwer23/deliverx/pull/105) | Bugfix | BA bootstrap summary crash |
| [#106](https://github.com/gnaneshwer23/deliverx/pull/106) | R1 | Settings split |
| [#107](https://github.com/gnaneshwer23/deliverx/pull/107) | R2 | Command Centre honest KPIs |
| [#108](https://github.com/gnaneshwer23/deliverx/pull/108) | R3 | PM IA rebuild |
| [#109](https://github.com/gnaneshwer23/deliverx/pull/109) | R4 | Founder board-memo |
| [#110](https://github.com/gnaneshwer23/deliverx/pull/110) | R5 | 5-persona rebuilds |
| [#111](https://github.com/gnaneshwer23/deliverx/pull/111) | R6 | Governance merge |
| [#112](https://github.com/gnaneshwer23/deliverx/pull/112) | R7 | Portfolio + coord intel |
| [#113](https://github.com/gnaneshwer23/deliverx/pull/113) | UX | Monday-inspired polish |
| [#114](https://github.com/gnaneshwer23/deliverx/pull/114) | R8 | Real data wiring |
| [#115](https://github.com/gnaneshwer23/deliverx/pull/115) | R9 | Product/Engineer wiring |
| [#116](https://github.com/gnaneshwer23/deliverx/pull/116) | R10 | Honest KPI + mobile |

---

## Collaborative loop (Phase H)

Shipped in parallel with I-series work; health checks live in `phaseHHealth.ts`.

| Sprint | PR | What shipped |
|--------|-----|--------------|
| H1.1 — Collaborative loop engine | [#33](https://github.com/gnaneshwer23/deliverx/pull/33) | `collaborativeLoopEngine.ts`, service layer |
| H1.2 — Stakeholder panels UI | [#34](https://github.com/gnaneshwer23/deliverx/pull/34) | Stakeholder loop, team needs, pulse panels |
| H1.3 — Dashboard wiring + H1 health | [#35](https://github.com/gnaneshwer23/deliverx/pull/35) | All 7 mission routes + Command Centre |
| H2.1 — Delivery impact realtime | [#36](https://github.com/gnaneshwer23/deliverx/pull/36) | Migration `0056`, live refresh component |
| H2.2 — Loop propagation | [#37](https://github.com/gnaneshwer23/deliverx/pull/37) | `collaborativeLoopPropagation.ts`, narrative threads |
| H3 — Loop orchestration | [#38](https://github.com/gnaneshwer23/deliverx/pull/38) | Snapshots, agent orchestration impact, programme hook |

**Status detail:** [docs/COLLABORATIVE_LOOP_STATUS.md](./COLLABORATIVE_LOOP_STATUS.md)

---

## Horizon 1 — Stabilisation (S1)

| Sprint | Status | Deliverable |
|--------|--------|-------------|
| **S1-A** | ✅ Complete | Production parity — `main` (including full I5 stack) deployed to https://www.deliverx.dev |
| **S1-B** | ✅ PR [#67](https://github.com/gnaneshwer23/deliverx/pull/67) | `@vercel/analytics`, `@vercel/speed-insights`, `vercel-observability.tsx`, [PREVIEW_ENV_PARITY.md](./PREVIEW_ENV_PARITY.md) |
| **S1-C** | ✅ This branch | `phaseIHealth.ts` — smoke checks for I5-A/B/C/D, loop propagation, S1-B wiring |
| **S1-D** | ✅ This branch | `BUILD_REPORT.md`, `COLLABORATIVE_LOOP_STATUS.md` |

---

## Stakeholder matrix & dashboard IA

Seven personas (Founder, PM, BA, Product, Engineer, QA, Scrum) map to mission control routes, onboarding paths, and artifact review scopes.

| Persona | Route | IA summary |
|---------|-------|------------|
| Founder | `/workspace/founder` | Board-memo — funding, portfolio, decisions, intelligence feed |
| PM | `/workspace/pm-mission` | Control room — governance tabs, AI inbox, milestones, capacity |
| BA | `/workspace/ba` | Requirements hub — traceability, stakeholders, guided tasks |
| Product | `/workspace/product` | Discovery — roadmap, RICE, vision |
| Engineer | `/workspace/engineer` | Engineering — architecture, dependencies, PRs |
| QA | `/workspace/qa` | Quality gate — release readiness, defects, test cases |
| Scrum | `/workspace/scrum-mission` | Sprint ops — health, impediments, velocity, standup |
| Command Centre | `/workspace/dashboard` | Org hub — alerts, project health, pending decisions |

→ **[docs/DASHBOARD_IA.md](./DASHBOARD_IA.md)** · **[docs/I4_STAKEHOLDER_MATRIX.md](./I4_STAKEHOLDER_MATRIX.md)**

---

## Health & observability

| Check | Module | Route |
|-------|--------|-------|
| Phase H — collaborative loop spine | `phaseHHealth.ts` | `GET /api/setup/phase-h-health` |
| Phase I — I5 + loop + observability | `phaseIHealth.ts` | `GET /api/setup/phase-i-health` |
| Setup audit observability | `observability.ts` | Settings → Setup audit |
| Vercel Analytics / Speed Insights | `vercel-observability.tsx` | Root layout (production or `NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS=true`) |

---

## Next horizon / deferred

Tracked after R1–R10, K1–K5, and P-PM/P-Founder series.

| Item | Horizon | Notes |
|------|---------|-------|
| **K4 rollout** — Inline edit on remaining personas | H3 | Pattern in PM + Founder; extend to BA/Product/Engineer/QA/Scrum |
| **Sprint points schema** | H4 | Burndown uses task counts today; dedicated sprint_points column deferred |
| Server-side dashboard prefs + inline edits | H4 | localStorage today (`dashboard-prefs.ts`, `dashboard-inline-edit.ts`) |
| Preview env var sync | S1-B / R11 follow-up | **5 vars still Production-only** — see below |
| Document intelligence (PDF/PPT) | Backlog | `.txt/.md/.csv` only today |
| Outbound report email | Backlog | Draft → publish pipeline exists; no Resend send |
| Day-in-the-life automated narrative | Backlog | Section 6 explainer not one simulation |
| Optional demo seed removal | H2+ | `seedNarrativeThreadDemoData` still runs on bootstrap |
| Full email invite form on PM dashboard | Backlog | Links to `/onboarding/invite` today |
| Neo4j knowledge graph sync | Backlog | Postgres graph engine today (`projectKnowledgeGraphEngine.ts`) |

### Preview env status (2026-06-22)

Audited via `vercel env ls`. **Preview has 1 var** (`open_api_key`); **Production has 7**. Still missing on Preview (copy Production values in [Vercel dashboard](https://vercel.com/dashboard) — secret values not committed here):

1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `SUPABASE_SERVICE_ROLE_KEY`
4. `NEXT_PUBLIC_APP_URL` (use preview URL or stable preview domain)
5. `MINIMAX_MODEL` (optional legacy — omit if using OpenAI only)
6. `CRON_SECRET` (optional unless testing cron on preview)

See [PREVIEW_ENV_PARITY.md](./PREVIEW_ENV_PARITY.md) for the full checklist.

---

## Related docs

- [DASHBOARD_IA.md](./DASHBOARD_IA.md) — seven persona layouts (acceptance §11)
- [ARCHITECTURE_AUDIT.md](./ARCHITECTURE_AUDIT.md) — loop coverage vs flowchart
- [COLLABORATIVE_LOOP_STATUS.md](./COLLABORATIVE_LOOP_STATUS.md) — built vs spec matrix
- [SETUP_AUDIT.md](./SETUP_AUDIT.md) — production AI/auth diagnostics
- [PREVIEW_ENV_PARITY.md](./PREVIEW_ENV_PARITY.md) — Vercel Preview env checklist
- [API_KEYS.md](./API_KEYS.md) — environment variables
