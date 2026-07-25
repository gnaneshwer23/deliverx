# Technical Debt Register

**Seeded from:** post-ship audit (2026-07-25, HEAD `f3ac383`) + hypotheses/decisions canvas  
**Rule:** Do not fabricate items. Severity guides charter hardening priority.

| ID | Item | Severity | When | Notes |
| --- | --- | --- | --- | --- |
| TD-001 | No signed-in E2E of P0–P7 happy path | **High** | **Now** (pilot seal) | **Still open (T0 2026-07-25):** unauth/unit green; signed-in BLOCKED (no founder/test login); ScoreRuns/evidence/outcomes still 0 on prod. Close when founder completes `docs/qa/t0-signed-in-checklist.md` (T6 automates later). |
| TD-002 | Coach deep-link `next` loses `/workspace/coach` | Medium | Now | **Reconfirmed T0** on prod (`next=/workspace`). Fix: `x-matched-path` fallback in `getRequestPathFromHeaders` + `x-dx-proxy` marker — **re-verify after deploy**. |
| TD-003 | Edge/session proxy anonymous path-guards ineffective in prod | Medium | Now / deferred | **Reconfirmed T0:** layouts own `next=` (e.g. settings → `/settings/profile`). Documented; full proxy restore deferred. |
| TD-004 | Supabase advisor: mutable `search_path` on `forbid_*` | Medium | Now | Function search_path hygiene |
| TD-005 | `pi_cf_audit_events` RLS on, no policies (INFO) | Low–Med | Now | Lock down or document intentional deny-all |
| TD-006 | Leaked-password protection off (WARN) | Medium | Now | Auth dashboard setting |
| TD-007 | Framework seed thin (3 competencies) | Low | Deferred | Acceptable for pilot narrative; expand only with founder OK |
| TD-008 | No feature-flag system for PI surfaces | Medium | Deferred | Env gate (`DELIVERX_PI_*`) exists; no progressive flag framework |
| TD-009 | In-code rubric / catalogue fallbacks vs DB seed drift | Medium | Now | Prefer DB/admin framework as SoT; label any heuristic fallback |
| TD-010 | Team Co-pilot vs Workspace SKU ambiguity | Medium | Deferred | Needs founder ADR; interim alias accepted |
| TD-011 | Marketing copy vs ledger truth (Verified / readiness %) | Medium | Now | Strip overclaim; badge off until attestation |
| TD-012 | Experience → workspace dual-write not fully wired from all `/workspace` pages | Low–Med | Deferred | Contributions API exists; not all pages dual-write |
| TD-013 | Full Mermaid ER for PI schema not published | Low | Deferred | Compact sketch in `data-model.md`; expand later |
| TD-014 | Pre-pivot delivery/org API surface large vs PI SoT | Low | Deferred | Do not expand as PI WPs; avoid capability confusion |

---

## Disposition guide

- **Now** — allowed under Build Charter (pilot hardening)  
- **Deferred** — record only; do not expand into P8/P9 or new products without approval  

When resolving an item: note SHA + date in this table (append a Resolved column entry or move to a “Resolved” section).
