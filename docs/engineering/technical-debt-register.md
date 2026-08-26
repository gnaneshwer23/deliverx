# Technical Debt Register

**Seeded from:** post-ship audit (2026-07-25, HEAD `f3ac383`) + hypotheses/decisions canvas  
**Rule:** Do not fabricate items. Severity guides charter hardening priority.

| ID | Item | Severity | When | Notes |
| --- | --- | --- | --- | --- |
| TD-001 | No signed-in E2E of P0–P7 happy path | **High** | **Now** (pilot seal) | **Closed (T6 2026-07-25):** automated signed-in loop `e2e/t0-signed-in-loop.test.ts` (18/18) + security negatives; disposable users purged. Remaining human: visual/UX judgement, TD-006 Auth toggle, optional email when channels exist. |
| TD-002 | Coach deep-link `next` loses `/workspace/coach` | Medium | Now | **Resolved on prod (T0 `c5d2b9f`):** unauth `/workspace/coach` → `login?next=/workspace/coach` via `x-matched-path` fallback. |
| TD-003 | Edge/session proxy anonymous path-guards ineffective in prod | Medium | Now / deferred | **Reconfirmed T0:** layouts own `next=` (e.g. settings → `/settings/profile`). Documented; full proxy restore deferred. |
| TD-004 | Supabase advisor: mutable `search_path` on `forbid_*` | Medium | Now | **Resolved T1 (`0086`)**: `search_path = public` on all `forbid_*` + privacy delete bypass flag. |
| TD-005 | `pi_cf_audit_events` RLS on, no policies (INFO) | Low–Med | Now | **Resolved T1 (`0086`)**: explicit authenticated deny-all; service role only. |
| TD-006 | Leaked-password protection off (WARN) | Medium | Now | **Open — founder action required (2026-07-25):** advisor still WARN (`auth_leaked_password_protection`). Not SQL; MCP has no Auth-config write. Management API field `password_hibp_enabled` exists but needs PAT + Pro plan. Runbook: [`runbook-leaked-password-protection.md`](./runbook-leaked-password-protection.md). One-click: [Auth → Attack Protection](https://supabase.com/dashboard/project/jibmyxaldetyycmtlxet/auth/protection). |
| TD-007 | Framework seed thin (3 competencies) | Low | Deferred | Acceptable for pilot narrative; expand only with founder OK |
| TD-008 | No feature-flag system for PI surfaces | Medium | Deferred | Env gate (`DELIVERX_PI_*`) exists; no progressive flag framework |
| TD-009 | In-code rubric / catalogue fallbacks vs DB seed drift | Medium | Now | **Resolved T2 (`0087`)**: DB `pi_cf_*` preferred; source `db \| in_code_fallback` labelled + logged; `rubric_resolve_source` on ScoreRuns; pin assert on capability run; golden harness. Fail-closed via `DELIVERX_RUBRIC_REQUIRE_DB`. |
| TD-010 | Team Co-pilot vs Workspace SKU ambiguity | Medium | **Settled (T7 alias)** | **2026-07-25:** Team Copilot = Professional Workspace alias (not third SKU) — PD-2026-07-25. Commercial packaging SKU remains T9-gated. |
| TD-011 | Marketing copy vs ledger truth (Verified / readiness %) | Medium | Now | **Closed (Batches 2–3, 2026-07-25):** commercial honesty + UX language — no priced CTAs/money-back without T9; Launchpad includes match Career Intelligence; ScoreRun demoted to internal engine name; Career readiness % source-labelled; interim Privacy/Terms/Cookies. |
| TD-012 | Experience → workspace dual-write not fully wired from all `/workspace` pages | Low–Med | Deferred | Contributions API exists; not all pages dual-write |
| TD-013 | Full Mermaid ER for PI schema not published | Low | Deferred | Compact sketch in `data-model.md`; expand later |
| TD-014 | Pre-pivot delivery/org API surface large vs PI SoT | Low | Deferred | Do not expand as PI WPs; avoid capability confusion |
| TD-015 | Person-purge RPC executable by anon/authenticated (Supabase default-privilege) | **High** | Now | **Resolved T3 (`0089`, `9eae533`)**: `revoke execute ... from anon, authenticated` on `pi_privacy_purge_person_data`; verified anon/authenticated EXECUTE = false, service_role only. Root cause: `revoke ... from public` does not remove role-specific default grants. |
| TD-016 | Other `SECURITY DEFINER` functions callable by anon/authenticated | Low–Med | Closed | **Closed on prod (2026-07-25, `0092`, `096fb72`):** exhaustive non-system inventory found nine functions (six DeliverX `public`, two managed `vault`, one managed `pgbouncer`). Anonymous EXECUTE is now false for all. `current_org_id`, `is_workspace_project_member`, and `pi_cf_version_is_readable` intentionally retain authenticated EXECUTE because active RLS policies depend on them; rollback-only authenticated read/write probes passed before and after. Purge/admin/trigger functions remain service-role or owner-only. |
| TD-017 | Full-repo ESLint + standalone `tsc` test-fixture debt | Low–Med | Closed | **Closed (Batch 6, 2026-07-26):** `npx tsc --noEmit` **0** errors; `npm run lint` **0** errors. Fixture casts/types aligned; mount-fetch effects scheduled via `scheduleEffectWork` (no rule weaken). CI lint can drop `continue-on-error` when TD-018 restores Actions. |
| TD-018 | GitHub Actions minutes exhausted on private repo | Medium | Closed | **Closed 2026-08-26:** founder restored Actions access; eng re-enabled `verify.yml` + `ci-e2e.yml`, fixed secrets-in-`if` parse (`084093c`), proved green `workflow_dispatch` run [32986767790](https://github.com/gnaneshwer23/deliverx/actions/runs/32986767790) (unit + release-gate + build; live T6 skipped — secrets unset), restored `on.push` for `main` / `cursor/**`. Residual: wire `T6_SUPABASE_*` Actions secrets for live signed-in job; optional drop lint `continue-on-error`. |
| TD-019 | Capability / Verified / elevated evidence trust enforced only in app guards | **High** | Closed | **Closed (Batch 1, 2026-07-25, `0095`, `b96e538`):** ScoreRuns are engine/service-role-only at DB; Verified-bearing VPP columns and `platform_verified` transitions require narrow service-role RPCs. Owner and non-owner PostgREST negatives plus privileged positives pass live. |

---

## Disposition guide

- **Now** — allowed under Build Charter (pilot hardening)  
- **Deferred** — record only; do not expand into P8/P9 or new products without approval  

When resolving an item: note SHA + date in this table (append a Resolved column entry or move to a “Resolved” section).

**Post-T5 hardening disposition:** TD-016 is closed by `0092` / `096fb72`. **T6 (2026-07-25):** TD-001 closed by signed-in E2E + release gates. **T7 (2026-07-25):** TD-010 alias settled (not third SKU). **T8 (2026-07-25):** attestation path shipped; TD-011 meaning frozen. **Batch 1 (2026-07-25):** TD-019 closed by `0095` / `b96e538`. **Batch 2 (2026-07-25):** commercial/legal honesty shipped (PD-2026-07-25e). **Batch 3 (2026-07-25):** UX language honesty shipped (PD-2026-07-25f); TD-011 closed. **CI ops (2026-07-25):** TD-018 recorded; **closed 2026-08-26** (Actions restored + green verify). **Batch 6 (2026-07-26):** TD-017 closed (tsc 0 / eslint 0). TD-006 remains open (founder Auth toggle).
