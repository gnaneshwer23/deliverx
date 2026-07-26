# DeliverX — B0–B9 Outcomes & Efficiency Audit

**As of:** 2026-07-26  
**Audit HEAD:** `2e3d4fd` (`fix(nfr): make PI API rate-limit increments atomic under concurrency`) — matches intended B9 concurrency hardening (`0102`). Working tree clean; `main` = `origin/main` at audit time.  
**Authority:** Build Charter · Current Scope · Product Bible · [`six-doc-build-phases.md`](./six-doc-build-phases.md) · [`remaining-work.md`](./remaining-work.md) §E  
**Companion canvas:** Cursor IDE [`deliverx-b1-b9-outcomes-audit.canvas.tsx`](../../../.cursor/projects/Users-gnaneshwerjadav-Workspace-deliverx/canvases/deliverx-b1-b9-outcomes-audit.canvas.tsx) · repo archive [`canvases/deliverx-b1-b9-outcomes-audit.canvas.tsx`](./canvases/deliverx-b1-b9-outcomes-audit.canvas.tsx)  
**Production:** https://www.deliverx.dev · Supabase `jibmyxaldetyycmtlxet` (migrations cited from implementation-log)

**Method:** Docs + `git log` B1→HEAD + migration/flag inventory + code spot-check (paths, trust guards, `test:pi` inclusion). No new product features. End-to-end re-runs not repeated unless already recorded.

**Classification keys:**

| Layer | Meaning |
| --- | --- |
| **Verified facts** | Paths, commits, migrations, flags, test suites present in-repo; prod apply notes in implementation-log |
| **Product assumptions** | Pack/pilot hypotheses (one org, human-reviewer primary, PRD metric targets) |
| **Efficiency judgments** | Qualitative leverage / overbuild / underbuild assessments |
| **Founder decisions still open** | FD-PACK-1/2/7, founder ops A |

---

## Executive verdict

**B1–B9 delivered the six-doc gap remainder with strong charter discipline:** trust rails intact, no Insights product, no PostHog/Stripe chase, no M0–M7 restart. The candidate loop (Evidence → Capability → PI → Next action) is materially more explainable and operable for pilot. **Pilot-ready: Conditional** — product loop is ready for a controlled pilot; founder ops (CI dark, Auth HIBP, SMTP proof, AT lab, B4 queue flag still off) remain the real gate.

---

## A. Outcomes scorecard

### Grade summary

| Phase | Grade | DoD | Leverage |
| --- | --- | --- | --- |
| B0 | Incomplete | Pending founder | — (docs-only optional) |
| B1 | Strong | Met | High |
| B2 | Strong | Met | High |
| B3 | Adequate | Met (ops dashboards thin) | Med |
| B4 | Adequate | Met (prod queue off) | Med |
| B5 | Strong | Met | High |
| B6 | Adequate | Met | Med |
| B7 | Strong | Met | High |
| B8 | Adequate | Met (+ follow-up `0100`) | Med |
| B9 | Strong | Met (+ concurrency fix `0102`) | High |

---

### B0 — Pack archive (docs only)

| Field | Content |
| --- | --- |
| **Objective (quoted)** | “Founder-accessible pack in-repo without elevating it above Bible.” |
| **What shipped** | Nothing — `docs/build-pack/` absent. Pack intake lives in gap-check + six-doc-build-phases docs/canvases. |
| **DoD met?** | No — optional; blocked on FD-PACK-1/2. |
| **Verification** | Path spot-check: `docs/build-pack` **MISS**. |
| **Residual risk** | SoT confusion if someone treats Desktop pack as higher than Bible (mitigated by CX-03 modify + agent rules). |
| **Outcome grade** | **Incomplete** (intentionally deferred). |
| **Efficiency** | Correct non-spend until founder asks. |

---

### B1 — Confidence-band algorithm

| Field | Content |
| --- | --- |
| **Objective (quoted)** | “Candidates and employers can understand confidence bands without pseudo-% theatre.” |
| **What shipped** | `confidence-bands@2026.1`; `src/lib/capability-engine/confidence-bands.ts` + tests; [`confidence-band-algorithm.md`](./confidence-band-algorithm.md); Profile/Career/Portfolio/Evidence “Why this band”; PD-2026-07-26e. Commit `f4a7fc5`. |
| **DoD met?** | Yes — versioned algorithm; UI labels; no decorative %; no Verified light. |
| **Verification** | Unit (`confidence-bands.test.ts` in `test:pi`); no migration; no dedicated prod spot-check required (display mapping). |
| **Residual risk** | Low — future band changes need version bump; ScoreRun still never lights Verified. |
| **Outcome grade** | **Strong** |
| **Efficiency** | **High leverage** — small slice, unlocks B2 band citations, closes PACK-E3 / SCH-BANDS. |

