# 07 — Onboarding Mapping

**Implementation status:** **Pack-1 implementable now**
**Route:** `/onboarding/profile`
**Rule:** Evolve shipped `v2-conversation`; do not create a parallel twelve-screen wizard. Existing API, payload, persisted ids, resume mapping, required consent and rollback step set remain authoritative.

## Twelve ideas mapped to the shipped eight steps

The founder’s twelve conceptual moments are treated as content moments, not route count.

| Founder concept | Shipped step | Treatment |
| --- | --- | --- |
| 1. Welcome and promise | `welcome` | Keep as opening screen |
| 2. Name and professional identity | `identity` | Existing fields |
| 3. Current situation | `identity` | Existing field within identity |
| 4. Career objective | `targets` | Existing field |
| 5. Target role and level | `targets` | Existing fields |
| 6. Timeframe and industries | `targets` | Existing fields |
| 7. Strengths | `strengths` | Existing optional self-report |
| 8. Development priorities | `strengths` | Existing optional self-report |
| 9. Existing evidence | `evidence` | Existing summary / none-yet path |
| 10. CV, portfolio and learning imports | `evidence` | Existing draft-note fields; future real imports stay separate |
| 11. Collaboration, feedback and communication style | `working_style` | Existing optional fields |
| 12. Review, privacy, consent and recommendation | `review` then `path` | Deliberately split: informed confirmation before recommendation |

## Shared wizard contract

- **Primary user:** Newly authenticated professional.
- **Purpose:** Build enough self-reported context for an explainable first recommendation.
- **Shell:** Minimal signed-in header; eight-step progress; one question group; “Why we ask”; Back / Continue; Save & exit; Skip only on optional steps.
- **Data:** `pi_onboarding_sessions.payload`, self-only RLS; every save persists current step.
- **Global states:** Loading resumes saved step; empty starts at welcome; partial resumes without discarding answers; success advances once; error retains input; permission denied returns to safe auth/gateway flow.
- **Accessibility:** Step count announced as “Step N of 8”; H1 changes per step; fields have labels/descriptions/errors; Enter never accidentally skips multi-field review; focus moves to H1 after navigation; selections work by keyboard.
- **Analytics:** `onboarding_pi_step_completed(step, session_id)` after save; completion uses canonical `onboarding_pi_completed(chosen_path, baseline_opt_in, step_set, step_count, steps_skipped)`. Third-party event properties never include answers or notes.

## Shared wireframe

```text
DESKTOP
┌ DeliverX                                      Save and exit ┐
│ Step N of 8  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━             │
├──────────────────────────────┬──────────────────────────────┤
│ H1 + support                 │ Why we ask / source status   │
│ fields / review / result     │ privacy or recommendation   │
│ [Back] [Skip if optional] [Continue]                        │
└──────────────────────────────┴──────────────────────────────┘

MOBILE
┌ DeliverX                         Save and exit ┐
│ Step N of 8  ━━━━━                              │
│ H1 + support                                    │
│ fields / review / result                        │
│ Why we ask (disclosure, open by default)        │
│ [Continue]                                      │
│ [Back] [Skip if optional]                       │
└─────────────────────────────────────────────────┘
```

---

## Screen 1: Welcome

**Product area / Route / Primary user / Purpose:** PI onboarding / `/onboarding/profile?step=welcome` / new member / set honest expectations.
**Primary user question / Immediate understanding:** “What will you ask and what will this create?” / About six minutes; saves as I go; private by default; no evidence/capability/Verified is created.
**Primary + secondary actions:** Start mapping; Save and exit.
**Required data / source / permissions:** Existing session and step set; owner only.
**Layout:** Header / step progress / expectation list / why-we-ask context.
**Components:** StepHeader, ExpectationList, TrustNote, WizardActions.
**States:** Shared contract; partial session changes CTA to “Continue mapping”; error offers retry.
**Responsive:** Use shared desktop/mobile wireframe; no fields; expectation list stacks.
**Accessibility:** Time estimate is text; progress has accessible name.
**Analytics events:** Canonical step completion on Continue.
**Acceptance criteria:** No form overload; save/resume and privacy stated; no “assessment” implication.
**Related screens:** Identity, Sign up.
**Cursor implementation notes:** Copy-only evolution over existing step.

**FINAL COPY:** **Let’s map where you are and where you want to go.** This short conversation takes about six minutes. Your answers save as you go, stay private by default and can be corrected later. They guide a starting recommendation; they do not create evidence, capability or Verified status. **CTA:** Start mapping.

---

## Screen 2: Identity

