# DeliverX Screen Pack 01

**Status:** Accepted design source of truth, subject to the implementation gates below
**Scope:** Marketing, authentication, evolved PI onboarding, signed-in home, Launchpad, employer proposition, and Team Copilot / Professional Workspace
**Authority:** Build Charter → Current Scope → Product Bible → Product Decisions → this pack
**Design only:** This pack does not authorize UI implementation, live Stripe, marketplace liquidity, or enterprise mission-control depth.

## Reading order

1. [`00-design-system.md`](./00-design-system.md)
2. [`01-marketing-home.md`](./01-marketing-home.md)
3. [`02-marketing-how-it-works.md`](./02-marketing-how-it-works.md)
4. [`03-marketing-product-pages.md`](./03-marketing-product-pages.md)
5. [`04-marketing-pricing.md`](./04-marketing-pricing.md)
6. [`05-marketing-employers.md`](./05-marketing-employers.md)
7. [`06-auth-signin-signup.md`](./06-auth-signin-signup.md)
8. [`07-onboarding-mapping.md`](./07-onboarding-mapping.md)
9. [`08-home-dashboard.md`](./08-home-dashboard.md)
10. [`09-launchpad-suite.md`](./09-launchpad-suite.md)
11. [`10-team-copilot-deep.md`](./10-team-copilot-deep.md)
12. [`11-cursor-prompts.md`](./11-cursor-prompts.md)

## Implementation matrix

| Surface | Route | Pack disposition | Implementation rule |
| --- | --- | --- | --- |
| Home | `/` | **Pack-1 implementable now** | Evolve the existing marketing page; preserve honesty rails. |
| How it works | `/solutions` | **Pack-1 implementable now** | Reframe the existing route; no net-new product promise. |
| Product marketing | `/experience`, `/launchpad`, `/team-copilot`, `/professional-workspace` | **Pack-1 implementable now** | PI may remain a home section until a route is approved. |
| Pricing money UI | `/pricing` | **Design-complete / build-gated** | Proposed £500/£250/£500/£800 packaging is not the accepted T9 catalogue. Do not publish or make purchasable without a new packaging decision, live Stripe, checkout smoke, and an explicit `DELIVERX_BILLING_ENFORCE` decision. |
| Employers | Proposed `/employers` | **Design-complete / build-gated** | Narrative landing design is approved; employer accounts, matching and marketplace liquidity need separate founder build approval and operations. |
| Sign in / sign up | `/login`, `/signup` | **Pack-1 implementable now** | Evolve existing Supabase Auth surfaces; preserve deep-link and error behaviour. |
| PI onboarding | `/onboarding/profile` | **Pack-1 implementable now** | Evolve the shipped eight-step wizard. Never create a parallel twelve-screen wizard. |
| Unified home | `/profile` (with `/hub` redirect decision during implementation) | **Pack-1 implementable now** | Evolve Profile into the signed-in home; do not create a competing Home. |
| Launchpad suite | `/launchpad/app/*` | **Design-complete / phased build** | Readiness, roadmap, CV, portfolio, interview and applications mostly have shipped foundations; redesign in vertical slices. Career Dashboard consolidation is net-new. |
| Deep Team Copilot | `/workspace/*` | **Design-complete / build-gated** | Thin Workspace remains live. Programmes, delivery health and executive reporting depth need separate founder build approval; no fourth SKU. |

## Non-negotiable trust language

- `Verified` means a named independent attestor confirmed a specific claim through the T8 path. Work, AI observation, learning completion, self-report, imports, or a capability assessment never light it alone.
- Label source at point of use: **Self-reported**, **Imported draft**, **Observed with consent**, **Evidence**, or **Externally verified**.
- Observation is not evidence; evidence is not capability until judged through the Capability Engine.
- No unexplained score or decorative readiness percentage. Use cited capability bands, source-labelled readiness, and plain-language rationale.
- AI output is a draft attached to a project, task, evidence item, or career objective. It is never the primary database or an unbounded blank chat.
- Public copy contains no phase/version language and no emojis.
- Pricing contains no money-back or job guarantee theatre.

## Route and shell policy

- Marketing uses the existing `src/app/(marketing)/` shell.
- Signed-in primary navigation remains: **Home · Profile · Experience · Launchpad · Workspace · Portfolio**. If `/profile` becomes Home, the Profile destination becomes the profile/evidence view within that shell rather than a second home.
- Context panels show evidence, guidance, provenance, consent, or related items. They do not default to blank AI chat.
- Stable routes and redirects are preserved until an implementation slice explicitly migrates them.

## Definition of design-complete

A screen is design-complete when this pack names its user, question, actions, data, permissions, layout, components, six required states, desktop and mobile wireframes, accessibility, analytics, acceptance criteria, related screens, implementation notes, and final or provisional copy. Design-complete does not mean build-authorized.

## Recommended first implementation slice

Implement **homepage only** first. It is public, charter-aligned, independently testable, and establishes the copy and visual system without coupling marketing work to onboarding state or Profile aggregation. Follow with onboarding copy/field refinements, then the `/profile` unified home as separate vertical slices.
