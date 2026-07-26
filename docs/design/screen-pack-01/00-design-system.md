# 00 — Screen Pack Design System

**Applies to:** Every screen in Pack 01
**Direction:** Calm, spacious, enterprise-credible, evidence-first
**Constraint:** Extend the shipped DeliverX theme (`src/lib/dx-theme.ts`, `src/components/dx*`, marketing tokens); do not introduce a parallel component library.

## Product posture

Every screen must answer, in order:

1. Where am I?
2. What matters now?
3. What can I do next?
4. What is the source and status of any claim shown?

Prefer one strong action, one supporting action, structured evidence, and generous whitespace. Avoid decorative dashboards, purple-glow AI aesthetics, card walls, celebratory motion, fake social proof, and unbounded chat.

## Tokens

Implementation must map these semantic roles to existing theme variables rather than hardcoded values.

| Role | Use |
| --- | --- |
| `surface.canvas` | Warm off-white page background |
| `surface.primary` | White primary work surface |
| `surface.subtle` | Quiet grouping, selected navigation |
| `text.primary` | Main headings and decisions |
| `text.secondary` | Supporting explanation |
| `text.muted` | Metadata, timestamps, source labels |
| `border.default` | Structural dividers |
| `accent.primary` | Primary action and active destination |
| `status.success` | Confirmed completion, never capability by colour alone |
| `status.warning` | Partial data, consent off, or gated content |
| `status.danger` | Destructive or failed state |

No gradient is required. If marketing retains an existing subtle brand atmosphere, it must remain low-contrast and never reduce text readability.

## Type

| Style | Desktop | Mobile | Use |
| --- | --- | --- | --- |
| Display | 56/60, medium | 38/42 | Marketing hero only |
| H1 | 40/46 | 32/38 | Page purpose |
| H2 | 28/34 | 24/30 | Major section |
| H3 | 20/28 | 18/26 | Component title |
| Body | 16/26 | 16/25 | Default reading |
| Small | 14/21 | 14/21 | Metadata and labels |
| Label | 12/16, semibold, modest tracking | same | Source/status/navigation |

Use the shipped brand fonts. Keep lines near 65–75 characters. Sentence case everywhere.

## Spacing and geometry

- Base unit: 4px. Common steps: 8, 12, 16, 24, 32, 48, 64, 96.
- Marketing max width: 1200px; reading column: 720px.
- Signed-in main column: flexible 720–880px; context rail: 300–360px.
- Minimum touch target: 44×44px.
- Corners: restrained 8–12px; pills only for compact status/source labels.
- Borders create structure; shadows are optional and extremely subtle, never the hierarchy mechanism.

## Shell layouts

### Marketing shell

```text
DESKTOP
┌ Logo ─ Products ─ How it works ─ Employers ─ Pricing ─ Sign in ─ [Start] ┐
├──────────────────────────────────────────────────────────────────────────┤
│                         page content                                     │
├──────────────────────────────────────────────────────────────────────────┤
│ Product links · Platform · Company/legal · Account                       │
└──────────────────────────────────────────────────────────────────────────┘

MOBILE
┌ Logo                                      [Sign in] [Menu] ┐
├────────────────────────────────────────────────────────────┤
│ page content                                               │
├────────────────────────────────────────────────────────────┤
│ stacked footer groups (Product → Platform → Company → Account) │
└────────────────────────────────────────────────────────────┘
```

**Footer columns (shipped):** Product · Platform · Company · Account. Demoted alias: Team Copilot → Professional Workspace. Omit Contact / public Portfolio until those pages exist.

### Signed-in shell

```text
DESKTOP
┌ Logo | Home Profile Experience Launchpad Workspace Portfolio | Search User ┐
├───────────────┬────────────────────────────────────┬────────────────────────┤
│ local nav     │ title / purpose / primary content  │ contextual panel       │
│ when needed   │                                    │ evidence · guidance     │
└───────────────┴────────────────────────────────────┴────────────────────────┘

MOBILE
┌ Logo | screen title | Search | User ┐
├─────────────────────────────────────┤
│ optional horizontal local tabs      │
│ main content                        │
│ contextual panel as disclosure      │
└─────────────────────────────────────┘
```

The global shell is stable. Local navigation appears only for a genuine suite such as Launchpad or Workspace.

## Context panel rules

The panel is contextual, optional, and never empty.

Priority:

1. Evidence and source status
2. “Why this” rationale
3. Consent / visibility
4. Related artefacts or screens
5. Context-bound assistant draft

If none applies, omit the panel and widen main content. On mobile, render it after the relevant section or as an accessible disclosure with an explicit label such as “Why this recommendation”.

## Core components

- `PageHeader`: breadcrumb/area, H1, purpose, one primary action.
- `SourceLabel`: Self-reported / Imported draft / Observed with consent / Evidence / Externally verified.
- `ClaimRow`: claim, band/status, rationale, cited evidence count, “Why”.
- `NextAction`: one recommendation, rationale, dismiss/accept where supported.
- `EvidenceItem`: title, source, date, provenance, visibility, status.
- `StatePanel`: loading, empty, partial, error, permission denied with one recovery action.
- `ContextPanel`: evidence, guidance, consent, related.
- `DataTable`: responsive row-to-card transform; never horizontal clipping for core person journeys.
- `ProvisionalBanner`: design approved, build gated; appears in internal specs and gated prototypes, not as public phase copy.

## Standard state contract

| State | Behaviour |
| --- | --- |
| Loading | Preserve page skeleton and headings; no fabricated values. |
| Empty | Explain why empty and give one safe next action. |
| Partial | Show what is known, label missing sources, avoid false precision. |
| Success | Confirm the saved state and offer the next logical action. |
| Error | Plain-language cause where known; retry without losing user input. |
| Permission denied | Explain the required role/access; never leak object existence or private data. |

## Accessibility

- WCAG 2.2 AA is the design target, not a product-wide claim until tested.
- Semantic landmark order; one H1; skip link on marketing and signed-in shells.
- Full keyboard operation, visible focus, Escape for overlays, focus return to trigger.
- Errors are linked to fields and announced through an appropriate live region.
- Source/status is expressed in text, not colour alone.
- Reduced-motion support; no essential information in motion.
- Mobile zoom is never disabled.
- Tables have captions and headers; complex desktop tables become labelled lists on mobile.

## Analytics

Use the typed privacy allowlist and existing pilot KPI names where a real state change exists. Marketing navigation events may be proposed in specs but must not include PII or free-text. Never emit raw evidence, target-role free text, imported notes, or AI prompt bodies.

## Copy mechanics

- “Capability assessment” in UI; `ScoreRun` remains internal.
- “Evidence-backed” only when the view cites evidence.
- “Externally verified” only for a T8-confirmed specific claim.
- “Observed with consent” is not “verified”.
- “Readiness” must name its source in nearby copy.
- “AI draft” identifies assistance and human ownership.
- No “guaranteed”, “job-ready score”, “proven by AI”, or “verified by completing work”.
