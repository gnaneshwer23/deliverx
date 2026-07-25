# DeliverX Executive Audit Report

**Date:** 2026-07-25  
**HEAD context:** Product Bible landed; specialist audits Phases 1–11 under `docs/audit/`; remediation Batch 1 + Batch 2 shipped; migrations head **`0095`**
**Method:** Synthesis of inventory, UX/a11y, data/security/AI, and performance/test audits against Build Charter, Current Scope, Product Decisions, Product Bible (`00`, `01`, `13`, `15`), technical-debt register, and `docs/qa/release-readiness.md`  
**Lifecycle:** Original audit synthesis followed by founder-approved Remediation Batch 1 (DB) and Batch 2 (honesty + legal).

**Finding counts at audit:** P0 **8** · P1 **16** · P2 **18** · P3 **8** · P4 **9**. **Three DB P0s resolved by Batch 1.** **Honesty/legal P0s (R-P0-04/05/06/08) + cookie/Launchpad marketing P1s (R-P1-04/06) resolved by Batch 2** (see [`remediation-roadmap.md`](./remediation-roadmap.md)).

**Release status (one):** **Testable internally**

**T8:** Shipped (code + `0094` + docs). Units strong. **Not** included in T6 live loop — **shipped but unverified E2E**. Do not claim live attestor → Verified-on proof.

---

## 1. Overall product health

DeliverX’s **Professional Intelligence candidate loop is real**: evidence ledger, Capability Engine ScoreRuns, SnapshotClaims, Experience Day-1 path, consent-default-OFF observation, learning≠capability, outcomes honesty, and privacy export/delete are live-verified on production by T6 (**26/26**). The modular monolith is large (129 pages, 205 API routes, ~94 migrations) with substantial pre-pivot Workspace surface area beside the PI SoT.

Health is **split**:

- **Engine / loop:** Strong for guided internal use.  
- **Trust at DB boundary:** Batch 1 hardened — authenticated PostgREST cannot mutate ScoreRuns, self-set Verified-bearing VPP columns, or append `platform_verified`.
- **Product honesty / legal:** Batch 2 shipped — pilot access CTAs, interim Privacy/Terms/Cookies, no decorative authority %. **CI** remains weak (TD-018).

Charter next work is **ops + trust hardening**, not T9.

---

## 2. What is working

- Signup/signin session, protected routes, unauth API 401s (live).  
- PI onboarding → Profile five-question aggregate.  
- Evidence append + provenance; body immutability triggers.  
- ScoreRun via Capability Engine with `pm-core@2026.1` pin (app path).  
- SnapshotClaims shared across Profile / Career / Portfolio.  
- Experience planner + catalogue; Day-1 decision → ledger.  
- Observation consent default OFF; interventions as drafts.  
- Final/transfer + growth citations; learning cannot assign capability; outcomes not auto-Verified.  
- Artefact versioning + evidence cite; notifications inbox.  
- Privacy export/delete + purge service_role-only (TD-015/016 class closed for purge).  
- T4 AI orchestration contracts (mocked): observer cannot verify; capability write refused on T4 path.  
- T7 alias: Team Copilot = Professional Workspace (not third SKU); org structure tables present.  
- T8 attestation **implementation** present (token flow, Verified gate, kill switch).  
- Automated quantity: **941** pass / 25 skip; release gate **PASS** (242 PI + unauth + security always-on).

---

## 3. What is partially working

- Marketing product pages (live but aspirational includes).  
- Password reset / email verify (code present; delivery not proven this audit).  
- Human review / challenge (tables + UI; 0 cases).  
- Admin framework seed (thin — 3 competencies, TD-007).  
- Launchpad beyond readiness (CV / interview / roadmap modules thin).  
- Workspace delivery OS / org departments (shipped structure, sparse usage).  
- Career readiness % (honesty helpers exist; label risk remains).  
- Observation dual-write from all Workspace pages (TD-012).  
- Accessibility foundations on marketing; authenticated a11y unverified live.  
- SEO / analytics (partial).  
- T8 Verified path (units yes; E2E no).

---

## 4. What is UI only

- Salary insights / networking / hiring-manager style Launchpad marketing claims without real backends.  
- Some Mission Control / Twin / PMO / Marketplace dashboards still routable though demoted.  
- Settings Phase B–H health panels as phase jargon UI.  
- Auth brand panel KPI theatre.  
- Non-MVP Launchpad modules labelled “later”.

---

## 5. What is broken

- **Money-back guarantee** copy with no billing ops (Broken in feature matrix).  
- **CI continuous verification** — workflows disabled (TD-018); gate trustworthy only when run manually.  
- **DB trust invariants** for capability assignment and Verified — **resolved by `0095`**, with live owner/non-owner PostgREST negatives and privileged-path positives.
- Cookie policy route **404** / no consent banner.

---

## 6. What is missing

- Stripe / T9 commercial (correctly deferred).  
- Cookie consent UX.  
- Social OAuth UI.  
- T8 in release harness.  
- Coverage tooling; Playwright/a11y automation in CI.  
- Finished Privacy/Terms.  
- Continuous CI.  
- Employer marketplace / mission-control depth / multi-profession (charter-deferred — not “missing” as bugs).

---

## 7. Security and privacy risks

| Sev | Risk |
| --- | --- |
| Resolved P0 | PostgREST ScoreRun invent/alter — `0095` SELECT-only + DML revoke + immutable trigger |
| Resolved P0 | PostgREST self-Verified — protected-column trigger + service-role-only RPC |
| Resolved P0 | PostgREST `platform_verified` transitions — RLS + trigger + service-role-only RPC |
| P1 | Next.js 16.2.9 high advisories (fix ≥16.2.11) |
| P1 | TD-006 leaked-password protection off |
| P1 | Observation insert without SQL consent |
| P2 | No dedicated PI API rate limit; DEFINER helper surface (intentional reads); pre-pivot purge residue |
| OK | Unauth gates; anon cannot EXECUTE purge; person self-RLS for reads |

