# Phase 11 — Missing functionality register

**Date:** 2026-07-25  
**Companion:** [`feature-completeness-matrix.md`](./feature-completeness-matrix.md)  
**Rule:** Only gaps with evidence. Prefer charter hardening over new SKUs.

Severity: **P0** trust/commercial/CI · **P1** pilot trust · **P2** polish · **P3** nice-to-have

---

## P0 — Fix or stop claiming now

| ID | Gap | Evidence | Impact | Recommended action | Milestone |
| --- | --- | --- | --- | --- | --- |
| MF-001 | Marketing prices + money-back guarantee without billing | `/pricing` shows £500/£250/£500/£800; `GUARANTEE` copy; **no Stripe**; T9 blocked | Legal / trust | Remove prices & guarantee **or** label “pilot — not for sale” until T9 founder approval | Now (TD-011) |
| MF-002 | Homepage/product includes overclaim Launchpad breadth | `LAUNCHPAD_INCLUDES` lists salary insights, AI mock interviews, job readiness score; modules thin | False expectation | Rewrite includes to shipped readiness + labelled heuristics | Now |
| MF-003 | CI workflows disabled | TD-018; `verify.yml` / `ci-e2e.yml` disabled | Regressions silent | Restore Actions minutes → enable workflows → re-add `on.push` | Founder ops |
| MF-004 | Demo stories read as testimonials | `DEMO_STORIES` archetypes on homepage; `PILOT_QUOTE.enabled=false` | Misleading social proof | Relabel as “example journeys” or hide | Now |

---

## P1 — Pilot trust / compliance

| ID | Gap | Evidence | Impact | Recommended action | Milestone |
| --- | --- | --- | --- | --- | --- |
| MF-010 | Cookie consent + `/cookies` policy missing | HTTP 404; no CookieBanner | GDPR risk (esp. Vercel Analytics) | Add policy page + consent if legally required | Ops/legal |
| MF-011 | Leaked-password protection off | Supabase advisor WARN `auth_leaked_password_protection` | Weak passwords | Founder Auth Attack Protection toggle (TD-006) | Now |
| MF-012 | T8 attestation E2E not in release harness | T6 asserts Verified off only; 0 attestation rows; no attest journey test | Verified path unproven under automation | Extend harness: request → attest confirm → Verified on → dispute | Engineering now |
| MF-013 | Unlabeled decorative % risk on Career UI | `readinessPct` rendered; honesty helpers exist | Trust if labels stripped | Audit UI for missing `readinessSource` labels | Copy/eng |
| MF-014 | Password-reset email not proven this audit | Forms exist; no mail sink run | Recovery may fail in prod | Founder send test reset | Ops |
| MF-015 | Experience marketing ≠ Day-1 planner depth | “AI-powered companies / months of work” vs verified Day-1 path | Expectation gap | Align Experience marketing to planner+catalogue truth | Copy |

---

## P2 — Partial / thin (acceptable for pilot if honest)

| ID | Gap | Evidence | Action |
| --- | --- | --- | --- |
| MF-020 | Human review workflow not default gate | `pi_review_*` 0 rows; rule-based verification | Document; optional ops |
| MF-021 | Framework seed thin (3 competencies) | SQL + TD-007 | Founder breadth decision |
| MF-022 | Org departments/teams unused | 0093 tables 0 rows | Seed when Workspace pilot needs |
| MF-023 | Experience→workspace dual-write incomplete | TD-012 | Wire high-traffic pages only |
| MF-024 | Social OAuth not offered | No provider buttons | Keep Not required unless ICP needs |
| MF-025 | Product analytics event catalogue missing | Only `role_chip_click` | Define 5–10 pilot events |
| MF-026 | Admin review console thin | `/pi/review/admin` | Harden when cases appear |
| MF-027 | Full Mermaid ER unpublished | TD-013 | Docs debt |
| MF-028 | Edge proxy anonymous guards weak | TD-003; layouts own redirects | Documented defer |
| MF-029 | Test-fixture ESLint/tsc debt | TD-017; prod build clean | Clear before CI returns |
| MF-030 | Launchpad CV / interview depth | Modules present; not LIVE-proven | Manual QA or extend harness |
| MF-031 | Mobile / a11y device testing | BLOCKED this audit | Founder visual pass optional |

---

## Deferred by scope (do not build under current charter)

| ID | Item | Why blocked |
| --- | --- | --- |
| MF-D01 | T9 Stripe / commercial packaging | Build Charter — separate founder approval |
| MF-D02 | Employer marketplace liquidity | Out of scope |
| MF-D03 | Enterprise mission-control expansion | T7 demoted; not third SKU |
| MF-D04 | Multi-profession frameworks | Founder gate |
| MF-D05 | Graph DB / microservice split | Taxonomy only |
| MF-D06 | First-class `messages` table | Explicit non-goal |
| MF-D07 | Networking / hiring-manager OS | Launchpad deferred modules |
| MF-D08 | Progressive feature-flag SaaS | TD-008 deferred; env gates enough |
| MF-D09 | Job guarantee | Explicitly disclaimed in FAQ — keep |

---

## Not missing (closed / verified) — do not re-open without evidence

| Item | Evidence |
| --- | --- |
| Signed-in P0–P7 loop | LIVE 18/18 |
| Unauth API/page gates | LIVE + RG |
| RLS cross-user evidence isolation | LIVE security |
| Purge RPC lockdown | LIVE security |
| Learning/outcomes cannot write capability | LIVE security |
| Privacy export/delete | LIVE #17–18 |
| Consent default OFF | LIVE #06 |
| Verified off without attestation | LIVE throughout |
| TD-001 signed-in E2E | Closed by T6 |

---

## BLOCKED items this audit (explicit)

| Blocked work | Why | What would unblock |
| --- | --- | --- |
| Interactive multi-role browser UX | Not needed for functional seal; optional founder | Human session |
| Mobile device lab | No device farm in agent env | BrowserStack / founder phone |
| Real email verification / reset delivery | No mail capture | Supabase email logs + test inbox |
| Live T8 attestor confirm → Verified on | Not in harness; would create real attestation artefacts | Extend `e2e/t0-signed-in-loop` or new `e2e/t8-attestation.test.ts` |
| Playwright 17-step delivery OS acceptance | Out of PI charter; CI disabled | Re-enable `ci-e2e.yml` if still relevant |
| Claiming marketing pages “working as sold” | Copy ahead of product | TD-011 honesty pass |

---

## Recommended next actions (ordered)

1. **Founder:** TD-018 restore Actions minutes; TD-006 leaked-password toggle.  
2. **Engineering:** TD-011 marketing honesty (prices, guarantee, Launchpad includes, demo stories).  
3. **Engineering:** T8 attestation automated journey into release gate.  
4. **Ops/legal:** Cookie policy + consent decision.  
5. **Do not:** Start T9 / Stripe / marketplace / mission-control expansion.
