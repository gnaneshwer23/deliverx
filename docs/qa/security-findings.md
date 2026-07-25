# Security findings — Technology T6

**Date:** 2026-07-25  
**Scope:** Signed-in E2E + negative journeys for P0–P7 / T1–T5 surfaces  
**Prod:** `jibmyxaldetyycmtlxet` · www.deliverx.dev

---

## Verified controls (pass)

| Control | Evidence |
| --- | --- |
| Unauthenticated PI APIs → 401 | `e2e/t6-unauth-gates.test.ts` |
| Hub pages → `/login?next=…` | same |
| Self-only evidence list (cross-user) | `e2e/t6-security-journeys.test.ts` |
| RLS blocks direct PostgREST read of another user’s `pi_evidence_records` | same |
| `pi_privacy_purge_person_data` not executable by anon | same + TD-015/016 migrations |
| `pi_privacy_purge_person_data` not executable by authenticated | same |
| Privacy delete requires exact `DELETE_MY_PI_DATA` | same |
| Learning / outcomes never increment ScoreRuns | same + happy path |
| Portfolio public share excludes private marker; no Verified badge | happy path step 13 |
| ScoreRun carries `framework_version_id` + `rubric_resolve_source=db` | happy path step 03 |
| Observation consent default OFF | happy path step 06 |
| AI prompt-injection hard-block patterns | guardrails unit + T6 security always-on |
| SECURITY DEFINER grant hygiene (migration SQL) | `src/lib/pi-privacy/privacy.test.ts` (0092) |

---

## Findings

| ID | Severity | Finding | Disposition |
| --- | --- | --- | --- |
| — | — | No new High/Critical defects from T6 live run | — |
| SF-T6-01 | Low / note | Baseline ScoreRun may produce **0 gaps** for strong synthetic answers → interventions not offered | Expected honesty; harness accepts empty intervention set when gaps empty |
| SF-T6-02 | Medium (pre-existing) | Full-repo `tsc --noEmit` / `eslint` have baseline fixture debt | Classified; scoped PI gate is green; full lint advisory in CI |
| TD-006 | Medium | Leaked-password protection still WARN | Founder action; not automatable via MCP |

---

## Residual risk

- Live signed-in suite currently runs against **production** with disposable users and mandatory purge. Prefer Option A (local Supabase) when disk/Docker allows.  
- CI live job is **optional** until GitHub secrets `T6_SUPABASE_*` are configured. Always-on gates still block regressions without secrets.  
- Reviewer/admin PI review surfaces not exercised end-to-end (no safe admin fixture in this phase).