---

### B2 — Recommendation state machine

| Field | Content |
| --- | --- |
| **Objective (quoted)** | “Explainable, dismissible next actions with retained rationale (FR-010 literal).” |
| **What shipped** | Migration `0098`; `src/lib/recommendations/`; `GET/POST/PATCH /api/pi/recommendations`; Profile + Career UI; flag `DELIVERX_RECOMMENDATION_SM=on` in Vercel Production + Preview (docs `9e326c9` / `b48a790`). Commit `6574449`. PD-2026-07-26f. |
| **DoD met?** | Yes — SM persisted; dismiss ≠ evidence mutate; flag on in prod. |
| **Verification** | Unit SM + store tests; `test:pi` includes recommendations; prod migration apply recorded; flag enable recorded. No full signed-in E2E dedicated to accept/dismiss in CI (CI dark). |
| **Residual risk** | Low–med — generation is snapshot-derived; quality of “next action” depends on capability depth (`pm-core` thin). |
| **Outcome grade** | **Strong** |
| **Efficiency** | **High leverage** — closes FR-010 / PACK-E2; core of Evidence→Next action loop. |

---

### B3 — Pilot KPI instrumentation (Vercel)

| Field | Content |
| --- | --- |
| **Objective (quoted)** | “Measure activation / loop completion against PRD targets without vanity dashboards.” |
| **What shipped** | `src/lib/analytics/` typed catalogue + PII sanitizer; emit on real state transitions; [`pilot-kpi-instrumentation.md`](./pilot-kpi-instrumentation.md); kill-switch `DELIVERX_ANALYTICS`; PostHog intentionally no-op. Commit `59f32d0`. PD-2026-07-26g. |
| **DoD met?** | Yes for Vercel path — catalogue + emits + no migration/PostHog. |
| **Verification** | Unit kill-switch + sanitizer (`pilot-kpis.test.ts`); **ops confirmation of Vercel custom-event visibility in dashboard not independently re-verified in this audit**. |
| **Residual risk** | Med — events may land in Vercel Analytics but founder still lacks a ready “activation ≥70%” board; FD-PACK-7 PostHog open. |
| **Outcome grade** | **Adequate** |
| **Efficiency** | **Med leverage** — right sink for pilot; value realizes only when founder reads events. Avoided PostHog overbuild. |

---

### B4 — Human reviewer ops (non-Verified)

| Field | Content |
| --- | --- |
| **Objective (quoted)** | “Structured review for disputes/submissions without pretending reviewers light `deliverxVerified`.” |
| **What shipped** | Hardened `/api/pi/review/*`; queue UI; [`reviewer-ops-playbook.md`](./reviewer-ops-playbook.md); trust guards reject Verified/capability; flag default **off**. Commit `52eb654`. PD-2026-07-26h. No new migration (reuses `0073`). |
| **DoD met?** | Yes for code/playbook; **prod queue still founder-off** by design. |
| **Verification** | Strong unit trust + status-machine (`b4-trust.test.ts`); release-gate includes `pi-review`; spot-check of trust-guards source confirms Verified rejection. |
| **Residual risk** | Med ops — unused until flag on; risk of misuse if playbook ignored (mitigated by code guards). |
| **Outcome grade** | **Adequate** (code Strong; pilot utilization Incomplete until flag) |
| **Efficiency** | **Med** — correct CX-04 modify; avoided Verified-path rewrite. Value deferred until ops enable. |

---

### B5 — Eight-step onboarding conversation

| Field | Content |
| --- | --- |
| **Objective (quoted)** | “Clearer first-run personalisation **or** confirm shipped 6-step is enough.” (Founder chose evolve → 8-step.) |
| **What shipped** | Step set `v2-conversation`; migration `0099`; skip on non-essentials; claim labels; review-before-use; flag rollback `v1-six-step`. Commit `a6ac193` (+ caveat fix `0d97790`). PD-2026-07-26i. |
| **DoD met?** | Yes — evolved wizard; cross-set resume; no capability/Verified. |
| **Verification** | Unit step-set/walk/flag; `test:pi` includes `pi-onboarding`; prod `0099` apply recorded. |
| **Residual risk** | Low–med — longer funnel may hurt activation METRICS; mitigated by skips + KPI `steps_skipped`. |
| **Outcome grade** | **Strong** |
| **Efficiency** | **High** — pack shape without rebuild; trust language explicit on self-report. |

