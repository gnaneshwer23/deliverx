# 04 — Authentication & Onboarding

**Status:** Active  
**Audience:** Product, Engineering, UX, QA  
**Shipped:** Supabase Auth · gateway/account onboarding · PI progressive onboarding at `/onboarding/profile`

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
      identity → situation → targets → evidence → consent → path
  → Recommended Experience / Launchpad / Profile hub
  → Dashboard / first meaningful action
```

Baseline assessment is **opt-in** (PD-2026-07-02), not a hard gate before Experience.

---

## PI onboarding steps (detailed)

Storage: `pi_onboarding_sessions.payload` (JSON) + `current_step` / `status` / `recommended_path` / `chosen_path`.  
All answers are **self-reported** unless later linked to ledger evidence. They **influence recommendations**, not capability levels.

### 1. Identity

| Field | Why | Editable later | PI impact |
| --- | --- | --- | --- |
| First / last name | Anchors Professional Profile | Yes (profile settings) | Identity context |
| Professional identity (PM ladder / other) | Frames language and defaults | Yes | Recommendation context only |

**Not verified.** Does not write ScoreRuns.

### 2. Situation

| Field | Why | Influences recommendations? |
| --- | --- | --- |
| Current situation (student, employed PM, switcher, etc.) | Experience vs Launchpad bias | Yes (`recommendPath`) |

### 3. Targets

| Field | Why | Influences? |
| --- | --- | --- |
| Career objective / target role / seniority / industries | Relative capability views & planner | Yes — framing only |

### 4. Evidence posture

| Field | Why | Self-reported vs verified |
| --- | --- | --- |
| Existing experience summary / no prior experience | Path recommendation | Self-reported; labelled |
| CV / portfolio / learning import notes | Continuity | Notes only — **not** ledger evidence until imported properly |
| Skipped imports | Honesty | — |

### 5. Consent

| Field | Why | Default |
| --- | --- | --- |
| Consent analysis | What DeliverX may analyse | Explicit |
| Visibility default | private / link / public | Prefer private |
| Baseline opt-in | Optional assessment | Off unless chosen |

Observation consent for continuous Workspace watching is a **separate** control (`pi_observation_consent`, default OFF).

### 6. Path (summary + choose)

- System recommends `experience` | `launchpad` | `hub` via `recommendPath`  
- User may change choice  
- Hrefs: `/experience/app`, `/launchpad/app`, `/profile`  
- Final screen: confirm path; explain next action in plain language  

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

- Step validation in `validateStep` (length limits, required selects)  
- Only the owning user may read/write their `pi_onboarding_sessions` (RLS)  
- Completing onboarding must not create fabricated evidence or capability  

---

## Acceptance criteria

- [ ] New user can reach PI onboarding after auth without dead ends  
- [ ] Each step shows “why we ask”  
- [ ] Self-reported imports never appear as verified evidence  
- [ ] Path recommendation is changeable  
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
- Migration `0066_pi_onboarding.sql`  
- Components: `src/components/pi-onboarding/pi-onboarding-wizard.tsx`  
