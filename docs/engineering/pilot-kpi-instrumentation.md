# B3 Pilot KPI instrumentation

**Status:** Shipped (Vercel Analytics path)  
**Decision:** PD-2026-07-26g  
**Provider:** Vercel Web Analytics custom events  
**Database migration:** None

## Purpose

B3 measures the real state changes in the pilot evidence loop. It does not create a
parallel event store, infer capability, or treat page views as completed work.
PostHog is not wired; that sink remains deferred pending FD-PACK-7.

## KPI map

| KPI | Event | Emission point |
| --- | --- | --- |
| Activation denominator | `account_created` | Successful Supabase password signup |
| Activation | `onboarding_pi_completed` | PI onboarding session persisted as completed |
| Core loop entry | `experience_started` | Xperience enrolment/start succeeds |
| Core loop planning | `experience_plan_generated` | Experience plan create/refresh succeeds |
| Judgement coverage | `capability_assessment_completed` | A non-duplicate ScoreRun and snapshot persist successfully |
| Evidence density | `evidence_appended` | A non-duplicate Evidence Ledger append succeeds |
| Work density | `artefact_version_created` | A non-duplicate immutable artefact version is created |
| Recommendation engagement | `recommendation_viewed` | Generated recommendations transition to viewed |
| Recommendation engagement | `recommendation_accepted` | Recommendation transitions to accepted |
| Career outcomes | `outcome_event_recorded` | P7 outcome persistence and calibration refresh succeed |

There is no `activity_submitted` event yet because the shipped PI path has no one
canonical activity-submission transition. Artefact versions and evidence appends are
the current trustworthy completion signals. Add that event only when the activity
state machine has a real persisted submitted transition.

## Privacy and operation

- The typed catalogue and allowlist live in `src/lib/analytics/pilot-kpis.ts`.
- Event properties contain no email, name, phone, address, evidence body, title,
  summary, or other free text. No user ID is sent.
- Server events use `@vercel/analytics/server` after successful writes. Provider
  failures are best-effort and never reverse the product action.
- `DELIVERX_ANALYTICS=vercel` explicitly enables server events;
  `DELIVERX_ANALYTICS=off` is the kill switch. With no value, server events default
  on only for Vercel production.
- Client signup emission defaults on with the loaded Vercel Analytics component;
  `NEXT_PUBLIC_DELIVERX_PILOT_KPIS=off` disables it.
- `DELIVERX_ANALYTICS=posthog` intentionally emits nothing. There is no PostHog SDK,
  dependency, adapter, or product analytics sink in B3.

## Reading the Vercel dashboard

Open the DeliverX project in Vercel, choose **Analytics**, then filter by **Custom
Events** and the event name above. Compare unique visitors for activation, and event
counts for evidence/work density. Use the approved catalogue properties for
breakdowns; do not interpret page views as loop completion.

Vercel custom-event availability and retention depend on the project plan. Protected
preview deployments may also need Vercel's Automation Bypass secret for server-side
events. Pilot reporting should first confirm each production event appears before
using rates operationally.
