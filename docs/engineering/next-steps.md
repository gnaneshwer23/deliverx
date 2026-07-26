# DeliverX — Build next steps

> **Product Bible:** Orientation in [`../README.md`](../README.md). This engineering doc is **canonical detail** for schema/APIs/phases when implementing.

**As of:** 2026-07-26  
**Authority:** [`../product/build-charter.md`](../product/build-charter.md) · [`../product/current-scope.md`](../product/current-scope.md)  
**Master remaining inventory:** [`remaining-work.md`](./remaining-work.md)  
**Companion canvas:** Cursor IDE `canvases/deliverx-remaining-work.canvas.tsx` (open beside chat)

This plan is grounded in **shipped reality**, not a greenfield vision. T9 is founder-authorized and **shipped in code**; **payments later** means live Stripe / entitlement enforcement are deferred founder ops — not missing product engineering. Marketplace and microservice splits remain unauthorized.

---

## Current reality (verified)

| Track | Status |
| --- | --- |
| Product P0–P8 | **Shipped** — candidate PI loop + external attestation (attestation→Verified live E2E, Batch 4) |
| Technology T0–T9 | **Shipped in code** — migrations through `0097`; T9 founder-authorized 2026-07-26 |
| Remediations 1–6 | **Shipped** — DB trust `0095`, honesty/legal, UX language, Next+T8 E2E, nav/a11y, residual a11y + TD-017 |
| DB consent `0096` | **Shipped** |
| AI citations | **Shipped** |
| Next.js | **`16.2.12`** (≥16.2.11) — audited proxy/SSRF/DoS advisories closed (Batch 4) |
| T9 payments | **Deferred founder ops** — code ready; Stripe Dashboard/env/enforce off until founder chooses |
| TD-001 / TD-011 / TD-017 / TD-019 | **Closed** |
| TD-006 | **Open** — founder Auth leaked-password toggle |
| TD-018 | **Open** — GitHub Actions minutes exhausted; workflows disabled |
| Production | **Healthy** — Vercel READY · https://www.deliverx.dev |
| CI | **Disabled** (`verify.yml`, `ci-e2e.yml`) to stop 0-job failure spam |
| Not authorized | Marketplace liquidity · intelligence microservices · fourth Workspace SKU / enterprise mission-control depth |

---

## A. Do now — founder ops (blocks CI / auth hygiene)

| # | Step | Owner | Effort | Objective | Why now | Dependency | Acceptance check |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A1 | **Restore GitHub Actions minutes / spending** (TD-018) | **Founder** | S | Billing allows private-repo workflow jobs again | CI is dark; every push previously emailed synthetic failures | None | GitHub billing shows available minutes; new workflow runs can schedule jobs |
| A2 | **Re-enable workflows + restore `on.push`** | Engineering (after A1) | S | `verify.yml` and `ci-e2e.yml` active again | Ops signal without email spam | A1 | `gh workflow list` shows enabled; PR/dispatch (then push) runs real jobs, not 0s |
| A3 | **Enable leaked-password protection** (TD-006) | **Founder** | S | HaveIBeenPwned Auth protection ON | Advisor WARN; pilot auth hygiene; not automatable via agent/MCP | None (parallel to A1) | Supabase advisors clear `auth_leaked_password_protection`; TD-006 marked Closed |
| A4 | **Configure T6 live CI secrets** | Founder / ops + Engineering | S | Live signed-in release-gate job can run in CI | Local/manual live gate exists; CI still skips without secrets | A2 preferred | Secrets set; `test:release-gate:live` (or CI live job) green once |
| A5 | **SMTP password-reset proof** (R-P1-15) | **Founder** / ops | S | Recovery email received in prod | Forms exist; delivery unproven | None | Reset mail received; note filed |
| A6 | **VoiceOver/keyboard AT lab** (optional before AA claim) | **Founder** (+ eng) | M | Human AT evidence on Hub→Profile→Evidence | Core a11y engineering closed Batch 5–6; whole-product AA not claimed | Prod healthy | Notes filed; no AA claim without this |
| A7 | **Founder visual QA of candidate loop** (optional polish) | **Founder** | M | Human judgement of clarity, trust copy, next-action UX | Automated T0 PASS; subjective UI remains open | Prod healthy | Notes filed (defects or “no change”) |

**Founder one-clicks**

