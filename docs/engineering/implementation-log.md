# Implementation Log — PI Pivot P0–P7

Ship log for the Professional Intelligence candidate loop. SHAs are from `main` history (July 2026).

**Production:** https://www.deliverx.dev  
**Supabase:** `jibmyxaldetyycmtlxet`  
**Migrations:** `0066`–`0091`  
**Post-ship HEAD (audit):** `f3ac383`

---

## Foundations (pre-phase packaging)

| SHA | Summary | Migrations / notes |
| --- | --- | --- |
| `6acb8d9` | feat(pi): Professional Intelligence foundations + wire ScoreRun/evidence loop | Ledger + engine foundations |
| `bff9d2d` | fix(pi): seed admin framework before immutability triggers | Seed ordering |

---

## P0–P3

| SHA | Summary | Migrations |
| --- | --- | --- |
| `b5ded43` | feat(pi): ship P0–P3 profile, baseline, and Experience planner | `0066`–`0078` family (onboarding, ledger, engine, sim, workspace, portfolio, career, review, admin framework, assessment, planner) |
| `6da1b50` | feat(experience): expand P3 planner to 12-company catalogue | `0079` |
| `3409ec1` | fix(experience): re-export MediFlow generator for production build | build fix |

**P0** — Profile centre, framework pin, evidence relocate  
**P1** — SnapshotClaims coherence  
**P2** — Baseline assessment  
**P3** — Experience planner + 12-company catalogue  

---

## P4

| SHA | Summary | Migrations |
| --- | --- | --- |
| `3e5fd90` | feat(pi): ship P4 continuous Workspace observation under consent | `0080` |

---

## P5

| SHA | Summary | Migrations |
| --- | --- | --- |
| `beebcc3` | feat(pi): ship P5 final assessment, transfer tasks, and growth reports | `0081`+ |
| `ea35e55` | fix(db): split P5 enum migration from body for PG 55P04 | `0081`/`0082` split |

---

## P6

| SHA | Summary | Migrations |
| --- | --- | --- |
| `34442c4` | feat(pi): ship P6 Learning Intelligence with gap→apply CTAs | `0083` |

---

## P7

| SHA | Summary | Migrations |
| --- | --- | --- |
| `bdc7706` | feat(pi): ship P7 real-world outcome loop with honest calibration | `0084`/`0085` |

---

## Post-ship auth hardening (audit)

| SHA | Summary |
| --- | --- |
| `8aff4df` | fix(auth): preserve next path on workspace/settings login redirect |
| `446348e` | fix(auth): edge-redirect workspace/settings with next preserved |
| `2e9673c` | test(auth): cover workspace/settings path guards |
| `f3ac383` | fix(auth): pass loginNext fallbacks for workspace/settings shells |

---

## Technology T0 — Pilot seal (2026-07-25)

| SHA | Summary | Notes |
| --- | --- | --- |
| `c5d2b9f` | docs(qa): T0 signed-in pack + release readiness; fix path headers for coach deep-link | Automated/unauth PASS; signed-in **BLOCKED** (founder login). See `docs/qa/t0-results.md`. TD-001 still open. |

**T0 verdict:** PARTIAL — do not start T1 until T0 PASS or founder override.

---

## Technology T1 — Privacy, consent, export & deletion (2026-07-25)

| SHA | Summary | Migrations / notes |
| --- | --- | --- |
| `22ce7ed` | feat(privacy): T1 person PI export/delete + advisor hygiene | `0086`; `src/lib/pi-privacy/`; `/api/pi/privacy/*`; settings UX; TD-004/005 closed; TD-006 documented |

**T1 verdict:** Shipped under founder override while T0 signed-in QA remains open.

---

## Technology T2 — Framework / rubric coherence (2026-07-25)

| SHA | Summary | Migrations / notes |
| --- | --- | --- |
| `8a41caf` | feat(capability): T2 rubric DB SoT + labelled fallback + golden harness | `0087`; `rubric-resolve-policy`; pin assert on `/api/pi/capability/run`; TD-009 closed |

