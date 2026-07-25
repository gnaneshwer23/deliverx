# Phase 13 — First remediation batch (proposal only)

**Date:** 2026-07-25  
**Status:** **Proposal — awaiting founder approval. No code or migrations applied in this audit pass.**  
**Batch name:** **DB trust-rail lockdown**  
**Coherence rule:** Security / data integrity / authz at the Postgres boundary for ScoreRuns, Verified attestation columns, and elevated evidence statuses — plus regression/RLS tests. Optional Next.js patch is **out of this batch** unless founder expands scope (keep batch coherent).

---

## Executive summary (pre-batch)

| Area | Verdict |
| --- | --- |
| Overall | Core PI loop works on the **app path**; product-as-marketed and **DB trust boundary** do not yet support external pilot |
| P0 | **8** — three DB integrity holes dominate engineering; honesty/legal/CI dominate ops/copy |
| P1 | **16** — T8 E2E, TD-006, Next advisories, consent-at-DB, UX coherence, AI guard gaps |
| Core workflow | **Complete and verified** via T6 live 26/26 (P0–P7 + T1–T5 hardening); **T8 shipped but E2E unverified** |
| Release | **Testable internally** only |

### P0 findings (engineering + release)

1. Authenticated clients can invent/alter ScoreRuns (`pi_capability_score_runs` ALL RLS, no forbid trigger).  
2. Authenticated clients can self-set Verified columns on `vpp_entries`.  
3. Authenticated clients can insert `platform_verified` evidence transitions.  
4. Priced CTAs + money-back guarantee without Stripe/T9.  
5. Privacy/Terms placeholders.  
6. Unexplained decorative percentages on marketing/auth.  
7. CI workflows disabled (TD-018).  
8. Demo archetype stories read as testimonials.

### P1 findings (selected)

- TD-006 leaked-password OFF; T8 not in T6 harness; Next 16.2.9 highs; cookie policy missing; ScoreRun jargon; Launchpad/Experience marketing depth; multi-shell nav; Command Centre pitch; naming split; review seed; observation consent not in SQL; judgement INSERT under invented runs; AI regex/bypass/citations; password-reset unproven; readinessPct label risk.

### Core workflow status

**Working and live-verified** for the charter candidate loop (Profile → evidence → Experience Day-1 → ScoreRun via engine → SnapshotClaims → Learning ≠ capability → Outcomes honesty → privacy export/delete). Cross-user RLS and purge lockdown hold in live security journeys. **Verified-on via external attestation is implemented but not E2E-proven** in the release harness.

### Release readiness

**Testable internally.** Not controlled pilot / public beta / production — see [`release-plan.md`](./release-plan.md).

### Proposed first batch

**DB trust-rail lockdown** (this document). Honesty copy and founder ops are parallel but **not** in batch 1 scope so the migration stays reviewable and rollback-safe.

---

## Batch 1 scope

### In scope

1. Make **ScoreRuns** engine/service_role-writable only at DB (no authenticated INSERT/UPDATE/DELETE via PostgREST; forbid-mutation trigger with purge bypass pattern consistent with existing `forbid_*` helpers).  
2. Make **Verified-related columns** on `vpp_entries` (`verifier_status`, `evidence_strength`, and any columns that alone can light `deliverxVerified`) **attestation/service_role-only** to mutate.  
3. **Block** authenticated INSERT of evidence status transitions to `platform_verified` (and any other elevated statuses the API already refuses), except service_role / attestation actors.  
4. Add **regression tests**: unit/SQL/RLS-style negatives proving user JWT cannot perform the three bypasses; engine + attestation happy paths still succeed.  
5. Update engineering notes / TD register when implementing (implementation pass — not this audit).

### Out of scope (do not fold in)

- Marketing honesty / Privacy-Terms copy  
- TD-006 / TD-018 founder ops  
- Observation consent SQL trigger (follow-on)  
- Next.js version bump  
- T8 E2E harness (recommended immediately **after** or parallel track)  
- UX ScoreRun renaming  
- T9 / Stripe

---

## Affected files (expected)