- TD-006: [Auth → Attack Protection](https://supabase.com/dashboard/project/jibmyxaldetyycmtlxet/auth/protection) · runbook [`runbook-leaked-password-protection.md`](./runbook-leaked-password-protection.md)
- TD-018: [GitHub billing](https://github.com/settings/billing) → then `gh workflow enable` both workflows → re-add `on.push` to `verify.yml`

---

## B. Payments later — founder Stripe ops (not eng backlog)

Do **when founder is ready to take payments**. Product code is already shipped (`0097`, Checkout, Portal, webhooks, entitlements). Default `DELIVERX_BILLING_ENFORCE` stays **off**.

1. In Stripe test mode, create three recurring monthly prices matching PD-2026-07-26d.
2. Set `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and all `STRIPE_PRICE_*` values in Vercel.
3. Register `https://www.deliverx.dev/api/billing/webhook` for checkout + subscription events and set `STRIPE_WEBHOOK_SECRET`.
4. Enable Stripe Customer Portal cancellation.
5. Complete a test-mode checkout; verify webhook event + subscription + entitlement rows and product unlock.
6. Promote equivalent live-mode prices/keys/webhook. Only then set `DELIVERX_BILLING_ENFORCE=on`.

Until then: public marketing correctly falls back to pilot access when Stripe price IDs are absent. Do not schedule engineering slices whose only goal is “turn Stripe on.”

---

## C. Harden optionally — authorized residual engineering

Not blocking payments later. Full table: [`remaining-work.md`](./remaining-work.md) §B.

| # | Step | Owner | Effort | Objective | Dependency | Acceptance check |
| --- | --- | --- | --- | --- | --- | --- |
| C1 | **R-P1-12** judgements/snapshots INSERT binding | Engineering | M | Child rows only via engine | Batch 1 done | PostgREST cannot invent children under forged runs |
| C2 | **R-P1-13** AI injection red-team; bypass off prod | Engineering | M | Stronger jailbreak resistance | Config verify | Known injections blocked; bypass off in prod |
| C3 | **R-P2-16** coverage tooling + Playwright/axe in CI | Engineering | M | Continuous quality signal | TD-018 / A2 | Coverage report or axe smoke in CI |
| C4 | **R-P2-06** PI API rate limit | Engineering | M | Abuse / cost resistance | — | **Done (B9)** — `0101` + documented 429 |
| C5 | **TD-007 deepen** thin `pm-core` seed | Engineering | M | Richer explainability, same pin | **Founder OK** | Seed expanded; pin `pm-core@2026.1` holds |
| C6 | Defect-driven UX from A6/A7 notes | Engineering | S–M | Clarity fixes | Founder notes | Repro + regression where applicable |

---

## D. Requires founder approval

Do **not** start without an explicit decision recorded in [`../product/product-decisions.md`](../product/product-decisions.md).

| Item | What it unlocks | Primary risks if rushed |
| --- | --- | --- |
| **Expansion beyond PD-2026-07-26d T9** | Annual/enterprise packaging, tax/VAT automation, fourth SKU | Scope and legal/ops depth |
| **ICP weight (90 days)** | Career vs Workspace investment priority | Wrong surface depth for the actual pilot user |
| **Framework breadth** | Whether TD-007 deepen is enough or multi-profession is needed | Scope explosion outside charter |

**T8 / verification meaning:** Authorized and frozen in PD-2026-07-25c — do not reopen without founder.  
**T9 / SKU model:** Settled in PD-2026-07-26d — live enablement is ops (§B), not a new product decision.

---

## E. Explicitly defer

| Deferred | Why |
| --- | --- |
| Employer marketplace liquidity / opportunity OS | Charter; Launchpad packaging honesty already shipped in T7 |
| Stripe custom card forms | Checkout + Portal are the approved payment surface |
| Lighting `deliverxVerified` without attestation | PD-2026-07-06 / PD-2026-07-25c |
| Graph database | Relational + typed contracts preferred |
| Multi-profession framework platforms | Pilot is `pm-core` |
| Agent swarms / chat-as-DB | Intelligence belongs to the platform |
| Speculative microservice split of “ten intelligence domains” | Taxonomy only until scale requires separation |
| First-class `messages` table | Reuse meetings / contributions / notifications |
| Enterprise mission-control depth / third SKU | T7 settled alias only; mission-control remains demoted |
| Full progressive feature-flag platform (TD-008) | Env gates sufficient for pilot |
| Experience ↔ workspace dual-write everywhere (TD-012) | Low–med; not pilot-blocking |
| Full Mermaid ER publish (TD-013) | Docs polish later |
| Money-back / job guarantee | Explicitly disclaimed — keep out |

---

## Ordered execution

1. **A1** — Founder restores Actions minutes (TD-018)  
2. **A3** — Founder enables leaked-password (TD-006) — parallel with A1  
3. **A2** — Engineering re-enables CI workflows  
4. **A4** — Wire T6 live secrets once CI can run  
5. **A5** — SMTP reset proof — parallel anytime  
6. **A6 / A7** — Optional founder AT / visual QA  
7. **C\*** — Optional residual eng from [`remaining-work.md`](./remaining-work.md) §B as approved  
8. **§B payments later** — Founder Stripe ops only when ready to sell  

---

## Top recommended next actions

1. **Restore GitHub Actions minutes and re-enable workflows (TD-018)** — founder billing first, then engineering enable.  
2. **Enable Supabase leaked-password protection (TD-006)** — founder one-click; clears Auth advisor WARN.  
3. **Prove SMTP password-reset** — founder send test.  
4. **Optional AT lab** — before claiming whole-product WCAG AA.  
5. **Payments later** — founder Stripe ops when ready; do not invent eng work for it.  
6. **Optional eng:** R-P1-12 judgement binding after trust priority.

**Founder-only before continuous CI / auth seal:** A1 (minutes), A3 (Auth toggle).  
**Payments:** founder calendar, not engineering sprint.  
**Document intake:** when new docs arrive, gap-check with [`remaining-work.md`](./remaining-work.md) §D.

---

## Related

- [`remaining-work.md`](./remaining-work.md)  
- [`technical-debt-register.md`](./technical-debt-register.md)  
- [`technology-build-phases.md`](./technology-build-phases.md)  
- [`implementation-log.md`](./implementation-log.md)  
- [`../qa/release-readiness.md`](../qa/release-readiness.md)  
- [`runbook-leaked-password-protection.md`](./runbook-leaked-password-protection.md)  
