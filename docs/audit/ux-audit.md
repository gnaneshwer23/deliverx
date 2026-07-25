# DeliverX UI/UX Audit — Phase 4 Summary

**Auditor role:** UX Reviewer + Accessibility Engineer  
**Date:** 2026-07-25  
**Method:** Read-only static review of `src/` against Build Charter, Current Scope, UX architecture (`docs/architecture/06`), and DeliverX UI principles. Production (`https://www.deliverx.dev`) inspected via HTML fetch for unauthenticated surfaces. Authenticated app surfaces reviewed from source only (credentials not available — see Phase 8).  
**Scope:** Shipped candidate loop + marketing + Professional Workspace modules + Launchpad + Portfolio. Legacy Mission Control routes noted where still reachable.

**Companion docs:** [`screen-by-screen-review.md`](./screen-by-screen-review.md) · [`design-consistency-report.md`](./design-consistency-report.md) · [`accessibility-audit.md`](./accessibility-audit.md) · [`responsive-audit.md`](./responsive-audit.md)

---

## Executive verdict

DeliverX’s **Professional Intelligence loop** (Profile → Evidence → Experience → Learning → Launchpad → Outcomes → Portfolio) is conceptually coherent and usually calm. Marketing positioning is largely aligned with Experience / Launchpad / Professional Workspace.

The product does **not yet feel fully coherent for serious professional use** because:

1. Internal engine jargon (**ScoreRun**, readiness %, source mix labels) is user-facing.
2. Marketing and auth surfaces still show **decorative / unexplained percentages** and illustrative dashboards that read as live data.
3. **Multiple shells and navigations** coexist (Hub, Profile chrome, Experience app shell, Launchpad sidebar, AppShell Professional Workspace, leftover dark `WorkspaceSidebar`, Mission Control routes).
4. Legal and payment honesty are unfinished (placeholder Privacy/Terms; open access with Stripe TODOs).
5. Workspace home still points users at **legacy Command Centre** while T7 demoted that IA.

Overall tone: more credible than a generic AI chat product, still uneven — part evidence OS, part unfinished delivery suite, part marketing mock.

---

## Findings by severity

### P0 — Trust / honesty (pilot-blocking if a serious buyer hits them)

| ID | Finding | Paths |
| --- | --- | --- |
| P0-1 | **Privacy Policy and Terms are placeholders** while footer / compliance claims imply a finished legal posture. | `src/app/(marketing)/privacy/page.tsx`, `src/app/(marketing)/terms/page.tsx` |
| P0-2 | **Unexplained percentage scores** on marketing and auth (e.g. MediFlow **72%**, auth panel **40% / 3x / 97%**) without methodology — violates “no unexplained scores”. | `src/components/marketing/home/home-sections.tsx`, `src/components/marketing/home/home-hero.tsx`, `src/components/marketing/xperience-hero.tsx`, `src/components/dx/dx-page-chrome.tsx` (`AuthBrandPanel`) |
| P0-3 | **ScoreRun** exposed as primary user CTA/label across Profile, Evidence, Hub, Launchpad — reads as engineering API, not professional language. | `src/components/pi/profile-centre.tsx`, `src/components/pi/evidence-capability-app.tsx`, `src/app/hub/page.tsx`, `src/components/launchpad/career-intelligence-app.tsx` |
| P0-4 | Start pages state **payment entitlement can be added later — access is open** while pricing CTAs sell £500 / £250 / £800. Misleading commercial CTA. | `src/app/start/experience/page.tsx`, `src/app/start/launchpad/page.tsx` (+ Stripe TODOs) |

### P1 — Coherence / navigation / unfinished product

