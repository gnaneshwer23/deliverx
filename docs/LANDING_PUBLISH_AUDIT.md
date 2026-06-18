# Landing page — publish audit

**Last reviewed:** 2026-06-18 (Sprint I4-F, branch `feat/sprint-i4-f-final-polish`)

## Marketing stack (current)

| Layer | Location | Notes |
|-------|----------|-------|
| Page shell | `src/app/(marketing)/page.tsx` | Composes modular sections |
| Layout / metadata | `src/app/(marketing)/layout.tsx` | OG + Twitter cards, `metadataBase` |
| OG image | `src/app/(marketing)/opengraph-image.tsx` | Dynamic 1200×630 PNG at `/opengraph-image` |
| Theme & tokens | `src/lib/marketing/landing-theme.ts`, `landing-data.ts` | Role dashboards, pricing, proof copy |
| Persona config | `src/config/persona-onboarding.ts` | Shared with real onboarding (`OB_CONFIG`, `PERSONA_COMPLETION`) |
| Components | `src/components/marketing/*` | Nav, hero, product, loop, onboarding, proof, pricing, CTA, footer |

> **Deprecated:** monolithic `landing-sections.tsx` — replaced by modular marketing components above.

## Story flow (end-to-end)

| # | Section | Component | Anchor | Status |
|---|---------|-----------|--------|--------|
| 1 | Nav + mobile drawer | `marketing-nav.tsx` | — | ✅ Desktop + hamburger menu (`#marketing-mobile-nav`) |
| 2 | Hero | `marketing-hero.tsx` | `#hero` | ✅ Value prop + role dashboard preview |
| 3 | Platform | `marketing-product.tsx` | `#platform` | ✅ Product proof + pillars |
| 4 | Delivery loop | `marketing-loop.tsx` | `#loop` | ✅ 5-step pipeline strip |
| 5 | Role onboarding | `marketing-onboarding.tsx` | `#onboarding` | ✅ 7 personas from `persona-onboarding.ts` |
| 6 | Proof | `marketing-proof.tsx` | `#proof` | ✅ Outcomes / trust signals |
| 7 | Pricing | `marketing-pricing.tsx` | `#pricing` | ✅ Tier cards |
| 8 | CTA | `marketing-cta.tsx` | `#cta` | ✅ Trial conversion band |
| 9 | Footer | `marketing-nav.tsx` (`MarketingFooter`) | — | ✅ In-page anchors + legal links |

## Technical checks

- [x] `npm run build` passes locally
- [x] `npm test -- --run` passes
- [x] Marketing metadata + OG image (`layout.tsx`, `opengraph-image.tsx`)
- [x] Skip link → `#main-content` (`marketing-layout.tsx` → `MarketingPageShell`)
- [x] Section IDs for in-page nav (`#platform`, `#loop`, `#onboarding`, `#proof`, `#pricing`, `#cta`)
- [x] `prefers-reduced-motion` respected (CSS + Framer in marketing components)
- [x] Mobile nav: drawer with body scroll lock, `aria-expanded` / `aria-controls`
- [x] Legal stubs: `/privacy`, `/terms` (marketing route group)
- [x] Dashboard preview mockups: `role="img"` + `aria-label` on `DashboardPreview`
- [ ] Run Lighthouse on production URL after deploy (manual — see checklist below)

## Manual Lighthouse / QA checklist

Run in Chrome DevTools → Lighthouse (mobile + desktop) against **https://deliverx.dev** after deploy:

1. **Performance** — LCP on hero; no blocking third-party scripts on marketing page
2. **Accessibility** — skip link, heading order, contrast on dark marketing theme, mobile menu labels
3. **Best practices** — HTTPS, no console errors on `/`, `/login`, `/signup`
4. **SEO** — title/description, OG image resolves (`/opengraph-image`), canonical via `metadataBase`
5. **Smoke routes** — `/`, `/privacy`, `/terms`, `/login`, `/signup` → HTTP 200
6. **Mobile** — open hamburger nav, tap each anchor, confirm scroll to section
7. **Footer** — Privacy / Terms open stub pages (expand copy before GA if required)

## Content gaps (optional before GA)

- Customer logos or named testimonials (hero uses outcome stat tiles)
- Expand Privacy / Terms beyond stubs if legal review required
- Enterprise contact: dedicated mailto or Calendly
- Security page (footer link not yet added)

## Deploy

Production: **https://deliverx.dev** — align GitHub `main` deploys with latest merged I4 work.
