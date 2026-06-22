# Dashboard information architecture

**Last updated:** 2026-06-22 (R11 — post R1–R10)  
**Production:** https://www.deliverx.dev  
**Routes:** see [I4 stakeholder matrix](./I4_STAKEHOLDER_MATRIX.md) for onboarding paths and DB role mapping.

Seven persona mission dashboards plus Command Centre. Panel defaults from `src/config/dashboard-essential-panels.ts`; customize via collapse/hide prefs (`dashboard-prefs.ts`, localStorage).

---

## Persona layouts (acceptance §11 summary)

| Persona | Route | IA (one line) |
|---------|-------|---------------|
| **Founder** | `/workspace/founder` | Board-memo control surface — funding, portfolio, decisions, intelligence feed, delivery health; day-one vs steady-state modes (P-Founder-0–3). |
| **PM** | `/workspace/pm-mission` | Delivery control room — needs-attention strip, merged governance tabs, AI review inbox, milestones, team capacity; day-one vs steady-state dual mode (P-PM-0–4). |
| **BA** | `/workspace/ba` | Requirements hub — guided tasks, stakeholders, traceability, collaborative loop; welcome bridge on day one (K5). |
| **Product** | `/workspace/product` | Product discovery — roadmap, RICE, vision, guided tasks; real feature/adoption KPIs when project data exists (R9). |
| **Engineer** | `/workspace/engineer` | Engineering workspace — traceability, architecture, dependencies, pull requests; live PR/dependency signals (R9). |
| **QA** | `/workspace/qa` | Quality gate — release readiness, defects, test cases, traceability; honest UAT/release KPIs (R8–R10). |
| **Scrum** | `/workspace/scrum-mission` | Sprint ops — sprint health, impediments, velocity, standup; live burndown when sprint data exists (R8). |

## Command Centre

| Surface | Route | IA (one line) |
|---------|-------|---------------|
| **Command Centre** | `/workspace/dashboard` | Org hub — alert queue, project health, active tasks, pending decisions, recent projects; honest KPI strip and next-up strip (R2). |

---

## Shared chrome

- **MissionPersonaHeader** — persona identity, project chip, mode badges (PM/Founder).
- **NextUpStrip** — role-aware “do this next” links (K1/K3).
- **CollaborativePanelsGrid** — stakeholder loop, team needs, pulse (Phase H).
- **DashboardPanelShell** — collapse/hide customization (I5-B/K2).
- **LiveDataPromptBanner** — honest mock→live CTAs when project context missing (I4-F, R2+).

---

## Related docs

- [BUILD_REPORT.md](./BUILD_REPORT.md) — sprint history R1–R10, P-PM, P-Founder
- [I4_STAKEHOLDER_MATRIX.md](./I4_STAKEHOLDER_MATRIX.md) — routes, onboarding, artifact review scopes
- [COLLABORATIVE_LOOP_STATUS.md](./COLLABORATIVE_LOOP_STATUS.md) — loop built vs spec