| ID | Finding | Paths |
| --- | --- | --- |
| P1-1 | **Duplicated / competing navigation models**: AppShell Professional Workspace vs dark `WorkspaceSidebar` vs Experience in-app tools vs Launchpad module nav vs Hub journey cards. Continuity principle from UX architecture is not met. | `src/components/dx/app-shell.tsx`, `src/components/workspace/sidebar.tsx`, `src/components/xperience/product-app.tsx`, `src/components/launchpad/career-intelligence-app.tsx`, `src/app/hub/page.tsx` |
| P1-2 | Workspace home still tells users **legacy mission control remains available under Command Centre** — undermines T7 demotion. | `src/app/workspace/page.tsx` |
| P1-3 | Launchpad nav lists **non-MVP modules with a “later” badge** (dead-end feel if routes stub). | `src/lib/career-intelligence/types.ts` (`mvp: false`), `src/components/launchpad/career-intelligence-app.tsx` |
| P1-4 | PI review queue offers **“Seed sample finding”** — demo/fixture affordance in a trust-sensitive review surface. | `src/components/pi-review/review-queue-app.tsx` |
| P1-5 | Product naming still splits **Launchpad** (SKU) vs **Career Intelligence** (app chrome) vs Hub CTA “Open Career Intelligence”. | `src/app/hub/page.tsx`, `src/components/launchpad/career-intelligence-app.tsx` |
| P1-6 | Root metadata still frames DeliverX as **“AI Delivery Platform”** while marketing is **Career Intelligence** — first tab-title impression is wrong. | `src/app/layout.tsx` vs marketing home |

### P2 — Clarity, density, polish

| ID | Finding | Paths |
| --- | --- | --- |
| P2-1 | Workspace home exposes raw **Autonomy policy: auto-submit false · …** — developer config, not human guidance. | `src/app/workspace/page.tsx` |
| P2-2 | Ultra-small mono labels (`text-[7px]`–`text-[9px]`) on nav section labels, buttons, auth footers — hard to read; feels dense/engineering. | `src/lib/dx-theme.ts`, `src/components/dx/app-nav.tsx` |
| P2-3 | Marketing **Performance Review ★★★★ / Stars earned** language edges into gamification. | `src/components/marketing/home/home-sections.tsx` (timeline / Career Twin narrative) |
| P2-4 | Org onboarding copy still references **Brief v2** templates — internal phase jargon. | `src/app/onboarding/organisation/page.tsx`, `src/app/onboarding/organisation/organisation-form.tsx`, `src/app/onboarding/role/page.tsx` |
| P2-5 | Settings Phase B–H health panels still exist as **“Phase X”** UI copy (components present even if lightly wired). | `src/components/settings/phase-*-health-panel.tsx` |
| P2-6 | Unnecessary enterprise dashboards still ship as routes (Digital Twin, PMO, Marketplace) — high density, charter-demoted, easy to confuse with core loop. | `src/app/workspace/twin/page.tsx`, `src/app/workspace/pmo/page.tsx`, `src/app/workspace/marketplace/page.tsx` |

### P3 — Minor / polish

| ID | Finding | Paths |
| --- | --- | --- |
| P3-1 | Folder/route names keep **xperience** (`(xperience)`, `product=xperience`) while UI says Experience — fine for code, confusing in URLs/query params. | `src/app/(xperience)/…`, `src/lib/marketing/product-intent.ts` |
| P3-2 | User menu avatar button lacks accessible **name** beyond expanded state (icon-only). | `src/components/dx/user-menu.tsx` |
| P3-3 | Login error banners lack `role="alert"` / live region (see a11y audit). | `src/app/(auth)/login/login-form.tsx` |
| P3-4 | Marketing purple product accents conflict with “calm green” system. | `src/lib/marketing/landing-theme.ts`, `src/components/marketing/home/home-sections.tsx` |

---

## Explicit inventory (requested)

### Pages that feel unfinished

- Privacy / Terms placeholders — `(marketing)/privacy/page.tsx`, `(marketing)/terms/page.tsx`
- Start Experience / Launchpad payment honesty — `start/experience/page.tsx`, `start/launchpad/page.tsx`
- Launchpad non-MVP modules labelled “later” — `career-intelligence-app.tsx` + `CAREER_MODULES`
- Founder / mission panels with “Sample decisions — connect governance…” — `founder-decision-centre.tsx`, `founder-steady-state-panels.tsx`
- PI review “Seed sample finding” — `review-queue-app.tsx`

### Duplicated navigation

- Marketing nav + Hub journey + Profile action chips + Experience tool rail + Launchpad aside + AppShell sidebar (+ optional legacy Mission Control sections)
- Two workspace sidebars in codebase: light AppShell (`app-shell.tsx`) and dark legacy (`workspace/sidebar.tsx`)

### Inconsistent terminology

