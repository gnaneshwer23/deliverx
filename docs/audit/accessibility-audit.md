# Accessibility audit (Phase 8)

**Date:** 2026-07-25 · **Updated:** 2026-07-26 (Batch 5)  
**Target:** WCAG 2.2 Level AA where practical  
**Method:** Static analysis of semantic HTML, ARIA, labels, focus styles, contrast tokens; production HTML fetch for `/` and `/login`. Interactive keyboard/focus live testing **BLOCKED** for authenticated routes without pilot credentials. Batch 5 closed the primary AA gaps with unit contracts.

**Verdict:** **Not fully WCAG 2.2 AA compliant** across every surface. Core signed-in chrome + auth now meet the audited P0/P1 a11y slice. Do not claim whole-product AA until axe + keyboard QA on authenticated journeys is run.

---

## Batch 5 status (2026-07-26)

| ID | Status | Notes |
| --- | --- | --- |
| A0-1 User menu name | **Resolved** | `aria-label` Open/Close account menu |
| A0-2 Auth error live regions | **Resolved** | Login/signup/forgot/reset + login page banner `role="alert"` |
| A0-3 Auth panel contrast | **Resolved** | Brand panel body/footer raised to `white/75` / `white/70` |
| A0-4 Tiny 7–9px essential labels | **Resolved (chrome)** | `dxClass` labels/nav/buttons ≥12px (`text-xs`); residual marketing mocks deferred |
| A0-5 Decorative unexplained % | **Prior batches** | Auth KPIs removed Batch 2; marketing honesty Batch 2 |
| A1-1 App skip links | **Resolved** | `ProductSuiteShell` + `AppShell` skip to main |
| A1-2 Launchpad mobile nav | **Resolved** | Horizontal module switcher below `lg` |
| A1-3 Escape on menus | **Resolved** | User menu + alert bell Escape + focus restore |
| A1-4 Icon-only controls | **Partial** | Named primary chrome icons; residual Lucide in dense legacy panels deferred |
| A1-5 Badge context | **Resolved** | Nav badges include `aria-label` with item context |
| A1-6 Placeholder-only fields | **Partial** | Launchpad interview notes now labelled; Portfolio fields remain mixed |
| A2-1 Muted greys | **Partial** | Primary chrome muted text darkened; marketing microcopy deferred |
| A2-2 Heading hierarchy | **Resolved (Launchpad)** | Page `h1` = Launchpad; module purpose stays `h2` |
| A2-5 Target size | **Partial** | Primary chrome controls `min-h-11`; dense legacy toolbars deferred |

**Deferred (honest):** VoiceOver/NVDA pass; axe on authenticated Hub→Profile→Evidence; marketing decorative micro-labels; Twin/PMO chart text alternatives; full icon inventory outside primary chrome; Experience onboarding decorative readiness % (content honesty residual, not chrome).

**Manual method until CI axe:** Tab through `/`, `/login`, then (with credentials) Hub → Profile → Experience → Launchpad → Workspace; verify skip link, visible focus ring, Escape closes menus, Launchpad modules reachable at 768px.

---

## BLOCKED items

| Item | Why blocked |
| --- | --- |
| Keyboard-only walkthrough of authenticated apps | No pilot credentials in this session |
| Screen-reader verification (VoiceOver/NVDA) | Not run |
| Real contrast measurement on rendered pixels | Tokens reviewed; not measured with axe in-browser |
| Marketing mobile drawer focus trap | Unverified live |

Unauthenticated production pages were fetched historically: `/`, `/login`, `/privacy`, `/terms`.

---

## What looks solid (static + Batch 5)

| Area | Evidence |
| --- | --- |
| Document language | `<html lang="en">` in `src/app/layout.tsx` |
| Marketing skip link | `MarketingPageShell` → `#main-content` |
| Signed-in skip links | `ProductSuiteShell`, `AppShell` |
| Main landmarks | Marketing + product shells provide skip targets |
| Mobile menu labels | AppNav: `aria-expanded`, `aria-controls`, `sr-only` Open/Close |
| User menu | Named trigger; Escape; `role="menu"` / `menuitem` |
| Dialog close | `sr-only` “Close” + decorative icon `aria-hidden` |
| Form labels (login) | Visible label wrapping inputs |
| Auth errors | `role="alert"` / `aria-live="assertive"` |
| Focus-visible rings | Global `:focus-visible` outline + shadcn rings |
| Launchpad mobile IA | Module switcher always available below `lg` |
| Unit contracts | `accessibility-contract.test.ts`, `product-suite-nav.test.ts` |

---

## AA compliance statement

**DeliverX does not claim full WCAG 2.2 AA** across the product. Batch 5 closed the audited chrome/auth gaps that blocked a public-beta honesty bar. Remaining work is residual content density, legacy Mission Control panels, and live AT verification.
