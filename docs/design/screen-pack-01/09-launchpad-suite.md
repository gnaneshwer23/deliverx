# 09 — Launchpad Full Suite Redesign

**Implementation status:** **Design-complete / phased build**
**Build rule:** Redesign as vertical slices over existing routes and modules. Do not big-bang rewrite the Launchpad shell, Professional Intelligence, Portfolio or application data.

## Information architecture and shipped reality

| Destination | Route | Reality | Build disposition |
| --- | --- | --- | --- |
| Career Dashboard | `/launchpad/app` | Readiness home exists; consolidated action dashboard is net-new | Phase after shell contract |
| Readiness | `/launchpad/app/readiness` (home may alias initially) | Shipped | Evolve first |
| Roadmap | `/launchpad/app/roadmap` | Shipped foundation | Evolve |
| CV | `/launchpad/app/cv` | Shipped foundation | Evolve |
| Portfolio | `/portfolio` (linked from Launchpad) | Shipped PI/attestation surface | Integrate, do not duplicate |
| Interview | `/launchpad/app/interview` | Shipped foundation | Evolve |
| Applications | `/launchpad/app/applications` | Shipped foundation | Evolve |

Shared shell: suite nav + Launchpad local nav. Shared context panel priority: rationale, cited evidence, source label, related career objective. No blank AI chat. Shared states follow `00-design-system.md`; section failures are independent. Shared accessibility: active local nav announced, mobile tabs horizontally scroll with visible labels, charts have text alternatives, every readiness display names its source.

---

## Screen: Career Dashboard

**Product area / Route / Primary user / Purpose:** Launchpad / `/launchpad/app` / professional planning a move / orient career work around one next action.
**Primary user question / Immediate understanding:** “What should I do next to make my target move more credible?” / One action is recommended from PI, with readiness source and current application/interview work visible.
**Primary + secondary actions:** Accept recommended career action; Open readiness; Review applications.
**Required data / source / permissions:** Career Intelligence, target, recommendation SM, latest artefacts, application summary; self-only.
**Layout:** Header / suite + Launchpad local nav / next action, target role, readiness summary, artefact progress, application activity / rationale context panel.
**Components:** CareerTarget, NextAction, ReadinessSummary, ArtefactProgress, ApplicationSummary, ContextPanel.
**States:** Loading—skeleton; Empty—set target or return to Profile; Partial—source labels and missing-input actions; Success—recommendation state updates; Error—section retry; Permission denied—auth/entitlement gate.
**Desktop wireframe:** `Local nav | Next career action + target | readiness/source | artefacts | applications || Why this action`
**Mobile wireframe:** `Local tabs / target / next action / readiness / artefacts / applications / rationale disclosure`.
**Accessibility:** No radial score-only graphic; all statuses textual.
**Analytics events:** `recommendation_viewed(surface=launchpad)`, `recommendation_accepted(surface=launchpad)`.
**Acceptance criteria:** One action; source visible; no job-match promise; no duplicate Portfolio data.
**Related screens:** Readiness, Roadmap, Profile home.
**Cursor implementation notes:** Net-new aggregation; build only after Readiness redesign stabilises contracts.
**PROVISIONAL COPY:** **Career Dashboard.** Focus your career work on the next action your evidence supports. **CTA:** Review your next action.

---

## Screen: Readiness

**Product area / Route / Primary user / Purpose:** Launchpad / `/launchpad/app/readiness` / role seeker / explain preparedness relative to a target without decorative truth.
**Primary user question / Immediate understanding:** “What supports my readiness, and where is the evidence thin?” / Readiness comes from an assessment, mixed inputs or evidence coverage and says which.
**Primary + secondary actions:** Build evidence for a named gap; Update capability profile.
**Required data / source / permissions:** Career Intelligence `readinessSource`, SnapshotClaims, target role, framework pin; self-only.
**Layout:** Header / local nav / source disclosure, capability areas, supporting evidence, gaps / “Why this view” context.
**Components:** SourceDisclosure, CapabilityAreaList, EvidenceCitations, GapActions, ContextPanel.
**States:** Loading—no fake values; Empty—set target/start Experience; Partial—heuristic clearly labelled; Success—new source refresh; Error—retry; Permission denied—safe gate.
**Desktop wireframe:** `Readiness + source | capability areas and evidence | gaps and actions || Why/source/framework`
**Mobile wireframe:** `Source banner / areas / evidence / gaps / why disclosure`.
**Accessibility:** If percentages remain for compatibility, adjacent source/rationale and textual band are mandatory; preferred design uses bands and evidence counts.
**Analytics events:** `recommendation_viewed`; future `launchpad_readiness_viewed` proposed without score payload.
**Acceptance criteria:** Source cannot be hidden; heuristic is not capability truth; framework and evidence rationale accessible.
**Related screens:** Roadmap, Experience planner, Profile assessment.
**Cursor implementation notes:** Evolve existing active module; do not recalculate capability in UI.
**PROVISIONAL COPY:** **Readiness for [target role].** This view is based on **[latest capability assessment / mixed sources / evidence coverage]**. Use it to choose what to strengthen—not as a guarantee of hiring outcome.