`npm audit`: **6 high**, **4 moderate**, **1 low**; **0 critical**.

Privacy design (consent OFF, private evidence default, export/delete) is coherent; integrity bypass undermines Verified honesty and thus privacy *claims*.

---

## 8. AI quality risks

| Sev | Risk |
| --- | --- |
| Hold | T4 path: no capability write; observer cannot mark verified; interactions append-only |
| P1 | Regex injection lists; `DELIVERX_AI_ORCHESTRATION_BYPASS` can skip T4 |
| P1 | Empty citations → recommendations may look evidence-backed |
| P2 | Sparse-context hallucination; no PI rate limit; cost estimates heuristic |

**Critical dependency:** AI layer cannot protect Verified/capability while DB ALL policies remain.

---

## 9. UX and accessibility findings

- Multi-shell IA; Command Centre still pitched; Launchpad vs Career Intelligence naming; ScoreRun jargon; review “Seed sample finding”.  
- Marketing/auth unexplained %; open entitlement vs priced CTAs.  
- **Not WCAG 2.2 AA**; keyboard/authenticated testing blocked. High static issues: icon-only user menu name, login errors without live region, tiny 7–9px text, auth panel contrast risk.

---

## 10. Data integrity findings

**Hold in DB:** evidence body/provenance immutability; judgement/snapshot immutability after write; learning/outcomes CHECKs; artefact version immutability; AI prompt/interaction immutability; purge grants.

**Closed P0 (`0095`):** ScoreRuns are engine/service-role-only; VPP attestation columns require the narrow attestation RPC; elevated evidence status requires the narrow privileged append RPC.

**P1 follow-ons:** consent not in SQL; nullable `framework_version_id`; judgements INSERT own.

---

## 11. Test coverage

- Original audit: **941** pass / **25** skip; live T6 **26/26**. Batch 1: release gate **248 PI**, production build PASS, live gate **30/30** (18 loop + 12 security).  
- Coverage **% unmeasured** (no tooling).  
- Strong: capability engine, ledger, AI orchestration mocks, attestation units, privacy hygiene.  
- Thin/absent: Playwright this pass, a11y automation, AI live eval, signed-in API matrix without live gate, continuous CI.  
- CI disabled ⇒ coverage is a **point-in-time** seal, not continuous assurance.

---

## 12. Core evidence-loop readiness

| Criterion | Status |
| --- | --- |
| E2E app workflow | **Verified** (LIVE) |
| Persistence | **Verified** (then purged) |
| App-path permissions | **Verified** |
| DB-boundary trust | **Verified — Batch 1 live RLS negatives + privileged positives** |
| Marketing match | **Fail** |
| T8 Verified-on | **Shipped, E2E unverified** |

**Core loop readiness for internal testing:** Ready.  
**Core loop readiness for external trust claims (Verified, capability):** Not ready until batch 1.

---

## 13. Release readiness

See [`release-readiness.md`](./release-readiness.md) and [`release-plan.md`](./release-plan.md).

**Single status: Testable internally.**

Prior `docs/qa/release-readiness.md` T6 pilot seal remains valid for **functional signed-in loop automation**. This audit **narrows** external-facing readiness: DB P0s + honesty/legal/CI prevent controlled pilot / beta / production.

---

## 14. Immediate remediation priorities

1. **Batch 1 — DB trust-rail lockdown** (`0095`) — **shipped**; ScoreRuns engine-only, Verified columns attestation-only, and client `platform_verified` blocked.
2. **Batch 2 — Honesty + legal** — **shipped**; pilot access; no money-back; decorative % removed; illustrative stories; Launchpad includes; interim Privacy/Terms/Cookies.
3. **Founder ops** — TD-018 CI minutes; TD-006 HIBP; SMTP reset proof.
4. **T8 E2E** in harness + Next ≥16.2.11.
5. **UX trust** — ScoreRun language, Command Centre demotion, naming, remove review seed.

---

## 15. Recommended next milestone

**M1: DB trust-rail lockdown (Batch 1)** — **shipped**.

**M2: Honesty + legal (Batch 2)** — **shipped**.

After M2: M3 CI seal → M4 T8 E2E → then reassess **controlled pilot**.

---

## Status card

```
Product status:            Split — PI loop strong; honesty + UX language Batches 2–3 shipped; CI/ops remain
Core workflow status:      Complete and verified (app path, T6 26/26); T8 E2E unverified
Security status:           Unauth gates + DB trust rails hold; Next highs P1; TD-006 open
Data integrity status:     Ledger/artefact/learning + ScoreRun/Verified/status rails hold
AI quality status:         T4 contracts hold on path; injection/citations/bypass residual P1
UX status:                 ScoreRun jargon demoted; Career Intelligence naming aligned; review seed removed
Test coverage status:      Strong PI units + live when run; CI off; no coverage %; no a11y auto
Release recommendation:    Testable internally
Top five actions:
  1. Completed: DB trust-rail lockdown (0095 + RLS tests)
  2. Completed: honesty + legal Batch 2 (pilot access, Privacy/Terms/Cookies)
  3. Completed: UX language Batch 3 (assessment labels, Career naming, seed removed)
  4. Founder: restore CI (TD-018) + enable leaked-password (TD-006)
  5. Add T8 attestation E2E to release harness; bump Next ≥16.2.11
```

**Batch 1 shipped. Batch 2 shipped. Batch 3 shipped.** Remaining audit findings retain their original priorities; no T9 work is authorised.