| User sees | Also sees | Preferred (charter) |
| --- | --- | --- |
| Experience | URL/query `xperience` | Experience |
| Professional Workspace | signup `product=team-copilot`; retired `/team-copilot` redirect | Professional Workspace (Team Copilot = alias only) |
| Launchpad | Career Intelligence (app title / Hub CTA) | Pick one primary label; Launchpad = product, Career Intelligence = capability inside it — but Hub currently equates CTA to Career Intelligence |
| ScoreRun | everywhere as button/heading | Hide engine name; use “Update capability view” / “Project readiness from evidence” |
| Command Centre / Mission Control | demoted but still referenced | Do not surface unless legacy flag on |

### Dead-end / weak next-step screens

- Non-MVP Launchpad modules (`companies`, `networking`, `hiring_managers`, `events`, `promotion`)
- Bookmarkable demoted routes (Marketplace, Twin, PMO, Mission Controls) if legacy flag off — reachable by URL, not explained as out of primary IA
- Auth brand panel stats with no “illustrative” label

### Buttons / CTAs that mislead or are demo-only

- Pricing / “Get started” vs open entitlement copy on start pages
- “Seed sample finding” (`review-queue-app.tsx`)
- “Run ScoreRun” as primary professional action (jargon CTA)
- Marketing “Explore Professional Workspace” → may imply full enterprise OS depth that charter demoted

### Cards with no purpose / fake data

- Home mock panels: MediFlow 72%, artefact status theatre — `home-sections.tsx`
- AuthBrandPanel KPI grid — `dx-page-chrome.tsx`
- Hero 72% chips — `home-hero.tsx`, `xperience-hero.tsx`

### Unnecessary dashboards

- Digital Twin, PMO Dashboard, Marketplace, multiple Mission Controls, Command Centre — still implemented; demoted from default nav but still product surface area

### Confusing labels / generic AI copy

- Workspace autonomy boolean string dump
- “AI watching everything” on auth panel (`AuthBrandPanel`) — surveillance tone, not evidence-driven calm
- Root title “AI Delivery Platform”

### Gradients / animation / emoji / noise

- No emoji characters found in `src` JSX (good).
- Marketing section gradients and card gradients present (`marketing-layout.tsx`, `mkt-card-gradient`); within marketing tolerance but busy vs app calm.
- Gamification-adjacent star language on marketing timeline.
- Reduced-motion respected in some marketing components (`marketing-reveal.tsx`) — positive.

### Internal jargon leaking to UI

- ScoreRun, Brief v2, Phase B–H health, “source score_run / mixed / heuristic”, readiness %, `deliverxVerified` engineering names in places, Snapshot UUID prefixes in Launchpad readiness card

---

## Does it feel professional, calm, credible, coherent, human, evidence-driven?

| Criterion | Rating | Note |
| --- | --- | --- |
| Professional | Partial | PI surfaces yes; marketing mock % and auth KPIs undermine |
| Calm | Partial | PI/Workspace modules mostly calm; marketing + mission control denser |
| Credible | At risk | Legal placeholders + open paywall + unexplained % |
| Coherent | Weak | Multi-shell IA; Launchpad vs Career Intelligence; ScoreRun |
| Human | Partial | Profile/Hub “what next” is human; autonomy policy / ScoreRun not |
| Evidence-driven | Strong in PI loop | Honesty copy is often good; naming of ScoreRun fights the message |
| Serious professional use | Not yet | Suitable for guided pilot with founder; not for cold enterprise buyer without P0 fixes |

---

## Recommended next UX slice (smallest)

1. Replace ScoreRun user strings with capability-projection language; keep engine name in admin/dev only.  
2. Label or remove decorative percentages on marketing/auth.  
3. Finish Privacy/Terms or remove compliance overclaim.  
4. Align Hub / Launchpad naming; hide non-MVP Launchpad modules.  
5. Remove Workspace home pointer to Command Centre; hide demoted routes behind feature flag more firmly.

---

## Method notes / BLOCKED

- **Browser MCP** could not create a usable automation tab in this session; production checks used `WebFetch` / `curl` HTML.  
- **Authenticated screens** (`/profile`, `/workspace`, `/hub`, `/experience/app`, etc.) — **BLOCKED** for live interaction (no credentials). Judged from source + known redirects to `/login`.
