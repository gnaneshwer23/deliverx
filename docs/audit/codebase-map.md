# Phase 1 — Codebase map (audit)

**Date:** 2026-07-25 · Complements `docs/engineering/codebase-map.md` with audit status.

---

## Top-level layout

| Path | Purpose | Audit note |
| --- | --- | --- |
| `src/app/` | Next.js routes, layouts, API, actions | 129 pages / 205 APIs — dual product eras |
| `src/lib/` | Domain logic (PI + legacy) | Prefer PI modules for charter work |
| `src/components/` | UI (marketing, pi, launchpad, workspace, personas) | Marketing aspirational vs PI calm |
| `src/config/` | Nav, persona dashboards, workspace policy | T7 legacy nav opt-in |
| `src/services/` | Pre-pivot engines (delivery, twin, marketplace…) | Do not treat as PI SoT |
| `src/hooks/` | Client hooks | Minor |
| `supabase/migrations/` | Schema SoT | Head `0094` |
| `e2e/` | T6/T0 harness + Playwright smoke/acceptance | Live loop verified this audit |
| `scripts/release-gate.mjs` | Composite CI gate | PASS |
| `docs/` | Product Bible `00`–`15` + engineering + this audit | Concurrent edits ongoing |

---

## PI domain libraries (charter-critical)

