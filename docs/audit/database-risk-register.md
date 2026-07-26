# Database risk register (Phase 5)

**Date:** 2026-07-25 · Prod `jibmyxaldetyycmtlxet`  
**Legend:** P0 = trust-breaking if abused with user JWT; P1 = significant; P2 = hardening; Info = accepted/ops

| ID | Sev | Finding | Evidence | Disposition |
| --- | --- | --- | --- | --- |
| DB-P0-01 | **P0** | Own-row `ALL` RLS on `pi_capability_score_runs` with **no** forbid-mutation trigger. Authenticated PostgREST can INSERT/UPDATE/DELETE ScoreRuns without Capability Engine. | Policy `pi_capability_score_runs_own` (`cmd=ALL`); trigger inventory has no `trg_*` on this table (unlike judgements/snapshots). | **Open** — tighten to INSERT via service_role / engine-only, or add CHECK + revoke UPDATE/DELETE for authenticated |
| DB-P0-02 | **P0** | Own-row `ALL` RLS on `vpp_entries` allows setting `verifier_status=externally_attested` and `evidence_strength=externally_verified` directly. App `updatePortfolioEntry` rejects those values, but DB does not. `deliverxVerified` is derived from those columns. | Policy `vpp_entries_own`; `deliverxVerifiedFromAttestation` in `src/lib/external-attestation/verified-gate.ts`; store guard lines ~284–292. **Code-review evidence, not live exploit.** | **Open** — column CHECKs / trigger / revoke UPDATE on attestation columns; attestation path service_role only |
| DB-P0-03 | **P0** | `pi_evidence_status_transitions` INSERT own allows `to_status=platform_verified` (enum). API rejects; PostgREST does not. | Policy `pi_evidence_transitions_insert_own`; API guard in `src/app/api/pi/evidence/[id]/route.ts`. | **Open** — restrict elevated statuses to service_role / attestation RPC |
| DB-P1-01 | P1 | `workspace_observations` `ALL` own — consent not enforced in SQL | Policy `workspace_observations_own`; consent in `consent.ts` only | **Closed (0096, 2026-07-26)** — INSERT triggers require effective consent (project override wins; missing = OFF); no service-role GUC bypass; `workspace_observation` evidence guarded; `capability_assigned` CHECK |
| DB-P1-02 | P1 | `framework_version_id` nullable on ScoreRuns; pin not DB-mandatory | `information_schema.is_nullable=YES`; app asserts when `DELIVERX_RUBRIC_REQUIRE_DB` | Fail-closed CHECK or NOT NULL after backfill |
| DB-P1-03 | P1 | Judgements/snapshots INSERT own still allows fabricating child rows tied to invented ScoreRuns | Policies `*_insert_own` + immutable after write | Bind inserts to engine role or signed run token |
| DB-P1-04 | P1 | TD-006 leaked-password protection disabled | Advisor `auth_leaked_password_protection` WARN | Founder Auth toggle |
| DB-P2-01 | P2 | Advisor: mutable `search_path` on `match_project_memory_chunks`, `match_org_memory_chunks`, `pi_cf_version_is_immutable` | Advisors + function defs (SECURITY INVOKER) | Set `search_path=public` |
| DB-P2-02 | P2 | Advisor INFO: RLS on `org_ai_rate_limits`, `platform_api_rate_limits` with **no** policies | Effective deny for non-bypass roles | Add explicit deny policies for clarity |
| DB-P2-03 | P2 | Six authenticated-callable SECURITY DEFINER helpers (3 from TD-016 + 3 from T7) | Prod grants; advisors 0029 | **Accepted** if kept read-only / auth.uid()-scoped; document expansion vs TD-016 “three helpers” note |
| DB-P2-04 | P2 | Pre-pivot delivery tables large vs PI purge map — org residue possible after person purge | Cascade map vs `list_tables` volume | Track as privacy residual; not PI ledger rewrite |
| DB-OK-01 | Info | Anon EXECUTE false on all SECURITY DEFINER; purge service_role only | Prod privilege query 2026-07-25 | TD-015/016 closed for purge class |
| DB-OK-02 | Info | Learning/outcomes CHECKs prevent capability / external verification flags | Constraints `*_no_capability_chk`, `*_not_externally_verified_chk` | Hold |
| DB-OK-03 | Info | Artefact version immutability + provenance CHECK | `0088` + prod triggers | Hold |

## Similar-class bugs to the old purge hole (0089)

| Class | Present? |
| --- | --- |
| Privileged SECURITY DEFINER mutation callable by anon/auth | **No** for purge wrappers / internals (`*_t4/_t5/_t7` owner-only; wrapper service_role) |
| SECURITY DEFINER read helpers callable by authenticated | **Yes** (intentional RLS helpers) |
| Trust mutations allowed by broad `ALL` RLS without triggers | **Yes** — this is the **new dominant class** (ScoreRuns, VPP attestation columns, evidence status) |

## Recommended next DB hardening slice

1. Migration: revoke authenticated UPDATE/DELETE on `pi_capability_score_runs`; add forbid trigger (purge bypass only).  
2. Migration: forbid client UPDATE of `vpp_entries.verifier_status` / `evidence_strength` except via attestation RPC (service_role).  
3. Migration: CHECK or trigger on evidence transitions blocking `platform_verified` unless `actor_type` in (`external_employer`,`admin_attestor`,`system`) and session is service_role.  
4. Founder: TD-006.
