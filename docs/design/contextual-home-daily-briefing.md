# Contextual Home + Daily Briefing

**Status:** Implemented (v1)  
**Authority:** Build Charter · Current Scope · Screen Pack 01 `/profile` home · PD-2026-07-26o  
**Canonical route:** `/profile` (post-login candidate landing; Hub remains secondary chooser)  
**Typed SoT:** `src/lib/contextual-home/`  
**Kill-switch:** `DELIVERX_CONTEXTUAL_HOME=off` (default **on**)

---

## Intent

Dashboards adapt to **journey state**, not a static widget homepage. In under ~10 seconds, Home answers:

1. Where am I?
2. What should I do today?
3. Why does it matter?
4. How am I progressing?
5. What should I do next?

Conceptual layers (Intelligence → Action → Workspace → Growth → Insights) describe **content**, not five nav products. **Insights is not a suite nav item** (prior FD / B7). Insights = “what next” prose and cards inside Home / PI / Launchpad.

Biggest ask: a **Daily Briefing** on login/home — personalised, evidence-backed, one highest-impact CTA (start-of-workday clarity).

---

## Architecture

```text
Auth redirect → /profile (canonical Home)
       │
       ▼
GET /api/pi/profile
       │
       ├─ buildPiProfileAggregate (existing PI truth)
       ├─ getXperienceSession (active enrolment)
       └─ resolveHomeState + buildDailyBriefing (flag-gated)
              │
              ▼
ProfileCentre → DailyBriefing (above fold) + existing sections
```

- No duplicated PI / SnapshotClaims / recommendation truth.
- Briefing is a **projection** over existing aggregates + Experience session.
- v1 prose is **deterministic templates** (no LLM). If AI is added later: `ai-orchestration`, citations, draft labelling.

---

## State machine

| State | Code | Focus | Detection (deterministic) |
| --- | --- | --- | --- |
| **A** Not onboarded | `not_onboarded` | Continue Professional Identity — single CTA | `onboardingComplete === false` |
| **B** Onboarded, no Experience | `recommend_experience` | Recommended Experience + goal + why | Onboarded; no active unfinished enrolment; no experience-sourced evidence |
| **C** Inside active Experience | `active_experience` | Org/project briefing: day, company, continue work | ACTIVE enrolment and `lifecycle` ∉ {`completed`, `failed`} |
| **D** Launchpad-primary | `launchpad_primary` | Career readiness (qualitative), roles, next interview/prep | Heuristic (below); no fake % |
| **E** Team Copilot executive | *(deferred)* | Thin Workspace summary card + link only | Never resolves as primary Home state |

**Priority:** A → C → D → B → `progress` (post-Experience / assessment loop when none of A–D apply).

### Launchpad-primary heuristic (D)

Documented in `resolve-home-state.ts`. True when onboarded, not in active Experience (C), and any of:

1. Product intent metadata is `launchpad`, **or**
2. Real outcome activity: `interviews > 0` or `applications > 0`, **or**
3. Career roadmap contains an `interview_prep` item, **or**
4. Onboarding `chosen_path` / `recommended_path` is `launchpad` and there is no experience evidence yet is **not** sufficient alone if B would apply — path alone with no outcomes yields **B** when no Experience; D requires career signal **or** explicit launchpad product intent after Experience exists, or launchpad product with outcomes/roadmap.

Practical rule implemented:

- Not A, not C.
- `productIntent === "launchpad"` **or** (`interviews|applications > 0`) **or** `hasInterviewPrepRoadmap`.
- If that fires while user still has **zero** experience evidence and product is not launchpad → prefer **B** (Experience-first). Launchpad product intent may still select D so Launchpad-sku users land career-forward.

### Team Copilot (E)

Build-gated. Any state may attach an optional **thin Workspace** card (`/workspace`) when the user has org membership or `team-copilot` product intent. No programme health %, approvals theatre, or “Excellent” delivery scores.

---

## Founder draft — in vs out of charter

| Founder draft idea | Disposition |
| --- | --- |
| Adaptive journey Home + five questions | **Accepted** |
| Daily Briefing with one primary CTA | **Accepted** |
| Insights as content inside Home | **Accepted** (not a nav product) |
| 80% journey / 65% project / 92% programme / “Excellent” | **Rejected as UI** — illustrative only; use bands, counts, named entities |
| Five separate dashboard apps | **Out of scope** |
| Team Copilot executive Dashboard 5 | **Gated** — thin Workspace card only |
| Nav emoji redesign | **Rejected** (constitution) |
| Employer marketplace widgets | **Gated** |
| Fake Verified inflation | **Rejected** — T8 only |

---

## Daily Briefing content contract

### Inputs

- Onboarding completion + identity goal fields  
- Active Experience enrolment (company, day, lifecycle)  
- Active/ephemeral Experience plan (title, rationale, href)  
- Evidence counts by source (experience vs other) — **counts only**  
- SnapshotClaims → qualitative confidence band label when present (B1); never invent %  
- Career outcomes counts + interview_prep roadmap (named items)  
- Existing `PiProfileNextAction` (prefer as CTA when coherent)  
- Optional `verifiedClaimCount` **only** when attested (T8); omit when zero  

### Prose rules

1. Answer the five questions explicitly (fields on the DTO).  
2. Cite real entities in `citations[]` (plan id, enrolment id, recommendation kind, meeting none invent).  
3. One `primaryAction` with href + label; secondary cards may have actions or be omitted.  
4. No unexplained percentages; no “Excellent” health; no emoji.  
5. Learning ≠ capability; ScoreRun ≠ Verified; `capabilityAssigned: false`.  
6. Partial data: omit cards; never invent missing sections.

### CTA selection

Prefer journey-state CTA; fall back to aggregate `nextAction` when state-specific href is missing.

---

## Wireframes

### Desktop — state C (active Experience)

```text
┌ Suite: Hub | Profile | Experience | Launchpad | Workspace | Portfolio ┐
├──────────────────────────────────────────────────┬────────────────────┤
│ Daily briefing · Active Experience               │ Why this matters   │
│ Where: Day 3 at MediFlow                         │ cites company/day  │
│ Today: Continue stakeholder brief                │ Progress: 4        │
│ [Continue Experience]                            │ evidence items     │
│ Cards: evidence count · next meeting none invent │ Next: assessment   │
├──────────────────────────────────────────────────┴────────────────────┤
│ (existing Profile sections: prove / holding back / what next / …)     │
└───────────────────────────────────────────────────────────────────────┘
```

### Mobile — state A

```text
┌ Profile (Home) ┐
│ Daily briefing │
│ Continue       │
│ Professional   │
│ Identity       │
│ [Continue]     │
│ Why: anchors   │
│ later claims   │
└────────────────┘
```

States B/D follow the same shell: one CTA, why, progress as counts/bands, optional thin Workspace card — never executive OS.

---

## Acceptance criteria

- [x] Canonical Home is `/profile`; auth redirect unchanged for candidate journey.  
- [x] States A–D resolve deterministically with documented heuristics.  
- [x] E never ships as executive dashboard; thin Workspace card only.  
- [x] No invented % / “Excellent”; Verified line only when attested count > 0.  
- [x] Loading / empty / error / partial: briefing section fails independently when flag on.  
- [x] Kill-switch restores prior Profile without briefing.  
- [x] Unit tests cover A–D + honesty.  
- [x] Pilot KPIs `home_briefing_viewed` / `home_primary_cta_clicked` privacy-safe.  

---

## Out of scope (this slice)

Full five dashboard apps; marketplace; deep Team Copilot Dashboard 5; decorative charts; nav emoji; payments; LLM-authored briefing.
