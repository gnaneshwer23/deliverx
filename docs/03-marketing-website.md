# 03 — Marketing Website

**Status:** Active marketing IA  
**Audience:** Marketing, Product, Engineering  
**Shipped routes:** `src/app/(marketing)/**` · production https://www.deliverx.dev

---

## Goals

- Explain DeliverX in under 30 seconds (what / why different / what next)  
- Drive signup into PI onboarding without overclaiming Verified or capability  
- Route curiosity into the four experiences without inventing a fifth SKU  

## Global requirements

| Concern | Requirement |
| --- | --- |
| CTA | Primary: Sign up / Start; secondary: How it works / product deep links |
| SEO | Unique title + description per page; OG image via route `opengraph-image` |
| A11y | Semantic headings, focusable CTAs, alt text on meaningful images |
| Analytics | Vercel Analytics / Speed Insights present; event catalogue gaps in [`14`](./14-analytics-and-product-metrics.md) |
| Performance | Prefer static marketing shells; avoid shipping heavy app chunks on `/` |
| Honesty | No “Verified professionals” claims without attestation path disclosure (TD-011) |

---

## Page map (purpose · sections · CTA)

| Page | Route | Purpose | Key sections | Primary CTA |
| --- | --- | --- | --- | --- |
| **Home** | `/` | Answer five questions fast | Hero (brand + one promise), how it works teaser, product strip, trust/honesty, CTA | Sign up |
| **How it works** | Prefer `/solutions` or Resources narrative | Lifecycle: PI → Experience → evidence → Launchpad | Steps, evidence philosophy, FAQ | Start free |
| **Professional Intelligence** | Covered via Home + product pages / Hub narrative | PI as SoT | Domains at high level; not a score | Explore profile after signup |
| **Experience** | `/experience` (marketing) | Realistic work generates evidence | Catalogue promise, not quiz framing | Start Experience |
| **Launchpad** | `/launchpad` | Career packaging from evidence | Readiness honesty; portfolio | Open Launchpad |
| **Team Copilot** | `/team-copilot` + `/professional-workspace` | Collaborative delivery | Alias to Professional Workspace; not third SKU | Open Workspace |
| **Pricing** | `/pricing` | Pilot packaging | Honest open/pilot posture; **no Stripe until T9** | Contact / Sign up |
| **Enterprise** | Use `/solutions` / Resources until dedicated page | Org interest | Do not promise mission-control OS | Contact |
| **About** | `/about` | Company / mission | Evidence-first story | Contact / Sign up |
| **Contact** | About CTA / email patterns | Sales & support | Keep simple | Email / form if present |
| **Legal** | `/privacy`, `/terms` | Compliance | Accurate privacy (export/delete, consent) | — |
| **Resources** | `/resources` | Education content | Link to principles, not fake case scores | Sign up |

### Also shipped

- Marketing layout + OG image  
- Product entry marketing pages listed above  

### Aspirational (do not invent without charter)

- Employer marketplace landing liquidity  
- Paid plan checkout (T9)  
- Multi-profession “for every career” claim beyond PM pilot  

---

## Section pattern (per page)

1. One purpose, one headline, one short supporting sentence  
2. One CTA group  
3. Optional proof that does not invent metrics  
4. Footer legal + product links  

Avoid first-viewport clutter (stat strips, pill clusters, unexplained %).

---

## Mapping to product

| Marketing promise | Product truth |
| --- | --- |
| Evidence-driven profile | Ledger + SnapshotClaims |
| Practice in realistic orgs | Experience planner + 12-company catalogue |
| Career readiness | Launchpad with labelled readiness source |
| Team collaboration | Professional Workspace; Team Copilot alias |
| Verified | External attestation only (T8) |

---

## Acceptance

- [ ] Home answers what / why different / next action without buzzword fog  
- [ ] Pricing does not imply Stripe entitlements  
- [ ] Verified language matches T8  
- [ ] Links to live app routes resolve (auth gates OK)  
