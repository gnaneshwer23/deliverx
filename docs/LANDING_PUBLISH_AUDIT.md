# Landing page — publish audit

Last reviewed: 2026-06-01 (branch `cursor/phase-2`)

## Story flow (end-to-end)

| # | Section | Purpose | Status |
|---|---------|---------|--------|
| 1 | Nav | Wayfinding + trial CTA | ✅ Desktop + mobile menu |
| 2 | Hero | Value prop + live/demo mockup | ✅ Motion, social proof, scroll hint |
| 3 | Problem | Pain + “answer” bridge | ✅ Icons, CTA to signup |
| 4 | Journey | 4-step workflow + guardrail | ✅ Reveal, guardrail callout |
| 5 | Platform | Product proof + pillars + metrics | ✅ Live metrics when signed in |
| 6 | Features | Bento feature grid | ✅ Icons + module copy |
| 7 | Capabilities | Built-in capabilities grid | ✅ Short descriptions |
| 8 | Pricing | Plans + featured tier | ✅ |
| 9 | FAQ | Pre-trial objections | ✅ |
| 10 | CTA + Footer | Conversion + links | ✅ Footer columns |

## Technical checks

- [x] `npm run build` passes
- [x] Marketing metadata (`src/app/(marketing)/layout.tsx`)
- [x] Skip link → `#main-content`
- [x] Section IDs for in-page nav (`#how`, `#platform`, `#features`, `#faq`, `#price`, `#problem`)
- [x] `prefers-reduced-motion` respected (CSS + Framer)
- [ ] Replace `#` footer legal links with real pages before GA
- [ ] Add OG image URL when brand asset is ready
- [ ] Run Lighthouse on https://deliverx.dev after prod deploy

## Content gaps (optional before GA)

- Customer logos or named testimonials (currently avatar strip only)
- Link Privacy / Terms / Security to real documents
- Enterprise contact: dedicated mailto or Calendly

## Deploy

Production domain serves **Production** target only. After merging to `main` or `vercel deploy --prod`, verify https://deliverx.dev matches preview.
