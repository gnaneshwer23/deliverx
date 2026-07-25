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
| Hub | Journey cards | Explicit suite map — **best continuity** |
| Profile | Action chips | Partial suite links |
| Experience app | Internal tools only | Weak link back to Hub/Profile |
| Launchpad | Module aside | Link to Profile; ScoreRun re-run |
| Workspace AppShell | Professional Workspace modules (+ optional legacy) | User menu → Profile/Settings; “Back to site” |
| Dark WorkspaceSidebar | Separate advanced list | Settings only |

**Duplication:** Alerts appear as bell + “Alerts” link (`app-nav.tsx`). AI appears as Ask HELM + Full view + Coach module + Assistant route.

---

## 4. Typography & spacing

| Pattern | Issue |
| --- | --- |
| `dxClass.label` / `navSectionLabel` at **7–9px** | Below comfortable reading size; feels like internal tooling |
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

1. **Freeze one app shell** for signed-in candidates: Hub-aware top nav (Profile · Experience · Launchpad · Workspace · Portfolio) + contextual side nav.  
2. **Retire dark sidebar + indigo Twin/PMO styling** from default pilot builds (or gate behind legacy flag including routes).  
3. **Single CTA language**: sentence case, one green, min 14px body / 12px labels.  
4. **Glossary for UI**: ban ScoreRun, Brief v2, Phase letters, Command Centre from candidate-facing strings.  
5. **Marketing mocks**: watermark “Illustrative” or replace percentages with qualitative bands.

---

## 9. Consistency scorecard

| Area | Score (1–5) |
| --- | --- |
| Visual dialect unity | 2 |
| Terminology | 2 |
| Navigation continuity | 2 |
| Typography hierarchy | 3 |
| Honesty / scores | 2 |
| Calm professionalism (PI core) | 4 |
| Calm professionalism (whole product) | 2 |
