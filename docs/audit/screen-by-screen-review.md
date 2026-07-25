# Screen-by-screen UX review

**Date:** 2026-07-25  
**Method:** Static review of route entrypoints + primary components. Live unauthenticated: marketing home, login (HTML). Authenticated: source only (**BLOCKED** for runtime).

Legend: **Pass** / **Partial** / **Fail** / **BLOCKED**

---

## Marketing & public

### `/` — Home

| Dimension | Verdict | Notes |
| --- | --- | --- |
| Hierarchy | Partial | Strong journey headline; long page with many competing sections |
| Where / what / next | Pass | CTAs “Start your journey” / “Explore products” |
| Honesty | Fail | Mock MediFlow **72%**, timeline stars — reads live; see `home-sections.tsx`, `home-hero.tsx` |
| Density | Partial | Dashboard previews + AI colleague grids are heavy |
| A11y | Partial | Skip link + `main#main-content` present (`marketing-layout.tsx`) |

Files: `src/app/(marketing)/page.tsx`, `src/components/marketing/home/*`

### `/experience`, `/launchpad`, `/professional-workspace`

| Dimension | Verdict | Notes |
| --- | --- | --- |
| Terminology | Pass | Display names Experience / Launchpad / Professional Workspace |
| `/team-copilot` | Pass | Redirects to Professional Workspace (`team-copilot/page.tsx`) |
| Hero scores | Fail | Xperience/Launchpad heroes still show decorative **72%** chips |

Files: marketing product pages, `xperience-hero.tsx`, `launchpad-hero.tsx`, `professional-workspace/page.tsx`

### `/pricing`

| Dimension | Verdict | Notes |
| --- | --- | --- |
| Clarity | Partial | Clear stage pricing; “stage” language is marketing OK |
| CTA honesty | Fail | Prices imply paid access; start pages say entitlement open |

### `/privacy`, `/terms`

| Dimension | Verdict | Notes |
| --- | --- | --- |
| Completeness | **Fail** | Explicit placeholder copy |
| Credibility | Fail | Conflicts with GDPR / residency claims elsewhere |

### `/about`, `/solutions`, `/resources`

| Dimension | Verdict | Notes |
| --- | --- | --- |
| Usefulness | Partial | Supporting; resources point to products |
| Consistency | Pass | Same marketing shell |

---

## Auth & onboarding

### `/login`, `/signup`, `/login/forgot`, `/login/reset`

| Dimension | Verdict | Notes |
| --- | --- | --- |
| Form clarity | Pass | Labels via wrapping `<label>` (`login-form.tsx`) |
| Brand panel | Fail | Unexplained KPIs 40% / 3x / 97% (`AuthBrandPanel`) |
| Positioning | Fail | “AI watching everything” + root metadata “AI Delivery Platform” |
| Errors | Partial | Visible red banner; no `role="alert"` |
| Mobile | Pass | Brand panel hidden on small screens (`auth/layout.tsx`) |

### `/onboarding/profile`

| Dimension | Verdict | Notes |
| --- | --- | --- |
| Fit to charter | Pass | PI progressive setup path |
| States | Partial | Wizard has `role="alert"` on errors (`pi-onboarding-wizard.tsx`) — good |

### `/onboarding/organisation`, `/onboarding/role`, `/onboarding/team`, `/onboarding/invite`

| Dimension | Verdict | Notes |
| --- | --- | --- |
| Jargon | Fail | “Brief v2” in descriptions |
| Audience | Partial | Org path oriented to delivery teams; career candidates may feel wrong-footed |

### `/start/experience`, `/start/launchpad`, `/start/bundle`

| Dimension | Verdict | Notes |
| --- | --- | --- |
| Next step | Pass | Clear sign-in CTA |
| Honesty | **Fail** | Open access + Stripe TODO comments in UI path |

---

## Hub & Professional Intelligence

### `/hub`

