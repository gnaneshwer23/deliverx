# API Contracts

> **Product Bible:** Orientation in [`../README.md`](../README.md). This engineering doc is **canonical detail** for schema/APIs/phases when implementing.

**As of:** 2026-07-25  
**Convention:** Next.js Route Handlers under `src/app/api/**/route.ts`  
**Auth default for PI person APIs:** authenticated session required → **401** if missing (verified in post-ship unauth smoke)

This document lists **PI-relevant and adjacent** contracts. The repo also contains a large pre-pivot delivery/org API surface (`/api/project/*`, `/api/ai/*`, twin, platform, etc.) that is not the Professional Intelligence source of truth.

## Billing and entitlements — `/api/billing/*` (T9)

| Method | Route | Auth | Contract |
| --- | --- | --- | --- |
| POST | `/api/billing/checkout` | User | Body `{ sku: experience \| launchpad \| professional }`; creates Stripe subscription Checkout session; returns `{ url, sessionId }`; 503 if price/env config incomplete |
| POST | `/api/billing/portal` | User | Creates Stripe Customer Portal session; returns `{ url }` |
| GET | `/api/billing/entitlements` | User | Returns own active entitlements + checkout/enforcement state |
| POST | `/api/billing/webhook` | Stripe signature | Raw-body signature verification; idempotently handles Checkout complete and subscription create/update/delete; service-role DB writes |

`/billing/checkout?sku=…` is the server redirect entry used by public purchase CTAs. `/billing/success` explains that access unlocks only after webhook proof. Product APIs may use `assertApiEntitlement`, returning **402** when `DELIVERX_BILLING_ENFORCE=on` and access is unpaid. Product app layouts redirect unpaid signed-in users to `/pricing`.

---

## Professional Intelligence — `/api/pi/*`

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/api/pi/profile` | User | Profile aggregate |
| GET, POST | `/api/pi/evidence` | User | List / append evidence |
| GET, POST | `/api/pi/evidence/[id]` | User | Read / transition; rejects user-set `platform_verified` without admin attestation |
| POST | `/api/pi/evidence/process` | User | Processing job kick |
| GET, POST | `/api/pi/capability/run` | User | List / create ScoreRun via engine. **T2:** response includes `rubricSource` (`db` \| `in_code_fallback`), `frameworkVersionId`, optional `fallbackReason`; persist asserts published pin when DB required |
| POST | `/api/pi/assessment/start` | User | Baseline start (POST-only; GET → 405) |
| POST | `/api/pi/assessment/next` | User | Next item |
| POST | `/api/pi/assessment/respond` | User | Submit response |
| POST | `/api/pi/assessment/complete` | User | Complete baseline |
| POST | `/api/pi/assessment/final/start` | User | Final assessment |
| POST | `/api/pi/assessment/final/next` | User | |
| POST | `/api/pi/assessment/final/respond` | User | |
| POST | `/api/pi/assessment/final/complete` | User | |
| GET, POST | `/api/pi/experience-plan` | User | Ranked Experience plan |
| GET, POST | `/api/pi/observation/consent` | User | Consent read/update (default OFF) |
| GET, POST | `/api/pi/interventions` | User | Coach intervention drafts |
| GET, POST | `/api/pi/learning` | User | Learning paths |
| PATCH | `/api/pi/learning/[id]` | User | Update learning item/path |
| GET | `/api/pi/growth-report` | User | Citation-backed growth report |
| GET, POST | `/api/pi/review` | User | B4 — Review/challenge queue. Flag `DELIVERX_REVIEWER_QUEUE` (default off). Never lights Verified. |
| GET, POST | `/api/pi/review/[id]` | User | B4 — Case detail / user action. Flag gated. |
| GET, POST | `/api/pi/review/admin` | Admin | B4 — Admin review queue (uphold/revise/escalate). Flag gated; AI-assisted requires citations. Never writes capability or Verified. |
| GET, POST | `/api/pi/review/notifications` | User | Legacy compatibility route backed by the T5 consolidated inbox; flag gated with B4 |
| GET, PATCH | `/api/pi/notifications` | User | T5 — list own contextual in-app notifications; mark selected or all read; idempotently sync privacy domain events |
| GET, POST, PATCH | `/api/pi/recommendations` | User | B2 — list/sync own recommendations from latest capability snapshot; accept / dismiss / complete / mark viewed. Flag `DELIVERX_RECOMMENDATION_SM` (default off). Never assigns capability or Verified. |
| GET, POST | `/api/pi/privacy/export` | User | T1 — person PI export JSON; GET lists requests |
| POST | `/api/pi/privacy/delete` | User | T1 — re-auth + confirm phrase; purges person PI |
| GET, POST | `/api/pi/artefacts` | User | T3 — list / create artefact (optional initial version); private by default |
| GET, POST | `/api/pi/artefacts/[id]/versions` | User | T3 — read artefact + versions / append immutable version (idempotent on content hash) |
| GET | `/api/pi/ai/interactions` | User | T4 — list own AI interaction log (cost/latency/provenance); optional `?agent=` `?limit=` |

## PI onboarding

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/api/pi-onboarding` | User |