---

### B6 — Xperience entry ceremony

| Field | Content |
| --- | --- |
| **Objective (quoted)** | “Coherent company→role→team→project→first activity narrative.” |
| **What shipped** | `xp-entry-ceremony@2026.1`; UI over existing sim state; kill-switch default on; **no migration/API**. Commit `5f7d1f0`. PD-2026-07-26j. |
| **DoD met?** | Yes — reaches first activity; honesty line; no fake evidence. |
| **Verification** | 17 unit tests in `entry-ceremony.test.ts`; `test:pi` includes `xperience`. No dedicated Playwright ceremony journey. |
| **Residual risk** | Low — skippable; some users may skip → Day-1 still works. Depth still Day-1 sim (charter-honest). |
| **Outcome grade** | **Adequate** |
| **Efficiency** | **Med** — UX coherence win; not a capability-loop blocker. Avoided Experience rebuild. |

---

### B7 — Shell global search + help

| Field | Content |
| --- | --- |
| **Objective (quoted)** | “Find profile/evidence/projects without new product Home.” |
| **What shipped** | `src/lib/global-search/`; Cmd/Ctrl+K; `/help`; `GET /api/pi/search` self-only; **no Insights** (catalogue test asserts). Commit `844c81e`. PD-2026-07-26k. |
| **DoD met?** | Yes. |
| **Verification** | Units + cross-user negative intent via owner filters; `test:pi` includes `global-search`. |
| **Residual risk** | Low — search surface area grows with entities; keep owner filters. |
| **Outcome grade** | **Strong** |
| **Efficiency** | **High** — shell utility closes PACK-E7 / UX-SHELL remainder without CX-05 violation. |

---

### B8 — Thin pilot admin

| Field | Content |
| --- | --- |
| **Objective (quoted)** | “Operate one pilot org/project safely without enterprise CMS.” |
| **What shipped** | `/settings/admin`; `src/lib/pilot-admin/`; permissioned org/project APIs; audited; kill-switch + org-admin. Commit `0d1102b`. Follow-up: prod spot-check found creator-only UPDATE RLS → `0100` + fix `f9ca5d7`. PD-2026-07-26l. |
| **DoD met?** | Yes after `0100` — org admins can UPDATE. |
| **Verification** | Units; **signed-in prod spot-check** documented (caught real RLS gap — high-value verify). |
| **Residual risk** | Med — activities still not CMS-managed (intentional thin); org structure seed often empty (R-P2-10). |
| **Outcome grade** | **Adequate** (Strong discipline; thin by design; follow-up needed once) |
| **Efficiency** | **Med** — stayed thin; spot-check paid for itself (`0100`). Not mission-control. |

---

### B9 — Pack-aligned NFR polish (+ atomic fix)

| Field | Content |
| --- | --- |
| **Objective (quoted)** | “Rate-limit / recovery / activity-state honesty matching TRD without new SKUs.” |
| **What shipped** | `0101` counters + `0102` atomic increment RPC; `src/services/piApiRateLimit.ts` + `src/lib/pi/rate-limit-*`; PI error contracts; AI 429 honesty; intervention + Experience activity SM 409. Commits `cd9f656`, `2e3d4fd`. PD-2026-07-26m. |
| **DoD met?** | Yes — documented limits; tests; no trust-rail bypass. Concurrent increment hardened. |
| **Verification** | Unit rate-limit + SM + error contracts; `test:pi` includes `src/lib/pi`; `0101` prod apply recorded. Concurrent re-verify may still be in flight elsewhere — **treat `2e3d4fd` / `0102` as intended hardening**; HEAD at audit = that SHA. |
| **Residual risk** | Med — **TD-018 CI still dark** so continuous proof absent; prune RPC optional (no cron); thresholds may need ops tuning under real pilot load. |
| **Outcome grade** | **Strong** |
| **Efficiency** | **High** — closed R-P2-06 correctly; atomic follow-up shows verify→fix loop working. |

---

## B. Efficiency assessment

### Time/effort vs value (qualitative)

| Phase | Leverage | Notes |
| --- | --- | --- |
| B1 | High | Docs+mapping; unlocks explainability |
| B2 | High | Completes FR-010 loop |
| B3 | Med | Instrumentation without dashboard theater |
| B4 | Med | Code ready; utilization gated |
| B5 | High | Pack onboarding without rebuild |
| B6 | Med | Ceremony polish; skippable |
| B7 | High | Shell findability; CX-05 avoided |
| B8 | Med | Thin admin; one RLS follow-up |
| B9 | High | Abuse/recovery honesty for pilot |
| B0 | N/A | Correctly unspent |

