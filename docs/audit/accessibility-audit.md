# Accessibility audit (Phase 8)

**Date:** 2026-07-25  
**Target:** WCAG 2.2 Level AA where practical  
**Method:** Static analysis of semantic HTML, ARIA, labels, focus styles, contrast tokens; production HTML fetch for `/` and `/login`. Interactive keyboard/focus live testing **BLOCKED** (browser automation tab failed this session; authenticated routes require credentials).

**Verdict:** **Not WCAG 2.2 AA compliant** as a whole product. Marketing + auth foundations are partial. Signed-in surfaces likely fail several AA criteria (icon-only controls, missing live regions, tiny text contrast/size, incomplete mobile nav, decorative scores without text alternatives). Pilot may proceed with known gaps; do not claim AA.

---

## BLOCKED items

| Item | Why blocked |
| --- | --- |
| Keyboard-only walkthrough of authenticated apps | No pilot credentials provided; do not invent logins |
| Focus order / focus trap on Workspace mobile drawer, Experience tools, Launchpad modules | Requires live browser; MCP browser tab creation failed |
| Screen-reader verification (VoiceOver/NVDA) | Not run |
| Real contrast measurement on rendered pixels | Tokens reviewed only; not measured with axe/contrast tools in-browser |
| Modal focus management beyond Dialog primitive | Base UI Dialog used; not exhaustively verified in product flows |

Unauthenticated production pages were fetched (`WebFetch` / `curl`): `/`, `/login`, `/privacy`, `/terms`.

---

## What looks solid (static)

| Area | Evidence |
| --- | --- |
| Document language | `<html lang="en">` in `src/app/layout.tsx` |
| Marketing skip link | `MarketingPageShell` → `#main-content` (`marketing-layout.tsx`) |
| Landing skip link | `landing-layout.tsx` same pattern |
| Main landmarks | Marketing pages use `<main id="main-content">` |
| Mobile menu labels | AppNav: `aria-expanded`, `aria-controls`, `sr-only` Open/Close (`app-nav.tsx`) |
| Marketing Products menu | `aria-expanded`, `aria-haspopup`, Escape closes (`marketing-nav.tsx`) |
| User menu | `aria-expanded`, `aria-haspopup="menu"`, `role="menu"` / `menuitem` (`user-menu.tsx`) |
| Dialog close | `sr-only` “Close” (`ui/dialog.tsx`) |
| Form labels (login) | Visible label wrapping inputs (`login-form.tsx`) |
| Focus-visible rings | shadcn Button/Input/Select use `focus-visible:ring-*` |
| Some status/alerts | PI onboarding `role="alert"`; review queues `role="status"` |
| Reduced motion | Marketing reveal / carousel note reduced-motion (`marketing-reveal.tsx`) |

---

## WCAG 2.2 AA findings

### P0 / high

| ID | Criterion | Finding | Paths |
| --- | --- | --- | --- |
| A0-1 | 1.3.1 / 4.1.2 | **User menu trigger** has no accessible name (avatar initial only) | `user-menu.tsx` |
| A0-2 | 3.3.1 / 4.1.3 | Login/signup **errors** are visual only — no `role="alert"` / `aria-live` | `login-form.tsx`, login page banners |
| A0-3 | 1.4.3 / 1.4.11 | **White/30 and white/15** text on dark auth panel likely fails contrast | `AuthBrandPanel` in `dx-page-chrome.tsx` |
| A0-4 | 1.4.4 / 1.4.12 | Widespread **7–9px** UI text (labels, nav badges, caps) fails readable resize/zoom usability | `dx-theme.ts`, `app-nav.tsx` |
| A0-5 | 2.4.4 / 2.4.6 | Marketing **decorative 72%** and auth KPI stats lack explanation — ambiguous for AT users | home heroes, `AuthBrandPanel` |

### P1

