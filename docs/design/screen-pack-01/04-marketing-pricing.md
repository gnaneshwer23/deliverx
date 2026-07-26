# 04 — Marketing Pricing

> **DESIGN-COMPLETE / BUILD-GATED — DO NOT PUBLISH OR ENABLE PURCHASE**
>
> The founder draft amounts below (£500 / £250 / £500 / £800) are **proposed commercial packaging**, not the accepted T9 catalogue (£39/month Experience, £39/month Launchpad, £59/month Complete Journey). Cadence, tax treatment, entitlement mapping and the role of Team Copilot are unresolved. Public money UI or purchasable CTAs require: (1) a new product decision superseding or reconciling PD-2026-07-26d, (2) live Stripe products/prices and webhook, (3) successful test and live checkout smoke, and (4) an explicit `DELIVERX_BILLING_ENFORCE` decision. Until then, the existing page must keep config-gated pilot access copy. No money-back or job guarantee.

## Screen: Proposed pricing and packaging

**Product area:** Marketing / Commercial
**Route:** `/pricing`
**Primary user:** Professional comparing ways to access DeliverX
**Purpose:** Design a clear future money UI while preserving current commercial honesty.

**Primary user question:** “What do I get, what does it cost, and can I buy it now?”
**Immediate understanding:** Four packages are proposed, but they are not available to purchase until checkout and entitlements are operational and approved.

**Primary action:** Current gated state: Join the pilot
**Secondary action:** Compare what is included
**Future purchase action:** Start checkout — must remain absent/disabled until all gates pass.
**Required data / source / permissions:** Billing catalogue + `isCheckoutReady`; founder-approved packaging decision; Stripe price metadata; anonymous marketing read. Never infer readiness from client-only env.
**Layout:** Header; internal/gated banner in prototype; hero; package table; comparison; billing explanation; no-guarantee disclosure; FAQ; CTA; footer. No context panel.
**Components:** CommercialGateBanner, PricingCards, ComparisonTable, BillingDisclosure, NoGuaranteeNotice, FAQ, CTA.

### Proposed packaging for design exploration

| Package | Draft amount | Draft role | Commercial status |
| --- | ---: | --- | --- |
| Experience | £500 | Build practical experience through company work | Provisional; cadence and entitlement unresolved |
| Launchpad | £250 | Package evidence and prepare career moves | Provisional; cadence and entitlement unresolved |
| Team Copilot | £500 | Collaborative delivery direction | Provisional and conflicts with “Workspace included, not fourth SKU” unless explicitly reconciled |
| Complete Journey | £800 | Connected Experience + Launchpad + Workspace | Provisional; bundle composition unresolved |

**States**
- **Loading:** Show package skeletons without amounts until server catalogue resolves.
- **Empty:** If no approved price catalogue, show pilot access only; never zero-price cards.
- **Partial:** If any required Stripe price is missing, suppress all purchase CTAs and public amounts.
- **Success:** Future only: Stripe return confirms session receipt, not entitlement until webhook state is available.
- **Error:** Keep comparison readable; say checkout is unavailable; never imply payment succeeded.
- **Permission denied:** Billing portal requires authenticated owner; redirect through login preserving destination.

### Desktop wireframe

```text
┌ Header ┐
│ INTERNAL PROTOTYPE: proposed packaging; purchase disabled                     │
│ Choose the part of the journey you need                                       │
├ Experience £500 | Launchpad £250 | Team Copilot £500 | Complete £800          │
│ summary          | summary         | summary            | summary               │
│ [Join pilot]     | [Join pilot]    | [Join pilot]       | [Join pilot]          │
├ Comparison table: evidence / tools / workspace / portfolio / support           │
├ How billing would work: Stripe · entitlements · cancellation                   │
├ No money-back guarantee · no job guarantee                                     │
└ FAQ + footer                                                                    │
```

### Mobile wireframe

```text
┌ Header ┐
│ Gated prototype banner                   │
│ H1 + commercial status                   │
├ Package selector                         │
│ selected package detail + [Join pilot]   │
├ Comparison as labelled feature groups    │
├ Billing disclosure                       │
├ No-guarantee notice                      │
└ FAQ + footer                             │
```

**Accessibility:** Table has caption/headers; mobile comparison becomes labelled groups; amounts include currency and cadence once approved; disabled controls explain why; error and success messages announced.
**Analytics events:** Proposed `pricing_package_viewed(package)` and `pricing_pilot_cta_clicked(package)`; future checkout event must only fire after server-created Checkout session. No payment identifiers in marketing analytics.
**Acceptance criteria**
- Gated prototype unmistakably says packaging is proposed and purchase is unavailable.
- Production fallback contains no proposed £ amounts or disabled “Buy” theatre.
- No package can be purchased until server-side checkout readiness and approval gates pass.
- Team Copilot cannot silently become a fourth SKU.
- No refund, money-back, interview, salary or job guarantee.
- Payment success and entitlement success are distinct states.

**Related screens:** Product pages, Sign up, future Checkout, Settings → Billing.
**Cursor implementation notes:** This file is a design reference only. Do not change `career-suite.ts`, billing catalogue, Stripe env, `/billing/checkout`, public prices, or enforcement. A future implementation prompt must cite the superseding packaging PD.

## PROVISIONAL COPY

**Headline:** Choose the part of your professional journey you need.

**Support:** Build practical experience, strengthen how you present it, or follow the connected journey. The packages and amounts below are proposed and are not currently available to purchase.

**Package CTAs while gated:** Join the pilot

**Billing disclosure:** Paid access will be offered only when Stripe Checkout, Customer Portal and webhook-derived entitlements are live and tested. DeliverX will not store full card numbers.

**Guarantee disclosure:** DeliverX does not offer a money-back or job guarantee. We provide realistic work, evidence tooling and career preparation; outcomes depend on the market, your effort and how you use your record.
