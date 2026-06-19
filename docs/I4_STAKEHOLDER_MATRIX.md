# I4 stakeholder matrix

**Last updated:** 2026-06-18 (Sprint I4-F)  
**Source of truth:** `src/config/persona-onboarding.ts`, `src/lib/mission-nav.ts`, `src/lib/approval/persona-reviews.ts`

Seven marketing/onboarding personas map to database roles and mission-control dashboards.

| Stakeholder | DB role | Marketing ID | Mission control route | Post-onboarding landing | Onboarding path |
|-------------|---------|--------------|----------------------|-------------------------|-----------------|
| **Sponsor / Founder** | `executive` | `sponsor` | `/workspace/founder` | `/workspace/founder` | Sponsor gateway: `/onboarding/organisation` → `/onboarding/role` → `/project/new` (business case + AI review) → `/onboarding/team` → `/onboarding/complete` |
| **Delivery PM** | `pm` | `pm` | `/workspace/pm-mission` | `/workspace/pm-mission` | Persona wizard: `/onboarding/persona` (OB_CONFIG `pm`) → `/onboarding/complete` |
| **Business Analyst** | `ba` | `ba` | `/workspace/ba` | `/workspace/ba` | Persona wizard: `/onboarding/persona` (OB_CONFIG `ba`) → `/onboarding/complete` |
| **Product Owner** | `product_manager` | `po` | `/workspace/product` | `/workspace/product` | Persona wizard: `/onboarding/persona` (OB_CONFIG `po`) → `/onboarding/complete` |
| **Engineer** | `engineer` | `eng` | `/workspace/engineer` | `/workspace/engineer` | Persona wizard: `/onboarding/persona` (OB_CONFIG `eng`) → `/onboarding/complete` |
| **QA** | `qa` | `qa` | `/workspace/qa` | `/workspace/qa` | Persona wizard: `/onboarding/persona` (OB_CONFIG `qa`) → `/onboarding/complete` |
| **Scrum Master** | `scrum_master` | `sm` | `/workspace/scrum-mission` | `/workspace/scrum-mission` | Persona wizard: `/onboarding/persona` (OB_CONFIG `sm`) → `/onboarding/complete` |

## Command Centre vs mission control

- **Command Centre** (`/workspace/dashboard`) — shared org hub; role-aware copy and widgets; `team_member` and explicit nav still use it.
- **Mission control** — persona-primary dashboard (see table); post-login/onboarding landing for all seven personas (K1); surfaced first in sidebar via `partitionCoreNav()` in `src/lib/mission-nav.ts`.

## AI output review & responses audit

| Route | Label | Access |
|-------|-------|--------|
| `/workspace/proposals` | AI output review | All org members (RLS). Persona tabs filter artifact reviews by entity type (`PERSONA_ARTIFACT_ENTITY_TYPES`). |
| `/workspace/audit` | Responses audit | All org members (RLS). Immutable org audit trail; optional `?project=` filter. |

Per-persona artifact review scopes (pending reviews on mission dashboards):

| Persona | Entity types reviewed |
|---------|----------------------|
| Founder | `report`, `decision`, `customer_insight`, `structure_bundle`, `change_request` |
| BA | `requirement`, `user_story`, `customer_insight`, `decision` |
| Product | `product_feature`, `customer_insight`, `decision` |
| PM | `structure_bundle`, `task`, `raid_item`, `change_request`, `decision`, `estimation`, `report` |
| Engineer | `task`, `estimation`, `structure_bundle` |
| Scrum | `user_story`, `task`, `raid_item` |
| QA | `requirement`, `user_story`, `task`, `raid_item` |

## Mock-data fallback banners (I4-F)

Mission dashboards show `LiveDataPromptBanner` (via `MissionBootstrapBanner`) when panels use illustrative defaults until live project context exists. `BootstrapParityBanner` takes priority when bootstrap summary exists.

| Dashboard | `dataSources` key | Trigger | Live CTAs |
|-----------|-------------------|---------|-----------|
| Founder | `financials` | No pitch/business-case financials in context | Upload pitch deck · Start business case |
| PM | `deliveryPlan` | Default milestone phases and/or budget | Open delivery plan · Import charter · Review AI outputs |
| Product | `roadmapRice` | No `product_features` rows for project | Add features · Run product analysis |
| Engineer | `architecture` | No architecture notes in delivery plan | Upload architecture doc · Open engineering workspace |
| Scrum | `velocity` | No velocity history in delivery plan | Open scrum workspace · Import sprint data |
| QA | `qaMetrics` | No QA metrics in database | Review defects · Review test artifacts |

CTA config: `src/lib/live-data-prompt-ctas.ts`