**T2 verdict:** Shipped. DB `pi_cf_*` preferred for ScoreRuns; `in_code_fallback` labelled + measurable; do not start T3 until asked. T0 signed-in QA remains open.

---

## Technology T3 — Artefact versioning & submission coherence (2026-07-25)

| SHA | Summary | Migrations / notes |
| --- | --- | --- |
| `c2819b3` | Ship T3 artefact versioning + submission coherence | `0088`; `src/lib/artefacts/`; `POST/GET /api/pi/artefacts` + `/[id]/versions`; evidence provenance cites `artefact_version_id`; privacy cascade extended; settings UX panel |
| `9eae533` | Lock down person-purge RPC to service_role (hotfix) | `0089`; revokes anon/authenticated EXECUTE on `pi_privacy_purge_person_data` (default-privilege leak found during T3 access-control check) |

**Scope:** First-class `artefacts` + immutable `artefact_versions` (content hash, user-vs-AI provenance) with append-only prior versions (DB trigger + purge bypass) and an append-only `artefact_status_transitions` submission audit. Evidence citing an artefact must reference a specific version (DB CHECK + app guard). Artefact tables added to the T1 export/purge cascade. Self-only RLS, private by default. No capability writes; observation ≠ evidence.

**Verification:** typecheck (no new errors) · lint clean on touched files · 890 vitest pass (21 new artefact tests) · migrations `0088`/`0089` applied to prod + `list_migrations` confirmed · schema verified (3 tables, 8 policies, RLS on, evidence FK + CHECK, 2 immutability triggers, purge covers versions) · purge RPC now `service_role`-only (anon/authenticated EXECUTE = false) · Vercel prod READY (`deliverx-bpv6yl695`) · unauth smoke: `/api/pi/artefacts` (+`/versions`) 401, `/settings/profile` 307.

**T3 verdict:** Shipped. Do not start T4 (AI agent registry) unless asked. T0 signed-in QA remains open.

---

## Technology T4 — AI orchestration trust layer (2026-07-25)

| SHA | Summary | Migrations / notes |
| --- | --- | --- |
| `5a6e51c` | feat(ai): T4 agent registry, guardrails, provenance, usage log | `0090`; `src/lib/ai-orchestration/`; `GET /api/pi/ai/interactions`; consolidates Experience/Helm/Interview Lab personas |
| `518d405` | fix(ai): OutputValidationResult narrowing for production build | Type-safe `contractFallback`; Vercel prod READY |

**Founder override:** User said `t4` — explicit override of the T0–T3 audit gate while TD-001 signed-in QA remains open; pre-existing typecheck/lint debt (TD-016 residual) not blocking under override.

**Scope:** Formal §11 agent framework without chat-as-DB: role registry (line_manager / stakeholder / observer + experience_coach / workspace_coach / interview_lab), immutable prompt versions, context builder (system instructions separate from org data), structured output contracts, prompt-injection guardrails, authority boundaries (no capability / verified-evidence writes; consequential actions need confirmation), mandatory cost/latency logging on `ai_interactions`. App registry is runtime SoT; DB catalogue seeded for ops. Existing Experience/coach/Helm behaviour wrapped, not rewritten.

**Verification:** focused vitest 16 new orchestration tests (mock-model, injection, output validation, cascade) · migration `0090` (+ purge extend) applied to prod `jibmyxaldetyycmtlxet` (6 agents, 6 prompts, RLS on, purge covers `ai_interactions`, service_role-only EXECUTE) · Vercel prod READY (`4UYPiSFLEtKPLR4hfhJUpbNQ3VLV` / SHA `518d405`) · unauth smoke: `/api/pi/ai/interactions` 401, `/api/pi/artefacts` 401, `/settings/profile` 307. Pre-existing lint debt still fails GitHub `verify` job (not introduced by T4); not blocking under founder override.

