# DeliverX — Ship status

**Audit date:** 2026-07-26  
**Auditor:** deployment-expert (ops audit; no feature work)  
**Verdict:** **YES — all committed & deployed** (with intentional flag / design-only notes below)

---

## Git hygiene

| Check | Result |
| --- | --- |
| Branch | `main` |
| Working tree | Clean at audit (then this note committed) |
| Sync | `main` tracked `origin/main` |
| Product HEAD at audit | `98b77ae2b2cf273e10e91cdfb12a04981654c16f` — `docs: establish first governed screen pack` |

No leftover uncommitted product work. No secrets staged. This status note is docs-only and was committed + pushed after the audit.

---

## Production deploy

| Field | Value |
| --- | --- |
| Vercel project | `deliverx` / `prj_9abkAXxjypDbXQTEqq7YQMMj0GPI` |
| Production (product audit) | `dpl_6rL3uWb3rnGHz8b8Quzqm6Ugx34s` @ `98b77ae` — **Ready** |
| Aliases | `www.deliverx.dev`, `deliverx.dev` pointed at that SHA at audit time |
| Post-note redeploy | Confirmed Ready + alias after pushing this note (`224609c` and successors) |

Product code/docs through Screen Pack 01 were on production before this note. Pushing the note triggers a docs-only production redeploy (expected).

### HTTP smoke (`www.deliverx.dev`)

| Path | Result |
| --- | --- |
| `/` | 200 |
| `/pricing`, `/signup`, `/login`, `/about`, `/solutions` | 200 |
| `/help`, `/hub`, `/profile`, `/workspace`, `/experience/app`, `/launchpad/app`, `/settings/admin`, `/pi/review` | 307 → `/login?next=…` (auth gate expected) |
| `/how-it-works` | **404** — Screen Pack 01 marketing route is **design-complete / not implemented** (docs only). Not a deploy lag. |

---

## Migrations (prod `jibmyxaldetyycmtlxet`)

| Scope | Head |
| --- | --- |
| Repo | `supabase/migrations/0105_fix_mutable_search_path_residuals.sql` |
| Prod applied | Includes `0098_pi_recommendations` through `0105_fix_mutable_search_path_residuals` |

| Migration | Prod |
| --- | --- |
| `0098_pi_recommendations` | Applied |
| `0099_pi_onboarding_step_sets` | Applied |
| `0100` / `organisations_org_admin_update` | Applied |
| `0101` / `pi_api_rate_limits` | Applied |
| `0102` / `pi_api_rate_limit_atomic` | Applied |
| `0103` / `capability_child_insert_lockdown` | Applied |
| `0104` / `capability_child_anon_select_revoke` | Applied |
| `0105` / `fix_mutable_search_path_residuals` | Applied |

**Gap:** none — repo head matches prod applied set through 0105.

---

## Feature flags (prod intent)

Vercel Production env (readable keys only; encrypted values not decrypted in this audit):

| Flag | Pilot intent | Prod observation | OK? |
| --- | --- | --- | --- |
| `DELIVERX_RECOMMENDATION_SM` | **on** | Set for Production + Preview (encrypted; documented on 2026-07-26) | Yes |
| `DELIVERX_XP_ENTRY_CEREMONY` | default **on** | Unset → code default on | Yes |
| `DELIVERX_XP_HIRING_INTERVIEW` | default **on** | Unset → code default on | Yes |
| `DELIVERX_GLOBAL_SEARCH` | default **on** | Unset → code default on | Yes |
| `DELIVERX_PILOT_ADMIN` | default **on** | Unset → code default on | Yes |
| `DELIVERX_PI_RATE_LIMIT` | default **on** | Unset → code default on | Yes |
| `DELIVERX_ONBOARDING_STEP_SET` | unset = v2 eight-step | Unset | Yes |
| `DELIVERX_REVIEWER_QUEUE` | shipped **off** | Unset → default off | Yes |
| `DELIVERX_BILLING_ENFORCE` | **must stay off** | Unset → enforcement off | Yes |

No flag flips performed in this audit.

---

## Built-so-far inventory vs HEAD + prod SHA

Product inventory verified at `98b77ae` (committed + on prod at audit).

| Ship | Commit / evidence | Committed | On prod |
| --- | --- | --- | --- |
| B1 confidence bands | `f4a7fc5` | Yes | Yes |
| B2 recommendations + 0098 | `6574449` + flag docs | Yes | Yes |
| B3 pilot KPIs | `59f32d0` | Yes | Yes |
| B4 reviewer queue (flag off) | `52eb654` | Yes | Yes (flag off) |
| B5 onboarding v2 + 0099 | `a6ac193` | Yes | Yes |
| B6 XP ceremony | `5f7d1f0` | Yes | Yes |
| B7 search/help | `844c81e` | Yes | Yes |
| B8 pilot admin + 0100 | `0d1102b` / `f9ca5d7` | Yes | Yes |
| B9 rate limits + 0101/0102 | `cd9f656` / `2e3d4fd` | Yes | Yes |
| Screen Pack 01 docs | `98b77ae` | Yes | Yes (docs; UI not in scope) |
| Outcomes audit docs | `eaec60c` | Yes | Yes |
| Canvas tsconfig exclude deploy fix | `326995d` | Yes | Yes |

---

## Gaps / follow-ups (non-blocking)

1. **Screen Pack 01** — design docs shipped; product UI implementation not started (e.g. `/how-it-works` 404). Expected.
2. **`DELIVERX_REVIEWER_QUEUE`** — remains off until founder enables.
3. **T9 payments** — `DELIVERX_BILLING_ENFORCE` correctly unset; live Stripe still founder ops.
4. Encrypted env values were not plaintext-verified; recommendation flag presence + prior ops notes are the evidence trail.

---

## Overall

**YES — all committed & deployed.** Product HEAD `98b77ae` matched production at audit; migrations through `0102` on prod; pilot flags match intent. Status note commit is docs-only and redeploys production as expected.
