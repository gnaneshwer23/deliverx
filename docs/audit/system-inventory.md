# Phase 1 — System inventory

**Audit date:** 2026-07-25T21:55Z  
**HEAD:** `c31146a` (at audit start; concurrent agents may advance docs)  
**Prod:** https://www.deliverx.dev · Supabase `jibmyxaldetyycmtlxet` · migrations head `0094`  
**Method:** Read-only filesystem + migration inventory + Supabase `list_tables` / security advisors + live HTTP + Vitest release gate + live T6 signed-in harness  
**Constraint:** No writes to `src/`, `supabase/`, or product config

---

## Verdict (one line)

Pilot PI loop (P0–P7 + T1–T5 hardening) is **real and live-verified**; marketing/commercial packaging **overclaims**; Launchpad modules beyond readiness are **thin**; pre-pivot Workspace OS is **large and unevenly used**; T9/Stripe **not started (chartered block)**.

---

## Counts (measured)

| Asset | Count | Notes |
| --- | --- | --- |
| App Router pages (`page.tsx`) | **129** | Marketing + auth + PI + Launchpad + Workspace + Project OS |
| API route handlers (`route.ts`) | **205** | ~35 PI/career/portfolio/org; rest mostly pre-pivot delivery OS |
| Server actions (`actions.ts`) | **25** | Auth, onboarding, project, workspace |
| SQL migrations | **94** | `0001`–`0094`; PI pivot `0066`–`0094` |
| `create table` statements (all migrations) | **~166** | Includes legacy delivery + PI |
| Prod public tables (MCP list) | **~140+** | RLS on; person PI tables empty after T6 purge |
| `src/lib/*` top-level modules | **~120+** files/dirs | PI domains + legacy persona KPIs |
| `src/services/*` | **100+** | Heavy pre-pivot engines |
| AI prompt files (`src/lib/ai/prompts`) | **23** | Delivery OS prompts |
| T4 AI agents (registry) | **6** | line_manager, stakeholder, observer, experience_coach, workspace_coach, interview_lab |
| Test files (excl. `imports/`) | **201** | Vitest + Playwright specs |
| Full `npm test` (this audit) | **941 passed / 25 skipped** | Confirms “900+” claim |
| Release gate (non-live) | **PASS** | 242 PI units + unauth + security always-on |
| Live T6 (`T6_BASE_URL=https://www.deliverx.dev`) | **26/26 PASS** | 18 signed-in loop + 8 security (3 always-on + 5 live) |

---

## Frameworks & runtime

| Layer | Technology | Status |
| --- | --- | --- |
| Web | Next.js **16.2.x** App Router, React 19 | Working |
| UI | Tailwind 3.x, Base UI / shadcn, Framer Motion, Lucide | Working |
| Backend | Next Route Handlers + Server Actions (modular monolith) | Working |
| DB / Auth | Supabase Postgres + Auth + RLS + SSR cookies | Working |
| AI | OpenAI primary; Anthropic optional; T4 orchestration registry | Working (guardrailed); model spend not re-audited here |
| Hosting | Vercel (`vercel.json` crons) | Working |
| Analytics | `@vercel/analytics` + Speed Insights (`src/components/vercel-observability.tsx`) | Present; custom events minimal |
| Testing | Vitest 3, Playwright (manual CI), T6 release-gate script | Working locally; **CI workflows disabled** (TD-018) |
| Background jobs | Vercel crons → `/api/twin/snapshot`, `/api/cron/loops`, `/api/cron/notifications` | Configured; twin/coordination tables have historical rows |

---

## Architecture (as shipped)

```text
Marketing / Auth
       │
       ▼
   Hub / Profile / PI surfaces ──► Evidence Ledger ──► Capability Engine ──► SnapshotClaims
       │                              ▲                      │
 Experience planner/sim ──────────────┘                      ├── Profile / Career / Portfolio
 Workspace contributions + consent observation ──────────────┘
 Launchpad reads SnapshotClaims (+ labelled heuristic fallback)
 Pre-pivot Project/Workspace OS ── parallel; must not write capability
```

**Authoritative SoT for capability:** Capability Engine persist only (`src/lib/capability-engine`).  
**Long-term `docs/architecture/00`–`07`:** vision only — not approved build scope unless in Build Charter.

---

## Auth & authorization

| Concern | Implementation | Working? | Risk |
| --- | --- | --- | --- |
| Signup / signin | Email+password via Supabase (`signup-form`, `login/actions`) | Yes | — |
| Password reset | `/login/forgot`, `/login/reset` | Yes (code) | Email delivery depends on Supabase SMTP |
| Email verify | `/verify` + auth callback | Present | Not re-proven in T6 (admin confirms users) |
| Social OAuth | Callback handles OAuth errors; **no Google/GitHub sign-in UI** found | **Not started / unused** | Marketing silence OK |
| Session | `@supabase/ssr` cookies; layouts redirect | Yes | TD-003: edge proxy path-guards weak; pages own redirects |
| Protected routes | Layout/page `redirect(/login?next=)` + API 401 | Yes (live unauth gate) | — |
| PI gate | `DELIVERX_PI_ALLOWLIST` / `SURFACES` / `GATE` | Env-gated | Empty allowlist = open |
| Org RBAC | Workspace membership + T7 department/team helpers | Partial | Advisor WARN on intentional SECURITY DEFINER helpers |
| Account delete / export | T1 `/api/pi/privacy/*` + settings UX | **Verified live** (T6 steps 17–18) | — |
| Rate limiting | Org/platform AI rate tables; **no auth brute-force rate limit in app** | Partial | TD-006 leaked-password still WARN |