---

## Screen: Career Roadmap

**Product area / Route / Primary user / Purpose:** Launchpad / `/launchpad/app/roadmap` / professional with a target / turn explainable gaps into ordered actions.
**Primary user question / Immediate understanding:** “What should I work on, in what order, and why?” / Each action cites a gap/evidence need and links to Experience, artefact or career work.
**Primary + secondary actions:** Start next roadmap action; Adjust target.
**Required data / source / permissions:** Target, recommendations, claims/gaps, accepted/completed state; self-only.
**Layout:** Header / local nav / current objective, now-next-later action list / rationale and related evidence context.
**Components:** ObjectiveHeader, RoadmapList, ActionState, Rationale, RelatedEvidence.
**States:** Loading; Empty—generate from target; Partial—limited-data default disclosed; Success—accept/complete; Error—retain state; Permission denied.
**Desktop wireframe:** `Objective | Now / Next / Later actions || rationale + evidence`
**Mobile wireframe:** `Objective / Now / Next / Later / rationale per action`.
**Accessibility:** Ordered list, not drag-only; completion does not use strikethrough alone.
**Analytics events:** Canonical recommendation viewed/accepted; completion domain event if existing, not invented client truth.
**Acceptance criteria:** Actions are dismissible; completion does not mutate capability; every action has a why and stable href.
**Related screens:** Readiness, Experience, CV.
**Cursor implementation notes:** Reuse recommendation SM; no parallel roadmap truth.
**PROVISIONAL COPY:** **Your career roadmap.** A focused sequence based on your target, current evidence and accepted recommendations. Completing an action records progress; it does not award capability.

---

## Screen: Evidence CV

**Product area / Route / Primary user / Purpose:** Launchpad / `/launchpad/app/cv` / applicant / draft role-relevant CV statements grounded in selected evidence.
**Primary user question / Immediate understanding:** “Which claims can I make credibly?” / Each draft line shows its evidence and source; user edits and owns final copy.
**Primary + secondary actions:** Create/update draft; Review supporting evidence; Export when supported.
**Required data / source / permissions:** Profile, target, selected SnapshotClaims/evidence, immutable artefact versions; self-only.
**Layout:** Header / local nav / target selector, CV sections and statements / evidence context panel.
**Components:** CvSectionEditor, ClaimCitation, SourceLabel, DraftBadge, ExportAction.
**States:** Loading; Empty—choose target/evidence; Partial—uncited lines flagged; Success—version saved; Error—draft retained; Permission denied.
**Desktop wireframe:** `CV editor sections || selected evidence + source + claim warning`
**Mobile wireframe:** `Target / section editor / evidence disclosure per line / save`.
**Accessibility:** Editor labels and keyboard order; exported document structure is semantic.
**Analytics events:** `artefact_version_created(kind=cv, source_surface=launchpad)` only after save.
**Acceptance criteria:** AI text labelled draft; uncited claims cannot masquerade as evidence-backed; save creates immutable version where PI artefact path applies.
**Related screens:** Evidence, Portfolio, Interview.
**Cursor implementation notes:** Preserve existing artefact/version model; never overwrite prior version.
**PROVISIONAL COPY:** **Build a CV you can substantiate.** Draft each claim against work you can explain. AI can help shape language; you choose the evidence and own the final statement.

---

## Screen: Portfolio

