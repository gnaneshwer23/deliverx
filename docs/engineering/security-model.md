## T9 billing boundary

- Stripe hosts card collection; DeliverX never stores full PAN, CVC, or payment method payloads.
- `/api/billing/webhook` reads the raw body and verifies `Stripe-Signature` with `STRIPE_WEBHOOK_SECRET` before parsing/processing.
- `billing_webhook_events.stripe_event_id` is unique. Duplicate deliveries are successful no-ops; concurrent duplicates rely on the unique constraint.
- Only `service_role` may write customers, subscriptions, entitlements, or webhook audit. Users can SELECT only rows where `user_id = auth.uid()`.
- Checkout requires an authenticated user and records `deliverx_user_id` + bounded SKU metadata on the Stripe session/subscription.
- Access grants follow subscription state: `active`, `trialing`, and `past_due` remain active; canceled/unpaid/incomplete-expired/paused revoke subscription-derived entitlements.
- `DELIVERX_BILLING_ENFORCE` defaults off. Enable only after production migration, Stripe price/webhook/portal config, and test-mode proof.
- Billing identifiers are personal data and included in privacy export/purge. Operational webhook audit retains event IDs/digests only.

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
| **Person PI tables** | Self-only RLS by default. ScoreRuns are the deliberate exception: users read their own rows; only the Capability Engine service-role path writes. Verified-bearing VPP columns and elevated evidence status use service-role-only RPCs. |
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
- Users cannot self-promote evidence to `platform_verified` / external verification without the T8 attestation path
- Attestor token views are least-privilege (claim summary only; no private evidence; no capability levels)
- Self-attestation of own claim is rejected
- `deliverxVerified` requires external attestation (PD-2026-07-06 / PD-2026-07-25c); kill switch `DELIVERX_VERIFIED_BADGE=off`
- AI-generated observations are not automatically verified evidence

### Artefacts (T3)

- `artefacts`, `artefact_versions`, `artefact_status_transitions` — self-only RLS, private by default
- Prior artefact versions are immutable (append-only trigger); new content = new version
- Evidence referencing an artefact must cite a specific `artefact_version_id` (DB CHECK + app guard) — never a mutable envelope
- Artefact provenance separates user vs AI contribution; artefact creation never assigns capability

### AI orchestration (T4)

- `ai_agents` / `ai_prompt_versions` — platform catalogue; authenticated read; no client writes
- `ai_interactions` — self-only RLS; append-only (purge bypass for T1 delete)
- Prompt-injection scan + authority boundaries in `src/lib/ai-orchestration/guardrails.ts`
- Agents cannot write capability or modify verified evidence; consequential actions require confirmation
- Observation drafts never auto-verify; cost/latency logged on every `runAgent` call
- **Citation requirement (2026-07-26):** material outputs must cite the exact run context (`citations.ts` / `enforceCitations`); missing/unknown → `validation_failed` + honest non-claiming fallback; logged via `guardrail_flags`
- AI observation provenance may carry model / prompt / contextSourceIds / citationIds — never capability or Verified
- Rollback: `DELIVERX_AI_ORCHESTRATION_BYPASS=1` for legacy delivery AI only

### Person notifications (T5)

- `pi_notifications` has explicit self-only SELECT/INSERT/UPDATE policies; client DELETE is not granted
- `(user_id, dedupe_key)` prevents duplicate projection from the same review, intervention, or domain event
- Notification links are internal contextual routes; review/intervention items bind to evidence, while privacy items bind explicitly to account privacy controls
- Notification payload guards refuse capability assignment or verification claims; notifications are attention routing, never evidence or capability
- `pi_ai_usage_daily` is `security_invoker`, so authenticated reads remain constrained by underlying `ai_interactions` RLS
- T1 export/purge includes notifications; the purge RPC remains `service_role` only after the T5 wrapper

### Organisation structure (T7)

- `departments` / `teams` — org-scoped RLS (`organisation_id = current_org_id()`); SELECT for org members; INSERT/UPDATE/DELETE for org admins (`is_org_admin`)
- `department_members` / `team_members` — same org SELECT; admin write; person `user_id` rows are privacy-export/purge targets
- New helpers `is_org_admin`, `is_department_member`, `is_team_member` follow TD-016: fixed `search_path = public`, anon EXECUTE revoked, authenticated + service_role granted
- Org structure never writes capability, ScoreRuns, or verified evidence
- Cross-org leakage prevented by `current_org_id()` scoping (same posture as projects / workspace_members)

