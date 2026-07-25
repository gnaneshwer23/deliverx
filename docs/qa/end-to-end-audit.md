# End-to-end audit — Technology T6

**As of:** 2026-07-25  
**Authority:** Build Charter · `docs/engineering/technology-build-phases.md` (T6)  
**Prod:** https://www.deliverx.dev · Supabase `jibmyxaldetyycmtlxet`

---

## Approach

| Option | Chosen? | Notes |
| --- | --- | --- |
| A — local Supabase + `next dev` | Preferred; **blocked this run** | Docker image pull exhausted disk (~100% Data volume). Revisit when local stack is available. |
| B — hosted app + disposable test identity + T1 purge | **Used** | `t0-qa+<ts>@deliverx.test` / `t6-*@deliverx.test` against www.deliverx.dev; purged after each run. |
| C — route-handler integration only | Partial fallback | Unauth gates + always-on security units run without a browser session. |

Synthetic data respects real provenance (observed / self-reported only). No fake `externally_verified` semantics. Prod person-PI tables return to **0** after purge (privacy request tombstones retained by design).

---

## Suites

| Suite | Command | What it covers |
| --- | --- | --- |
| Signed-in happy path | `npm run test:e2e:t6` (or `test:e2e:t0`) | Onboarding → baseline → ScoreRun pin → Profile → gap Experience → ledger → consent off/on → contribution → intervention → final/transfer → growth → learning → outcomes → Portfolio share → Career SnapshotClaims → notifications → artefact versions → privacy export/delete |
| Security / negatives | `npm run test:e2e:t6:security` (+ `T6_E2E=1` for live) | Prompt-injection; cross-user RLS; purge SECURITY DEFINER denial; wrong delete phrase; learning/outcomes no capability write |
| Unauth gates | `npm run test:e2e:t6:unauth` | 401 on PI APIs; hub pages → login |
| Release gate | `npm run test:release-gate` | PI units + unauth + security always-on |
| Release gate (live) | `npm run test:release-gate:live` | Above + signed-in loop + live security |

---

## Journey coverage matrix

| Step | Automated | Result (2026-07-25 live) |
| --- | --- | --- |
| Unauth refusal | Yes | Pass |
| Onboarding → Profile | Yes | Pass |
| Baseline + provenance | Yes | Pass |
| ScoreRun `framework_version_id` + `run_kind=baseline` + `rubric_resolve_source=db` | Yes | Pass |
| Profile five questions | Yes | Pass |
| Gap-planned Experience (12-company catalogue) | Yes | Pass (`brightpath-adaptive`; non-MediFlow) |
| Day-1 ledger evidence | Yes | Pass |
| Consent OFF → no observation | Yes | Pass |
| Consent ON → observation + evidence (not verified) | Yes | Pass |
| Intervention offer/accept | Yes* | Pass (*skipped accept when ScoreRun gaps empty — honest empty) |
| Final/transfer different industry + same pin | Yes | Pass |
| Growth report citations; Verified off | Yes | Pass |
| Learning ≠ capability | Yes | Pass |
| Outcomes self-reported; volume floor | Yes | Pass |
| Portfolio share privacy; no Verified badge | Yes | Pass |
| Career = same SnapshotClaims | Yes | Pass |
| Notifications (T5) | Yes | Pass |
| Artefact immutable versions (T3) | Yes | Pass |
| Privacy export domains | Yes | Pass |
| Privacy purge | Yes | Pass |
| Cross-user RLS | Yes | Pass |
| Purge RPC anon/authenticated denied | Yes | Pass |
| AI prompt-injection guardrails | Yes (unit) | Pass |
| Visual/UX judgement | **Human** | Remaining founder-manual |
| Real email delivery | **Human / N/A** | No email channel in T5 |
| Founder Auth leaked-password toggle (TD-006) | **Founder** | Open |

---

## How to run locally

```bash
# Always-on release gate (no secrets beyond public prod URL)
npm run test:release-gate

# Live signed-in + security (uses .env.local Supabase keys; purges after)
T6_BASE_URL=https://www.deliverx.dev npm run test:release-gate:live

# Against local Next (when local Supabase is up)
T6_BASE_URL=http://localhost:3000 T6_E2E=1 npm run test:e2e:t6
```

Required env for live: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (never commit).
