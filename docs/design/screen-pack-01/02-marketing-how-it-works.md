# 02 — Marketing: How It Works

**Implementation status:** **Shipped** (visual parity with product marketing pages)

## Screen: How DeliverX works

**Product area:** Marketing  
**Route:** `/how-it-works` (legacy `/solutions` permanently redirects here; `#journey` and `#workflow` anchors retained)  
**Primary user:** Professional comparing DeliverX with courses, simulations and career tools  
**Purpose:** Explain the complete evidence lifecycle without turning it into a technical architecture diagram.

**Primary user question:** “What will I actually do, and what will I have afterwards?”  
**Immediate understanding:** I map a direction, work in a realistic context, retain evidence, receive explainable judgements, and use them in Experience, Launchpad and Workspace.

**Primary action:** Start your experience  
**Secondary action:** Explore Experience  
**Required data / source / permissions:** Static product truth from Product Bible; no auth; no private profile examples; illustrative dashboard mocks labelled via sr-only captions.  
**Layout:** Header; split product hero with Professional Intelligence dashboard mock; what DeliverX is; what to do first; at-a-glance pipeline; five-step loop with shared product dashboard mocks; evidence sources; product hand-offs; FAQ; pilot access; CTA; footer.  
**Components:** HowItWorksHero, ProductDashboardMock (intelligence / experience / launchpad), NarrativeBlock, StepRail (ordered list), EvidenceSourceLegend, ProductHandoff, TrustFaq, AccessPanel, FinalCta — same shell and visual rhythm as `/experience`, `/launchpad`, `/professional-workspace`.

**States**
- **Loading:** Static text first; progressive enhancement for hero motion.
- **Empty:** Omit illustrative mock only if mock component unavailable (not expected).
- **Partial:** Source labels remain plain text; Verified always claim-specific.
- **Success:** CTA preserves Experience intent.
- **Error:** Motion degrades; ordered text remains.
- **Permission denied:** Not applicable.

### Desktop wireframe

```text
┌ Header (How it works · Experience · Launchpad · Professional Workspace) ┐
│ [Brand: How it works]  headline + CTAs     │  ProductDashboardMock (PI) │
├ What DeliverX is — one evidence-driven loop                              │
├ What to do first — map direction → company context                       │
├ At a glance: Work → Evidence → Capability → Next step                    │
├ Steps 01–05 alternating copy + shared dashboard mocks                    │
├ Evidence sources: self-report | import | observation | evidence | attest │
├ Experience / Launchpad / Workspace hand-offs                             │
├ FAQ · Pilot access · Final CTA · footer                                  │
```

### Mobile wireframe

```text
┌ Header ┐
│ Hero copy + CTAs                         │
│ Dashboard mock beneath                   │
├ Intro + first-step bullets stacked       │
├ Pipeline cards stacked                   │
├ Steps 1–5 with mock under each           │
├ Sources / hand-offs / FAQ / access / CTA │
```

**Accessibility:** Lifecycle is an ordered list; dashboard mocks have text equivalents; source labels are plain text; FAQ headings are readable without colour alone.  
**Analytics events:** Proposed `marketing_primary_cta_clicked(surface=how_it_works)`; `marketing_product_link_clicked(product)`; canonical `account_created`, `onboarding_pi_completed`, `experience_started` remain downstream.  
**Acceptance criteria**
- User can describe the five-step lifecycle after scanning the page.
- Page explicitly states AI drafts do not become evidence automatically.
- External verification is claim-specific and independent.
- Baseline assessment is described as optional.
- No decorative score, unsupported outcome, or marketplace promise.
- Visual system matches Experience / Launchpad / Professional Workspace (hero mesh, brand-scale name, ProductDashboardMock, soft-panel sections, access + dark CTA).

**Related screens:** Home, PI brief, Experience marketing, Onboarding welcome.  
**Cursor implementation notes:** Reuse `ProductMarketingPage` section rhythm and `ProductDashboardMock`. Do not invent a separate SVG diagram language. Keep `/solutions` redirect. Do not create a new backend or analytics sink.

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
**Secondary CTA:** Explore Complete Journey (or Explore Experience from the hero)