**Product area / Route / Primary user / Purpose:** Launchpad link to `/portfolio` / applicant / package selected claims and evidence for controlled sharing.
**Primary user question / Immediate understanding:** “What can I share, and what is externally verified?” / Visibility and attestation status are explicit per claim.
**Primary + secondary actions:** Add a portfolio entry; Preview share; Request attestation when eligible.
**Required data / source / permissions:** Existing VPP entries, evidence links, visibility, T8 attestation; owner; token views least privilege.
**Layout:** Header / Launchpad return link + suite nav / entries and status / visibility/attestation context.
**Components:** PortfolioEntry, VisibilityControl, AttestationStatus, SharePreview.
**States:** Loading; Empty—compile from evidence; Partial—pending/disputed status; Success—share/request confirmation; Error; Permission denied.
**Desktop wireframe:** `Portfolio entries + controls || visibility / attestation meaning / related evidence`
**Mobile wireframe:** `Entries / per-entry status / actions / trust disclosure`.
**Accessibility:** Status text; destructive revoke confirmation; public preview announced.
**Analytics events:** Existing `attestation_requested/confirmed/disputed`, `evidence_externally_verified`.
**Acceptance criteria:** No duplicate Launchpad portfolio store; Verified only after T8 confirm; private evidence absent from shares.
**Related screens:** CV, Employers, Attestor portal.
**Cursor implementation notes:** Integrate navigation only; Portfolio remains its canonical route/module.
**PROVISIONAL COPY:** **Portfolio.** Select the claims and work you are ready to share. A Verified label applies only to a specific claim confirmed by an independent attestor.

---

## Screen: Interview Lab

**Product area / Route / Primary user / Purpose:** Launchpad / `/launchpad/app/interview` / interview candidate / practise role questions using evidence-backed stories.
**Primary user question / Immediate understanding:** “Can I tell stronger stories without inventing outcomes?” / Prompts cite my evidence; AI feedback is a draft, not a judgement or verified record.
**Primary + secondary actions:** Start a practice session; Build a story from evidence.
**Required data / source / permissions:** Target, selected evidence/artefacts, interview session state, AI orchestration; self-only.
**Layout:** Header / local nav / session setup, question, response workspace, evidence references / contextual feedback panel.
**Components:** SessionSetup, QuestionPanel, ResponseEditor, EvidencePicker, DraftFeedback.
**States:** Loading; Empty—choose target/evidence; Partial—practice without enough evidence warns; Success—session saved; Error—response retained/retry; Permission denied.
**Desktop wireframe:** `Question + response workspace || evidence references + AI draft feedback`
**Mobile wireframe:** `Question / response / evidence / submit / feedback disclosure`.
**Accessibility:** Timers optional and extendable; no speech-only requirement; transcript editable.
**Analytics events:** Proposed `interview_practice_started/completed` only after analytics catalogue approval; no transcript/prompts sent to third party.
**Acceptance criteria:** No invented claim; AI feedback labelled; no capability write; context-bound session.
**Related screens:** CV, Portfolio, Applications.
**Cursor implementation notes:** Reuse orchestration and existing module; chat history is not primary DB.
**PROVISIONAL COPY:** **Practise the story behind the evidence.** Build interview answers from work you can explain. Feedback is an AI-assisted draft for your review, not a capability assessment.

---

## Screen: Applications

**Product area / Route / Primary user / Purpose:** Launchpad / `/launchpad/app/applications` / active applicant / track pursued roles and next actions without pretending to source jobs.
**Primary user question / Immediate understanding:** “What am I pursuing and what needs attention?” / My own applications, stages, artefacts and follow-ups are organised here.
**Primary + secondary actions:** Add application; Update stage; Prepare next action.
**Required data / source / permissions:** Owner application records, role label, dates, linked artefacts/outcomes; self-only. No marketplace inventory.
**Layout:** Header / local nav / filter, application list/table, upcoming actions / selected application context.
**Components:** ApplicationList, StageControl, NextAction, ArtefactLinks, OutcomePrompt.
**States:** Loading; Empty—add first application; Partial—missing next date/artefact; Success—stage saved; Error—retain edit; Permission denied.
**Desktop wireframe:** `Filters | applications table + next actions || selected role artefacts/history`
**Mobile wireframe:** `Filters / application cards / stage / next action / details disclosure`.
**Accessibility:** Table/card parity; stage select labelled; dates readable; no colour-only pipeline.
**Analytics events:** Canonical `application_submitted(role_label)` only if role label policy remains approved; `outcome_event_recorded` for real outcomes.
**Acceptance criteria:** User-created applications only; no “matched jobs”; stage changes audited where supported; outcomes do not auto-upgrade capability.
**Related screens:** Interview, CV, Outcomes.
**Cursor implementation notes:** Evolve existing module; do not add employer marketplace or scraping.
**PROVISIONAL COPY:** **Applications.** Keep the roles you choose to pursue, the material you used and the next follow-up in one place. DeliverX does not guarantee interviews or offers.

## Phased build recommendation

1. Readiness source and evidence redesign.
2. Roadmap on canonical recommendation state machine.
3. CV evidence citations and immutable versions.
4. Interview evidence binding.
5. Applications and outcomes coherence.
6. Career Dashboard aggregation.
7. Portfolio navigation integration, without data duplication.