**Product area / Route / Primary user / Purpose:** PI onboarding / `?step=identity` / new member / establish identity and current context.
**Primary user question / Immediate understanding:** “How will you describe me?” / These are self-reported profile facts and recommendation context.
**Primary + secondary actions:** Continue; Back.
**Required data / source / permissions:** First/last name, professional identity, other detail, current situation; session owner.
**Layout:** Header / progress / grouped fields / source label and why panel.
**Components:** TextFields, SelectCards, SourceLabel, WizardActions.
**States:** Shared; partial pre-fills; validation keeps values; permission denied leaks nothing.
**Responsive:** Desktop fields may pair names; mobile stacks all fields.
**Accessibility:** Autocomplete names; radio/selection groups use legends.
**Analytics events:** Step completion only; no answer values.
**Acceptance criteria:** Current situation remains inside identity; “Other” reveals labelled input; self-reported label visible.
**Related screens:** Targets, Review.
**Cursor implementation notes:** Reuse existing payload keys and validation.

**FINAL COPY:** **Tell us how you describe yourself professionally.** This gives recommendations the right context. It is self-reported and can be edited later. **Fields:** Name; Professional identity; Current situation. **Why we ask:** Capability claims should attach to a person and context, not a generic account. **CTA:** Continue.

---

## Screen 3: Targets

**Product area / Route / Primary user / Purpose:** PI onboarding / `?step=targets` / new member / capture career direction in one coherent step.
**Primary user question / Immediate understanding:** “What will DeliverX help me move towards?” / My objective, target role, level, timeframe and industries frame recommendations only.
**Primary + secondary actions:** Continue; Back.
**Required data / source / permissions:** Objective, target role, seniority, timeframe, up to five industries; owner.
**Layout:** Header / progress / objective then structured targets / why panel.
**Components:** TextArea, TextField, Select, MultiSelect, WizardActions.
**States:** Shared; partial target can save only when required validation passes.
**Responsive:** Desktop two-column target metadata; mobile stacked.
**Accessibility:** Character guidance and selection count announced.
**Analytics events:** Step completion only.
**Acceptance criteria:** No promise of matching; target is editable; free text excluded from analytics.
**Related screens:** Strengths, Launchpad roadmap.
**Cursor implementation notes:** Keep current validation bounds.

**FINAL COPY:** **What are you working towards?** Describe the change you want to make, then add the role, level and timeframe that make it concrete. These targets frame recommendations; they are not a judgement of your current capability. **CTA:** Continue.

---

## Screen 4: Strengths and development priorities

**Product area / Route / Primary user / Purpose:** PI onboarding / `?step=strengths` / new member / set optional coaching focus without self-awarding capability.
**Primary user question / Immediate understanding:** “Can I tell you where I feel strong or want help?” / Yes; it remains a self-reported claim, not a score.
**Primary + secondary actions:** Continue; Skip for now; Back.
**Required data / source / permissions:** Up to three strengths, three priorities, optional 500-char note; owner.
**Layout:** Header / two selection groups / optional note / prominent source disclosure.
**Components:** PracticeAreaSelector, TextArea, SelfReportNotice, WizardActions.
**States:** Shared; empty is valid via Skip; partial shows selected count; error preserves note.
**Responsive:** Desktop groups side by side; mobile sequential.
**Accessibility:** Checkbox counts, not drag-only ranking.
**Analytics events:** Step completion or skip; no selected values.
**Acceptance criteria:** Exact “not capability, score or Verified” disclosure; skip without penalty; limits enforced.
**Related screens:** Evidence, Review.
**Cursor implementation notes:** Reuse practice areas and payload.

**FINAL COPY:** **Where do you feel strongest, and what would you like to develop?** Choose up to three in each group. This is a self-reported claim used to focus guidance. It is not a capability level, score or Verified status. **Actions:** Continue · Skip for now.

---

## Screen 5: Evidence posture

**Product area / Route / Primary user / Purpose:** PI onboarding / `?step=evidence` / new member / understand existing experience and draft imports.
**Primary user question / Immediate understanding:** “Can I bring what I already have?” / I can describe it now; notes remain self-reported/imported drafts until properly reviewed.
**Primary + secondary actions:** Continue; Skip for now; Back.
**Required data / source / permissions:** Experience summary or none-yet, optional CV/portfolio/learning notes; owner.
**Layout:** Header / experience choice / summary / import-note groups / source legend.
**Components:** NoneYetChoice, TextArea, ImportNoteFields, SourceLegend, WizardActions.
**States:** Shared; none-yet is valid; partial imports labelled draft; upload failure is not applicable unless a later approved importer exists.
**Responsive:** Desktop summary plus side import group; mobile stacked.
**Accessibility:** Mutually exclusive none-yet control; labels explain no file upload in current step.
**Analytics events:** Step completion or skip; never send notes.
**Acceptance criteria:** Imported draft never appears as ledger evidence; no experience path remains dignified; summary validation retained.
**Related screens:** Working style, Evidence Ledger, Portfolio.
**Cursor implementation notes:** Do not add file ingestion in this copy/UX slice.

