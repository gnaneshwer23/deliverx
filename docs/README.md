# DeliverX Product Bible

**Canonical reading path** for humans and agents. Stop thinking in one-off prompts: architecture, PRDs, UX, engineering, QA, and principles live here. Prompts should request only the **next vertical slice**.

**As of:** 2026-07-25 · P0–P7 + T0–T8 shipped · T9 blocked · migrations head `0094`

---

## Reading order

### Agents (before substantial work)

1. [`00-vision-and-principles.md`](./00-vision-and-principles.md) — why DeliverX exists; refuse filter  
2. [`product/build-charter.md`](./product/build-charter.md) — what may be built **now**  
3. [`product/current-scope.md`](./product/current-scope.md) — shipped reality vs out of scope  
4. Relevant bible chapter for the slice (`01`–`15`)  
5. Canonical detail docs linked from that chapter (data-model, api-contracts, etc.)  
6. [`product/product-decisions.md`](./product/product-decisions.md) — recorded decisions  

### Humans (orientation)

| Goal | Start here |
| --- | --- |
| Understand the product | `00` → `01` → `05`–`09` |
| End-to-end journey (founder / new engineers) | [`product/end-to-end-journey.md`](./product/end-to-end-journey.md) · PRD [`product/prd-end-to-end-journey.md`](./product/prd-end-to-end-journey.md) |
| Design / UX | `02` → architecture `06` |
| Marketing site | `03` |
| Auth / first session | `04` |
| Ship code safely | `10` → `11` → `12` |
| Release / QA | `13` |
| Metrics | `14` |
| What next | `15` + [`engineering/next-steps.md`](./engineering/next-steps.md) |

### Design source of truth

- [`design/screen-pack-01/README.md`](./design/screen-pack-01/README.md) — Screen Pack 01 for marketing, auth, evolved onboarding, signed-in home, Launchpad, Employers and Team Copilot. The pack labels each surface as implementable, phased, or build-gated; it does not authorize live payments, marketplace liquidity or enterprise mission-control depth.

---

## Document index

| # | Document | Role |
| --- | --- | --- |
| 00 | [Vision & Principles](./00-vision-and-principles.md) | Permanent philosophy + decision filter |
| 01 | [Master PRD](./01-master-prd.md) | Product requirements (not a feature dump) |
| 02 | [UX & Design Bible](./02-ux-and-design-bible.md) | Screens, components, copy, a11y |
| 03 | [Marketing Website](./03-marketing-website.md) | Public pages + SEO/analytics |
| 04 | [Auth & Onboarding](./04-authentication-and-onboarding.md) | Landing → PI path → dashboard |
| 05 | [Professional Intelligence](./05-professional-intelligence.md) | PI PRD + shipped libs/APIs |
| 06 | [Experience Platform](./06-experience-platform.md) | Experience PRD |
| 07 | [Launchpad](./07-launchpad.md) | Career / packaging PRD (+ T8 attestation) |
| 08 | [Team Copilot](./08-team-copilot.md) | Workspace alias + org structure |
| 09 | [AI & Intelligence](./09-ai-and-intelligence.md) | AI below intelligence; orchestration |
| 10 | [Engineering Handbook](./10-engineering-handbook.md) | Repo conventions + DoD |
| 11 | [Technical Architecture](./11-technical-architecture.md) | Modular monolith; deploy |
| 12 | [Database & Data Model](./12-database-and-data-model.md) | Entity catalogue summary |
| 13 | [QA & Release Bible](./13-qa-and-release-bible.md) | Gates + T6 commands |
| 14 | [Analytics & Metrics](./14-analytics-and-product-metrics.md) | Event catalogue + gaps |
| 15 | [Delivery Roadmap](./15-delivery-roadmap.md) | Shipped / next / gated / deferred |

---

## Source-of-truth hierarchy

When documents conflict, follow this order:

1. **Build Charter** ([`product/build-charter.md`](./product/build-charter.md))  
2. **Current Scope** ([`product/current-scope.md`](./product/current-scope.md))  
3. **Product Bible** (`docs/00`–`docs/15`) — canonical reading path  
4. **Recorded Product Decisions** ([`product/product-decisions.md`](./product/product-decisions.md))  
5. **Approved engineering detail** (`docs/engineering/*` — data-model, api-contracts, security-model, etc.)  
6. **Long-term product architecture** (`docs/architecture/00`–`07`) — vision; does **not** authorize out-of-scope builds  
7. **Existing implementation**

Long-term architecture describes where DeliverX **may** evolve. It does **not** authorize building features outside the Build Charter.

---

## How existing folders relate

| Path | Role after Product Bible |
| --- | --- |
| `docs/00`–`15` + this README | **Primary** reading path for agents and humans |
| `docs/product/*` | Charter, scope, decisions, [end-to-end journey](./product/end-to-end-journey.md), [e2e journey PRD](./product/prd-end-to-end-journey.md) — still binding |
| `docs/engineering/*` | **Canonical detail** for schema, APIs, security, phases, next steps |
| `docs/architecture/*` | Long-term vision extracts; aspirational where not marked shipped |
| `docs/qa/*` | Release evidence, checklists, findings |

Prefer the numbered bible for orientation. Follow **Canonical detail** links when implementing against schema or contracts.

---

## Agent one-liner

**Read the bible → refuse if out of charter → implement only the next vertical slice.**
