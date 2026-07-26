# 11 — Copy-Paste Cursor Prompts

Use only one prompt at a time. These prompts request the smallest screen slice and require Cursor to read the linked specification and current implementation first. Gated prompts are explicitly design/prototype prompts until a later product decision authorises build.

## 1. Homepage

```text
Implement only the DeliverX homepage slice specified in docs/design/screen-pack-01/01-marketing-home.md. Read Build Charter, Current Scope, Product Decisions, Product Bible 00/02/03/14 and 00-design-system.md first. Evolve src/app/(marketing)/page.tsx and existing marketing components/data; do not rewrite other pages, change billing, publish prices, enable Stripe, or alter onboarding. Use the FINAL COPY verbatim unless an existing legal constraint requires a documented correction. Preserve static performance, semantic headings, mobile wireframe, honesty labels and CTA destinations. Add focused tests for hero copy, CTA routes, forbidden guarantee/Verified claims and accessibility contracts. Run typecheck, lint and relevant tests; report changed files and remaining risks.
```

## 2. How it works

```text
Implement only /solutions from docs/design/screen-pack-01/02-marketing-how-it-works.md. Evolve the existing route and marketing shell. Keep the five-step lifecycle, source labels and optional-baseline language; no new backend, marketplace, pricing, decorative scores or claim that AI work is verified. Add responsive ordered-list/diagram fallback, FAQ accessibility and focused copy/link tests. Verify typecheck, lint and tests.
```

## 3. Experience marketing

```text
Implement only the /experience marketing screen in docs/design/screen-pack-01/03-marketing-product-pages.md. Reuse the existing 12-company catalogue and entry-ceremony truth; do not change the Experience app or scenario engine. Use final copy, preserve baseline as optional, label illustrative content, and state that work does not automatically become capability or Verified. Test CTA, trust copy, mobile structure and no one-company regression.
```

## 4. Launchpad marketing

```text
Implement only the /launchpad marketing screen in docs/design/screen-pack-01/03-marketing-product-pages.md. Market only shipped Career Intelligence foundations. Read Product Bible 07 and the current module routes first. Make readiness source honesty and attestation meaning visible. Do not promise marketplace, networking, jobs or full-suite redesign. Test CTA routes and forbidden claims.
```

## 5. Professional Workspace marketing

```text
Implement only /team-copilot and /professional-workspace marketing language from docs/design/screen-pack-01/03-marketing-product-pages.md. Preserve Team Copilot as a Professional Workspace alias, not a fourth SKU. Show observation default OFF and AI-draft/human-decision ownership. Do not build programme, delivery-health or executive depth. Keep canonical route behaviour and add focused alias/consent/copy tests.
```

## 6. Professional Intelligence brief

```text
Implement only the Professional Intelligence brief as a reusable marketing section at /#professional-intelligence from docs/design/screen-pack-01/03-marketing-product-pages.md. Do not add a new route without approval. Explain claims, evidence, capability judgement and external attestation as distinct layers. Reuse it on Home only if the homepage slice is already merged. Add semantic ordered-list and trust-language tests.
```

## 7. Pricing — gated design only

```text
DESIGN-ONLY GATED TASK. Produce or refine a non-production prototype/spec for the pricing screen in docs/design/screen-pack-01/04-marketing-pricing.md. Do not modify src/, billing catalogue, Stripe env, public prices, checkout routes or DELIVERX_BILLING_ENFORCE. The £500/£250/£500/£800 table is proposed packaging and conflicts with the accepted T9 catalogue until a superseding product decision exists. Keep purchase controls absent and document every gate. Stop if asked to make it purchasable without that decision and live Stripe proof.
```

## 8. Employers — gated design only

```text
DESIGN-ONLY GATED TASK. Refine the For Employers design in docs/design/screen-pack-01/05-marketing-employers.md without creating a route, employer accounts, candidate data, matching, search, messaging or marketplace liquidity. Keep the evidence and claim-specific attestation story, candidate privacy and future-direction disclosure. Any example must be clearly illustrative. Return only spec/prototype artefacts and open approval requirements.
```

## 9. Sign in