| ID | Criterion | Finding | Paths |
| --- | --- | --- | --- |
| A1-1 | 2.4.1 | App / PI / Launchpad / Experience shells — **no skip link** (marketing only) | AppShell, Profile, Launchpad |
| A1-2 | 1.3.1 | Launchpad **module nav hidden below `lg`** without alternate control — keyboard/mobile users lose IA | `career-intelligence-app.tsx` |
| A1-3 | 2.1.1 / 2.4.3 | Custom dropdowns rely on mousedown-outside; Escape handled on marketing; UserMenu may miss Escape | `user-menu.tsx` |
| A1-4 | 1.3.1 | Many icon-only Lucide usages without `aria-hidden` or text alternatives (mixed) | various |
| A1-5 | 4.1.2 | Nav badge counts may be announced without context (“3”) | `app-shell.tsx` NavLink badges |
| A1-6 | 3.3.2 | Some PI forms use placeholders as primary cues (weaker than persistent labels) | Launchpad / Portfolio fields |

### P2

| ID | Criterion | Finding | Paths |
| --- | --- | --- | --- |
| A2-1 | 1.4.3 | Muted greys `#A8A89E` / `#9ca3af` on light/white — borderline on small text | dx theme, sidebars |
| A2-2 | 2.4.6 | Heading hierarchy: Launchpad puts product name in `h1` while page purpose is module `h2` — OK but Hub/marketing vary |
| A2-3 | 1.1.1 | Marketing mock dashboards are text-in-divs (OK) but percentage bars may lack text value for AT |
| A2-4 | Tables/charts | Twin/PMO KPI strips — need live check for text alternatives; static review flags unexplained numbers |
| A2-5 | 2.5.8 (AA 2.2) | Some ghost buttons / chips may fall under **24×24** target size on dense toolbars | `app-nav.tsx` |

---

## Colour contrast (token review)

| Pair | Approx | Likely AA? |
| --- | --- | --- |
| `#0D0D0B` on `#FFFFFF` / cream | High | Pass |
| `#1C4A2E` on white | High | Pass |
| `#6B6B64` / `#6B7280` body on white | ~4.5–5 | Borderline at small sizes |
| `#A8A89E` on white | Low | **Fail** for small text |
| White at 40%/30%/15% on `#0D0D0B` | Low | **Fail** for body/footer |
| Green-L `#3D9660` on cream | Medium | Check as text |
| Marketing `text3` `#7A857E` on white | Borderline | Check at 10px |

`mktStat` comments claim WCAG-friendly KPI colours — good intent; decorative % still a content problem.

---

## Forms, errors, announcements

| Flow | Labels | Errors announced? |
| --- | --- | --- |
| Login | Yes | No live region |
| Signup | Field components with labels | Verify |
| PI onboarding | Yes | `role="alert"` present |
| Baseline / Final | Mixed | Status via notice paragraphs |
| Portfolio attestation | BLOCKED live | Token page exists |

---

## Modals / drawers

- `ui/dialog.tsx` uses Base UI Dialog (focus management expected from primitive) + sr-only Close.  
- Marketing mobile drawer: backdrop button `aria-label="Close menu"`; body scroll lock — good start; focus trap **unverified**.  
- AppShell mobile nav overlay (`backdrop-blur`) — focus trap **unverified**.

---

## Recommendations (a11y slice)

1. Name all icon buttons (`aria-label`); Escape closes all menus.  
2. Add `role="alert"` / `aria-live="polite"` to auth and PI error/success notices.  
3. Add skip-to-content on AppShell and PI layouts.  
4. Raise minimum UI text to ≥12px; ban 7–9px for essential labels.  
5. Provide Launchpad mobile module switcher.  
6. Run axe + keyboard QA on `/`, `/login`, then authenticated Hub → Profile → Evidence once credentials available.

---

## AA compliance statement

**DeliverX does not currently meet WCAG 2.2 AA** across the product. Closest: marketing skip link + landmarks. Furthest: tiny text, contrast on dark auth panel, icon-only menus, missing error announcements, Launchpad mobile nav gap, unexplained scores as content.