**T4 verdict:** Shipped. Do not start T5 (notifications) unless asked. T0 signed-in QA + TD-006/TD-016 remain open.

---

## Technology T5 — Notifications & PI observability (2026-07-25)

| SHA | Summary | Migrations / notes |
| --- | --- | --- |
| `5c71edd` | feat(pi): ship T5 consolidated notifications and observability | `0091`; `src/lib/notifications/`; `GET/PATCH /api/pi/notifications`; Profile bell/list/mark-read; `pi_ai_usage_daily` |

**Founder override:** User said `t5` — T5 shipped while T0 signed-in QA, TD-006 and TD-016 remain open. This does not claim T0 PASS and does not authorise T6.

**Scope:** One self-only person inbox consolidates migrated review history, future review writes, intervention offers and privacy domain events. Every item has an internal contextual route, source identity, idempotency key, delivery timestamp and read state. Organisation Slack/Teams deliveries remain a separate tenant concern; no new email provider or channel fan-out. Notification guards never assign capability or verification. T1 export/purge now includes `pi_notifications`. A `security_invoker` daily AI usage view gives pilot ops token/cost/latency queries without bypassing `ai_interactions` RLS.

**Verification:** 41 focused tests pass (5 new T5 tests); touched-file lint clean; production Next.js build passes. Full Vitest reached 910 pass / 2 skipped with one unrelated `portfolio.test.ts` timeout, then that test passed alone (2/2). Standalone `tsc --noEmit` retains only the documented pre-existing test-fixture errors. Migration `0091_pi_notifications` applied to `jibmyxaldetyycmtlxet`; `pi_notifications` RLS + three self-only policies verified; privacy purge wrapper grants verified anon=false, authenticated=false, service_role=true (old implementation also not client-executable); security advisors show no new T5 finding and existing TD-006/TD-016 warnings remain. Vercel production deployment `dpl_3euGrKM5yLKMqnBnqAM1SyK9pPq4` is READY. Unauth smoke: `/api/pi/notifications` 401, legacy review notifications 401, `/profile` 307 → login.

**T5 verdict:** Shipped. Do not proceed to T6 unless asked. Open debt unchanged.

---

## Security hardening — TD-016 SECURITY DEFINER grants (2026-07-25)

| SHA | Summary | Migration / notes |
| --- | --- | --- |
| `096fb72` | Close anonymous SECURITY DEFINER EXECUTE exposure without breaking RLS | `0092`; anonymous EXECUTE false for all nine inventoried functions; authenticated retained only for three RLS helpers |

**Verification:** production inventory queried from `pg_proc` plus routine/effective privileges · active `pg_policy` dependencies mapped · authenticated read probes unchanged before/after for evidence, artefacts, notifications, ScoreRuns, Workspace, requirements and `pi_cf_*` · rollback-only authenticated inserts passed for evidence, artefacts, notifications and workspace contributions · 914 tests passed (2 skipped) · migration history confirms `0092_security_definer_grants` · advisor 0028 anonymous findings cleared; three advisor 0029 findings intentionally remain for RLS-critical read helpers.

**TD-016 verdict:** Closed. The authenticated findings are a documented, tested RLS requirement rather than unclassified residual exposure.

---

## Technology T6 — Signed-in E2E & release gates (2026-07-25)

| Artefact | Summary |
| --- | --- |
| `e2e/t0-signed-in-loop.test.ts` | Signed-in P0–P7 + T1–T5 happy path (18 steps); disposable user + T1 purge |
| `e2e/t6-security-journeys.test.ts` | Prompt-injection always-on; live RLS / purge denial / no capability write |
| `e2e/t6-unauth-gates.test.ts` | CI-safe 401 + login redirects |
| `scripts/release-gate.mjs` | `npm run test:release-gate` / `:live` |
| `.github/workflows/verify.yml` | T6 release gate job; optional live secrets |
| `docs/qa/*` | end-to-end-audit, acceptance-test-results, security-findings, release-readiness, t0-results |