| Area | Paths |
| --- | --- |
| **Migration** | `supabase/migrations/0095_db_trust_rail_lockdown.sql` (name may vary; **next number after `0094`**) |
| Capability persist | `src/lib/capability-engine/persist.ts` (confirm service role / admin client already used; adjust if user-scoped client writes ScoreRuns) |
| Attestation | `src/lib/external-attestation/store.ts`, `verified-gate.ts` |
| Portfolio store | `src/lib/verified-portfolio/store.ts` (client update guards already reject attestation fields — keep; DB must enforce) |
| Evidence API | `src/app/api/pi/evidence/[id]/route.ts` (already rejects `platform_verified`; align transition writers that use service role for attestation) |
| Privacy cascade | `src/lib/pi-privacy/cascade-map.ts` (usually unchanged; verify purge still deletes ScoreRuns via service_role) |
| Tests | `src/lib/capability-engine/*.test.ts`, `src/lib/external-attestation/attestation.test.ts`, `src/lib/verified-portfolio/*.test.ts`, `e2e/t6-security-journeys.test.ts` (extend PostgREST negatives), possibly new `src/lib/**/trust-rail-rls.test.ts` |
| Docs (implement pass) | `docs/engineering/technical-debt-register.md`, `docs/qa/security-findings.md`, `docs/qa/release-readiness.md` |

---

## Migration impact

- **Additive hardening** on existing tables: new triggers and/or RLS policy replacements; revoke UPDATE/DELETE/INSERT for `authenticated` where appropriate; keep `service_role` able to write for Capability Engine, attestation confirm, and privacy purge.  
- **No** intentional data rewrite; person PI tables are largely empty post-T6 purge — low data-migration risk.  
- **Compatibility:** Any code path that currently inserts ScoreRuns or attestation columns with the **user** Supabase client will break and must switch to admin/service client (desired).  
- Apply to local → staging → prod with advisors re-check after.

---

## Risks

| Risk | Mitigation |
| --- | --- |
| Engine persist uses user-scoped client → ScoreRun creation fails in UI | Audit `persist.ts` before migrate; fix to service_role in same PR |
| Attestation confirm fails if not service_role | Confirm `store.ts` already uses admin client for elevated writes |
| Over-restrictive trigger blocks legitimate dispute/withdraw transitions | Allowlist only elevated statuses; keep user withdraw/dispute paths |
| Purge cannot delete ScoreRuns | Preserve purge bypass flag pattern used by other `forbid_*` triggers |
| False confidence if tests only mock app layer | Include PostgREST-with-JWT negative probes (live or local Supabase) |

---

## Acceptance criteria

1. With a normal user JWT against PostgREST: **cannot** INSERT/UPDATE/DELETE `pi_capability_score_runs`.  
2. With a normal user JWT: **cannot** UPDATE `vpp_entries` to `verifier_status=externally_attested` and/or `evidence_strength=externally_verified`.  
3. With a normal user JWT: **cannot** INSERT `pi_evidence_status_transitions` with `to_status=platform_verified`.  
4. Capability Engine persist path still creates ScoreRuns + judgements + snapshots; Profile/Career still read SnapshotClaims.  
5. External attestation confirm path (service_role) still sets attestation columns and can append `platform_verified` / external verification evidence as designed; `deliverxVerified` lights only via that path when kill switch on.  
6. Privacy purge still clears person ScoreRuns / VPP / transitions.  
7. `npm run test:pi` and `npm run test:release-gate` PASS; new negatives included in always-on or documented live security suite.  
8. Live T6 loop still PASS if secrets available (`test:release-gate:live` / `test:e2e:t6`).  
9. Docs note DB-P0-01/02/03 closed.

---

## Rollback plan

1. **Do not** leave half-applied policies: if migrate fails mid-way, `supabase db reset` local; on remote use reverse migration or restore from backup snapshot taken pre-apply.  
2. Ship a paired **`0095_rollback`** note or down migration that: drops new triggers; restores prior RLS policies from `0094`/origin definitions (copy exact prior policy SQL into rollback file during implementation).  
3. Feature flag is **not** sufficient alone — RLS must be reverted in DB.  
4. After rollback: re-run release gate; confirm app path still works; re-open DB-P0 items in TD register.  
5. Prefer blue/green: apply on branch DB / preview first when available.

---

## Verification commands

```bash
# Before / after implementation
npm run test:pi
npm run test:release-gate
npm run build

# Live core loop (optional secrets)
T6_E2E=1 T6_BASE_URL=https://www.deliverx.dev npm run test:e2e:t6

# After migration on target DB — PostgREST negatives (implementation will encode as tests)
# Expect: 401/403 or empty error from policy for ScoreRun insert, VPP attestation update,
# and platform_verified transition insert using user JWT (not service_role).

npm audit   # informational; Next bump not required for batch 1 pass
```

Supabase: re-run security advisors; confirm no new anon EXECUTE on DEFINER mutators.

---

## Founder decision required

Approve **Batch 1 — DB trust-rail lockdown** as the next vertical engineering slice under the Build Charter (pilot trust hardening).  

**No code changed in this audit; awaiting founder approval for batch 1.**
