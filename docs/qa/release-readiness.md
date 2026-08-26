# Release readiness — Technology T6 / T0 pilot seal

> **Product Bible:** Release governance summary in [`../13-qa-and-release-bible.md`](../13-qa-and-release-bible.md). This file is evidence/detail.

**As of:** 2026-07-25  
**Charter:** [`../product/build-charter.md`](../product/build-charter.md)  
**Detail:** [`end-to-end-audit.md`](./end-to-end-audit.md) · [`acceptance-test-results.md`](./acceptance-test-results.md) · [`security-findings.md`](./security-findings.md) · [`t0-results.md`](./t0-results.md)

---

## Verdict

### **T6 — SHIPPED** · **T0 — PASS (automated)** · **TD-001 — Closed**

| Gate | Status |
| --- | --- |
| Build Charter active | Pass |
| Prod Ready (www.deliverx.dev) | Pass |
| Migrations through `0092` | Pass |
| Unauth smoke (pages → login / APIs 401) | Pass |
| Scoped PI unit suites (release gate) | Pass (242) |
| T6 security always-on + privacy grants | Pass |
| Signed-in P0–P7 (+ T1–T5) loop | **Pass (18/18 live)** |
| Security negatives (RLS / purge / no capability write) | **Pass** |
| Person-PI purge after QA | Pass (0 residual person rows) |
| Full-repo `tsc --noEmit` | **Baseline debt** — not a T6 blocker; classified in security-findings |
| Full-repo ESLint | **Baseline debt** — CI advisory; scoped T6 paths clean |
| Visual/UX founder judgement | Remaining human (non-blocking for T6 exit) |
| TD-006 leaked-password | Open — founder Auth toggle |

**Pilot seal:** Functional signed-in loop is verified by automation. TD-001 closed. Subjective UI review remains optional founder polish, not an engineering blocker for T6 exit.

**T7–T9:** Do **not** start without founder approval (charter).

---

## T6 gate matrix

| Gate | Command | Blocking? |
| --- | --- | --- |
| PI invariant units | `npm run test:pi` | Yes |
| Unauth gates | `npm run test:e2e:t6:unauth` | Yes |
| Security always-on | `npm run test:e2e:t6:security` | Yes (live portion optional) |
| Composite | `npm run test:release-gate` | Yes |
| Live signed-in | `npm run test:release-gate:live` | Yes when secrets present; optional in CI until secrets configured |
| Playwright smoke/acceptance | `npm run test:smoke` / `test:e2e:acceptance` | Manual — `.github/workflows/ci-e2e.yml` (`workflow_dispatch`) |
| Production build | `npm run build` | Yes |

**CI policy (updated 2026-08-26):** Default CI lives in `.github/workflows/verify.yml` (unit + `test:release-gate` + build; lint advisory) on `push`/`pull_request`/`workflow_dispatch`. Playwright is `.github/workflows/ci-e2e.yml` (manual `workflow_dispatch`). **TD-018 closed:** workflows re-enabled; first green verify after restore is [run 32986767790](https://github.com/gnaneshwer23/deliverx/actions/runs/32986767790). Optional next: add Actions secrets `T6_SUPABASE_*` for live signed-in job; consider dropping lint `continue-on-error` once canvas lint noise is cleared.

---

## Recommended next

Ordered plan: [`../engineering/next-steps.md`](../engineering/next-steps.md).

1. Founder restores Actions minutes / spending (TD-018), then re-enable workflows.  
2. Founder enables TD-006 leaked-password protection.  
3. Configure GitHub Actions secrets `T6_SUPABASE_URL`, `T6_SUPABASE_ANON_KEY`, `T6_SUPABASE_SERVICE_ROLE_KEY` so CI runs the live signed-in job.  
4. Engineering clears TD-017 fixture lint/tsc debt.  
5. When disk allows: stand up Option A (local Supabase) and point `T6_BASE_URL=http://localhost:3000`.
