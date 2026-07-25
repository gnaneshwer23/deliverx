# Phase 12 — Release plan

**Date:** 2026-07-25  
**Companion:** [`remediation-roadmap.md`](./remediation-roadmap.md) · [`executive-audit-report.md`](./executive-audit-report.md) · [`release-readiness.md`](./release-readiness.md)  
**Prod:** https://www.deliverx.dev · migrations head **`0094`** · next migration slot **`0095`**

---

## Release status (single)

### **Testable internally**

| Dimension | Gate | Met? |
| --- | --- | --- |
| Core PI evidence loop (app path) | T6 live **26/26**; release gate PASS; 941 tests | **Yes** |
| Product honesty (marketing/commercial) | No prices/guarantee without T9; no fake testimonials; labelled % | **No** |
| Legal surfaces | Privacy/Terms finished or clearly draft | **No** |
| Security / data integrity at **DB** boundary | ScoreRuns / Verified / platform_verified locked | **No** (app guards only) |
| Continuous CI | Workflows enabled on push | **No** (TD-018) |
| T8 Verified-on E2E | Attestor confirm in harness | **No** (shipped, unverified E2E) |
| WCAG 2.2 AA | Claimed compliance | **No** |

**Not** Ready for controlled pilot, public beta, or production until at least **DB trust-rail lockdown (batch 1)** + **commercial/legal honesty** land. Internal founder/engineering use of the signed-in loop is appropriate.

---

## Exit criteria by target

### A → Stay: Testable internally (current)

- Local/manual `npm run test:release-gate` PASS  
- Optional live T6 when secrets present  
- No claim of external pilot readiness

### B → Controlled pilot (invite-only)

Must all be true:

1. Batch 1 DB trust rails shipped + RLS regression tests green on prod-shaped DB  
2. Marketing: no sellable prices/money-back without T9; demo stories labelled or hidden; decorative % labelled/removed  
3. Privacy/Terms: founder-approved or explicit pilot draft banner (no finished-policy overclaim)  
4. TD-006 enabled **or** documented accept risk for invite-only cohort  
5. CI restored **or** documented manual gate cadence with named owner  
6. T8: either kill switch OFF for pilot **or** E2E attest journey green  
7. Founder ICP / invite list; no public paid CTA

### C → Public beta

All of B plus:

- CI on push green; live secrets configured when claiming continuous live gate  
- Next ≥16.2.11 (or documented exception)  
- Cookie/consent posture decided with legal  
- ScoreRun jargon + dual naming cleaned on primary surfaces  
- T8 E2E in release gate  
- Accessibility: critical auth/marketing AA gaps closed (A0-*)  
- No unexplained readiness % on Career UI

### D → Production

All of C plus T9 only if founder-approved; ops runbooks; support; formal legal; rate limits; perf pass at real volume — **out of current charter without T9 + ops programme**.

---

## Milestone plan

| Milestone | Goal | Includes | Exit |
| --- | --- | --- | --- |
| **M0** Audit seal | This synthesis committed | Phases 1–13 docs | Done when docs on `main` |
| **M1** Batch 1 — DB trust rails | ScoreRun / Verified / transitions DB-enforced | Migration `0095`, lib/tests | PostgREST negatives pass |
| **M2** Honesty + legal | Marketing matches charter | Copy + Privacy/Terms | No P0 honesty/legal open |
| **M3** Ops seal | CI + Auth hardening | TD-018, TD-006, SMTP check | Continuous or owned manual gate |
| **M4** Verified path proof | T8 E2E + optional Next bump | Harness + deps | Attest → Verified on automated |
| **M5** Pilot UX | Naming, ScoreRun language, Command Centre | Small UX slice | Controlled pilot checklist B |
| **M6** Hardening | Consent SQL, citations, a11y smoke | Follow-on migrations/tests | Public beta checklist C |

**T9** remains a separate founder gate after M5+ trust is stable.

---

## Roles

| Role | Owns |
| --- | --- |
| Founder | Approve batch 1; legal copy; TD-006; TD-018 billing; T9; ICP invite list |
| Engineering | Migrations, RLS tests, honesty copy (non-legal), T8 harness, Next bump |
| Ops | SMTP, CI secrets, cron health |
| Legal (external) | Privacy/Terms final; cookie policy |

---

## Verification commands (ongoing)

```bash
npm test
npm run test:release-gate
# with secrets:
T6_E2E=1 T6_BASE_URL=https://www.deliverx.dev npm run test:e2e:t6
npm run build
npm audit
```

After batch 1, add explicit PostgREST negative probes (documented in Phase 13 proposal) to release gate or security journeys.

---

## Explicit non-goals this plan

- Stripe / paid entitlement (T9)  
- Marketplace liquidity / mission-control expansion  
- Claiming WCAG AA or production readiness without evidence  
- Treating T8 units alone as live Verified-path proof