| Dimension | Verdict | Notes |
| --- | --- | --- |
| Journey clarity | Pass | Stage cards map the loop well |
| Terminology | Fail | “Evidence & ScoreRun”; CTA “Open Career Intelligence” for Launchpad card |
| Auth | BLOCKED live | Redirects unauthenticated users to login |

File: `src/app/hub/page.tsx`

### `/profile`

| Dimension | Verdict | Notes |
| --- | --- | --- |
| Where / next | Pass | Strong intro; chips for Evidence, Baseline, Final, Experience |
| Jargon | Fail | “Evidence & ScoreRun” primary button |
| Loading / error | Pass | Explicit loading + error + Hub link |
| Density | Partial | Many sections; still scannable |

File: `src/components/pi/profile-centre.tsx`

### `/profile/evidence`

| Dimension | Verdict | Notes |
| --- | --- | --- |
| Empty state | Pass | Points to Experience Day 1 decision/reflection |
| Primary CTA | Fail | “Run ScoreRun” |
| Cross-links | Pass | Profile, Portfolio, Career, Experience |

File: `src/components/pi/evidence-capability-app.tsx`, `src/app/profile/evidence/page.tsx`

### `/profile/baseline`, `/profile/final`

| Dimension | Verdict | Notes |
| --- | --- | --- |
| Honesty | Pass | Emphasises ScoreRun assigns capability — good trust, bad naming |
| Forms | Partial | Multi-step; completion CTAs include “Finish … & ScoreRun” |

Files: `baseline-assessment-app.tsx`, `final-assessment-app.tsx`

### `/learning`, `/profile/learning`

| Dimension | Verdict | Notes |
| --- | --- | --- |
| Charter fit | Pass | Learning ≠ competency messaging present |
| Next | Pass | CTA to apply in Experience |

File: `src/components/pi/learning-intelligence-app.tsx`

### `/career/outcomes`, `/profile/outcomes`

| Dimension | Verdict | Notes |
| --- | --- | --- |
| Honesty | Pass | Self-reported outcomes not capability |
| Clarity | Partial | “stageReached” may show as `stage: …` in list |

File: `src/components/pi/real-world-outcomes-app.tsx`

### `/pi/review`, `/pi/review/admin`

| Dimension | Verdict | Notes |
| --- | --- | --- |
| Professionalism | Fail | “Seed sample finding” demo control |
| Status | Pass | `role="status"` on notice |

File: `src/components/pi-review/review-queue-app.tsx`, `admin-review-app.tsx`

---

## Experience

### `/experience/app`

| Dimension | Verdict | Notes |
| --- | --- | --- |
| Shell | Partial | Self-contained SPA-like screens (`ProductApp`) — parallel product feel |
| Onboarding steps | Partial | Create account / Goals / Baseline / WorkStyle / Offer — may duplicate PI onboarding |
| Tools | Partial | Inbox, Calendar, Decisions, Documents, AI Coach, Evidence — needs empty/loading discipline per tool |
| Auth | BLOCKED live | |

Files: `src/app/(xperience)/experience/app/page.tsx`, `src/components/xperience/product-app.tsx`, `simulation-workspace.tsx`

---

## Launchpad

### `/launchpad/app` (+ modules)

| Dimension | Verdict | Notes |
| --- | --- | --- |
| Naming | Partial | Aside: “Career Intelligence” + h1 “Launchpad” |
| Readiness | Fail | Shows “ScoreRun readiness signal N%” and UUID snippets |
| Non-MVP | Fail | Modules with `mvp: false` shown as “later” |
| Mobile nav | Fail risk | Aside `hidden lg:block` — module switch may be missing on small screens |

Files: `career-intelligence-app.tsx`, `src/lib/career-intelligence/types.ts`

---

## Portfolio & attestation

### `/portfolio`, `/portfolio/v/[token]`, `/portfolio/attest/[token]`

| Dimension | Verdict | Notes |
| --- | --- | --- |
| Evidence honesty | Pass | Share views strip private; attestation ≠ ScoreRun (copy present) |
| Terminology | Partial | “Capability claims (ScoreRun projection)” |
| Attest flow | BLOCKED live | Tokenised; unauthenticated attestor path exists |

