# Design consistency report

**Date:** 2026-07-25  
**Sources of truth compared:** DeliverX UI principles (`.cursor/rules/deliverx.mdc`), UX architecture continuity (`docs/architecture/06`), Build Charter / Current Scope, `src/lib/dx-theme.ts`, `src/lib/marketing/landing-theme.ts`

---

## 1. Design systems in play

| System | Tokens / fonts | Used by | Visual character |
| --- | --- | --- | --- |
| **Marketing (`mkt`)** | Cream/mist greens, display serif, mono labels, large radius / pills | `(marketing)/*`, product heroes | Soft SaaS landing; occasional purple/blue accents |
| **App DX (`dx`)** | Light page `#F8F9FB`, green `#1C4A2E`, mono uppercase CTAs | Workspace AppShell, auth forms, many settings | Calm light SaaS dashboard |
| **PI / Launchpad local** | `#F7F6F2` / `#1A1A18` borders `#E5E2D9` | Profile, Evidence, Launchpad, Portfolio | Closest to “professional calm” |
| **Legacy workspace dark** | `#0a0e14`, teal accents | `WorkspaceSidebar` | Dark ops console — conflicts with DX light |
| **Enterprise indigo/slate** | Tailwind indigo/slate cards | Twin, PMO, Marketplace, some intelligence panels | Generic admin dashboard |

**Verdict:** At least **four visual dialects**. Continuity principle (“one platform”) fails when a candidate moves Hub → Experience → Launchpad → Workspace → bookmark Twin.

---

## 2. Terminology matrix

| Concept | Canonical (charter) | UI variants found | Severity |
| --- | --- | --- | --- |
| Experience product | Experience | Code/URL `xperience`, signup `product=xperience` | P3 (URL) |
| Workspace product | Professional Workspace | Alias Team Copilot (redirect OK); signup id still `team-copilot` | P2 |
| Career product | Launchpad | App chrome “Career Intelligence”; Hub CTA “Open Career Intelligence” | P1 |
| Capability projection | Evidence → Capability Engine | User-facing **ScoreRun** buttons, headings, Hub card | P0 |
| Verified | External attestation (T8) | Marketing “evidence employers recognise”; Verified Portfolio naming — need copy audit TD-011 | P1 (honesty) |
| Legacy IA | Demoted | Still labelled Mission Control / Command Centre / Ecosystem in code + workspace footer note | P1 |

Display-name helpers in `product-intent.ts` correctly map to Experience / Launchpad / Professional Workspace — good. Leak is ScoreRun + Career Intelligence dual branding.

---

## 3. Navigation consistency

| Surface | Primary nav | Cross-links to rest of suite |
| --- | --- | --- |
| Marketing | Products dropdown + site links | Signup with product intent |
| Hub | Shared suite nav + journey cards | Explicit suite map |
| Profile / Learning / Outcomes | Shared suite nav | Action chips remain contextual |
| Experience app | Shared suite nav + tool rail | Same product chrome |
| Launchpad | Shared suite nav + MVP module nav (desktop + mobile) | Profile / Portfolio links |
| Workspace AppShell | Shared suite nav (xl+) + Professional Workspace sidebar | User menu → Profile/Settings |
| Dark WorkspaceSidebar | **Removed** (Batch 5) | Was unused competing chrome |

**Batch 5 model:** ONE primary journey nav — Hub · Profile · Experience · Launchpad · Workspace · Portfolio. Local side/rail navigation is contextual only. Duplicate Alerts text link and “Full view” AI entry removed from AppNav.

---

## 4. Typography & spacing

| Pattern | Issue |
| --- | --- |
| `dxClass.label` / `navSectionLabel` | **Batch 5:** raised to ≥12px (`text-xs`) on primary chrome |
| Marketing `text-[10px]` mono eyebrows | OK as micro-labels if contrast holds |
| Mixed display fonts | DX display + marketing display + Geist fallbacks in root layout |
| Button case | App: uppercase mono tracking; PI: sentence-case rounded buttons — two CTA dialects |

Spacing: PI surfaces use generous `max-w-3xl` / `max-w-5xl` — good. Mission/Twin pages use dense multi-panel grids — charter-unfriendly for pilot ICP.

---

## 5. Colour & visual noise

| Principle | Status |
| --- | --- |
| No excessive gradients | Marketing uses section gradients (`green-tint`); Twin uses `bg-gradient-to-br from-indigo-50` — **noise** |
| No emoji | **Pass** (no emoji in TSX) |
| No gamification | Marketing timeline **stars / Stars earned** — fail edge |
| No unexplained scores | Marketing 72%, auth 40%/97%, Launchpad readiness % — **fail** |
| Calm green system | Undermined by purple product accent (`mkt.purple` / `accentPurple`) and indigo legacy pages |

---

## 6. Component / pattern consistency

| Pattern | Consistent? | Notes |
| --- | --- | --- |
| Page header (where / why) | Partial | Profile/Workspace good; many legacy pages title-only |
| Primary button | No | `dxClass.btnPrimary` vs green rounded `text-xs` PI buttons vs marketing pills |
| Empty states | Partial | Dashed borders common; copy quality varies |
| Cards | Overused on marketing & Twin; PI uses quieter bordered lists — better |
| AI interaction | Mixed | Coach tied to gaps (good); Helm drawer + “AI watching everything” (bad) |

---

## 7. Information architecture vs Build Charter

| Charter intent | Design reality |
| --- | --- |
| Harden P0–P7 loop | Hub + Profile loop is clear |
| T7 demote Mission Control | Default nav OK; copy + routes still advertise legacy |
| No marketplace liquidity | Marketplace page still exists |
| Team Copilot = alias | Marketing redirect OK; product id `team-copilot` remains |
| Evidence before claims | PI copy strong; marketing decorative metrics weak |

---

## 8. Recommendations (design system only)

1. ~~**Freeze one app shell**~~ — **Done Batch 5** (`ProductSuiteShell` + Workspace suite strip).  
2. ~~**Retire dark sidebar**~~ — **Done Batch 5**. Indigo Twin/PMO still demoted via legacy flag.  
3. **Single CTA language**: sentence case progressing; chrome labels ≥12px.  
4. **Glossary for UI**: ScoreRun banned from primary CTAs (Batch 3); Launchpad is product chrome name (Batch 5); Career Intelligence = capability language inside Launchpad.  
5. **Marketing mocks**: watermark “Illustrative” / qualitative bands (Batch 2 advanced).

---

## 9. Consistency scorecard

| Area | Score (1–5) | Batch 5 note |
| --- | --- | --- |
| Visual dialect unity | 3 | Shared chrome; Experience CSS still a dialect |
| Terminology | 4 | Launchpad product chrome; assessment language |
| Navigation continuity | 4 | Shared suite nav across primary surfaces |
| Typography hierarchy | 4 | Chrome labels raised to ≥12px |
| Honesty / scores | 4 | Prior batches; residual Experience decorative % |
| Calm professionalism (PI core) | 4 | Unchanged strength |
| Calm professionalism (whole product) | 3 | Chrome coherent; legacy routes remain bookmarkable |
