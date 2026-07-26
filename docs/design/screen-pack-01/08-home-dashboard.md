# 08 — Signed-In Home Dashboard

**Implementation status:** **Pack-1 implementable now**
**IA decision for implementation slice:** Evolve `/profile` as the unified home. Preserve `/hub` until redirect and nav impacts are tested; do not ship two competing home dashboards.

## Screen: Your professional home

**Product area:** Professional Intelligence / Suite Home
**Route:** `/profile`
**Primary user:** Signed-in professional returning to continue work
**Purpose:** Answer today’s priorities, active Experience, PI summary, recent evidence, career recommendation and one best next action.

**Primary user question:** “What matters today, what is my current professional picture, and what should I do next?”
**Immediate understanding:** I have one recommended next action with a reason; I can see active work, current claims, evidence status and career direction without interpreting a KPI dashboard.

**Primary action:** Dynamic accepted/recommended next action with stable internal href
**Secondary actions:** Continue active Experience; Review evidence; Open Launchpad
**Required data / source / permissions**
- Profile aggregate / SnapshotClaims / latest capability assessment via existing PI modules
- Active Experience plan/enrolment/sim
- Recent owner evidence and provenance
- Recommendation state machine and rationale
- Career Intelligence summary with `readinessSource`
- Notifications count
- Self-only access; PI feature gate; no cross-user or org leakage

**Layout**
- Header: suite shell, greeting, quiet profile metadata
- Nav: global journey nav only; no second product switcher
- Main: today’s priority; active Experience; PI summary; recent evidence; career recommendation
- Context panel: “Why this next action”, source/status legend, related evidence or guidance; never blank AI chat

**Components:** PageHeader, NextAction, ActiveExperience, ClaimSummary, EvidenceList, CareerRecommendation, NotificationEntry, ContextPanel, SourceLabel.

**States**
- **Loading:** Stable shell plus section skeletons; no fake bands/counts.
- **Empty:** New member sees “Start with a first Experience” and optional baseline; no empty KPI tiles.
- **Partial:** Show known sections; label missing assessment/evidence; readiness heuristic names its source.
- **Success:** Accept/dismiss/complete recommendation confirms state and updates next action.
- **Error:** Section-level recovery; one failed source does not blank the whole home.
- **Permission denied:** Redirect to `/hub?gate=...` or safe access explanation; no private details.

### Desktop wireframe

```text
┌ Suite nav: Home Profile Experience Launchpad Workspace Portfolio | Search | User ┐
├──────────────────────────────────────────────────────┬────────────────────────────┤
│ Good morning, Sam.                                   │ WHY THIS NEXT ACTION       │
│ One useful thing to do next                          │ rationale                  │
│ [Continue stakeholder brief] [Dismiss]               │ evidence references        │
├─────────────────────────────┬────────────────────────┤ source/status legend       │
│ ACTIVE EXPERIENCE           │ PROFESSIONAL PICTURE   │ related guidance           │
│ company · project · task    │ claim bands + Why      │                            │
│ [Continue]                  │ [View profile]         │                            │
├─────────────────────────────┴────────────────────────┤                            │
│ RECENT EVIDENCE: source · status · visibility        │                            │
├──────────────────────────────────────────────────────┤                            │
│ CAREER DIRECTION: recommendation + readiness source  │                            │
└──────────────────────────────────────────────────────┴────────────────────────────┘
```

### Mobile wireframe

```text
┌ Logo | Home | Search | User ┐
│ Good morning, Sam.          │
├ Next action + rationale     │
│ [Continue] [Dismiss]        │
├ Active Experience           │
├ Professional picture        │
├ Recent evidence             │
├ Career direction + source   │
├ Why this action (disclosure)│
└ Mobile suite navigation     │
```

**Accessibility:** H1 is greeting/purpose, not a metric; sections use H2; recommendation lifecycle actions have explicit confirmations; claim bands include textual “Why”; mobile order matches reading priority; no canvas-style drag layout; context disclosure is keyboard accessible.
**Analytics events:** Canonical `recommendation_viewed(surface=profile)`, `recommendation_accepted(surface=profile)`, `experience_started`, `evidence_appended`, `capability_assessment_completed`. Page view alone is insufficient; no raw evidence in analytics.
**Acceptance criteria**
- One primary next action appears above the fold with rationale.
- Empty and partial users receive useful actions without invented capability.
- Active Experience links to the real current work.
- PI claims use SnapshotClaims and existing confidence bands; UI never computes levels.
- Recent evidence shows source, status and visibility.
- Career readiness always shows assessment/mixed/evidence-coverage source.
- Context panel is evidence/guidance/related, never blank chat.
- Accept/dismiss never writes capability or Verified.
- `/hub` and `/profile` do not remain competing homes after final migration.

**Related screens:** Profile evidence, Experience app, Launchpad Career Dashboard, Portfolio, Settings privacy.
**Cursor implementation notes:** This is an aggregation/evolution slice, not a new data model. Inventory existing `ProfileCentre`, Hub, recommendation and Experience reads before implementation. Decide `/hub` redirect only after auth/onboarding deep links and suite nav tests are updated. Bound list sizes and fail sections independently.

## FINAL COPY

**Page purpose:** Your professional home

**Greeting:** Good morning, [first name].

**Support:** Continue the work that matters, review what it has added to your record and choose a credible next step.

**Next action heading:** One useful thing to do next

**Rationale label:** Why this is recommended

**Active Experience heading:** Continue your active Experience

**Professional Intelligence heading:** Your current professional picture

**Empty capability copy:** You do not have a capability assessment yet. Start with meaningful work, or choose an optional baseline when you want a structured starting point.

**Recent evidence heading:** Recent evidence

**Empty evidence copy:** Your evidence record is empty. Complete and submit meaningful work in Experience, or add an existing evidence item with its source.

**Career heading:** Your career direction

**Heuristic disclosure:** This guidance is based on evidence coverage, not a capability assessment. It is a starting point, not a readiness score.

**Verified disclosure:** A Verified label appears only when an independent named attestor confirms a specific claim.