### Overbuild vs charter

| Risk area | Finding |
| --- | --- |
| Mission-control / third SKU | **Avoided** — B8 thin; Team Copilot remains alias. |
| Insights product Home | **Avoided** — B7 explicitly omits; tests assert. |
| PostHog | **Avoided** — FD-PACK-7 still open; Vercel path only. |
| Live payments / Stripe chase | **Avoided** — T9 code remains; Bn did not enable billing. |
| Pack M0–M7 restart | **Avoided** — Bn only Missing/Partial remainder. |
| Schema rename / Prisma | **Avoided**. |

### Underbuild (loop incomplete edges)

| Gap | Impact |
| --- | --- |
| B4 queue flag off | Dispute path unused in prod until founder enable |
| B3 → readable KPI board | Events exist; activation % still not operationally dashboarded |
| Launchpad depth / CV-interview | Still Partial (charter Later — not Bn failure) |
| CI (TD-018) | Continuous verification theater risk — local/Vercel only |
| AT lab | AA claim still blocked |
| `pm-core` depth | Next-action quality ceiling |

### Test/verify cost: paid off vs theater

| Paid off | Theater / thin |
| --- | --- |
| B4 trust-guard units (Verified rejection) | Standalone `tsc` still blocked by pre-existing e2e fixture noise (not Bn) |
| B8 prod spot-check → `0100` | No CI Playwright on Bn surfaces (TD-018) |
| B2 SM + RLS contract tests | B3 “events emit” units ≠ founder saw dashboards |
| B9 unit + atomic follow-up | No load-test of 90/60s under concurrent users |

### Migration / flag discipline

| Artifact | Quality |
| --- | --- |
| Migrations `0098`–`0102` | Sequential, purposeful; `0100`/`0102` are verify-driven follow-ups (good) |
| Flags | Kill-switches with documented defaults; B2 on in prod; B4 off by design; B5/B6/B7/B8/B9 sensible defaults |
| Rollback story | Env flip without redeploy for most; B5 step-set rollback without data migration |

**Judgment:** Migration/flag discipline is **Strong** for a one-day Bn sprint series.

---

## C. System-level outcomes

### Five core pilot questions (qualitative)

| Question | Better after B1–B9? | Evidence |
| --- | --- | --- |
| Who am I professionally here? | Yes | B5 review identity; Profile claims ≠ evidence |
| What evidence do I have? | Yes (prior + B7 find) | Ledger + search |
| What can I claim at what confidence? | Yes | B1 bands + why-copy |
| What should I do next? | Yes | B2 SM next actions |
| How do I enter / operate the sim? | Yes | B6 ceremony; B8 thin admin for operators |

### Evidence → Capability → PI → Next action

| Stage | Completeness |
| --- | --- |
| Evidence | Intact (ledger, artefacts, consent OFF default) |
| Capability | Intact (engine-only writes; ScoreRun pin) |
| PI / explainability | Improved (B1 bands) |
| Next action | **Closed the pack gap** (B2) |
| Loop measurement | Partial (B3 emits; ops board thin) |

### Trust rails

| Rail | Intact? |
| --- | --- |
| Observation ≠ evidence | Yes |
| AI ≠ verified evidence | Yes (citations; B4 citations for AI-assisted review) |
| Capability Engine–only writes | Yes |
| Consent default OFF | Yes (B5/B6 untouched) |
| Verified = T8 attestation only | Yes (B4 guards; CX-04) |
| Learning ≠ capability | Yes (Bn did not reopen) |
| No unexplained decorative % | Yes (B1) |

### Pilot-readiness verdict

**Conditional.**

- **Ready:** Controlled pilot of candidate loop with honest trust language, next actions, onboarding, ceremony, search, thin admin, rate limits.  
- **Not ready to claim:** Continuous CI, whole-product AA, live paid access, PostHog product analytics, always-on human review queue, PRD metric targets as measured KPIs.

---

## D. Open backlog after B1–B9

### Founder ops (priority)

1. **TD-018** — restore GitHub Actions minutes / enable workflows  
2. **TD-006** — Auth leaked-password (HIBP)  
3. **SMTP** password-reset proof  
4. **AT lab** before AA claims  
5. **B4** — set `DELIVERX_REVIEWER_QUEUE=on` when dispute ops needed  
6. **Stripe** — deferred “payments later” (not eng chase)  
7. **FD-PACK-7** — PostHog only if Vercel KPI path insufficient  

