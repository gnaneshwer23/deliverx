# 05 — Marketing: For Employers

> **DESIGN-COMPLETE / BUILD-GATED**
>
> The public evidence story is design-approved. Employer accounts, candidate matching, opportunity inventory, search, messaging, bulk attestations and marketplace liquidity remain build-gated and require a separate founder product decision, privacy model, operating model and supply/demand plan.

## Screen: Capability evidence for hiring

**Product area:** Marketing / Employers
**Route:** Proposed `/employers`
**Primary user:** Hiring manager or talent leader evaluating a candidate’s evidence
**Purpose:** Explain how DeliverX can make a candidate claim more inspectable without claiming a hiring marketplace exists.

**Primary user question:** “What can I trust, and what exactly has been verified?”
**Immediate understanding:** I can inspect a candidate-authorized claim, its evidence sources, capability context and any independent attestation; DeliverX does not claim a whole person is universally verified.

**Primary action:** Learn how evidence works
**Secondary action:** Contact DeliverX
**Gated future action:** Explore candidates — must not ship until marketplace approval and liquidity.
**Required data / source / permissions:** Public static copy. Future candidate data requires candidate consent, share token, least-privilege projection, visibility filters and no attestor PII.
**Layout:** Header; hero; hiring problem; evidence anatomy; source labels; sample claim; candidate-control/privacy; attestation explanation; gated future capability; contact CTA; footer.
**Components:** EmployerHero, EvidenceAnatomy, SourceLegend, IllustrativeClaim, PrivacyControls, AttestationExplainer, GatedFutureNote, CTA.

**States**
- **Loading:** Static marketing shell; illustrative claim skeleton only if needed.
- **Empty:** If no approved example, use the evidence anatomy without a fake candidate.
- **Partial:** Claim without attestation says “Not externally verified”.
- **Success:** Contact intent acknowledged without promising matching.
- **Error:** Contact fallback provides a mail link; evidence story remains readable.
- **Permission denied:** Future private share says access unavailable without confirming candidate existence.

### Desktop wireframe

```text
┌ Header ┐
│ Hire with a clearer view of what someone has demonstrated       [Learn] [Contact]│
├ Problem: CV claims are hard to inspect                                             │
├ Evidence anatomy: claim | context | artefact | provenance | judgement | attestation│
├ Source legend                                                                     │
├ Illustrative candidate-authorized claim (clearly labelled)                        │
├ Candidate control: private by default · explicit sharing · revoke                 │
├ What external verification means / does not mean                                  │
├ Future marketplace direction — build gated, no browse CTA                         │
└ Contact CTA + footer                                                              │
```

### Mobile wireframe

```text
┌ Header ┐
│ Hero + Learn CTA                         │
├ Hiring problem                           │
├ Evidence anatomy, stacked                │
├ Source labels                            │
├ Illustrative claim                       │
├ Privacy and candidate control            │
├ Attestation meaning                      │
├ Gated future direction                   │
└ Contact + footer                         │
```

**Accessibility:** Evidence anatomy has text order; sample claim identifies itself as illustrative; source statuses are textual; contact form labels and errors are explicit; no inaccessible document preview.
**Analytics events:** Proposed `employer_evidence_explainer_viewed`, `employer_contact_intent_submitted`; never capture candidate search terms or private evidence in third-party analytics. Existing `attestation_requested/confirmed/disputed` remain product trust events, not marketing conversion theatre.
**Acceptance criteria**
- Page never implies an active candidate marketplace or available matching.
- “Verified” is limited to a specific independently attested claim.
- Candidate consent, privacy and revocation are prominent.
- An illustrative claim cannot be mistaken for a real person or testimonial.
- No broad ranking, fit score or opaque candidate score.

**Related screens:** PI brief, Launchpad portfolio, public portfolio share, attestor portal.
**Cursor implementation notes:** Do not create route or employer data model under this task. A future static narrative slice could be approved separately; marketplace CTA, accounts and matching remain excluded.

## PROVISIONAL COPY

**Headline:** Hire with a clearer view of what someone has demonstrated.

**Support:** DeliverX helps professionals organise claims, work evidence and capability context so an employer can inspect the source—not just read another list of skills.

**Evidence heading:** See the claim, the work behind it and its status.

Each shared claim can show the context in which work happened, the artefacts or outcomes cited, the source of the evidence, the relevant capability judgement and whether a named independent person attested that specific claim.

**Verification heading:** External verification is specific, not universal.

An externally verified label means a named independent attestor confirmed one claim through the DeliverX attestation path. It does not mean DeliverX audited the candidate’s whole profile, guarantees job performance or endorses every claim.

**Privacy heading:** The professional stays in control.

Professional records are private by default. A candidate chooses what to share. Public views exclude private evidence and attestor personal information.

**Future direction heading:** A more evidence-aware hiring workflow.

Candidate discovery and matching are a future direction, not a live marketplace. They will require explicit product approval, candidate consent, employer operations and enough real demand and supply to be useful.

**Primary CTA:** Learn how evidence works
**Secondary CTA:** Contact DeliverX