**Approach:** Option B (prod disposable identity + purge) — local Supabase (Option A) blocked by disk/Docker. No runtime product code changes; no migration; no deploy required.

**Verification:** Live 26/26 pass (`t0` 18 + security 8); release-gate non-live PASS (242 PI units + unauth + security always-on); post-purge person-PI counts = 0.

**T6 verdict:** Shipped. TD-001 closed. T0 PASS (automated). Do not proceed to T7 without founder approval.

---

## Technology T7 — Launchpad & Team Copilot foundations (2026-07-25)

| Artefact | Summary |
| --- | --- |
| `0093_org_structure.sql` | `departments`, `teams`, membership; `is_org_admin` / membership helpers; privacy purge chain; TD-016 grants |
| `src/lib/org-structure/` | Domain lib — no capability/evidence writes |
| `/api/org/structure\|departments\|teams\|members` | Org-member read; org-admin write |
| Launchpad readiness | `mixed` source + labelled % (not capability) |
| Workspace nav | Legacy Mission Control / Ecosystem demoted; opt-in `NEXT_PUBLIC_DELIVERX_LEGACY_WORKSPACE_NAV` |
| PD-2026-07-25 | T7 authorized; T8/T9 still blocked; not third SKU |

**Verification:** focused vitest 249 PI incl. 7 T7 org-structure cases · migration `org_structure` on `jibmyxaldetyycmtlxet` (head after `0092`) · advisors: no anon EXECUTE regression; authenticated 0029 for new RLS helpers (`is_org_admin`, `is_department_member`, `is_team_member`) intentional (same TD-016 posture) · TD-006 WARN unchanged · prod deploy `dpl` Ready (`7f24974`) · unauth smoke 401 on `/api/org/*` · `npm run test:release-gate` PASS (live signed-in suites skipped without `T6_E2E` secrets).

**T7 verdict:** Shipped (founder-authorized). Do not proceed to T8/T9 without separate founder approval. TD-006 remains founder-only.

---

## Technology T8 — External attestation (2026-07-25)

| Artefact | Summary |
| --- | --- |
| `0094_external_attestation.sql` | `vpp_attestation_requests`, `vpp_attestations`, `vpp_attestation_events`; privacy purge chain; TD-016 grants |
| `src/lib/external-attestation/` | Domain lib — gate, privacy view, store; never writes capability |
| `/api/portfolio/entries/[id]/attestations` | Owner request / list / revoke (consent required) |
| `/api/portfolio/attest/[token]` | Public tokenised confirm/dispute; self-attest denied |
| `/portfolio/attest/[token]` | Minimal calm attestor UX |
| Kill switch | `DELIVERX_VERIFIED_BADGE=off` |
| PD-2026-07-25c | T8 authorized; Verified meaning frozen; T9 still blocked |

**Verification:** focused vitest attestation + VPP + privacy cascade · migration `external_attestation` (`0094`) on `jibmyxaldetyycmtlxet` · purge EXECUTE anon/auth false, service_role true · advisors: no anon EXECUTE regression; TD-006 WARN unchanged · intentional authenticated 0029 helpers unchanged · prod deploy Ready (`75295c6`) · unauth smoke: owner attestation APIs 401; public invalid attest token 404; `/portfolio` → login · `npm run test:release-gate` PASS.

**T8 verdict:** Shipped (founder-authorized). Do not proceed to T9 without separate founder approval. TD-006 remains founder-only.

---

## Ops — CI / Vercel failure storm (2026-07-25)

