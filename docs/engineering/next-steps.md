# DeliverX — Build next steps

> **Product Bible:** Orientation in [`../README.md`](../README.md). This engineering doc is **canonical detail** for schema/APIs/phases when implementing.

**As of:** 2026-07-26
**Authority:** [`../product/build-charter.md`](../product/build-charter.md) · [`../product/current-scope.md`](../product/current-scope.md)  
**Companion canvas:** Cursor IDE `canvases/deliverx-next-steps.canvas.tsx` (open beside chat)

This plan is grounded in **shipped reality**, not a greenfield vision. T9 is founder-authorized and shipped in code; Stripe payments remain disabled/config-gated until founder ops complete. Marketplace and microservice splits remain unauthorized.

---

## Current reality (verified)

| Track | Status |
| --- | --- |
| Product P0–P8 | **Shipped** — candidate PI loop + external attestation (attestation→Verified live E2E, Batch 4) |
| Technology T0–T9 | **Shipped in code** — migrations through `0097`; T9 founder-authorized 2026-07-26 |
| Next.js | **`16.2.12`** (≥16.2.11) — audited proxy/SSRF/DoS advisories closed (Batch 4) |
| T9 | **Founder-authorized; code shipped** — Stripe live enablement pending founder ops |
| TD-001 | **Closed** (T6 signed-in E2E) |
| TD-016 | **Closed** (`0092`) |
| TD-006 | **Open** — founder Auth leaked-password toggle |
| TD-011 | **Closed (Batches 2–3)** — commercial/marketing honesty + in-app ScoreRun→assessment language |
| R-P1-02 / R-P1-03 | **Closed (Batch 4)** — T8 attestation→Verified live E2E; Next `16.2.12` (≥16.2.11) closes proxy/SSRF/DoS advisories |
| TD-017 | **Open** — test-fixture ESLint / standalone `tsc` debt |
| TD-018 | **Open** — GitHub Actions minutes exhausted; workflows disabled |
| Production | **Healthy** — Vercel READY · https://www.deliverx.dev |
| CI | **Disabled** (`verify.yml`, `ci-e2e.yml`) to stop 0-job failure spam |
| Not authorized | Marketplace liquidity · intelligence microservices · fourth Workspace SKU / enterprise mission-control depth |

---

## A. Do now — authorized; unblocks trust / ops

| # | Step | Owner | Effort | Objective | Why now | Dependency | Acceptance check |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A1 | **Restore GitHub Actions minutes / spending** (TD-018) | **Founder** | S | Billing allows private-repo workflow jobs again | CI is dark; every push previously emailed synthetic failures | None | GitHub billing shows available minutes; new workflow runs can schedule jobs |
| A2 | **Re-enable workflows + restore `on.push`** | Engineering (after A1) | S | `verify.yml` and `ci-e2e.yml` active again | Ops signal without email spam | A1 | `gh workflow list` shows enabled; PR/dispatch (then push) runs real jobs, not 0s |
| A3 | **Enable leaked-password protection** (TD-006) | **Founder** | S | HaveIBeenPwned Auth protection ON | Advisor WARN; pilot auth hygiene; not automatable via agent/MCP | None (parallel to A1) | Supabase advisors clear `auth_leaked_password_protection`; TD-006 marked Closed |
| A4 | **Configure T6 live CI secrets** | Founder / ops + Engineering | S | Live signed-in release-gate job can run in CI | Local/manual live gate exists; CI still skips without secrets | A2 preferred | Secrets set; `test:release-gate:live` (or CI live job) green once |
| A5 | **Founder visual QA of candidate loop** (optional polish) | **Founder** | M | Human judgement of clarity, trust copy, next-action UX | Automated T0 PASS; subjective UI remains open | Prod healthy | Notes filed (defects or “no change”); no claim that visual QA blocks T6 exit |

**Founder one-clicks**

