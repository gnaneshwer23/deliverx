# Audit release readiness — Phases 12–13 synthesis

**Date:** 2026-07-25  
**Authority:** Build Charter · Current Scope · Product Bible `13` · this audit  
**Companions:** [`executive-audit-report.md`](./executive-audit-report.md) · [`release-plan.md`](./release-plan.md) · [`remediation-roadmap.md`](./remediation-roadmap.md) · [`first-remediation-batch.md`](./first-remediation-batch.md)  
**Relation to** [`../qa/release-readiness.md`](../qa/release-readiness.md): that file seals **T6 functional automation**. This file states **product release posture after full audit**, including honesty, legal, CI, and **DB trust boundary**.

---

## Single release status

# Testable internally

| Status | Allowed? | Why |
| --- | --- | --- |
| Not testable | No | Core loop is live-verified |
| **Testable internally** | **Yes — selected** | T6 + units prove app-path loop; founders/engineers can exercise product |
| Ready for controlled pilot | **No** | Honesty/legal P0s closed in Batch 2; CI still off, T8 E2E and founder ops remain |
| Ready for public beta | **No** | Above + a11y/Next/cookie/ops gaps |
| Ready for production | **No** | Charter + evidence |

---

## Gate matrix (audit)

| Gate | Evidence | Result |
| --- | --- | --- |
| Build Charter active | `docs/product/build-charter.md` | Pass |
| Core loop E2E (app) | Batch 4 live gate 40/40 (18 loop + 12 security + 10 T8 attestation) | Pass |
| Release gate manual | 263 PI + unauth + security | Pass |
| Full `npm test` | 941 pass / 25 skip | Pass |
| Migrations head | `0095_db_trust_rail_lockdown` on prod | Pass (head) |
| Unauth pages/APIs | LIVE + HTTP | Pass |
| Purge / anon EXECUTE | Prod SQL | Pass |
| Learning ≠ capability | LIVE + CHECK | Pass |
| Verified off without attestation (app) | LIVE | Pass |
| Verified off without attestation (**DB**) | protected-column trigger + service-role-only RPC; live owner/non-owner negatives | **Pass** |
| Capability only via engine (**DB**) | SELECT-only owner RLS + DML revoke + immutable trigger; live negatives | **Pass** |
| Evidence verification honesty (**DB**) | RLS exclusion + elevated-status trigger + service-role-only RPC | **Pass** |
| Marketing commercial honesty | Pilot access; no £ checkout prices; no money-back offer; Launchpad includes match Career Intelligence | **Pass — Batch 2** |
| Privacy / Terms / Cookies | Interim pilot policies with practice-accurate markers | **Pass — Batch 2** |
| UX language honesty | ScoreRun→assessment labels; Career Intelligence naming; review seed removed; readiness source labels | **Pass — Batch 3** |
| T8 E2E Verified-on | `e2e/t8-attestation.test.ts` in live gate; attestor confirm → Verified; negatives + private-leak + Batch-1 DB denial | **Pass — Batch 4** (10/10 live) |
| Next.js security advisories | Upgraded `16.2.9`→`16.2.12` (≥16.2.11); proxy/SSRF/DoS class closed | **Pass — Batch 4** |
| Continuous CI | TD-018 disabled workflows | **Fail** (founder) |
| TD-006 HIBP | Advisor WARN | **Fail** (ops, founder) |
| WCAG 2.2 AA | A11y audit | **Fail** (do not claim) |
| T9 / Stripe | Charter block | N/A (correctly absent) |

---

## Distinguish carefully

| Claim | Verdict |
| --- | --- |
| “Core evidence loop works” | **True** (app path, automated live) |
| “Capability Engine is the only ScoreRun writer” | **True in app and DB** after `0095` |
| “Verified requires attestation” | **True in app and DB** after `0095` |
| “T8 shipped” | **True** (code/docs/`0094`) |
| “T8 E2E verified” | **True — Batch 4** (live attestor → Verified 10/10) |
| “Ready for pilot users” | **Closer** — DB + honesty/legal + UX language + T8 E2E + Next security Batches 1–4 shipped; remaining gates are founder ops (CI/TD-006) and a11y |
| “Ready to sell” | **False** — T9 blocked; prices must not imply purchase |

---

## Path to controlled pilot (minimum)

1. **Completed:** Batch 1 — DB trust-rail lockdown (`0095` + live RLS tests).
2. **Completed:** Batch 2 — product honesty + legal surface (pilot access; no money-back; decorative % removed; illustrative stories; Launchpad includes; interim Privacy/Terms/Cookies).
3. **Completed:** Batch 3 — UX language (ScoreRun→assessment; Command Centre demotion on Workspace home; Career Intelligence naming; review seed removed; metadata; readiness labels).
4. **Completed:** Batch 4 — pilot seal engineering (Next `16.2.9`→`16.2.12` closing proxy/SSRF/DoS advisories; T8 attestation→Verified live E2E in the release gate).
5. Founder: TD-006 and either restore CI or named manual gate cadence.
6. Invite-only cohort; no public paid CTA.

Detail: [`release-plan.md`](./release-plan.md) exit criteria **B**.

---

## Finding tally

| Severity | Count |
| --- | ---: |
| P0 Blocker | 8 |
| P1 Critical | 16 |
| P2 Major | 18 |
| P3 Minor | 8 |
| P4 Future | 9 |

---

## First remediation batch

**Name:** DB trust-rail lockdown  
**Doc:** [`first-remediation-batch.md`](./first-remediation-batch.md)  
**Migration slot:** `0095` (after `0094`)  
**Status:** **Shipped** — migration `0095` applied to production; app write paths deployed; local and live gates pass.

---

## Verification commands (current baseline)

```bash
npm test
npm run test:release-gate
T6_E2E=1 T6_BASE_URL=https://www.deliverx.dev npm run test:e2e:t6   # when secrets present
T6_E2E=1 T6_BASE_URL=https://www.deliverx.dev npm run test:e2e:t8   # T8 attestation → Verified
T6_BASE_URL=https://www.deliverx.dev npm run test:release-gate:live # full live gate (40/40)
npm run build
```

Do not treat a green manual gate as continuous assurance while workflows remain disabled.
