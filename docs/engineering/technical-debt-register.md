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
| TD-011 | Marketing copy vs ledger truth (Verified / readiness %) | Medium | Now | Strip overclaim; badge off until attestation |
| TD-012 | Experience → workspace dual-write not fully wired from all `/workspace` pages | Low–Med | Deferred | Contributions API exists; not all pages dual-write |
| TD-013 | Full Mermaid ER for PI schema not published | Low | Deferred | Compact sketch in `data-model.md`; expand later |
| TD-014 | Pre-pivot delivery/org API surface large vs PI SoT | Low | Deferred | Do not expand as PI WPs; avoid capability confusion |
| TD-015 | Person-purge RPC executable by anon/authenticated (Supabase default-privilege) | **High** | Now | **Resolved T3 (`0089`, `9eae533`)**: `revoke execute ... from anon, authenticated` on `pi_privacy_purge_person_data`; verified anon/authenticated EXECUTE = false, service_role only. Root cause: `revoke ... from public` does not remove role-specific default grants. |
| TD-016 | Other `SECURITY DEFINER` functions callable by anon/authenticated | Low–Med | Closed | **Closed on prod (2026-07-25, `0092`, `096fb72`):** exhaustive non-system inventory found nine functions (six DeliverX `public`, two managed `vault`, one managed `pgbouncer`). Anonymous EXECUTE is now false for all. `current_org_id`, `is_workspace_project_member`, and `pi_cf_version_is_readable` intentionally retain authenticated EXECUTE because active RLS policies depend on them; rollback-only authenticated read/write probes passed before and after. Purge/admin/trigger functions remain service-role or owner-only. |

---

## Disposition guide

- **Now** — allowed under Build Charter (pilot hardening)  
- **Deferred** — record only; do not expand into P8/P9 or new products without approval  

When resolving an item: note SHA + date in this table (append a Resolved column entry or move to a “Resolved” section).

**Post-T5 hardening disposition:** TD-016 is closed by `0092` / `096fb72`. **T6 (2026-07-25):** TD-001 closed by signed-in E2E + release gates. **T7 (2026-07-25):** TD-010 alias settled (not third SKU). TD-006 remains open (founder Auth toggle); all other entries retain their prior status.
