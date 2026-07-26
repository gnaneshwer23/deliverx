# 03 — Marketing Product Pages

All four screens use the existing marketing shell. Public language describes product roles, not separate data stores or speculative SKUs.

## Screen: Experience

**Implementation status:** **Pack-1 implementable now**
**Product area / Route / Primary user / Purpose:** Marketing / `/experience` / professional who needs practice / show how realistic company work generates evidence without promising automatic capability.
**Primary user question / Immediate understanding:** “Is this more than a simulation?” / I enter a company context, own work and retain evidence with provenance.
**Primary + secondary actions:** Start your experience; See how it works.
**Required data / source / permissions:** Static 12-company catalogue summary and approved illustrative scenario; anonymous; never expose user work.
**Layout:** Header / marketing nav / hero, entry ceremony preview, work loop, artefact examples, trust note, CTA / no context panel.
**Components:** ProductHero, CompanyPreview, WorkLoop, ArtefactList, TrustDisclosure, CTA.
**States:** Loading—text first; Empty—omit scenario preview; Partial—label illustrative scenario; Success—signup with Experience intent; Error—media fallback; Permission denied—not applicable.
**Desktop wireframe:** `Header | Hero+CTA | Company→Role→Team→Project→Activity | Work loop | Artefacts | Trust | CTA | Footer`
**Mobile wireframe:** `Header / Hero / CTAs / five entry steps stacked / work loop / artefacts / trust / CTA`.
**Accessibility:** Ordered process, alt text, no autoplay, target size 44px.
**Analytics events:** Proposed `marketing_product_cta_clicked(product=experience)`; canonical `experience_started`, `experience_plan_generated`.
**Acceptance criteria:** 12-company catalogue is not reduced to one company; baseline remains optional; AI drafts are labelled; completed work does not claim Verified.
**Related screens:** Home, How it works, Sign up, Onboarding path.
**Cursor implementation notes:** Evolve existing page/data and entry-ceremony truth; no new scenario engine.

### FINAL COPY

**Headline:** Build experience by doing the work.

Join a realistic company, take responsibility for a product challenge and work with AI colleagues who brief, question and draft in context. You make the decisions and submit the work.

**Primary CTA:** Start your experience
**Secondary CTA:** See how DeliverX works

**Trust line:** Your work can create evidence with provenance. It does not automatically become capability or Verified status.

---

## Screen: Launchpad

**Implementation status:** **Pack-1 implementable now** for honest current-product marketing
**Product area / Route / Primary user / Purpose:** Marketing / `/launchpad` / professional preparing for a move / show evidence-backed career packaging and action.
**Primary user question / Immediate understanding:** “How will my experience help my career?” / Launchpad turns PI into readiness rationale, CV, portfolio, interview and application work.
**Primary + secondary actions:** Open Launchpad; Explore the suite.
**Required data / source / permissions:** Static current-module inventory; anonymous; examples labelled illustrative.
**Layout:** Header / nav / hero, module strip, readiness-source explainer, evidence-to-artefact flow, CTA / no context panel.
**Components:** ProductHero, ModuleStrip, ReadinessSourceExample, ArtefactFlow, CTA.
**States:** Loading—static; Empty—omit example; Partial—heuristic example says evidence coverage, not capability; Success—auth/app route; Error—text fallback; Permission denied—auth handles app.
**Desktop wireframe:** `Header | Hero | Readiness Roadmap CV Portfolio Interview Applications | source example | evidence flow | CTA`
**Mobile wireframe:** `Hero / CTA / module list / source disclosure / evidence flow / CTA`.
**Accessibility:** Module list has headings; source disclosure adjacent to value; examples readable without charts.
**Analytics events:** Proposed `marketing_product_cta_clicked(product=launchpad)`; canonical `recommendation_viewed`, `recommendation_accepted`, `application_submitted`.
**Acceptance criteria:** Readiness source visible; no job guarantee; portfolio Verified meaning is claim-specific; no marketplace/networking promise.
**Related screens:** Launchpad suite, Portfolio, Employers.
**Cursor implementation notes:** Keep marketing within shipped scope; full suite IA lives in `09`.

### FINAL COPY

**Headline:** Turn evidence into a stronger career move.

Launchpad helps you understand readiness with a visible source, choose a development roadmap, build an evidence-backed CV and portfolio, prepare interview stories and track the roles you pursue.

**Primary CTA:** Open Launchpad
**Secondary CTA:** See Launchpad tools

