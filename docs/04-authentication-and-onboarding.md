# 04 — Authentication & Onboarding

**Status:** Active  
**Audience:** Product, Engineering, UX, QA  
**Shipped:** Supabase Auth · gateway/account onboarding · PI progressive onboarding at `/onboarding/profile` (eight-step conversation, B5 / PD-2026-07-26i)

---

## Shipped reality (two layers)

DeliverX has **account/org onboarding** (organisation + role / gateway journey) and **Professional Intelligence onboarding** (progressive conversation → path recommendation).

| Layer | Routes / APIs | Completion signal |
| --- | --- | --- |
| Auth | `/(auth)/signup`, `login`, `verify`, password reset | Supabase session |
| Account / gateway | `/onboarding/organisation`, `persona`, `role`, `team`, `invite`, `complete` | `organisation_id` + `role`; gateway step `complete` |
| PI onboarding | `/onboarding/profile` · `POST /api/pi-onboarding` · `pi_onboarding_sessions` | Session `status=completed` + chosen path |

Guards: `src/lib/auth/require-onboarding.ts`, `onboarding.ts`. PI types: `src/lib/pi-onboarding/types.ts`.

---

## End-to-end flow (candidate)

```text
Landing → Sign up / Login → (verify email if required)
  → Account setup (org/role/gateway as applicable)
  → PI onboarding /onboarding/profile
      welcome → identity → targets → strengths → evidence → working_style → review → path
  → Recommended Experience / Launchpad / Profile hub
  → Dashboard / first meaningful action
```

Baseline assessment is **opt-in** (PD-2026-07-02), not a hard gate before Experience.

---

## Step sets (B5, PD-2026-07-26i)

The step list is a **versioned step set**, selected by `DELIVERX_ONBOARDING_STEP_SET`:

| Step set | Steps | Status |
| --- | --- | --- |
| `v2-conversation` (default) | `welcome`, `identity`, `targets`, `strengths`, `evidence`, `working_style`, `review`, `path` | Shipped shape |
| `v1-six-step` | `identity`, `situation`, `targets`, `evidence`, `consent`, `path` | Rollback target — env change only, no redeploy or migration |

Retired step ids stay valid in the database (`0099_pi_onboarding_step_sets.sql`) and are mapped to the nearest question in the active set by `resolveStepForSet`, so a part-finished session **resumes** rather than restarts when the step set changes. `situation` resolves to `identity`; `consent` resolves to `review`.

---

## PI onboarding steps (detailed)

Storage: `pi_onboarding_sessions.payload` (JSON) + `current_step` / `status` / `recommended_path` / `chosen_path`.  
All answers are **self-reported** unless later linked to ledger evidence. They **influence recommendations**, not capability levels. Onboarding never writes a ScoreRun, capability level, ledger evidence or `deliverxVerified`.

### 1. Welcome

Sets expectations before any question: roughly six minutes, what will be covered, progress saves at every step, private by default, and nothing captured here becomes verified evidence. No input required.

### 2. Identity / background

| Field | Why | Editable later | PI impact |
| --- | --- | --- | --- |
| First / last name | Anchors Professional Profile | Yes (profile settings) | Identity context |
| Professional identity (PM ladder / other) | Frames language and defaults | Yes | Recommendation context only |
| Current situation (student, employed PM, switcher, etc.) | Experience vs Launchpad bias | Yes | Yes (`recommendPath`) |

**Not verified.** Does not write ScoreRuns.

### 3. Career direction (`targets`)

| Field | Why | Influences? |
| --- | --- | --- |
| Career objective / target role / seniority / timeframe / industries | Relative capability views & planner | Yes — framing only |

### 4. Strengths & development areas (optional)

| Field | Why | Self-reported vs verified |
| --- | --- | --- |
| Up to 3 self-assessed strengths | Coaching focus | **Self-reported claim** — labelled “not a capability level, score or Verified status” |
| Up to 3 development priorities | Coaching focus | Self-reported claim |
| Optional note (≤500 chars) | Context for coaching | Self-reported |