File: `src/components/verified-portfolio/portfolio-app.tsx`

---

## Professional Workspace

### `/workspace`

| Dimension | Verdict | Notes |
| --- | --- | --- |
| Orientation | Pass | Clear “Succeed in the role” framing |
| Dev leak | Fail | Autonomy policy boolean dump |
| Legacy pointer | Fail | Mentions Command Centre |
| Modules | Pass | Home module grid via `WorkspaceHomeModules` |

File: `src/app/workspace/page.tsx`

### Module routes (`/workspace/{stakeholders,inbox,artefacts,risks,timeline,coach,evidence,decisions,team,…}`)

| Dimension | Verdict | Notes |
| --- | --- | --- |
| Chrome | Pass | `module-chrome.tsx` labels “Professional Workspace · …” |
| Coach honesty | Pass | Notes ScoreRun gaps / no auto capability (jargon remains) |
| Consistency | Partial | Shared module page pattern; some legacy pages still slate/indigo styling |

Files: `src/components/professional-workspace/*`, `src/config/professional-workspace-nav.ts`

### App chrome (`AppShell` + `AppNav`)

| Dimension | Verdict | Notes |
| --- | --- | --- |
| Primary IA | Pass | Professional Workspace section first when legacy off |
| Top bar | Partial | Tiny uppercase buttons (Alerts, AI review, Full view); Ask HELM |
| Mobile | Partial | Menu toggle with sr-only label — good; drawer behaviour needs live verify |

Files: `src/components/dx/app-shell.tsx`, `app-nav.tsx`

### Demoted / legacy surfaces (still routable)

| Route | Verdict | Notes |
| --- | --- | --- |
| `/workspace/dashboard`, `*-mission`, `/workspace/assistant` | Unnecessary for pilot ICP | Mission Control depth |
| `/workspace/twin` | Fail vs charter density | Digital Twin + indigo gradients |
| `/workspace/pmo` | Fail | Unexplained portfolio health number |
| `/workspace/marketplace` | Fail | Employer/ecosystem marketplace — out of charter liquidity |
| `/workspace/global`, `/brain` | Partial | Intelligence admin depth |

---

## Settings

### `/settings/profile`, `/settings/workspace`, `/settings/developer`

| Dimension | Verdict | Notes |
| --- | --- | --- |
| Nav | Pass | Role-gated settings nav |
| Developer | Pass | Admin/dev only |
| Phase health panels | Risk | Components still titled “Phase B/F/…” if mounted anywhere |

---

## Cross-cutting state checklist

| State | Coverage |
| --- | --- |
| Empty | Good on Evidence, Marketplace, Twin (no portfolio); uneven elsewhere |
| Loading | Profile / Launchpad text loading; Experience Suspense fallback |
| Success | Notices as green text; toasts via Sonner globally |
| Error | Often red text; inconsistent live regions |
| Confirmation / destructive | Delete task patterns exist in project space; Portfolio revoke present — needs live QA |
| Misleading CTA | Pricing vs open entitlement; Seed sample; ScoreRun |

---

## Worst offenders (paths)

1. `src/app/(marketing)/privacy/page.tsx` / `terms/page.tsx` — unfinished legal  
2. `src/components/dx/dx-page-chrome.tsx` — fake KPI authority on login  
3. `src/components/marketing/home/home-sections.tsx` — 72% mock + stars  
4. `src/components/pi/evidence-capability-app.tsx` + `profile-centre.tsx` — ScoreRun as product language  
5. `src/app/workspace/page.tsx` — autonomy dump + Command Centre pointer  
6. `src/components/launchpad/career-intelligence-app.tsx` — ScoreRun % + “later” modules  
7. `src/app/start/experience/page.tsx` — payment honesty gap  
8. `src/components/pi-review/review-queue-app.tsx` — seed sample finding
