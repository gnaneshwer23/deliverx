# Phase 5 — Data integrity audit

**Date:** 2026-07-25  
**Scope:** Migrations `0066`–`0094`, production project `jibmyxaldetyycmtlxet`  
**Method:** Migration + code review; read-only SQL / advisors via `plugin-supabase-supabase`  
**Authority:** Build Charter trust rails; does **not** claim formal compliance

---

## Executive verdict

Person PI tables largely encode the intended domain separation (profile · claim · observation · evidence · capability · recommendation · artefact · feedback · reflection). **Append-only evidence bodies, learning/outcome CHECKs, artefact version immutability, and purge lockdown hold in the database.**

**They do not fully hold for capability assignment or Verified attestation at the database boundary.** Several trust invariants are enforced only in Next.js route handlers / `src/lib/*`, while RLS still permits authenticated users to mutate the underlying rows via PostgREST with their own JWT.

---

## Concept separation (model vs enforcement)

| Concept | Primary tables | Distinct? | Enforcement notes |
| --- | --- | --- | --- |
| Profile | `users`, `pi_onboarding_sessions`, aggregates | Yes | Soft identity; not capability |
| Claim | SnapshotClaims / VPP narrative fields | Yes | Packaging, not ledger truth |
| Observation | `workspace_observations`, AI observer drafts | Yes in types | App + DB consent gate (`0096`); missing/revoked consent blocks NEW inserts |
| Evidence | `pi_evidence_records` + provenance / transitions | Yes | Body append-only; status via transitions |
| Capability | `pi_capability_score_runs` / judgements / snapshots | Yes | Judgements/snapshots immutable after write; **score runs writable** |
| Recommendation | interventions, learning paths, AI outputs | Yes | Labelled drafts; notifications refuse capability fields |
| Artefact | `artefacts` / `artefact_versions` / transitions | Yes | Prior versions immutable; evidence must cite `artefact_version_id` |
| Feedback / reflection | review cases, reflections, intervention outcomes | Yes | Separate from ScoreRun |

---

## Schema inventory (PI-relevant)

Production: all listed PI / AI / artefact / VPP / org-structure tables have **RLS enabled** and **≥1 policy** (except pre-PI rate-limit tables — see risk register).

### Strengths verified in prod SQL

| Control | Evidence |
| --- | --- |
| Evidence body immutable | Trigger `trg_pi_evidence_records_immutable` → `pi_forbid_evidence_mutation` |
| Provenance / transitions / interpretations immutable | Matching forbid triggers |
| Capability judgements / snapshots immutable | `pi_forbid_capability_mutation` |
| Artefact versions + transitions immutable | `artefact_forbid_version_mutation` |
| AI prompt versions + interactions immutable | `ai_forbid_*` |
| Learning ≠ capability | `CHECK (capability_assigned = false)` + `learning_not_capability = true` |
| Outcomes never auto-verified | `CHECK (externally_verified = false)` + `capability_assigned = false` |
| Artefact-cited evidence | `pi_evidence_provenance_artefact_version_check` |
| Consent column default | `pi_observation_consent.consented default false`; missing row = deny in app **and DB** (`0096` INSERT triggers) |
| Purge privileged | `pi_privacy_purge_person_data` anon/auth EXECUTE = **false**, service_role = **true** |
| Anon SECURITY DEFINER | All inventoried definer funcs: anon EXECUTE = **false** |

### Indexes / uniqueness (sample)

- Evidence: unique `(user_id, content_hash)`, partial unique idempotency key  
- Artefact versions: unique `(artefact_id, version_number)`, `(artefact_id, content_hash)`  
- Notifications: `(user_id, dedupe_key)` idempotency (T5)  
- ScoreRuns: `run_kind` / `rubric_resolve_source` CHECKs present; `framework_version_id` **nullable**

### Ownership & tenant isolation

- Person PI: `user_id = auth.uid()` policies  
- Org structure (T7): `organisation_id = current_org_id()`  
- Framework catalogue: readable via `pi_cf_version_is_readable`; audit events deny-all for authenticated  
- Cross-user PostgREST: anon select of `pi_evidence_records` returns `[]` (live probe with anon key)

### Deletion / residue

- Person purge RPC cascades person tables; retains `pi_cf_*`, privacy tombstones (`pi_privacy_requests`), AI catalogue  
- Evidence FKs to artefact versions use `ON DELETE RESTRICT` (prevents silent version loss while cited)  
- Auth user delete cascades person FKs where defined; **legal tombstones intentionally remain** after purge

### Soft delete

- Generally **hard delete** on purge + append-only history elsewhere; artefact envelope status is lifecycle, not soft-delete of versions

---

## Targeted integrity tests (reasoned + partial live)

| Question | Result | Severity |
| --- | --- | --- |
| Can observations silently become evidence? | App observation path dual-writes ledger only after consent; **DB requires consent** for `workspace_observations` and `workspace_observation` evidence inserts (`0096`). Status `platform_verified` elevated path closed by `0095`. | **Hold** (consent + elevated status) |
| Do AI outputs lack provenance? | T4 `ai_interactions` logs model, prompt hash/version, tokens, latency, cost when `runAgent` persists. Legacy `/api/ai/*` paths may bypass if `DELIVERX_AI_ORCHESTRATION_BYPASS=1`. | P2 when bypass |
| Can capability be assigned without evidence / engine? | **Yes via PostgREST:** `pi_capability_score_runs` policy `ALL` own-row; **no** immutability trigger on score runs. Judgements allow INSERT. App engine is not the only writer. | **P0** |
| Can recommendations lack supporting evidence? | Allowed by design for coach drafts; contracts encourage citations but do not require non-empty citations. | Accepted / Low |
| Can evidence be edited without audit? | Body/provenance **no** (triggers). Status changes append transitions (audit exists) but **can invent elevated status**. | **P0** for verification honesty |
| Can artefact versions be lost? | Immutable trigger + RESTRICT from provenance; purge clears after evidence. | Hold |
| Cross-user data access? | Self-only RLS on person PI; T6 + anon probe support. Org tables scoped by `current_org_id()`. | Hold (person) |
| Deleted users leave sensitive residue? | Tombstones + optional incomplete cascade for pre-PI delivery tables not in purge map — person PI purge is broad; pre-pivot org data may remain if user was org-linked. | P2 residual |

---

## Migration consistency

- `0089` / `0092` / `0093` / `0094` present on prod; T8 tables exist with RLS  
- T7 added three new SECURITY DEFINER helpers (`is_org_admin`, `is_department_member`, `is_team_member`) with authenticated EXECUTE — **same class as intentional TD-016 helpers**, caller-scoped to `auth.uid()` / `current_org_id()`; not purge-class  
- Advisor still flags these six authenticated DEFINER helpers (WARN)

---

## Seed quality

- `pm-core` framework seed thin (3 competencies) — known TD-007  
- Experience catalogue 16 scenarios / 12 companies seeded  
- AI agents / prompt versions: 6 rows each in prod  

---

## Production safety notes

- Live signed-in suite historically uses disposable users + purge against **production** — residual operational risk (prefer local Supabase)  
- Do not treat empty PI row counts as proof of no historical data; purge + pilot volume explain sparsity  

See companion: [`database-risk-register.md`](./database-risk-register.md)