---

## Storage

| Kind | Mechanism | Used? |
| --- | --- | --- |
| Primary state | Postgres (Supabase) | Yes |
| Files | Brain documents / meeting audio paths exist | Sparse (0 `brain_documents` / meetings in prod) |
| Object storage | Not a first-class PI path | N/A for pilot loop |

---

## AI integrations

| Surface | Path | Notes |
| --- | --- | --- |
| T4 orchestration | `src/lib/ai-orchestration/*`, tables `ai_*` | Catalogue seeded (6 agents / 6 prompts); person interactions 0 after purge |
| Delivery OS AI | `/api/ai/*`, `/api/project/[id]/*-assistant` | Large; outside PI SoT |
| Experience coaches | experience_coach / workspace_coach agents | Guardrails unit-tested |
| Interview lab agent | `interview_lab` | Registry present; Launchpad depth thin |
| Kill / bypass | `DELIVERX_AI_ORCHESTRATION_BYPASS` | Ops only |

---

## Background jobs & notifications

| Job | Schedule | Table signals |
| --- | --- | --- |
| Twin snapshot | daily 06:00 | `twin_snapshots` 554 rows (legacy activity) |
| Collaborative loops | daily 07:00 | `coordination_runs` 531 |
| Notifications cron | daily 08:00 | `pi_notifications` person inbox (T5) |

Person PI notifications: implemented; empty at rest after T6 purge.

---

## Analytics events

| Event | Source | Required? |
| --- | --- | --- |
| `role_chip_click` | `src/lib/marketing/analytics.ts` | Marketing only |
| Vercel page analytics | Auto | Ops |
| Product funnel / evidence-loop events | **Not productized** | Gap vs Product Bible analytics chapter |

---

## Feature flags / gates

| Flag | Purpose |
| --- | --- |
| `DELIVERX_PI_GATE` / `ALLOWLIST` / `SURFACES` | Pilot access control |
| `DELIVERX_RUBRIC_REQUIRE_DB` / `ALLOW_IN_CODE_FALLBACK` | Rubric honesty |
| `DELIVERX_VERIFIED_BADGE` | Kill switch for Verified |
| `DELIVERX_LEGACY_WORKSPACE_NAV` / `NEXT_PUBLIC_…` | Restore pre-T7 nav |
| `DELIVERX_AI_ORCHESTRATION_BYPASS` | Test bypass |
| `NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS` | Preview analytics |

No progressive feature-flag framework (TD-008).

---

## Env vars (documented)

From `.env.example`: `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`, `INVITE_JWT_SECRET`, `OPENAI_API_KEY`, `CRON_SECRET`, optional Recall/Resend/Anthropic/Minimax.  
T6 live harness also needs app URL (`T6_BASE_URL`) — used this audit against prod.

---

## Seed data (prod)

| Seed | Rows |
| --- | --- |
| `experience_scenarios` | 16 |
| Distinct companies (catalogue) | 12 (per docs; scenarios confirm multi-company) |
| `pi_cf_*` framework `pm-core@2026.1` | 1 framework, 3 competencies, 15 assessment content |
| `ai_agents` / `ai_prompt_versions` | 6 / 6 |
| Person PI (evidence, ScoreRuns, learning, outcomes, attestations) | **0** at audit (post-T6 purge) |
| Legacy delivery demo | orgs 18, projects 17, requirements 14, etc. |

---

## Monitoring & deploy

| Item | Status |
| --- | --- |
| Vercel production | Live 200 on `/` |
| GitHub Actions `verify.yml` / `ci-e2e.yml` | **Disabled** (TD-018 Actions minutes) |
| Supabase advisors | Leaked-password WARN (TD-006); search_path WARNs on some functions; intentional authenticated SECURITY DEFINER helpers |

---

## Integrations

| Integration | Status |
| --- | --- |
| GitHub (project tasks) | Code present; 0 `project_integrations` |
| Recall.ai meetings | Optional env; unused in prod data |
| Resend email | Optional |
| Stripe / payments | **Not started** (T9 blocked) |
| Employer marketplace | Deferred / empty tables |

---

## Documentation gaps recorded

| Expected doc | Status |
| --- | --- |
| `docs/product/{build-charter,current-scope,product-decisions}.md` | Present |
| `docs/architecture/00`–`07` | Present (vision; not build authority) |
| `docs/engineering/{system-architecture,data-model,api-contracts,testing-strategy,technical-debt-register,implementation-log,technology-build-phases}.md` | Present |
| `docs/qa/*` | Present (T0/T6 evidence) |
| Full Mermaid ER | **Gap** (TD-013) — compact sketch only |
| Cookie / privacy consent UX page | **Missing** (`/cookie` `/cookies` → 404) |
| Product analytics event catalogue in code | Thin vs `docs/14-analytics-and-product-metrics.md` |

---

## Concurrent audit artefacts (do not overwrite)

Other agents already wrote under `docs/audit/`: `ux-audit.md`, `screen-by-screen-review.md`, `design-consistency-report.md`, `data-integrity-audit.md`, `database-risk-register.md`, `ai-quality-audit.md`. This Phase 1–3/11 set is additive.
