# 01 — Marketing Home

**Implementation status:** **Pack-1 implementable now**
**Evolution rule:** Replace/reorder content within the existing marketing route; retain legal links, auth destinations, and commercial config gates.

## Screen: Homepage

**Product area:** Marketing
**Route:** `/`
**Primary user:** Aspiring or practising product professional evaluating DeliverX
**Purpose:** Explain the experience→evidence→career journey in under 30 seconds and earn a start or learn-more action.

**Primary user question:** “How is this different from another course or AI tool?”
**Immediate understanding:** DeliverX gives me realistic work, helps turn that work into evidence, and uses that evidence to guide what I do next.

**Primary action:** Start your experience → `/signup?product=xperience`
**Secondary action:** See how DeliverX works → `/solutions`
**Required data / source / permissions:** Static marketing copy; checkout readiness only for any pricing teaser; anonymous-safe; no private data or fabricated proof.
**Layout:** Marketing header; hero; credibility line; problem; three-part journey; Professional Intelligence; how it works; Experience preview; who it is for; trust note; final CTA; footer. No context panel on marketing.

**Components:** MarketingHeader, Hero, CredibilityLine, ProblemStatement, JourneySteps, PiExplainer, HowItWorksSteps, ExperiencePreview, AudienceList, TrustDisclosure, FinalCta, Footer.

**States**
- **Loading:** Static shell renders immediately; defer only non-critical visual media.
- **Empty:** Not applicable; omit optional proof rather than render placeholders.
- **Partial:** If checkout is not ready, omit prices and retain pilot/start language.
- **Success:** Signup navigation preserves `product=xperience`.
- **Error:** If optional media fails, copy and CTAs remain fully usable.
- **Permission denied:** Not applicable; auth destinations handle signed-in users safely.

### Desktop wireframe

```text
┌ Header: DeliverX | Products | How it works | Employers | Pricing | Sign in | Start ┐
│ HERO                                                                            │
│ Build the experience. Prove your capability. Move your career forward.          │
│ Support copy                                           [Start] [How it works]    │
│ Credibility: realistic companies · meaningful work · evidence with provenance   │
├ Problem: courses teach; employers ask for experience                             │
├ Journey: Build experience → Develop evidence → Move forward                      │
├ Professional Intelligence: claims + evidence + judgement + next action           │
├ How it works: Map direction | Join a company | Do the work | Build your record   │
├ Experience preview: company / role / project / first activity                    │
├ Who it is for: switchers / graduates / PMs                                       │
├ Trust: source labels; Verified requires independent attestation                   │
├ FINAL CTA: Start with meaningful work                              [Start]        │
└ Footer                                                                           │
```

### Mobile wireframe

```text
┌ Logo                              Sign in  Menu ┐
│ Headline                                      │
│ Support                                       │
│ [Start your experience]                       │
│ [See how it works]                            │
│ Credibility line                              │
├ Problem                                       │
├ Journey (stacked 1–3)                         │
├ Professional Intelligence                     │
├ How it works (stacked 1–4)                    │
├ Experience preview (single frame)             │
├ Who it is for                                 │
├ Trust disclosure                              │
├ Final CTA                                     │
└ Footer groups                                 │
```

**Accessibility:** One H1; visible skip link; CTAs have unique names; journey is an ordered list; any product image has descriptive alt text or is decorative; credibility line is text, not logo-only proof; no autoplay.
**Analytics events:** `marketing_primary_cta_clicked` (proposed: `surface=home`, `destination=signup`); `marketing_how_it_works_clicked` (proposed); downstream canonical `account_created`. No free-text properties.
**Acceptance criteria**
- Hero uses the founder-approved headline and support verbatim.
- First viewport explains realistic work and evidence, without a capability/Verified overclaim.
- CTA path reaches existing signup with product intent.
- No price, guarantee, fake testimonial, unexplained percentage, or “AI verified” language.
- Page remains understandable without images and usable at 320px.
- PI explanation distinguishes claims, evidence, capability judgement and external verification.

**Related screens:** How it works, Experience marketing, Sign up, Onboarding welcome.
**Cursor implementation notes:** Evolve `src/app/(marketing)/page.tsx` and existing marketing components/data. Reuse tokens and static rendering. Do not touch billing configuration, live prices, onboarding state, or product pages in the homepage slice.

## FINAL COPY

### Hero

**Headline:** Build the experience. Prove your capability. Move your career forward.

**Support:** DeliverX gives professionals a realistic company, meaningful work and AI colleagues to help them build evidence-backed experience—not just complete another course.

**Primary CTA:** Start your experience
**Secondary CTA:** See how DeliverX works

**Credibility line:** Realistic companies. Meaningful product work. Evidence with a clear source.

### Problem

**Headline:** Learning the frameworks is not the same as having the experience.

Courses can explain product management. Employers still ask what you have done, how you made decisions and what changed because of your work. DeliverX creates a place to practise that work and build a record you can inspect, improve and share.

### Journey

**Headline:** One connected professional journey.

1. **Build the experience.** Join a realistic company and take responsibility for meaningful product work.
2. **Develop credible evidence.** Keep artefacts, decisions and outcomes with their source and context.
3. **Move your career forward.** Use Professional Intelligence to choose what to practise, package and pursue next.

### Professional Intelligence

**Headline:** Your work becomes useful when its meaning is clear.

Professional Intelligence connects what you say about yourself, the evidence you create, capability judgements made under a defined framework, and independent attestations. It keeps those sources distinct so recommendations remain explainable.

**Source labels:** Self-reported · Imported draft · Observed with consent · Evidence · Externally verified

### How it works

**Headline:** Start with direction. Build through work.

1. **Map your direction.** Tell us where you are and what you are working towards.
2. **Join a company.** Enter a realistic organisation, role, team and project.
3. **Do the work.** Make decisions, create artefacts and respond to stakeholders.
4. **Build your record.** Review evidence, understand capability bands and choose a credible next action.

### Experience preview

**Headline:** Work inside a company, not through a course playlist.

You receive a role, a team, a product challenge and a first activity. AI colleagues can brief, question and draft in context. You remain responsible for every decision and submission.

**CTA:** Explore Experience

### Who it is for

**Headline:** For professionals who need credible experience and a clearer next step.

- Career switchers who need practical work to discuss
- Graduates building their first professional evidence
- Product managers strengthening a specific capability or career story
- Returning professionals rebuilding current, relevant evidence

### Trust

**Headline:** Evidence before claims.

Work completed in DeliverX does not automatically become verified capability. Evidence retains its source. Capability is judged through the Capability Engine. A Verified label appears only when an independent named attestor confirms a specific claim.

### Final CTA

**Headline:** Start with meaningful work.

Map your direction, enter a realistic company and begin building evidence you can explain.

**Primary CTA:** Start your experience
**Secondary CTA:** See how DeliverX works