### Optional eng

| Item | ROI note |
| --- | --- |
| B0 pack archive | Low until founder wants intake folder |
| R-P1-12 judgement/snapshot INSERT bind | Trust hardening |
| R-P1-13 AI red-team | Trust claims |
| R-P2-16 coverage/Playwright after CI | Continuous quality |
| Rate-limit prune cron (optional) | Ops hygiene if table grows |
| R-P2-10 org structure seed | B8 demos |
| R-P2-05 AI `maxDuration` | Hang/cost |

### Recommended stop / next 1–3 (ROI)

**Stop:** Bn feature expansion, Insights, PostHog-by-default, Stripe eng, mission-control, pack M0–M7 restart.

**Next (ranked):**

1. **Founder TD-018** — highest ROI for protecting everything just shipped  
2. **Founder TD-006 + SMTP** — auth hygiene for real candidates  
3. **Ops: enable B4 flag only if pilot needs dispute path; else leave off** — avoid unused surface; OR run one AT lab pass before marketing AA  

Engineering optional after ops: R-P1-12 or B0 only if founder asks.

---

## E. Evidence appendix

### Commit spine (B1 → HEAD)

```
f4a7fc5 feat(pi): ship B1 versioned confidence-band algorithm
326995d fix(deploy): exclude Cursor canvas files from Next typecheck
6574449 feat(pi): ship B2 recommendation state machine
b48a790 docs: record prod apply of B2 migration 0098
9e326c9 docs: record B2 recommendation flag enabled in production
59f32d0 feat(analytics): ship B3 Vercel pilot KPI instrumentation
52eb654 feat(pi): ship B4 human reviewer ops (non-Verified)
a6ac193 feat(pi): ship B5 eight-step onboarding conversation
0d97790 fix(pi): show limited-data path caveat after optional skips
5f7d1f0 feat(xperience): ship B6 entry ceremony
844c81e feat(shell): ship B7 global search + help
0d1102b feat(admin): ship B8 thin pilot org/project config
f9ca5d7 fix(admin): allow org admins to UPDATE organisation config
cd9f656 feat(nfr): ship B9 rate limits, failure honesty, and activity SM
2e3d4fd fix(nfr): make PI API rate-limit increments atomic under concurrency
```

### Migrations (Bn window)

| Migration | Phase | Role |
| --- | --- | --- |
| `0098_pi_recommendations.sql` | B2 | Recommendation SM |
| `0099_pi_onboarding_step_sets.sql` | B5 | Step-set check widen |
| `0100_organisations_org_admin_update.sql` | B8 follow-up | Org-admin UPDATE RLS |
| `0101_pi_api_rate_limits.sql` | B9 | Per-user counters |
| `0102_pi_api_rate_limit_atomic.sql` | B9 fix | Atomic increment (+ optional prune) |

### Feature flags (Bn)

| Flag | Default / prod note |
| --- | --- |
| `DELIVERX_RECOMMENDATION_SM` | **on** in Vercel Prod+Preview |
| `DELIVERX_ANALYTICS` | vercel path; `off` kill |
| `DELIVERX_REVIEWER_QUEUE` | **off** until founder |
| `DELIVERX_ONBOARDING_STEP_SET` | `v2-conversation` default |
| `DELIVERX_XP_ENTRY_CEREMONY` | **on** kill-switch |
| `DELIVERX_GLOBAL_SEARCH` | **on** kill-switch |
| `DELIVERX_PILOT_ADMIN` | **on** + org-admin gate |
| `DELIVERX_PI_RATE_LIMIT` | **on**; max/window env |

### Spot-check results (this audit)

| Claim | Result |
| --- | --- |
| B1–B9 code modules | **OK** (paths present) |
| `docs/build-pack` (B0) | **MISS** |
| `/settings/admin` | **OK** (`src/app/settings/admin/page.tsx`) |
| B4 Verified guards | **OK** (`trust-guards.ts` + tests) |
| B7 no Insights | **OK** (catalogue + test) |
| `0102` + `rate-limit-atomic.ts` | **OK** at HEAD `2e3d4fd` |
| `test:pi` includes Bn libs | **OK** (analytics, recommendations, pi-onboarding, xperience, global-search, pilot-admin, pi) |

---

## Related

- [`six-doc-build-phases.md`](./six-doc-build-phases.md)  
- [`remaining-work.md`](./remaining-work.md)  
- [`implementation-log.md`](./implementation-log.md)  
- [`../product/current-scope.md`](../product/current-scope.md)  
- [`../product/product-decisions.md`](../product/product-decisions.md)  