| Source | What failed | Status after fix |
| --- | --- | --- |
| GitHub Actions `verify.yml` | Pre-T6: lint blocked job. Post-T6: runs fail in **0s with zero jobs** (Actions minutes exhausted on private repo). Removing `on.push` insufficient — GitHub still synthesized failures. | Slimmed gate; Playwright → `ci-e2e.yml`; **both workflows `disabled_manually`** until TD-018 minutes restored (`gh workflow enable` + re-add `on.push`). |
| Vercel production | T7 early SHAs (`2b6ef8f`, `5db5ef5`) failed Next typecheck on org create payloads | Fixed on later SHAs; HEAD **READY**; https://www.deliverx.dev HTTP 200 |
| Local gates | — | `test:release-gate` PASS; `npm test` 927 pass; `npm run build` PASS; production `src/` tsc clean; ~16 test-fixture tsc errors remain (TD-017) |

**Emails:** primarily GitHub Actions (0-job failures while minutes exhausted); intermittent Vercel Error during T7 typecheck. Workflows disabled → push no longer creates Actions runs. Product HEAD healthy.

**Verified HEAD:** Vercel production READY; www.deliverx.dev 200; unauth `/profile` → login; `/api/pi/notifications` + `/api/org/structure` 401. Local release-gate / unit / build PASS. Re-enable Actions only after TD-018.

---

## Ops — TD-006 leaked-password protection (2026-07-25)

| Check | Result |
| --- | --- |
| Advisor before | `auth_leaked_password_protection` WARN present on `jibmyxaldetyycmtlxet` |
| MCP enable | Not possible — no Auth-config write tool |
| Management API | `PATCH /v1/projects/{ref}/config/auth` + `password_hibp_enabled: true` documented; blocked here (no `SUPABASE_ACCESS_TOKEN`) |
| Disposition | **Open — founder action required**; runbook [`runbook-leaked-password-protection.md`](./runbook-leaked-password-protection.md) |

Do not mark TD-006 Closed until advisors clear after the dashboard (or PAT) enable.

---

## Remediation Batch 1 — DB trust-rail lockdown (2026-07-25)

| Artefact | Summary |
| --- | --- |
| `0095_db_trust_rail_lockdown.sql` | ScoreRun authenticated DML revoke + immutable trigger; VPP protected-column trigger; elevated evidence trigger; two service-role-only RPCs |
| `b96e538` | Server write paths moved to service-role clients / narrow attestation RPCs; live RLS regressions added |
| `e2e/t6-security-journeys.test.ts` | Owner + non-owner negatives for all three P0s; service-role positives |

**Pre-change write paths:** Capability run, baseline completion, and final completion passed the authenticated SSR client to `persistCapabilityRun`; T8 confirmation already used `createAdminClient` but wrote protected columns and `platform_verified` directly; ordinary evidence transitions used the authenticated client and relied on the API guard.

**Post-change write paths:** all ScoreRun persistence receives `createAdminClient`; T8 uses `pi_apply_vpp_attestation_state` and `pi_append_platform_verified_transition`; ordinary user transitions remain authenticated and cannot request `platform_verified`.

**Verification:** focused 32 pass / 9 live-skipped; touched-file ESLint clean; non-live release gate PASS (248 PI + unauth + security); Next production build PASS; migration head `0095` confirmed on `jibmyxaldetyycmtlxet`; ScoreRun grants show authenticated SELECT but no INSERT/UPDATE/DELETE/TRUNCATE; advisors show no new finding; post-deploy live release gate PASS **30/30** (18 signed-in loop + 12 security, including owner/non-owner negatives and privileged positives).

**Batch 1 verdict:** Shipped. Remaining remediation batches require founder approval; T9 remains blocked.

---

## Remediation Batch 2 — Product honesty + legal surface (2026-07-25)

| Artefact | Summary |
| --- | --- |
| Marketing data | `career-suite`, `homepage-data`, Launchpad/Experience/Workspace pages — pilot access; no £ checkout prices; no money-back offer |
| Auth / landing chrome | Removed decorative 40%/3x/97% authority stats; qualitative principles only |
| Legal | Interim `/privacy`, `/terms`, `/cookies` (+ `/cookie` alias); footer links; no certification overclaims |
| Tests | `src/lib/marketing/marketing-honesty.test.ts` |
| Decision | PD-2026-07-25e |