### SECURITY DEFINER grants (`0089`, `0092`, `0093`)

- `pi_privacy_purge_person_data` is `SECURITY DEFINER` and must be **service_role only**
- Supabase default privileges auto-grant EXECUTE to `anon`/`authenticated`; `revoke ... from public` does **not** remove those grants
- `0089` explicitly revokes EXECUTE from `anon`/`authenticated`; verified on prod (anon/authenticated EXECUTE = false)
- `0092` closes TD-016: anonymous EXECUTE is false for every inventoried SECURITY DEFINER function. The three read helpers retain authenticated EXECUTE because active RLS policies invoke them; revocation would break person/org/framework access.
- All DeliverX-owned SECURITY DEFINER functions have an explicit `search_path = public`; managed `vault` / `pgbouncer` functions use an empty search path.

### Remediation Batch 1 (`0095`)

- `pi_capability_score_runs`: authenticated DML revoked; owner SELECT only; immutable trigger blocks UPDATE/DELETE except privacy purge DELETE under `app.pi_privacy_delete`.
- `vpp_entries`: ordinary owner CRUD remains, but a trigger blocks transitions involving `externally_attested` or `externally_verified`. The T8 server calls `pi_apply_vpp_attestation_state`, executable only by `service_role`.
- `pi_evidence_status_transitions`: owner inserts remain for ordinary statuses; both RLS and a trigger reject direct `platform_verified`. T8 calls `pi_append_platform_verified_transition`, executable only by `service_role`.
- New functions are `SECURITY DEFINER`, fixed `search_path = public`; anon/authenticated EXECUTE is false. Post-migration advisors introduced no new findings.

### Observation consent enforcement (`0096`)

- `workspace_observations` BEFORE INSERT trigger requires effective consent (project-scope row wins when present; else global; missing row = OFF).
- `pi_evidence_records` BEFORE INSERT trigger applies the same rule only when `source_type = workspace_observation` (Experience/baseline/reflection untouched).
- No service-role GUC bypass — consent is a product invariant for observation creation; service_role inserts are also denied without active consent.
- `workspace_observations_no_capability_chk` keeps `capability_assigned = false`.
- Helper + guard functions: fixed `search_path = public`; EXECUTE revoked from anon/authenticated/service_role (TD-016 posture; triggers still fire).

Production inventory (`anon / authenticated / service_role`, before → after):

| Function | Before | After | Decision |
| --- | --- | --- | --- |
| `pgbouncer.get_auth(text)` | F / F / F | F / F / F | Supabase-managed internal |
| `public.current_org_id()` | F / T / T | F / T / T | Authenticated retained for organisation RLS |
| `public.handle_new_auth_user()` | F / F / T | F / F / T | Auth trigger; no client execution |
| `public.is_workspace_project_member(uuid)` | T / T / T | F / T / T | Anonymous revoked; authenticated retained for requirements RLS |
| `public.pi_cf_version_is_readable(uuid)` | T / T / T | F / T / T | PUBLIC/anonymous revoked; authenticated retained for ten `pi_cf_*` read policies |
| `public.pi_privacy_purge_person_data(uuid, uuid)` | F / F / T | F / F / T | Privileged mutation; service-role only |
| `public.pi_privacy_purge_person_data_t4(uuid, uuid)` | F / F / F | F / F / F | Owner-only implementation behind purge wrapper |
| `vault.create_secret(text, text, text, uuid)` | F / F / T | F / F / T | Supabase-managed service function |
| `vault.update_secret(uuid, text, text, text, uuid)` | F / F / T | F / F / T | Supabase-managed service function |

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
4. **SECURITY DEFINER grants** — **TD-016 closed in `0092`:** both anonymous findings cleared. Three authenticated findings remain intentionally for RLS-critical read helpers; production role-simulation probes prove those policy paths still work.

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
- `deliverxVerified` requires external attestation (T8; kill switch `DELIVERX_VERIFIED_BADGE=off`)
- No unexplained scores as capability truth
- Least-privilege access to professional information (Constitution)
