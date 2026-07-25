# Phase 7 — Security audit

**Date:** 2026-07-25  
**Prod:** https://www.deliverx.dev · Supabase `jibmyxaldetyycmtlxet`  
**Method:** Code + migration review; advisors; unauthenticated HTTP probes; anon PostgREST; `npm audit`  
**Not claimed:** formal certification, penetration-test completeness, or live authenticated cross-user exploit against real accounts

---

## Executive verdict

Authentication gates for PI pages/APIs behave correctly when signed out. Anon EXECUTE on privileged purge functions remains closed (TD-015/016). **Highest open severity is integrity bypass via authenticated PostgREST against overly broad RLS (`ALL` on ScoreRuns / VPP entries / evidence status transitions)** — same class as “trust enforced only in app,” distinct from the fixed purge EXECUTE hole.

Dependency audit reports **no critical**, but **high** issues including **Next.js 16.2.9** advisories fixed in **≥16.2.11**.

---

## Control review

| Area | Posture | Notes |
| --- | --- | --- |
| Auth | Supabase Auth + layout/API session checks | Unauth `/profile`,`/workspace`,`/settings/profile` → 307 login; `/api/pi/evidence` → 401 `Unauthorized` |
| Authorization / RBAC | Person self-only; org admin for framework; PI review admin gated | `requireOrgAdmin`, `canAccessPiReviewAdmin`; admin APIs return Not authenticated / Forbidden without role |
| RLS | Enabled on PI tables | Self-only / org-scoped; gaps = **over-permissive ALL**, not missing RLS |
| API validation | Route-level checks for elevated statuses / attestation | Bypassable if client talks to PostgREST directly with user JWT |
| Secrets / env | Service role server-only pattern | `createAdminClient`; do not expose in client |
| Logging | Domain events + AI interactions | Avoid logging secrets; injection pattern blocks bearer-looking user text |
| File uploads | Limited in PI path | Artefact content in DB/json; no full malware scan in this audit |
| Admin privileges | Framework + review admin | Unauth admin framework → error; escalation via payload alone not tested live with admin JWT |
| Rate limiting | Org AI / platform tables exist | **No** PI route rate limit found; RLS-on-no-policy on rate limit tables = deny client |
| Input sanitisation | Injection scan + JSON contracts | XSS primarily React escaping; PostCSS/Next advisories in deps |
| CSRF | Cookie session SameSite typical for Next/Supabase | Not deeply tested |
| XSS | React defaults | User HTML not intended as primary surface |
| SQLi | Parameterised Supabase client | Low residual |
| Prompt injection | T4 hard-blocks | See AI audit |
| Dependencies | `npm audit` | See summary below |

---

## Attack attempts / probes

| Attempt | Method | Result |
| --- | --- | --- |
| Access protected pages signed out | `curl -sI` profile/workspace/settings | **307** → `/login?next=…` |
| Access PI API signed out | GET `/api/pi/evidence` | **401** |
| Admin framework unauth | GET `/api/admin/framework/versions` | Not authenticated |
| Privacy delete empty body | POST `/api/pi/privacy/delete` | Unauthorized |
| Anon PostgREST evidence | REST select with anon key | `[]` (RLS) |
| Attest fake token page | GET `/portfolio/attest/fake-token` | 200 HTML shell (tokenised UX; no private evidence expected) |
| Cross-user record access | Live JWT A→B | **Not executed** (no disposable auth fixture this run); rely on T6 + RLS review |
| Escalate role via payload | Live | **Not executed**; admin checks read `users.role` server-side |
| Self-set Verified via PostgREST | Would UPDATE `vpp_entries` | **Code-review evidence** — RLS allows; app blocks — mark not live-exploited |
| Invent ScoreRun via PostgREST | Would INSERT `pi_capability_score_runs` | **Code-review evidence** — RLS ALL |
| Call purge as normal user | Grants | anon/auth EXECUTE **false** (prod SQL) |
| Malicious upload paths | — | Not fully exercised |
| Secret exposure via errors | Spot-check unauth JSON | Generic errors; no key leak observed |

---

## SECURITY DEFINER grant inventory (prod)

| Function | anon | authenticated | service_role | Verdict |
| --- | --- | --- | --- | --- |
| `pi_privacy_purge_person_data` | F | F | T | OK |
| `pi_privacy_purge_person_data_t4/t5/t7` | F | F | F | Owner internals OK |
| `handle_new_auth_user` | F | F | T | OK |
| `current_org_id` | F | T | T | Intentional RLS helper |
| `is_workspace_project_member` | F | T | T | Intentional |
| `pi_cf_version_is_readable` | F | T | T | Intentional |
| `is_org_admin` / `is_department_member` / `is_team_member` | F | T | T | Intentional T7; auth.uid()-scoped |
| vault / pgbouncer managed | F | F | varies | Managed |

**No recurrence of purge-class anon EXECUTE.** Remaining risk is **authenticated DEFINER RPC surface** (read helpers) + **ALL RLS mutations**.

---

## Advisor snapshot (2026-07-25)

- WARN: leaked password protection (TD-006)  
- WARN: authenticated SECURITY DEFINER executable (6 helpers)  
- WARN: mutable search_path on match_* / `pi_cf_version_is_immutable`  
- WARN: `pg_trgm` in public  
- INFO: RLS enabled no policy on rate limit tables  

---

## Dependency vulnerability summary (`npm audit`)

| Severity | Count | Notable packages |
| --- | --- | --- |
| Critical | 0 | — |
| High | 6 | **next@16.2.9** (multiple GHSA; fix ≥16.2.11), brace-expansion, fast-uri, js-yaml, postcss (via next), sharp |
| Moderate | 4 | hono / @hono/node-server / @modelcontextprotocol/sdk / shadcn (dev-ish) |
| Low | 1 | body-parser |

**Priority:** bump `next` to patched ≥16.2.11 (middleware/proxy bypass, SSRF, DoS advisories). Re-run audit after lockfile update. Do not treat CLI/dev-only chains as equal to runtime Next.

---

## Findings summary

| ID | Sev | Finding |
| --- | --- | --- |
| SEC-P0-01 | P0 | Verified self-promotion possible via PostgREST UPDATE on `vpp_entries` (DB-P0-02) |
| SEC-P0-02 | P0 | Capability fabrication via PostgREST on `pi_capability_score_runs` (DB-P0-01) |
| SEC-P0-03 | P0 | Evidence `platform_verified` transition insertable via PostgREST (DB-P0-03) |
| SEC-P1-01 | P1 | Next.js high advisories on locked 16.2.9 |
| SEC-P1-02 | P1 | TD-006 leaked-password protection off |
| SEC-P2-01 | P2 | No dedicated PI API rate limiting |
| SEC-P2-02 | P2 | Mutable search_path advisors |
| SEC-OK | Info | Unauth gates, purge grants, anon RLS |

See [`privacy-audit.md`](./privacy-audit.md), [`../qa/security-findings.md`](../qa/security-findings.md)