**Verification:** marketing honesty units PASS; `npm run test:release-gate` PASS (248 PI + unauth + security); `npm run build` PASS.

**Batch 2 verdict:** Shipped. Next remediation batch requires founder approval; T9 remains blocked.

---

## Remediation Batch 3 — UX clarity & product language (2026-07-25)

| Artefact | Summary |
| --- | --- |
| Copy module | `src/lib/ux/capability-assessment-copy.ts` — presentation labels; ScoreRun stays internal |
| App UI | Profile, Evidence, Hub, Career Intelligence, Learning, Portfolio, Baseline/Final, Experience, Outcomes, Workspace coach — human assessment language |
| Naming | Hub + Launchpad app chrome = **Career Intelligence**; `/launchpad` route retained |
| Workspace | Removed Command Centre / Mission Control pitch from Professional Workspace home |
| Review | Removed “Seed sample finding” from PI review queue |
| Metadata | Root title → Professional Intelligence Platform; Launchpad app → Career Intelligence |
| Readiness | Source labels via `readiness-honesty` + Career UI; heuristic never capability truth |
| Tests | `capability-assessment-copy.test.ts`; aggregate/snapshot/matching/plan expectations updated |
| Decision | PD-2026-07-25f |

**Verification:** UX language units PASS; marketing honesty PASS; `npm run test:release-gate` PASS (248 PI + unauth + security); `npm run build` PASS.

**Batch 3 verdict:** Shipped. Next remediation batch requires founder approval; T9 remains blocked.

---

## Remediation Batch 4 — Pilot seal engineering (2026-07-25)

| Artefact | Summary |
| --- | --- |
| `package.json` / lockfile | **Next.js `16.2.9` → `16.2.12`** (+ `eslint-config-next` `16.2.12`); closes the four high advisories (proxy/middleware bypass, SSRF ×2, Server Actions DoS) + five moderate from `v16.2.11` |
| `e2e/t8-attestation.test.ts` | **T8 attestation → Verified E2E** — compile entry → share → request (token) → external attestor confirm → `deliverxVerified` lights; negatives (self-attest, fake token, expired token, consent-required); private evidence never on public share; Batch-1 self-set columns still DB-denied; ledger `external_verification`/`platform_verified` asserted; no ScoreRun written |
| `src/lib/external-attestation/attestation.test.ts` | Always-on unit coverage extended: `pending_external` / `disputed` never light Verified |
| `scripts/release-gate.mjs` | `external-attestation` units added to always-on suite; T8 live suite wired into `--live` |
| `package.json` | `test:pi` includes `external-attestation`; new `test:e2e:t8` |
| Decision | PD-2026-07-25g (Verified E2E gating clarified; kept honest) |

**Next before/after:** `16.2.9` → `16.2.12` (≥16.2.11 required by SEC-P1-01 / R-P1-03). Production Next build clean — no compile breaks. Remaining `npm audit` `next` flag is transitive `postcss`/`sharp` (libvips) only — a separate class from the audited proxy/SSRF/DoS advisories, which are now patched.

**Verification:** `npm run build` PASS (no breaks from bump) · non-live `npm run test:release-gate` PASS (263 PI/unit incl. new external-attestation + attestation-state cases + unauth + security always-on) · **live gate PASS 40/40** against https://www.deliverx.dev (18 signed-in loop + 12 security + 10 T8 attestation), disposable identities purged after each run.

**Batch 4 verdict:** Shipped. Next remediation batch requires founder approval; T9 remains blocked. TD-006 (founder Auth toggle) and TD-018 (founder Actions minutes) remain founder-only — documented, not in scope.

---

## Remediation Batch 5 — Navigation coherence + accessibility (2026-07-26)