| Module | Purpose | Impl status | Used? | Working? | Risks | Primary files |
| --- | --- | --- | --- | --- | --- | --- |
| `evidence-ledger` | Append evidence + provenance | Complete | Yes | **Verified** (T6) | Must stay append-oriented | `src/lib/evidence-ledger/*` |
| `capability-engine` | ScoreRun persist, SnapshotClaims | Complete | Yes | **Verified** | Only write path for levels | `src/lib/capability-engine/*` |
| `pi-assessment` | Baseline / final / transfer | Complete | Yes | **Verified** | Thin rubric seed | `src/lib/pi-assessment/*` |
| `experience-planner` | Gap-driven scenario plans | Complete | Yes | **Verified** | Catalogue ≠ full sim depth | `src/lib/experience-planner/*` |
| `experience-sim` | Day-1 decision runtime | Complete | Yes | **Verified** | Not full multi-month sim | `src/lib/experience-sim/*` |
| `workspace-observation` | Consent-gated observation | Complete | Yes | **Verified** | Consent OFF default | `src/lib/workspace-observation/*` |
| `learning-intelligence` | Learning ≠ competency | Complete | Yes | **Verified** | — | `src/lib/learning-intelligence/*` |
| `real-world-outcomes` | Outcomes + calibration | Complete | Yes | **Verified** | Never auto-external | `src/lib/real-world-outcomes/*` |
| `pi-profile` | Profile aggregate | Complete | Yes | **Verified** | — | `src/lib/pi-profile/*` |
| `verified-portfolio` | Compile + share + Verified gate | Complete | Yes | **Verified** (badge off) | T8 path separate | `src/lib/verified-portfolio/*` |
| `external-attestation` | T8 attestor flow | Complete (shipped) | Low (0 rows) | **Unverified E2E this audit** | Needs dedicated journey | `src/lib/external-attestation/*` |
| `career-intelligence` | Readiness + Launchpad modules | Partial | Yes | Readiness **verified**; CV/interview thinner | `%` must stay labelled | `src/lib/career-intelligence/*` |
| `artefacts` | Immutable versions | Complete | Yes | **Verified** (T6 #16) | — | `src/lib/artefacts/*` |
| `ai-orchestration` | T4 agents/prompts/log | Complete (infra) | Low | Units pass | Bypass flag | `src/lib/ai-orchestration/*` |
| `notifications` | T5 inbox | Complete | Yes | **Verified** (T6 #15) | — | `src/lib/notifications/*` |
| `pi-privacy` | Export/delete | Complete | Yes | **Verified** | Service-role purge only | `src/lib/pi-privacy/*` |
| `pi-review` | Challenge / admin review | Partial | Low | Code present; 0 cases | Not default gate | `src/lib/pi-review/*` |
| `admin-framework` | `pi_cf_*` lifecycle | Complete (thin seed) | Yes | Yes | TD-007 thin graph | `src/lib/admin-framework/*` |
| `org-structure` | T7 depts/teams | Complete (empty) | Low | Units | 0 memberships | `src/lib/org-structure/*` |
| `access` | PI allowlist gate | Complete | Yes | Yes | Misconfig = open/closed | `src/lib/access/gate.ts` |
| `launchpad` | Auth + store helpers | Partial | Yes | App shell works | Module depth uneven | `src/lib/launchpad/*` |
| `xperience` | Legacy Experience bridge | Partial | Yes | Bridge APIs | Dual surface with PI planner | `src/lib/xperience/*` |
| `professional-workspace` | Module catalogue | Partial | Yes | Nav demoted | Mission-control depth blocked | `src/lib/professional-workspace/*` |
| `marketing` | Homepage/pricing copy | Complete (copy) | Yes | Live | **Honesty gap** TD-011 | `src/lib/marketing/*` |

---

## Pre-pivot / adjacent (large surface)

| Area | Purpose | Status | Used in prod? | Risk |
| --- | --- | --- | --- | --- |
| Project delivery OS | `/project/[id]/*`, `/api/project/*` | Partial / legacy | Sparse (demo orgs) | Confuses “shipped” with PI loop |
| Persona dashboards | founder/pm/ba/engineer/qa/scrum KPIs | Partial | Low | Fake-feeling % in marketing previews |
| Twin / global / coordination | `/api/twin/*`, `/api/global/*` | Cron-fed historical | Tables non-empty | Not PI SoT |
| Marketplace | `/api/marketplace/*` | Empty | No | Do not market as live |
| Platform v1 API keys | `/api/platform/v1/*` | Partial | No keys | — |
| Brain ingest | `/brain` | Empty | No | — |

---

## Major UI component clusters

| Cluster | Path | Role |
| --- | --- | --- |
| Marketing | `src/components/marketing/*` | Public site |
| PI | `src/components/pi/*` | Profile, assessments, evidence, inbox |
| Launchpad | `src/components/launchpad/*` | Career intelligence app |
| Workspace / personas | `src/components/{workspace,founder,pm,…}` | Delivery OS |
| DX design system | `src/components/dx/*`, `src/lib/dx-theme.ts` | In-app calm UI |
| Settings / auth forms | `src/components/settings/*`, auth forms under `src/app/(auth)` | Account |

---

## AI agents & prompts

**T4 registry agents** (`src/lib/ai-orchestration/agents.ts`):  
`line_manager`, `stakeholder`, `observer`, `experience_coach`, `workspace_coach`, `interview_lab`.

**Legacy prompts** (`src/lib/ai/prompts/*`): 23 files for delivery assistants (business case, scrum, helm, etc.) — separate from T4 trust layer.

---

## Workflows (product)

| Workflow | Entry | Engine | Status |
| --- | --- | --- | --- |
| Core evidence loop | Profile → baseline → Experience → ScoreRun → Portfolio | PI APIs | **Complete and verified** |
| Observation → intervention | Consent ON + contribution | workspace-observation | Verified; empty when gaps=0 |
| Privacy | Settings → export/delete | pi-privacy | Verified |
| External attestation | Portfolio → attest token | external-attestation | Shipped; **E2E not in T6 loop** |
| Org invite / project bootstrap | `/invite`, `/join`, `/project/new` | Legacy | Partial |
| Commercial checkout | Pricing CTAs → `/signup` | — | **Not started** (no Stripe) |

---

## Tests map

| Suite | Command | This audit |
| --- | --- | --- |
| Full unit | `npm test` | 941 pass / 25 skip |
| PI scoped | `npm run test:pi` | Included in release-gate (242) |
| Release gate | `npm run test:release-gate` | PASS |
| Live signed-in | `T6_E2E=1 T6_BASE_URL=https://www.deliverx.dev npm run test:e2e:t6` | **26 pass** |
| Playwright smoke/acceptance | `test:smoke` / `test:e2e:acceptance` | **Not re-run** (CI disabled; optional) |

---

## Dependency risks (structural)

1. **Two products in one repo** — PI pilot vs delivery OS; agents must not confuse page count with loop completeness.  
2. **Marketing copy pack** (`career-suite.ts`) lists features Launchpad does not fully deliver.  
3. **In-code rubric fallback** still exists (labelled); fail-closed via env.  
4. **CI off** — regressions can land unnoticed until minutes restored.