**Trust line:** When readiness uses evidence coverage rather than a capability assessment, Launchpad says so. Verified claims require independent attestation.

---

## Screen: Team Copilot / Professional Workspace

**Implementation status:** **Pack-1 implementable now** for the bounded Workspace story; deep features remain gated
**Product area / Route / Primary user / Purpose:** Marketing / `/team-copilot` and canonical `/professional-workspace` / working product professional / explain contextual delivery support and evidence capture.
**Primary user question / Immediate understanding:** “Will AI replace team judgement?” / AI supports work in context; people decide, contribute and control observation.
**Primary + secondary actions:** Explore Professional Workspace; See Team Copilot direction.
**Required data / source / permissions:** Static shipped modules; no org data; no separate SKU claim.
**Layout:** Header / nav / hero, working loop, consent explainer, bounded module set, gated future direction / no context panel.
**Components:** AliasNotice, ProductHero, ContributionLoop, ConsentPanel, ModuleList, FutureDirection.
**States:** Loading—static; Empty—omit illustration; Partial—future modules labelled provisional; Success—workspace/signup route; Error—text fallback; Permission denied—auth/org onboarding in app.
**Desktop wireframe:** `Header | Team Copilot → Professional Workspace | Contextual work loop | Consent | Current modules | Future direction | CTA`
**Mobile wireframe:** `Alias / Hero / CTA / work loop / consent / modules / future note`.
**Accessibility:** Consent explanation is text; no status by colour; diagrams have ordered-list alternatives.
**Analytics events:** Proposed `marketing_product_cta_clicked(product=professional_workspace)`; canonical `collaboration_contribution`, `observation_consent_changed`.
**Acceptance criteria:** No fourth SKU; observation default OFF; AI draft ownership clear; no enterprise mission-control promise as live.
**Related screens:** Deep Team design, Sign up, Workspace.
**Cursor implementation notes:** Keep both marketing routes but canonicalize language; no deep Team build.

### FINAL COPY

**Headline:** Deliver with context. Keep human judgement in control.

Team Copilot is the collaborative direction of Professional Workspace. It brings tasks, meetings, decisions, risks, artefacts and contextual AI support together around real work. AI drafts; people decide and submit.

**Primary CTA:** Explore Professional Workspace
**Secondary CTA:** See how evidence works

**Trust line:** Continuous observation is off by default. When enabled, observations remain distinct from evidence and capability.

---

## Screen: Professional Intelligence brief

**Implementation status:** **Pack-1 implementable now** as a homepage/product-page section; dedicated route requires a routing decision
**Product area / Route / Primary user / Purpose:** Marketing / section anchor `/#professional-intelligence` (preferred now) / any evaluator / explain the shared source of truth.
**Primary user question / Immediate understanding:** “What is Professional Intelligence?” / It separates claims, evidence, judgements and attestations, then powers recommendations.
**Primary + secondary actions:** Build your profile; See how it works.
**Required data / source / permissions:** Static trust model; anonymous.
**Layout:** Header / nav / concise hero, four-layer model, five user questions, trust boundary, CTA / no context panel.
**Components:** LayerModel, FiveQuestions, TrustBoundary, CTA.
**States:** Loading—static; Empty—not applicable; Partial—omit unapproved example; Success—signup/profile destination; Error—diagram text fallback; Permission denied—not applicable.
**Desktop wireframe:** `Hero | Claims → Evidence → Capability judgement → Attestation | five questions | trust | CTA`
**Mobile wireframe:** `Hero / four layers stacked / questions / trust / CTA`.
**Accessibility:** Model is an ordered list; technical terms have plain-language definitions.
**Analytics events:** Proposed `marketing_pi_cta_clicked`; canonical `account_created`.
**Acceptance criteria:** PI is not an AI score; evidence and capability remain separate; Verified definition is exact.
**Related screens:** Home, How it works, Profile home.
**Cursor implementation notes:** Prefer section reuse before introducing a new public route.

### FINAL COPY

**Headline:** A professional record built around evidence, not claims alone.

Professional Intelligence keeps four things distinct: what you report, what you can evidence, what has been judged under a defined capability framework, and what an independent person has attested.

It helps answer: Who am I professionally? What have I demonstrated? What evidence supports it? What should I develop next? Which opportunities fit?

**Primary CTA:** Build your profile
**Secondary CTA:** See how DeliverX works