## Career

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET, POST | `/api/career/intelligence` | User | Readiness / workflows |
| GET, POST | `/api/career/outcomes` | User | P7 outcomes |

## Portfolio (Verified Portfolio packaging)

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET, POST | `/api/portfolio/entries` | User | List / compile from evidence |
| GET, PATCH, POST | `/api/portfolio/entries/[id]` | User | Detail / update / share · revoke · role_version · export |
| GET, POST | `/api/portfolio/entries/[id]/attestations` | User | **T8** — list / create attestation request (consent required) / revoke pending |
| GET, POST | `/api/portfolio/attest/[token]` | Public (token) | **T8** — least-privilege attestor view / confirm or dispute; self-attest denied |
| GET | `/api/portfolio/health` | User | |
| POST | `/api/portfolio/migrate` | User | Launchpad case → VPP draft |

Public token view is a **page** (`/portfolio/v/[token]`). Attestor UX is `/portfolio/attest/[token]`.

`deliverxVerified` lights only when `verifier_status=externally_attested` and `evidence_strength=externally_verified` (kill switch `DELIVERX_VERIFIED_BADGE=off`). Attestation never writes ScoreRuns / capability.

## Admin framework

| Method | Path | Auth |
| --- | --- | --- |
| GET, POST | `/api/admin/framework/versions` | Admin |
| GET, PATCH, PUT | `/api/admin/framework/versions/[id]` | Admin |

## Experience / Workspace bridges

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/api/xperience/me` | User |
| POST | `/api/xperience/onboarding` | User |
| POST | `/api/xperience/experience/start` | User |
| POST | `/api/xperience/scenarios/decide` | User |
| GET | `/api/xperience/sim/state` | User |
| POST | `/api/xperience/sim/reflect` | User |
| POST | `/api/xperience/sim/hire` | User — Experience hiring interview (`open` / `turn` / `complete` / `skip`); kill-switch `DELIVERX_XP_HIRING_INTERVIEW` |
| POST | `/api/workspace/contributions` | User |

## Launchpad (career app)

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/api/launchpad/me` | User |
| POST | `/api/launchpad/onboarding` | User |
| POST | `/api/launchpad/progress` | User |
| POST | `/api/launchpad/artefacts` | User |
| GET, POST | `/api/career/intelligence` | User — readiness honesty (`score_run` \| `mixed` \| `evidence_coverage_heuristic`) |

## Organisation structure (T7)

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/api/org/structure` | Org member — departments/teams/membership; `capabilityAssigned: false` |
| POST | `/api/org/departments` | Org admin — create department |
| POST | `/api/org/teams` | Org admin — create team |
| POST | `/api/org/members` | Org admin — add department or team member |

---

## Auth expectations

1. **Person PI routes:** require Supabase user session; return **401** when anonymous.
2. **Admin framework / review admin:** org-admin or equivalent elevated role (enforced in route handlers + RLS).
3. **Gate env (optional):** `DELIVERX_PI_ALLOWLIST`, `DELIVERX_PI_SURFACES`, `DELIVERX_PI_GATE` — see `security-model.md`.
4. **Rubric resolve env (T2):** `DELIVERX_RUBRIC_REQUIRE_DB`, `DELIVERX_RUBRIC_ALLOW_IN_CODE_FALLBACK` — see `security-model.md`.
5. **Webhooks / cron** (`/api/integrations/*`, `/api/cron/*`): service/secret auth — outside person PI loop.
6. **Org structure (T7):** `DELIVERX_LEGACY_WORKSPACE_NAV` / `NEXT_PUBLIC_DELIVERX_LEGACY_WORKSPACE_NAV` restores demoted legacy workspace nav.
7. **PI rate limit (B9):** `DELIVERX_PI_RATE_LIMIT` kill-switch (default on); `DELIVERX_PI_RATE_LIMIT_MAX` (default 90); `DELIVERX_PI_RATE_LIMIT_WINDOW_MS` (default 60000). Exceeded calls return **429** `{ error, code: "rate_limited", retryAfterSeconds }` with `Retry-After` + `X-RateLimit-*` headers. Invalid activity/intervention transitions return **409** `{ error, code: "invalid_transition", from, to }`.

---

## Contract hygiene

- Prefer typed payloads colocated with `src/lib/*/types.ts` and `contracts.ts` modules.
- Do not invent capability or verification fields in API responses that the ledger/engine did not produce.
- When adding routes: document here + add unauth 401 smoke coverage for person PI endpoints.
- Honest failures: prefer stable `code` fields; never return success when a state transition was rejected.
- Activity / intervention status machines (B9): only declared transitions apply; same-state is an idempotent no-op; never assigns capability or Verified.
