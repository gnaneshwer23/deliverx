# Workspace UI parity with Experience & Launchpad

**Status:** Shipped (2026-07-26)  
**Scope:** Visual / IA chrome alignment only — not Team Copilot Dashboard 5 / mission-control depth.

## Gap audit (before)

| Area | Experience / Launchpad | Workspace (before) |
| --- | --- | --- |
| Local nav | Vertical side rail (`.xp-workspace-rail` / `.lp-nav`) | Horizontal pill wrap or none |
| Surface | Warm cream + soft radial atmosphere | Generic `--dx-page` + Tailwind utilities |
| Typography | Large clamp headings, tight tracking, accent eyebrow | Mixed `DxPageHeader` / `PageHeader` / display font |
| Cards | Soft border panels, 12–16px radius | Mixed dx cards, slate shadows, teal accents on Projects |
| Context | Day card / readiness pill / right rail | Inconsistent; Team used mission-control header |
| Nested pages | Same product CSS root | Legacy `DxPageHeader`, `OrgListPage`, Lucide `PageHeader` |
| Honesty | Labelled signals | Mostly honest; some stat strips felt like health dashboards |

## Approach

Reuse product-app patterns (do not fork a third design system):

- New scoped CSS: `src/components/professional-workspace/workspace-app.css` (`.pw-root`, tokens aligned to Experience green ink/surface)
- Shared chrome: `WorkspaceProductFrame` + `WorkspaceProductShell` (side rail + main + optional context aside)
- `WorkspacePageHeader` (eyebrow / H1 / lead / actions / context card)

## Gaps closed

- `/workspace` home on product shell + rail + context aside
- Module chrome (`ProfessionalModuleChrome`) uses the same frame
- Key nested routes: team, tasks, projects, search, meetings, documents (via `OrgListPage`)
- Replaced legacy page headers on those surfaces with product headers
- Counts labelled as activity volume — not programme health

## Remaining legacy (intentionally deferred)

Pages that still use `DxPageHeader` / demoted mission-control chrome (opt-in deep surfaces, not primary product path):

- `/workspace/governance`, `/workspace/capacity`, `/workspace/benefits`, `/workspace/reports`, `/workspace/alerts`, `/workspace/audit`, `/workspace/intelligence`, `/workspace/proposals`, `/workspace/playbooks`
- Persona workspaces (`/workspace/ba`, `/workspace/engineer`, …) and demoted routes (`/workspace/pmo`, `/workspace/twin`, …)
- Project-scoped routes under `/project/[id]/*` (separate delivery chrome)

These stay until a follow-up slice; they are not the Professional Workspace home path.

## Honesty constraints preserved

- No fake programme health %
- No decorative pulse / readiness scores on Workspace home
- Team Copilot language remains alias-only (not a third SKU)
- Observation consent default OFF messaging retained