```text
Implement only /login from docs/design/screen-pack-01/06-auth-signin-signup.md. Read the installed Next.js docs and current Supabase SSR auth implementation first. Preserve sanitized internal next redirects, generic auth errors and existing reset route. Do not add OAuth. Implement final copy, accessible labels/error summary/live status, mobile layout and no-account-enumeration tests. Run auth-focused tests, typecheck and lint.
```

## 10. Sign up

```text
Implement only /signup from docs/design/screen-pack-01/06-auth-signin-signup.md. Preserve product intent, Supabase verification behaviour, gateway ordering and canonical account_created emission after real success. Do not add checkout or imply purchase. Add final copy, next-steps explanation, trust note, password requirement accessibility and tests proving no sensitive analytics properties.
```

## 11. Onboarding welcome

```text
Evolve only the welcome step of the shipped v2-conversation wizard using docs/design/screen-pack-01/07-onboarding-mapping.md. Reuse existing step id, API, session and progress component. Apply FINAL COPY; do not add a route or change step count. Test resume CTA, privacy/trust wording and step completion analytics.
```

## 12. Onboarding identity

```text
Evolve only onboarding step identity per docs/design/screen-pack-01/07-onboarding-mapping.md. Keep firstName, lastName, professionalIdentity, professionalIdentityOther and currentSituation payload keys and validation. Show Self-reported at point of use. Do not split current situation into a new screen. Test Other handling, resume and accessibility.
```

## 13. Onboarding targets

```text
Evolve only onboarding step targets per docs/design/screen-pack-01/07-onboarding-mapping.md. Keep objective, role, seniority, timeframe and industries in one step with current bounds. State targets frame recommendations and are not capability judgement. Never emit answers to analytics. Add responsive and validation tests.
```

## 14. Onboarding strengths

```text
Evolve only onboarding step strengths per docs/design/screen-pack-01/07-onboarding-mapping.md. Preserve optional skip, max-three limits and payload keys. Display the exact rule that self-assessment is not a capability level, score or Verified status. Test skip recording and zero Capability Engine/evidence writes.
```

## 15. Onboarding evidence

```text
Evolve only onboarding step evidence per docs/design/screen-pack-01/07-onboarding-mapping.md. Reuse existing summary, none-yet and import-note fields. Do not add file ingestion. Label CV/portfolio/learning notes Imported draft and never ledger evidence. Test none-yet, validation, skip and source copy.
```

## 16. Onboarding working style

```text
Evolve only onboarding step working_style per docs/design/screen-pack-01/07-onboarding-mapping.md. Reuse existing option values and optional skip. State preferences affect presentation, not assessment. Add keyboard radio-group and skip tests.
```

## 17. Onboarding review

```text
Evolve only onboarding step review per docs/design/screen-pack-01/07-onboarding-mapping.md. Reuse summariseForReview, edit routing, consentAnalysis, visibilityDefault and baselineOptIn. Keep observation consent separate, baseline off, and private preferred. Every row needs Self-reported or Imported draft. Test all captured values, required consent and no public preselection.
```

## 18. Onboarding path

```text
Evolve only onboarding step path per docs/design/screen-pack-01/07-onboarding-mapping.md. Reuse recommendPath, explainRecommendation and pathHref; do not call an LLM. Show deterministic reasons, limited-data fallback and user override. Completion must emit once and write no evidence, capability or Verified. Test all three destinations and duplicate-submit safety.
```

## 19. Unified professional home

```text
Implement the smallest /profile unified-home slice from docs/design/screen-pack-01/08-home-dashboard.md. First inventory ProfileCentre, /hub, recommendations, SnapshotClaims, active Experience and Career Intelligence reads. Propose the exact aggregation and /hub migration impact before editing if contracts conflict. Use existing modules; no new capability logic or data store. Build one next action, active Experience, PI summary, recent evidence, career recommendation and evidence/guidance context panel with independent failure states. Preserve source labels and no decorative readiness %. Test empty/partial/full states, owner access, recommendation transitions and nav/redirect behaviour. Do not combine this with homepage or onboarding changes.
```

## 20. Launchpad Career Dashboard

