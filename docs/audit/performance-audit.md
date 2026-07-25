# Performance audit — Phase 9

**Date:** 2026-07-25 (UTC)  
**Auditor:** Senior QA Lead + Performance Engineer (read-only on `src/`)  
**Prod:** https://www.deliverx.dev · Supabase `jibmyxaldetyycmtlxet`  
**Method:** static analysis of `src/lib/**` + API routes; `npm run build`; unauthenticated timing probes; Supabase performance advisors (MCP `plugin-supabase-supabase`); read-only `pg_stat_user_tables` row estimates.

---

## Verdict

Pilot data volume is tiny (PI person tables ≈ 0 live rows after T6 purge; `users` ≈ 6; `projects` ≈ 17). **Latency today is dominated by edge/auth/cold-start, not DB.** Structural risks (RLS initplan, unindexed FKs, profile aggregate fan-out, unbounded child selects) are real but **latent** until scale. Several requested metrics remain **UNMEASURED** (signed-in TTFB, Lighthouse, AI wall-clock, cron success rates).

---

## Measured — public page / API timings (prod)

Probes via Node `fetch` from auditor machine (not browser Lighthouse). Two passes where noted.

### Public / marketing HTML

| Path | Status | TTFB (ms) | Total (ms) | Body bytes | `x-vercel-cache` | Notes |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| `/` | 200 | 169 / 122 | 177 / 130 | 135 589 | HIT | Large HTML; CDN warm |
| `/pricing` | 200 | 21 | 25 | 78 236 | HIT | |
| `/privacy` | 200 | 25 | 29 | 41 221 | HIT | |
| `/terms` | 200 | 31 | 32 | 41 338 | HIT | |
| `/experience` | 200 | 17 | 19 | 89 438 | HIT | |
| `/about` | 200 | 375 | 376 | 44 440 | PRERENDER | Cold/prerender |
| `/launchpad` | 200 | 336 | 341 | 85 777 | PRERENDER | Cold/prerender |
| `/login` | 200 | 215 / 177 | 217 / 180 | 26 068 | MISS | `private, no-store` |

### Auth gates (anonymous)

| Path | Status | TTFB (ms) | Location / body |
| --- | ---: | ---: | --- |
| `/profile` | 307 | 153 | `/login?next=%2Fprofile` |
| `/workspace` | 307 | 163 | `/login?next=%2Fworkspace` |
| `/experience/app` | 307 | 140 | `/login?next=%2Fexperience%2Fapp` |
| `/api/pi/profile` | 401 | 215–216 | `{"error":"Unauthorized"}` |
| `/api/pi/evidence` | 401 | 127–155 | Unauthorized |
| `/api/career/intelligence` | 401 | 123 | Unauthorized |
| `/api/ai/status` | 401 | 161 | Unauthorized |

**Interpretation:** Anonymous API auth rejection is ~120–220 ms — acceptable for pilot. Marketing HIT paths are fast; PRERENDER/MISS paths show ~300–375 ms TTFB. Home HTML ~132 KB is heavy for a marketing first paint (network transfer only; **browser LCP/INP UNMEASURED**).

---

## Measured — build / bundle

| Check | Result |
| --- | --- |
| `npm run build` | Pass (compiled in ~38.3 s; total wall ~85 s) |
| Next route table First Load JS column | **Absent** in this Next 16 build output — UNMEASURED per-route JS |
| `.next/static/chunks` total | **4.0 M** on disk |
| Largest chunk files (gzip not measured) | 408 K, 224 K, 216 K, 132 K, 132 K, … |

`next.config.ts`: long-cache headers for static assets (`max-age=31536000`); no custom `images` config. **`next/image` usage in `src/**/*.tsx`: 0 files** — image optimisation pipeline unused; marketing likely CSS/SVG/raw assets (not profiled further).

---

## Measured — database advisors (performance)

Supabase `get_advisors` type=`performance` on `jibmyxaldetyycmtlxet`:

| Lint name | Level | Count | Notes |
| --- | --- | ---: | --- |
| `unindexed_foreign_keys` | INFO | 183 | Includes **~61** PI/artefact/experience/launchpad FKs |
| `auth_rls_initplan` | WARN | 106 | Includes **53** PI-related policies (`pi_evidence_records`, `pi_capability_*`, consent, privacy, …) |
| `unused_index` | INFO | 101 | **~27** on PI-ish tables — noise until load justifies prune |
| `multiple_permissive_policies` | WARN | 50 | No PI hits in filtered sample |

**Row estimates (`pg_stat_user_tables`, approx):** PI person data tables at **0** (`pi_evidence_records`, `pi_capability_score_runs`, `pi_capability_snapshots`, `pi_onboarding_sessions`); framework seed tiny; `users` ≈ 6; `projects` ≈ 17. Advisors are **forward-looking**, not current hotspots.

Representative unindexed FKs: `pi_assessment_responses.user_id`, `pi_capability_judgements.user_id`, `experience_plans.*`, `artefact_*` actor/version FKs.

**EXPLAIN on hot paths:** **UNMEASURED** — tables empty; EXPLAIN would not reflect production shape. Deferred until signed-in load fixtures exist.

