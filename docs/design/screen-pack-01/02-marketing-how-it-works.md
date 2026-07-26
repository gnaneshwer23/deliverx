# 02 — Marketing: How It Works

**Implementation status:** **Pack-1 implementable now**

## Screen: How DeliverX works

**Product area:** Marketing
**Route:** `/how-it-works` (legacy `/solutions` permanently redirects here)
**Primary user:** Professional comparing DeliverX with courses, simulations and career tools
**Purpose:** Explain the complete evidence lifecycle without turning it into a technical architecture diagram.

**Primary user question:** “What will I actually do, and what will I have afterwards?”
**Immediate understanding:** I map a direction, work in a realistic context, retain evidence, receive explainable judgements, and use them in Experience, Launchpad and Workspace.

**Primary action:** Start your experience
**Secondary action:** Explore Professional Intelligence
**Required data / source / permissions:** Static product truth from Product Bible; no auth; no private profile examples; illustrative artefacts must be labelled.
**Layout:** Header; outcome-led hero; five-step lifecycle; evidence-source explainer; product hand-offs; example record; FAQ; CTA; footer.
**Components:** StepRail, EvidenceSourceLegend, ProductHandoff, IllustrativeRecord, TrustFaq, FinalCta.

**States**
- **Loading:** Static text first; progressive enhancement for step rail.
- **Empty:** Omit illustrative record if no approved fixture.
- **Partial:** If an example lacks external attestation, show “Not externally verified”.
- **Success:** CTA preserves Experience intent.
- **Error:** Interactive diagram degrades to ordered text.
- **Permission denied:** Not applicable.

### Desktop wireframe

```text
┌ Header ┐
│ How DeliverX works                     [Start your experience]          │
├ 1 Map direction → 2 Join context → 3 Do work → 4 Review → 5 Use it     │
├ Evidence sources: self-report | import | observation | evidence | attest│
├ Experience generates ─ PI interprets ─ Launchpad/Workspace consume      │
├ Illustrative claim record + citations + status                          │
├ FAQ: assessment, AI, privacy, Verified                                  │
└ Final CTA + footer                                                       │
```

### Mobile wireframe

```text
┌ Header ┐
│ H1 + support + CTA                    │
├ Steps 1–5, vertically ordered         │
├ Source labels, horizontally scrollable│
├ Product hand-offs, stacked            │
├ Illustrative record                   │
├ FAQ disclosures                       │
└ CTA + footer                           │
```

**Accessibility:** Lifecycle is an ordered list; diagrams have text equivalents; source labels are plain text; FAQ uses native buttons with `aria-expanded`; no meaning by colour alone.
**Analytics events:** Proposed `marketing_primary_cta_clicked(surface=how_it_works)`; `marketing_product_link_clicked(product)`; canonical `account_created`, `onboarding_pi_completed`, `experience_started` remain downstream.
**Acceptance criteria**
- User can describe the five-step lifecycle after scanning the page.
- Page explicitly states AI drafts do not become evidence automatically.
- External verification is claim-specific and independent.
- Baseline assessment is described as optional.
- No decorative score, unsupported outcome, or marketplace promise.

**Related screens:** Home, PI brief, Experience marketing, Onboarding welcome.
**Cursor implementation notes:** Reframe existing `/solutions`; keep route stable. Use static content and current marketing shell. Do not create a new backend or analytics sink.

## FINAL COPY

**Headline:** Turn realistic work into a professional record you can explain.

**Support:** DeliverX connects direction, experience, evidence and career action without treating self-report, AI observation or course completion as proven capability.

1. **Map your direction.** Share your current context, target role and priorities. These answers are self-reported and guide recommendations.
2. **Enter a realistic context.** Join a company, role, team and project matched to a useful place to start. An assessment is available, not mandatory.
3. **Do meaningful work.** Make decisions, create artefacts and respond to stakeholders. AI colleagues support the work in context; you own the submission.
4. **Review what the work demonstrates.** Evidence keeps its provenance. Capability judgements use a versioned framework and explain why a band applies.
5. **Use the record.** Choose the next Experience, strengthen a CV or portfolio in Launchpad, or carry better delivery habits into Professional Workspace.

**Evidence heading:** The source matters.

- **Self-reported:** Something you told DeliverX about yourself.
- **Imported draft:** Material brought in for review, not accepted as ledger evidence yet.
- **Observed with consent:** An observation from Workspace; not automatically evidence or capability.
- **Evidence:** A provenance-bearing record available for judgement.
- **Externally verified:** A named independent attestor confirmed a specific claim.

**Final CTA heading:** Begin with a clear first step.
**Primary CTA:** Start your experience
**Secondary CTA:** Explore Experience
