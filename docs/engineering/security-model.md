# Security Model

**As of:** 2026-07-25 · post-ship audit

---

## Authentication

- Supabase Auth for end users
- App shells and PI pages use onboarding/session guards (e.g. `requireCompleteOnboarding`) with `login?next=` return paths
- API Route Handlers for person PI data expect an authenticated user; anonymous calls return **401**

Known residual: anonymous RSC often lacks `x-pathname` when proxy anon guards do not run (TD-003). T0 added `x-matched-path` fallback in `getRequestPathFromHeaders` for deep links such as `/workspace/coach` (TD-002); production now returns `/login?next=%2Fworkspace%2Fcoach`. Proxy responses may include `x-dx-proxy` for observability.

---

## Authorisation & RLS

| Layer | Posture |
| --- | --- |
| **Person PI tables** | Self-only RLS — users read/write their own evidence, ScoreRuns, learning, outcomes, consent, artefacts + versions |
| **Org / project delivery tables** | Existing org membership / project access helpers (`src/lib/access`, project access tests) |
| **Admin framework** | Elevated admin APIs for `pi_cf_*` version management; immutability triggers after publish/seed |
| **Review admin** | `/api/pi/review/admin` gated to admin operators |
| **Public portfolio** | Share token views filter non-shareable / confidential evidence; invalid token still safe empty/invalid UI |

---

## Consent & observation

- `pi_observation_consent` — **default OFF** (missing row = denied)
- Workspace observations and coach interventions must not run as verified evidence without consent + ledger rules
- Interventions are drafts; observation ≠ evidence ≠ capability

---

## Evidence privacy

- Evidence is **private by default**
- Portfolio packaging and public links must exclude private/confidential rows
- Users cannot self-promote evidence to `platform_verified` / external verification without attestation path
- AI-generated observations are not automatically verified evidence

### Artefacts (T3)

- `artefacts`, `artefact_versions`, `artefact_status_transitions` — self-only RLS, private by default
- Prior artefact versions are immutable (append-only trigger); new content = new version
- Evidence referencing an artefact must cite a specific `artefact_version_id` (DB CHECK + app guard) — never a mutable envelope
- Artefact provenance separates user vs AI contribution; artefact creation never assigns capability

### Person-purge RPC lockdown (T3 hotfix `0089`)

- `pi_privacy_purge_person_data` is `SECURITY DEFINER` and must be **service_role only**
- Supabase default privileges auto-grant EXECUTE to `anon`/`authenticated`; `revoke ... from public` does **not** remove those grants
- `0089` explicitly revokes EXECUTE from `anon`/`authenticated`; verified on prod (anon/authenticated EXECUTE = false)
- Advisor 0028/0029 still flags lower-risk helpers — tracked TD-016. Production grants: `is_workspace_project_member` and `pi_cf_version_is_readable` are executable by anon + authenticated; `current_org_id` is executable by authenticated but not anon. All three are `SECURITY DEFINER`.

---

## Gate environment variables

Optional pilot gating via `src/lib/access/gate.ts`:

| Variable | Effect |
| --- | --- |
| `DELIVERX_PI_ALLOWLIST` | Comma-separated emails or user ids; empty = open |
| `DELIVERX_PI_SURFACES` | Comma-separated surface allowlist; empty = all surfaces |
| `DELIVERX_PI_GATE=off` | Force open even if allowlist set |
| `DELIVERX_RUBRIC_REQUIRE_DB` | T2 — fail closed when published `pi_cf_*` rubric cannot resolve |
| `DELIVERX_RUBRIC_ALLOW_IN_CODE_FALLBACK` | T2 — explicit allow for labelled in-code fallback (default allow when REQUIRE_DB unset) |

Post-ship audit noted pilot as **unguarded** in production configuration at audit time — treat allowlist as available control, not necessarily enabled.

---

## Known advisor warnings (honest)

From Supabase advisors at post-ship audit; T1 disposition:

1. **Mutable `search_path` on PI `forbid_*`** — **Closed in T1** (`0086`): all `forbid_*` functions set `search_path = public`.
2. **`pi_cf_audit_events` RLS with no policies** — **Closed in T1** (`0086`): explicit authenticated deny-all policy; service role only.
3. **Leaked-password protection off** (WARN) — **Still open (TD-006, 2026-07-25):** `get_advisors` still reports `auth_leaked_password_protection`. Not settable via SQL; Supabase MCP cannot write Auth config. Management API supports `password_hibp_enabled` (Pro+), but no access token in agent env. **Founder:** enable in [Auth → Attack Protection](https://supabase.com/dashboard/project/jibmyxaldetyycmtlxet/auth/protection). Full steps: [`runbook-leaked-password-protection.md`](./runbook-leaked-password-protection.md).

These are tracked in [`technical-debt-register.md`](./technical-debt-register.md). They do not authorise weakening ledger/verification invariants.

### Privacy export / deletion (T1)

- Person APIs: `POST/GET /api/pi/privacy/export`, `POST /api/pi/privacy/delete`
- Delete requires password re-auth + phrase `DELETE_MY_PI_DATA`
- Purge via `pi_privacy_purge_person_data` (service role); never deletes `pi_cf_*`

### Rubric resolve (T2)

- ScoreRuns prefer published `pi_cf_*` graph; in-code fallback is labelled `in_code_fallback` and logged
- `POST /api/pi/capability/run` asserts `framework_version_id` when DB is required
- Admin-only framework mutation unchanged
- Privacy request tombstones retained as legal minimum
- Settings UX: `/settings/profile` → Privacy · export & deletion


---

## Trust rules that are security-relevant

- Capability writes only via Capability Engine
- `deliverxVerified` requires external attestation
- No unexplained scores as capability truth
- Least-privilege access to professional information (Constitution)