---

## Static analysis — query / request patterns

### Profile aggregate fan-out (confirmed)

`src/lib/pi-profile/aggregate.ts` `buildPiProfileAggregate` runs **7 parallel loads** via `Promise.all`: onboarding, evidence (`.limit(100)`), snapshot claims, **career intelligence** (itself a further fan-out), experience plan, growth report, learning summary.

`src/lib/career-intelligence/context.ts` `buildCareerIntelligenceSnapshot` adds another **6-way** parallel load (onboarding again, launchpad profile, VPP entries, ledger evidence, snapshots, outcomes).

Client: `src/components/pi/profile-centre.tsx` fetches `/api/pi/profile` once, then mounts `NotificationInbox` which **separately** hits `/api/pi/notifications?limit=20`. Auth already done on the server page (`src/app/profile/page.tsx`) before client hydrate — double auth round-trip pattern (server gate + client API).

**Risk:** O(fan-out) latency and duplicate onboarding/evidence reads as data grows. Mitigations not implemented (shared loader, RSC payload, single BFF). Severity today: Low (empty data); at pilot scale with real users: Medium.

### Evidence list — bounded parent, unbounded children

`src/app/api/pi/evidence/route.ts`: parent `.limit(100)`, then transitions/provenance `.in("evidence_id", ids)` **without `.limit()`**. Same pattern in `src/lib/verified-portfolio/store.ts`. Not N+1 round-trips (batched), but **unbounded row fan-in** if many transitions per evidence.

### Other unbounded / catalogue selects (heuristic)

Static heuristic found **~174** candidates; highest-signal for growth:

| Area | Path | Concern |
| --- | --- | --- |
| Privacy export | `src/lib/pi-privacy/export.ts` | `select("*")` per table by `user_id` — intentional dump; can be large |
| Admin framework | `src/lib/admin-framework/store.ts` | Loads all graph tables for a version — OK for thin seed (3 competencies) |
| Rubric resolve | `src/lib/capability-engine/resolve-rubric.ts` | Full competency/indicator/anchor sets |
| Org structure | `src/lib/org-structure/store.ts` | `select("*")` departments/teams/members |
| Assessment sessions | `src/lib/pi-assessment/session.ts` / `complete.ts` | All items/responses for session — OK if session-scoped |

Good examples of limits: evidence list 100; notifications count/limit; profile evidence 100; several stores use `.maybeSingle()`.

### Client duplicate API calls

Multiple PI client panels each `useEffect` → fetch (consent, interventions, artefacts, outcomes, privacy). Expected per surface; **no measured duplicate storm** on a single navigation (would need signed-in network trace — **UNMEASURED**).

---

## Caching

| Layer | Observation |
| --- | --- |
| Vercel CDN | Marketing pages HIT when warm; login/profile private/MISS |
| HTML Cache-Control | `public, max-age=0, must-revalidate` on static marketing — CDN still caches |
| Asset Cache-Control | Immutable year for `svg|png|jpg|…|woff2` via `next.config.ts` |
| API | PI APIs `force-dynamic` / no-store semantics — correct for private data |
| App-level query cache | No React Query / SWR observed on Profile — client state only |

---

## Image optimisation

**UNMEASURED quality metrics.** Fact: zero `next/image` imports. Risk is low for PI app (text-heavy); marketing home 132 KB HTML may embed or reference assets that skip Next image pipeline — not audited file-by-file this pass.

---

## AI request performance

| Item | Status |
| --- | --- |
| Wall-clock of live Anthropic/OpenAI calls | **UNMEASURED** (no live AI timing this pass) |
| Route `maxDuration` exports | **None found** under `src/` |
| Orchestration | `src/lib/ai-orchestration/run.ts` — token caps via agents; mock invoker for CI; usage logging present |
| Blocking UX | Assessment complete / document extract called from client sequentially — expected; timeout behaviour for model calls **UNMEASURED** |

---

## Top performance risks (ordered)

1. **`auth_rls_initplan` WARN ×106** (53 PI) — re-eval `auth.*()` per row; bites when person tables grow.  
2. **Profile/Career fan-out** — `aggregate.ts` + `context.ts` nested `Promise.all`.  
3. **Unindexed FKs on PI child tables** — deletes/joins/cascade will degrade first.  
4. **Home HTML weight (~132 KB)** — CDN helps; first-visit LCP unknown.  
5. **Unbounded transition/provenance selects** for evidence batches.  
6. **Admin / rubric full-graph loads** — fine at seed size; watch if framework expands (TD-007).

---

## UNMEASURED (explicit)

- Browser Lighthouse / Web Vitals (LCP, CLS, INP) on prod  
- Signed-in `/profile` and ScoreRun end-to-end server time  
- Postgres `EXPLAIN (ANALYZE)` on realistic fixtures  
- Per-route First Load JS (Next 16 build omitted classic size table)  
- Gzip/brotli transfer sizes vs raw chunk files  
- Live AI latency / token cost under load  
- Memory leaks / React Profiler rerender counts  
- Cron job duration/success (`vercel.json` crons exist; no log pull this pass)
