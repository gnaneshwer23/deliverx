# Responsive audit (Phase 8)

**Date:** 2026-07-25  
**Breakpoints reviewed:** 320 · 768 · 1024 · 1440 (mapped to Tailwind `sm`/`md`/`lg` + custom workspace sidebar)  
**Method:** Static layout/class review + production HTML structure. Live viewport screenshots **BLOCKED** (browser automation unavailable this session). Authenticated responsive behaviour **BLOCKED** (no credentials).

Canonical workspace sidebar rule: `src/lib/responsive-layout.ts` — fixed sidebar from **`lg` (1024px)**; main uses `lg:ml-[var(--dx-sbw)]`.

---

## Breakpoint matrix (expected behaviour)

| Viewport | Marketing | Auth | Hub / PI | Launchpad | Workspace AppShell |
| --- | --- | --- | --- | --- | --- |
| **320** | Single column; hamburger; skip link | Form only (brand panel hidden) | Stacked chips; long scroll | **Risk:** module aside hidden — may lose nav | Hamburger; full-width main |
| **768** | Two-column sections start | Still form-first; brand may appear `md` | Readable max-width | Aside still hidden until `lg` | Mobile nav until 1024 |
| **1024** | Full nav; products dropdown | Split auth layout | Comfortable | Aside appears | **Sidebar appears** |
| **1440** | Contained `maxW` ~1120 | Split | Comfortable | Two-column | Sidebar + content |

---

## Surface findings

### Marketing (`/`, product pages, pricing)

| Issue | Severity | Evidence |
| --- | --- | --- |
| Long homepage; many grids — acceptable stacking via Tailwind grids | P3 | `home-sections.tsx` |
| Horizontal overflow risk from mock dashboard / rotated previews | P2 | `marketing-how-it-looks.tsx` blur/rotate stacks; `overflow-x-clip` on shell helps |
| Mobile nav drawer width `min(100%,300px)` | Pass | `marketing-nav.tsx` |
| Pill CTAs / large radii fine on small screens | Pass | landing theme |

**Unauthenticated prod:** Home and login HTML confirm primary content + CTAs present; visual layout not pixel-verified.

### Auth (`/login`)

| Issue | Severity | Evidence |
| --- | --- | --- |
| `md:grid-cols-2` — brand panel hidden on small (`hidden md:block`) | Pass | `auth/layout.tsx` |
| Form `max-w-[388px]` — good for 320 | Pass | login page |
| Tiny footer caps `text-[7px]` — readability at any width | P1 | login + AuthBrandPanel |

### Hub / Profile / Evidence / Learning / Outcomes

| Issue | Severity | Evidence |
| --- | --- | --- |
| `max-w-3xl` / `max-w-5xl` + `px-4` — generally mobile-safe | Pass | profile-centre, evidence-capability-app |
| Action chip wrap `flex-wrap` | Pass | profile-centre |
| Notification inbox density on 320 | P2 | needs live check (**BLOCKED**) |

### Experience (`/experience/app`)

| Issue | Severity | Evidence |
| --- | --- | --- |
| Custom CSS shell (`xperience-app.css`) — separate responsive rules | P1 | Must be QA’d independently of DX shell |
| Multi-tool dashboard may assume desktop | P1 | `product-app.tsx` |

### Launchpad (`/launchpad/app`)

| Issue | Severity | Evidence |
| --- | --- | --- |
| **Aside nav `hidden … lg:block` with no mobile substitute** | **P0/P1** | `career-intelligence-app.tsx` |
| Content `flex-1` OK when aside hidden | Partial | Users may not discover modules |
| Readiness cards with long UUID/meta strings wrap poorly | P2 | ScoreRun meta line |

### Professional Workspace

| Issue | Severity | Evidence |
| --- | --- | --- |
| Sidebar breakpoint documented & tested in unit terms | Pass | `responsive-layout.ts` + tests |
| Mobile toggle + overlay | Partial | `app-shell.tsx` / `app-nav.tsx` — focus trap unverified |
| Top bar hides many actions below `sm`/`md`/`lg` | P2 | Progressive disclosure OK; “Full view” only `lg` |
| Module pages `max-w-6xl` | Pass | workspace home |
| Legacy Twin/PMO `grid-cols-1 lg:grid-cols-2` | Pass pattern | Still dense vertically on 320 |

### Project space (`/project/[id]/*`)

| Issue | Severity | Evidence |
| --- | --- | --- |
| Separate topbar search `w-72` — likely overflow/hide issues on 320 | P1 | `project/[id]/topbar.tsx` |
| Project sidebar | P1 | Needs live QA (**BLOCKED**) |

---

## Zoom & reflow (1.4.4 / 1.4.10)

Static risks:

- Fixed `h-[var(--dx-navh)]` bars reduce vertical space at 200% zoom.  
- `text-[7px]`–`9px` does not meaningfully reflow into readable text when zoomed — fails practical AA.  
- `overflow-x-hidden` on workspace main may clip focus outlines or content.

---

## Touch targets

| Control | Risk |
| --- | --- |
| AppNav ghost buttons `text-[8px]`/`[9px]` with tight padding | Below 24×24 CSS px (WCAG 2.2 2.5.8) |
| Marketing nav links | Generally OK |
| Login “Forgot password?” `min-h-11` | **Pass** (good pattern) |
| Kanban / filter chips `text-[9px]` | Risk |

---

## Tables & charts

- Twin KPI strips and PMO health number: stack on small screens if parent grids are responsive; **chart text alternatives** not verified.  
- Prefer data tables with captions for AA; current panels are card metrics.

---

## Recommended responsive fixes (priority)

1. **Launchpad:** always-visible module switcher (select or horizontal scroll) below `lg`.  
2. Raise touch targets in `AppNav` to ≥44px height on touch breakpoints.  
3. Experience CSS: audit at 320 and 768 specifically.  
4. Project topbar: collapse search behind icon on `<md`.  
5. Re-test at 320 / 768 / 1024 / 1440 with credentials once available; capture screenshots for Hub, Profile, Experience, Launchpad, Workspace modules.

---

## Verdict

| Viewport | Marketing | Auth | Core PI (source) | Launchpad | Workspace |
| --- | --- | --- | --- | --- | --- |
| 320 | Likely usable | Usable | Likely usable | **Nav gap** | Usable with hamburger (unverified focus) |
| 768 | Good | Good | Good | Nav gap | Hamburger |
| 1024 | Good | Good | Good | OK | Sidebar |
| 1440 | Good | Good | Good | OK | OK |

**Overall:** Responsive foundations exist (especially workspace `lg` sidebar contract), but **Launchpad mobile IA and tiny toolbar controls** prevent a clean AA/responsive pass. Live verification remains **BLOCKED**.