Skippable without penalty. Never becomes a capability level; the Capability Engine remains the only writer of capability.

### 5. Evidence posture (optional)

| Field | Why | Self-reported vs verified |
| --- | --- | --- |
| Existing experience summary / no prior experience | Path recommendation | Self-reported; labelled |
| CV / portfolio / learning import notes | Continuity | Notes only — **not** ledger evidence until imported properly |
| Skipped imports | Honesty | — |

### 6. Working style (optional)

| Field | Why | Effect |
| --- | --- | --- |
| Collaboration / feedback / communication preference | How AI colleagues brief the member and how feedback lands | Presentation only — no assessment effect |

### 7. Review + consent

- Read-back table of every captured answer, each row labelled `Self-reported` or `Imported draft`, each with an **Edit** control that returns to the owning step.  
- Consent and default visibility are confirmed here (previously the standalone `consent` step):

| Field | Why | Default |
| --- | --- | --- |
| Consent analysis | What DeliverX may analyse | Explicit — required to complete |
| Visibility default | private / link / public | Prefer private |
| Baseline opt-in | Optional assessment (asked on the final step) | Off unless chosen |

Observation consent for continuous Workspace watching is a **separate** control (`pi_observation_consent`, default OFF).

### 8. Path / recommendation (summary + choose)

- System recommends `experience` | `launchpad` | `hub` via `recommendPath`  
- `explainRecommendation` states the deterministic reasons behind the choice  
- When the optional steps were skipped, the screen says so and offers a **default starter Experience** rather than implying a tailored match  
- User may change choice  
- Hrefs: `/experience/app`, `/launchpad/app`, `/profile`  
- Final screen: confirm path; explain next action in plain language  

---

## Exception paths

| Condition | Behaviour |
| --- | --- |
| Member leaves midway | Progress persists on every Continue / Save & exit; resumes at `current_step` |
| Member skips an optional step | `action: "skip"` records the step in `payload.skippedSteps` and advances without penalty; the server rejects skips on essential steps |
| Recommendation has thin data | Default starter Experience with an explicit “limited data” explanation |
| Step set changes under a live session | Resolved to the nearest equivalent step; answers are never discarded |

---

## Auth behaviour

- Session via Supabase SSR (`@supabase/ssr`)  
- Protected shells redirect to `/login?next=` (preserve deep links; workspace/settings covered)  
- Person PI APIs: **401** when anonymous  
- Optional gates: `DELIVERX_PI_ALLOWLIST`, surface flags  

### Founder ops residual

- TD-006: enable leaked-password protection in Supabase Auth dashboard (not agent-automatable)

---

## Validation & permissions

- Step validation in `validateStep(step, payload, stepSet)` (length limits, required selects, bounded optional selections)  
- Only the owning user may read/write their `pi_onboarding_sessions` (RLS)  
- Completing onboarding must not create fabricated evidence or capability  

---

## Acceptance criteria

- [ ] New user can reach PI onboarding after auth without dead ends  
- [ ] Each step shows “why we ask”  
- [ ] Self-reported imports never appear as verified evidence  
- [ ] Self-assessed strengths are labelled as a claim and produce no capability level  
- [ ] Optional steps can be skipped and the skip is recorded honestly  
- [ ] Review step reads back every answer with a route back to correct it  
- [ ] Path recommendation is changeable and states its rationale  
- [ ] Choosing Experience does not require baseline  
- [ ] Unauth access to PI APIs still 401  

## Edge cases

- Returning user with completed session: skip or show summary → dashboard  
- Partial session: resume `current_step`  
- Gateway incomplete vs PI incomplete: respect account guards first  
- Invite / org join paths: do not break PI progressive flow  

---

## Related

- [`05-professional-intelligence.md`](./05-professional-intelligence.md)  
- Migrations `0066_pi_onboarding.sql`, `0099_pi_onboarding_step_sets.sql`  
- Components: `src/components/pi-onboarding/pi-onboarding-wizard.tsx`  
- Step sets / validation / rationale: `src/lib/pi-onboarding/types.ts`; flag: `src/lib/pi-onboarding/flag.ts`  
