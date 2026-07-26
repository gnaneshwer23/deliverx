# Accessibility audit (Phase 8)

**Date:** 2026-07-25 · **Updated:** 2026-07-26 (Batch 6)  
**Target:** WCAG 2.2 Level AA where practical  
**Method:** Static analysis of semantic HTML, ARIA, labels, focus styles, contrast tokens; production HTML fetch for `/` and `/login`. Interactive keyboard/focus live testing **BLOCKED** for authenticated routes without pilot credentials. Batch 5–6 closed the primary AA gaps with unit contracts; Batch 6 added demoted-surface text alternatives and Experience honesty.

**Verdict:** **Not fully WCAG 2.2 AA compliant** across every surface. Core signed-in chrome + auth + demoted Twin/PMO/Marketplace honesty now meet the audited engineering-owned a11y slice. Do not claim whole-product AA until axe + keyboard/AT QA on authenticated journeys is run.

---

## Batch 6 status (2026-07-26)

| ID | Status | Notes |
| --- | --- | --- |
| A1-4 Icon-only controls | **Resolved (primary + demoted)** | Chrome icons named/`aria-hidden`; Twin/PMO/Marketplace decorative Lucide `aria-hidden` |
| A2-5 Target size | **Improved** | Alert “View all” + demoted CTAs `min-h-11`; Experience tools already ≥48px |
| Twin/PMO chart alternatives | **Resolved (honest)** | KPI text summaries + demoted banners; empty/deferred framing without fake data |
| Experience decorative readiness % | **Resolved** | Qualitative setup bands + honesty labels; scenario pulses labelled non-capability |
| TD-017 lint/tsc | **Closed** | `tsc --noEmit` 0; eslint 0 |

**Deferred (honest):** VoiceOver/NVDA pass; axe on authenticated Hub→Profile→Evidence; marketing decorative micro-labels; Portfolio mixed placeholder-only fields; full residual Mission Control density outside Twin/PMO/Marketplace.

**Manual method until CI axe:** Tab through `/`, `/login`, then (with credentials) Hub → Profile → Experience → Launchpad → Workspace; verify skip link, visible focus ring, Escape closes menus, Launchpad modules reachable at 768px. Optionally bookmark `/workspace/twin`, `/workspace/pmo`, `/workspace/marketplace` and confirm demoted banners + text KPI summaries.

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