**FINAL COPY:** **What experience or material are you bringing with you?** Summarise relevant work, or tell us you are starting without prior experience. You can also note a CV, portfolio or learning record to review later. These are self-reported or imported drafts—not verified evidence. **Actions:** Continue · Skip for now.

---

## Screen 6: Working style

**Product area / Route / Primary user / Purpose:** PI onboarding / `?step=working_style` / new member / tailor presentation and feedback style.
**Primary user question / Immediate understanding:** “Can DeliverX work in a way that suits me?” / Preferences change briefing and feedback presentation, not assessment.
**Primary + secondary actions:** Continue; Skip for now; Back.
**Required data / source / permissions:** Collaboration, feedback, communication preferences; owner.
**Layout:** Header / three concise selection groups / effect disclosure.
**Components:** PreferenceCards, EffectDisclosure, WizardActions.
**States:** Shared; all fields optional; skip recorded.
**Responsive:** Desktop three groups; mobile stacked.
**Accessibility:** Radio groups; selected state textual.
**Analytics events:** Completion or skip only.
**Acceptance criteria:** No personality score; no assessment impact; preferences editable later.
**Related screens:** Review, Experience.
**Cursor implementation notes:** Reuse existing option values.

**FINAL COPY:** **How do you prefer to work and receive feedback?** Choose what feels closest today. These preferences shape how briefings and feedback are presented. They do not affect capability assessment. **Actions:** Continue · Skip for now.

---

## Screen 7: Review and consent

**Product area / Route / Primary user / Purpose:** PI onboarding / `?step=review` / new member / inspect every answer before analysis and visibility consent.
**Primary user question / Immediate understanding:** “What did you record, and what am I agreeing to?” / Every item is labelled/editable; analysis consent required; sharing defaults private.
**Primary + secondary actions:** Confirm and continue; Edit section; Back.
**Required data / source / permissions:** Review rows, consent analysis, visibility default, baseline opt-in; owner. Observation consent is separate and absent.
**Layout:** Header / review sections / source labels / consent controls / baseline option / why panel.
**Components:** ReviewRows, EditLinks, ConsentCheckbox, VisibilityRadios, BaselineOption, WizardActions.
**States:** Shared; missing required consent blocks with field error; partial rows say Not provided; success saves before path.
**Responsive:** Desktop review table and sticky confirmation rail; mobile labelled cards then controls.
**Accessibility:** Table/list semantics; edit links include section; no preselected public visibility; checkbox errors announced.
**Analytics events:** Step completion only; consent value stays operational data, not third-party analytics.
**Acceptance criteria:** Every captured answer appears; labels are Self-reported or Imported draft; private preferred; observation consent not bundled; baseline off by default.
**Related screens:** Owning edit steps, Path, Settings privacy.
**Cursor implementation notes:** Preserve current consent validation and edit routing.

**FINAL COPY:** **Review what we recorded before we use it.** Every answer below is self-reported or an imported draft. Correct anything that is incomplete. Then confirm whether DeliverX may analyse these answers and choose your default visibility. Your profile is private unless you choose otherwise. **Primary CTA:** Confirm and continue.

---

## Screen 8: Starting path

**Product area / Route / Primary user / Purpose:** PI onboarding / `?step=path` / new member / explain and let the user choose a first useful destination.
**Primary user question / Immediate understanding:** “Why are you recommending this, and can I choose differently?” / Recommendation is deterministic, cites answers, admits limited data and remains changeable.
**Primary + secondary actions:** Start recommended path; Choose another path; Back.
**Required data / source / permissions:** `recommendPath`, `explainRecommendation`, chosen path, baseline opt-in; owner.
**Layout:** Header / recommendation / rationale / data sufficiency / three path choices / what happens next.
**Components:** RecommendationCard, RationaleList, DataSufficiency, PathOptions, WizardActions.
**States:** Loading—calculate from saved payload; Empty/limited—default starter Experience with disclosure; Partial—show available rationale; Success—complete and route; Error—allow safe retry without duplicate completion; permission denied—auth.
**Responsive:** Desktop recommendation plus alternative path rail; mobile recommendation then path options.
**Accessibility:** Recommended state not colour-only; choices are radios/cards with full labels.
**Analytics events:** Canonical `onboarding_pi_completed`; later destination events remain separate.
**Acceptance criteria:** User can override; rationale is plain language; limited data is explicit; completion writes no evidence/capability/Verified; destination is one of existing routes.
**Related screens:** Experience, Launchpad, Profile home.
**Cursor implementation notes:** Reuse existing recommendation functions and hrefs; do not add opaque AI recommendation.

**FINAL COPY:** **A useful place to start.** Based on what you shared, we recommend **[Experience / Launchpad / your professional home]**. **Why:** [deterministic reasons]. [If limited:] We have limited detail so far, so this is a default starting point rather than a tailored match. You can choose a different path now or change direction later. **Primary CTA:** Start this path. **Secondary:** Choose another path.
