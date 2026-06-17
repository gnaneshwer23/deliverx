# Landing page — publish audit

Last reviewed: 2026-06-01 (branch `cursor/phase-2`, commit `7240e66`)

## Story flow (end-to-end)

| # | Section | Purpose | Status |
|---|---------|---------|--------|
| 1 | Nav | Wayfinding + trial CTA | ✅ Desktop + mobile menu |
| 2 | Hero | Value prop + live/demo mockup | ✅ Outcome tiles, tighter layout |
| 2b | Bridge | Hero → problem transition | ✅ “Why DeliverX” band |
| 3 | Problem | Pain + “answer” bridge | ✅ Large stat cards (`LandingStatCard`) |
| 4 | Journey | 5-step pipeline + 4 cards + guardrail | ✅ Workflow strip + guardrail |
| 5 | Platform | Product proof + pillars + metrics | ✅ Metrics above mock; live when signed in |
| 6 | Features | 2×2 feature grid | ✅ Inline UI visuals per card; no section mask on text |
| 7 | Capabilities | Built-in capabilities grid | ✅ Short descriptions |
| 8 | Pricing | Plans + featured tier | ✅ |
| 9 | FAQ | Pre-trial objections | ✅ |
| 10 | CTA + Footer | Conversion + links | ✅ Footer columns |

## Technical checks

- [x] `npm run build` passes (local + Vercel prod build `dpl_2z9Z4N6CDGBRGk3go8qAMzcdLT8s`)
- [x] `npm run lint` — 0 errors (9 pre-existing warnings)
- [x] Marketing metadata (`src/app/(marketing)/layout.tsx`)
- [x] Skip link → `#main-content`
- [x] Section IDs for in-page nav (`#how`, `#platform`, `#features`, `#faq`, `#price`, `#problem`)
- [x] `prefers-reduced-motion` respected (CSS + Framer)
- [x] Prod routes: `/`, `/login`, `/signup`, `/workspace/dashboard` → HTTP 200
- [x] Workspace dashboard resilient load (`safeDashboardLoad`, `EMPTY_WORKSPACE_DASHBOARD`)
- [ ] Replace `#` footer legal links with real pages before GA
- [ ] Add OG image URL when brand asset is ready
- [ ] Run Lighthouse on https://deliverx.dev after prod deploy

## Content gaps (optional before GA)

- Customer logos or named testimonials (hero uses outcome stat tiles)
- Link Privacy / Terms / Security to real documents
- Enterprise contact: dedicated mailto or Calendly

## Deploy

Production: **https://deliverx.dev** (alias of latest `vercel deploy --prod` from `cursor/phase-2`).

Merge [PR #14](https://github.com/gnaneshwer23/deliverx/pull/14) to `main` so GitHub production deploys stay aligned without manual CLI promote.