```text
Implement only the Career Dashboard after the Readiness redesign is merged, using docs/design/screen-pack-01/09-launchpad-suite.md. Aggregate existing Career Intelligence, recommendation, artefact and application summaries; do not create duplicate truth. One next action with rationale and source is primary. Add section isolation, self-only tests and mobile ordering.
```

## 21. Launchpad Readiness

```text
Implement only Launchpad Readiness from docs/design/screen-pack-01/09-launchpad-suite.md. This is the first recommended Launchpad redesign slice. Preserve readinessSource and SnapshotClaims; do not calculate capability in UI. Make assessment/mixed/evidence-coverage source impossible to miss, provide text alternatives and remove decorative truth. Test all source modes, empty assessment and evidence citations.
```

## 22. Launchpad Roadmap

```text
Implement only Launchpad Roadmap from docs/design/screen-pack-01/09-launchpad-suite.md using the canonical recommendation state machine. Every action needs rationale, source and stable href; accept/dismiss/complete never writes capability. Do not add parallel roadmap storage. Test limited data, lifecycle transitions and empty target.
```

## 23. Launchpad CV

```text
Implement only the Evidence CV screen from docs/design/screen-pack-01/09-launchpad-suite.md. Bind draft statements to selected evidence, label AI text Draft, and use immutable artefact versions for saves where the existing model applies. Never silently overwrite a prior version or call an uncited line evidence-backed. Test provenance, version creation and draft retention after errors.
```

## 24. Launchpad Portfolio integration

```text
Implement only Launchpad-to-Portfolio navigation/integration from docs/design/screen-pack-01/09-launchpad-suite.md. /portfolio remains canonical; do not duplicate entries or attestation state under Launchpad. Preserve private-by-default sharing, T8 Verified gate and token least privilege. Test navigation and trust labels only.
```

## 25. Launchpad Interview Lab

```text
Implement only Interview Lab redesign from docs/design/screen-pack-01/09-launchpad-suite.md. Bind each session to target and selected evidence. AI feedback is a contextual draft; no fabricated claims, capability writes or chat-as-primary-database. Do not send transcripts to third-party analytics. Test evidence binding, error recovery and draft labels.
```

## 26. Launchpad Applications

```text
Implement only Applications from docs/design/screen-pack-01/09-launchpad-suite.md. Track user-created applications, stages, artefacts and next actions. Do not add job scraping, matching or marketplace inventory. Preserve outcome honesty: stage/outcome changes never auto-upgrade capability. Test empty, stage update, mobile cards and owner access.
```

## 27. Team Copilot overview — gated

```text
GATED TASK. Do not implement unless a new founder build decision names the allowed thin Workspace slice. If approved, use only the Team Copilot overview in docs/design/screen-pack-01/10-team-copilot-deep.md, preserve Workspace alias/no fourth SKU, consent default OFF and no capability from task completion. Inventory existing /workspace routes before proposing changes.
```

## 28. Programmes — gated

```text
DESIGN/PLANNING ONLY unless separately authorized. Use the Programmes screen in docs/design/screen-pack-01/10-team-copilot-deep.md. Before any code, require the founder decision, role matrix, canonical programme/outcome/dependency definitions and data-quality policy. Existing /workspace/programmes does not itself authorize expansion. Prefer a first slice of named exceptions with source freshness, never an opaque health score.
```

## 29. Delivery health — gated

```text
DESIGN/PLANNING ONLY unless separately authorized. Use Delivery health in docs/design/screen-pack-01/10-team-copilot-deep.md. Require metric definitions, thresholds, source freshness and “no data vs no exception” acceptance before code. Never infer individual capability or render a single unexplained health score. Return blockers and smallest vertical slice.
```

## 30. Executive reporting — gated

```text
DESIGN/PLANNING ONLY unless separately authorized. Use Executive reporting in docs/design/screen-pack-01/10-team-copilot-deep.md. Require executive role permissions, approved source coverage, export audit and human approval for AI-assisted narrative. Never autonomously publish a generated report or represent stale/partial data as current. Return approval dependencies and the smallest report slice.
```