- TD-006: [Auth → Attack Protection](https://supabase.com/dashboard/project/jibmyxaldetyycmtlxet/auth/protection) · runbook [`runbook-leaked-password-protection.md`](./runbook-leaked-password-protection.md)
- TD-018: [GitHub billing](https://github.com/settings/billing) → then `gh workflow enable` both workflows → re-add `on.push` to `verify.yml`

---

## B. Harden before expanding — authorized under charter

Do these **after or in parallel with A** where noted.

| # | Step | Owner | Effort | Objective | Why now | Dependency | Acceptance check |
| --- | --- | --- | --- | --- | --- | --- | --- |
| B1 | **Clear TD-017** (test ESLint + fixture `tsc`) | Engineering | M | Full-repo lint / standalone `tsc` green (or scoped exclude policy documented) | When CI returns, advisory lint should not become a false red; fixtures currently ~16+16 errors | None — **can start immediately** | `eslint` / `tsc --noEmit` clean on previously failing test fixtures; CI advisory → enforceable if desired |
| B2 | **Marketing vs ledger honesty pass** (TD-011) | Engineering | S–M | Align public/in-app Verified copy with T8 meaning (attestation-only) | **Batch 2 shipped** commercial honesty; remaining = in-app ScoreRun/Verified UX language | T8 shipped | No surface implies Verified without attestation; unexplained capability % removed from marketing |
| B3 | **Thin `pm-core` seed deepening** (TD-007) | Engineering | M | Richer competency graph under same `pm-core@2026.1` pin | Improves ScoreRun explainability without multi-profession expansion | **Founder OK** on framework breadth (single-domain deepen vs leave thin) | Seed expanded in DB; ScoreRuns still pin `pm-core@2026.1`; no new professions |
| B4 | **Local Supabase Option A** (when disk allows) | Engineering | L | Disposable E2E against local stack instead of only prod purge | Safer iteration; release-readiness already notes Option A blocked by disk/Docker | Disk/Docker available | `T6_BASE_URL=http://localhost:3000` live gate green |
| B5 | **Defect-driven UX clarity** from A5 notes | Engineering | S–M | Evidence, confidence bands, next actions understandable | Charter allows small clarity fixes | A5 notes (if any) | Each defect has repro + regression where applicable |

---

## C. Founder ops — enable T9 payments

1. In Stripe test mode, create three recurring monthly prices matching PD-2026-07-26d.
2. Set `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and all `STRIPE_PRICE_*` values in Vercel.
3. Register `https://www.deliverx.dev/api/billing/webhook` for checkout + subscription events and set `STRIPE_WEBHOOK_SECRET`.
4. Enable Stripe Customer Portal cancellation.
5. Complete a test-mode checkout; verify webhook event + subscription + entitlement rows and product unlock.
6. Promote equivalent live-mode prices/keys/webhook. Only then set `DELIVERX_BILLING_ENFORCE=on`.

## D. Requires founder approval

Do **not** start without an explicit decision recorded in [`../product/product-decisions.md`](../product/product-decisions.md).

| Item | What it unlocks | Primary risks if rushed |
| --- | --- | --- |
| **Expansion beyond PD-2026-07-26d T9** | Annual/enterprise packaging, tax/VAT automation, fourth SKU | Scope and legal/ops depth |
| **ICP weight (90 days)** | Career vs Workspace investment priority | Wrong surface depth for the actual pilot user |
| **Framework breadth** | Whether TD-007 deepen is enough or multi-profession is needed | Scope explosion outside charter |

**T8 / verification meaning:** Authorized and frozen in PD-2026-07-25c — do not reopen without founder.

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

---

## Ordered execution (dependency + user value)

1. **A1** — Founder restores Actions minutes (TD-018)  
2. **A3** — Founder enables leaked-password (TD-006) — parallel with A1  
3. **A2** — Engineering re-enables CI workflows  
4. **B1** — Engineering clears TD-017 (may start before A2)  
5. **A4** — Wire T6 live secrets once CI can run  
6. **B2** — Copy honesty (TD-011) — parallel anytime  
7. **A5** — Optional founder visual QA  
8. **B3** — Only if founder approves thin seed deepen  
9. **C** — T9 only after separate approval  

---

## Top 5 recommended next actions

1. **Restore GitHub Actions minutes and re-enable workflows (TD-018)** — CI is the ops backbone; founder billing first, then engineering enable.  
2. **Enable Supabase leaked-password protection (TD-006)** — founder one-click; closes the open Auth advisor WARN.  
3. **Configure T6 live CI secrets** — restores automated signed-in release signal once workflows run.  
4. **Clear TD-017 test-fixture lint/tsc debt** — engineering can start immediately so returning CI stays honest.  
5. **Marketing vs ledger honesty pass (TD-011)** — align copy with T8 Verified meaning.

**Founder-only before engineering can finish:** A1 (minutes), A3 (Auth toggle), and any C-item (T9/ICP/seed deepen).  
**Engineering can start immediately:** B1 (TD-017), B2 (TD-011), A2 prep (workflow enable scripts/docs), A5 checklist support.

---

## Related

- [`technical-debt-register.md`](./technical-debt-register.md)  
- [`technology-build-phases.md`](./technology-build-phases.md)  
- [`implementation-log.md`](./implementation-log.md)  
- [`../qa/release-readiness.md`](../qa/release-readiness.md)  
- [`runbook-leaked-password-protection.md`](./runbook-leaked-password-protection.md)  
