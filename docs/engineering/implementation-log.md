# Implementation Log — PI Pivot P0–P7

Ship log for the Professional Intelligence candidate loop. SHAs are from `main` history (July 2026).

**Production:** https://www.deliverx.dev  
**Supabase:** `jibmyxaldetyycmtlxet`  
**Migrations:** `0066`–`0090`  
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
| _(pending commit)_ | feat(ai): T4 agent registry, guardrails, provenance, usage log | `0090`; `src/lib/ai-orchestration/`; `GET /api/pi/ai/interactions`; consolidates Experience/Helm/Interview Lab personas |

**Founder override:** User said `t4` — explicit override of the T0–T3 audit gate while TD-001 signed-in QA remains open; pre-existing typecheck/lint debt (TD-016 residual) not blocking under override.

**Scope:** Formal §11 agent framework without chat-as-DB: role registry (line_manager / stakeholder / observer + experience_coach / workspace_coach / interview_lab), immutable prompt versions, context builder (system instructions separate from org data), structured output contracts, prompt-injection guardrails, authority boundaries (no capability / verified-evidence writes; consequential actions need confirmation), mandatory cost/latency logging on `ai_interactions`. App registry is runtime SoT; DB catalogue seeded for ops. Existing Experience/coach/Helm behaviour wrapped, not rewritten.

**Verification:** focused vitest (mock-model, injection, output validation, cascade) · migration `0090` applied to prod · unauth smoke on `/api/pi/ai/interactions` → 401 · Vercel prod READY.

**T4 verdict:** Shipped. Do not start T5 (notifications) unless asked. T0 signed-in QA + TD-006/TD-016 remain open.

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

## Not started (charter)

- **P8** — External verification / attestation  
- **P9** — Commercial  

Do not append ship rows for P8/P9 until Build Charter authorises them.