| Artefact | Summary |
| --- | --- |
| `ProductSuiteShell` / `product-suite-nav` | Shared journey nav: Hub · Profile · Experience · Launchpad · Workspace · Portfolio |
| Layouts | Hub, Profile, Learning, Career outcomes, Experience app, Launchpad app, Portfolio (auth only) wrap shared shell |
| Workspace chrome | Suite nav in AppNav (xl+) + mobile drawer; skip link; focus trap/Escape on drawer; removed duplicate Alerts/`Full view` |
| Launchpad | MVP-only module nav; mobile horizontal switcher; `h1` = Launchpad |
| Experience | Tool rail under shared shell; green accent alignment; status live region |
| A11y | Named user menu; Escape menus; auth error alerts; skip links; ≥12px chrome labels; auth contrast; focus-visible |
| Dead chrome | Removed unused dark `WorkspaceSidebar` + `sidebar-nav-section` |
| Tests | `product-suite-nav.test.ts`, `accessibility-contract.test.ts` |
| Decision | PD-2026-07-26a |

**Verification:** new units PASS; `npm run test:release-gate` PASS; `npm run build` PASS.

**Batch 5 verdict:** Shipped. Next remediation batch requires founder approval; T9 remains blocked.

---

## Remediation Batch 6 — Residual a11y + honesty polish + TD-017 (2026-07-26)

| Artefact | Summary |
| --- | --- |
| Experience honesty | Removed decorative Experience score / interview readiness %; qualitative setup bands + honesty labels (`setup-signal`) |
| Scenario pulses | Product-app illustrative signals qualitative; sim pulses labelled “scenario — not capability” |
| Demoted surfaces | Twin / PMO / Marketplace banners + Hub CTAs; Twin KPI text alternatives; honest empty marketplace |
| A11y polish | Decorative Lucide `aria-hidden`; alert “View all” hit area; accessibility contracts extended |
| TD-017 | `tsc --noEmit` 0; eslint 0 — fixture types + `scheduleEffectWork` for mount fetches |
| Decision | PD-2026-07-26b |

**Verification:** targeted units PASS; `npx tsc --noEmit` 0; `npm run lint` 0; `npm run test:release-gate` PASS; `npm run build` PASS. Shipped `3b596d9` → production Ready (`www.deliverx.dev`).

**Batch 6 verdict:** Shipped. Next remediation batch requires founder approval. TD-006 / TD-018 remain founder-owned (not flipped). T9 remains blocked.

---

## DB consent enforcement — `0096` (2026-07-26)

| Artefact | Summary |
| --- | --- |
| `0096_consent_enforcement.sql` | INSERT triggers on `workspace_observations` + `workspace_observation` evidence; effective-consent helper; no service-role bypass; capability CHECK |
| App | `consent-errors.ts`; observe/contribution map DB consent denials to `consent_denied` |
| Tests | `consent-enforcement.test.ts`; T6 live consent OFF/ON/override/revoke/cross-user/capability negatives |

**Bypass audit (pre-0096):** Authenticated PostgREST own-row `ALL` on `workspace_observations` and direct `pi_evidence_records` insert with `source_type=workspace_observation` skipped app consent. Service-role likewise bypassed RLS (not triggers). After `0096`, both paths require active consent; other evidence sources unchanged.

**Verification:** focused observation units PASS (30); migration applied to `jibmyxaldetyycmtlxet`; triggers + EXECUTE=false confirmed; advisors introduce no new consent-function findings; non-live release gate PASS (268 PI); build PASS; production deploy Ready (`005f0a9` / follow-up docs `37d3b63`); live release gate PASS (18 signed-in + 14 security incl. consent DB negatives + 10 T8).

**Verdict:** DB consent enforcement shipped. T9 not started.

---

## Not started (charter)

- **P9 / T9** — Commercial (requires separate founder approval)  

Do not append ship rows for P9 until Build Charter authorises them.
