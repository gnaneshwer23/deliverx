# E2E testing — Playwright smoke + 17-AC acceptance + T6 signed-in PI loop

Browser tests for DeliverX pilot readiness. Complements the Vitest integration harness in `e2e/acceptance-17-step.test.ts` and the **Technology T6** signed-in PI loop.

| Layer | Command | Coverage |
|-------|---------|----------|
| Vitest 17-step | `npm run test:acceptance` | Pure engines, no browser (CI-safe) |
| Playwright smoke (5 specs) | `npm run test:smoke` | Highest-risk pilot paths |
| Playwright acceptance (17 specs) | `npm run test:e2e:acceptance` | One spec per acceptance criterion |
| All Playwright | `npm run test:e2e` | Smoke + acceptance |
| **T6 release gate** | `npm run test:release-gate` | PI units + unauth + security always-on |
| **T6 live signed-in** | `npm run test:release-gate:live` | Full P0–P7 loop + security negatives (needs Supabase keys) |
| T6 unauth only | `npm run test:e2e:t6:unauth` | 401 / login redirects |
| T6 security | `npm run test:e2e:t6:security` | Guardrails (+ live when `T6_E2E=1`) |

Manual pilot checklist: [PILOT_17_STEP_RUNBOOK.md](./PILOT_17_STEP_RUNBOOK.md)  
T6 audit pack: [qa/end-to-end-audit.md](./qa/end-to-end-audit.md)

---

## Quick start

```bash
npm install
npx playwright install chromium   # first run only

# CI-safe — no secrets (starts dev server automatically)
npm run test:e2e:acceptance

# Smoke only (5 specs)
npm run test:smoke

# All browser tests (22 specs)
npm run test:e2e

# T6 PI release gate (always-on)
npm run test:release-gate

# T6 live signed-in (uses .env.local; purges disposable users)
T6_BASE_URL=https://www.deliverx.dev npm run test:release-gate:live
```

Against a running app or preview URL:

```bash
PLAYWRIGHT_BASE_URL=https://your-preview.vercel.app npm run test:e2e:acceptance
T6_BASE_URL=https://your-preview.vercel.app T6_E2E=1 npm run test:e2e:t6
```

---

## 17-AC acceptance mapping

Each file in `e2e/acceptance/` maps 1:1 to an acceptance criterion from `ACCEPTANCE_STEP_DEFINITIONS` in `src/services/acceptance17StepEngine.ts`.

| AC | Spec | CI-safe test | Live test (skipped without env) |
|----|------|--------------|----------------------------------|
| 1 | `ac-01-pm-bc-upload.spec.ts` | `/project/new` auth gate | PM opens project creation page |
| 2 | `ac-02-ai-extraction.spec.ts` | `/workspace/pm-mission` auth gate | PM AI review / extraction surfaces |
| 3 | `ac-03-ba-invite.spec.ts` | Mock BA invite validate API | PM pm-mission invite section |
| 4 | `ac-04-ba-join.spec.ts` | BA join preview (mock token) | BA lands on `/workspace/ba` |
| 5 | `ac-05-ba-bc-requirements.spec.ts` | `/workspace/ba` auth gate | BA requirements register panel |
| 6 | `ac-06-ba-accept-pm-feed.spec.ts` | BA requirements auth gate | BA accepts requirement → toast |
| 7 | `ac-07-ba-share-pm-summary.spec.ts` | BA workspace auth gate | BA handoff KPIs + PM summary |
| 8 | `ac-08-pm-all-role-invites.spec.ts` | Mock validate for all 6 roles | PM invite section lists roles |
| 9 | `ac-09-engineer-join.spec.ts` | Engineer invite + auth gate | Engineer mission workspace |
| 10 | `ac-10-standup-upload.spec.ts` | Meetings route auth gate | PM transcript ingest UI |
| 11 | `ac-11-standup-intel.spec.ts` | Meeting review auth gate | Speaker transcript blocks |
| 12 | `ac-12-pm-approve-tasks.spec.ts` | Meeting review auth gate | PM approve all proposals |
| 13 | `ac-13-team-standup-tasks.spec.ts` | Engineer workspace auth gate | Standup tasks section |
| 14 | `ac-14-sponsor-invite.spec.ts` | Sponsor read-only join preview | PM executive invite row |
| 15 | `ac-15-sponsor-join.spec.ts` | Founder route auth gate | Executive founder mission |
| 16 | `ac-16-sponsor-copilot.spec.ts` | Founder auth gate | Helm Copilot panel |
| 17 | `ac-17-sponsor-decision-pm-notify.spec.ts` | Founder decision auth gate | Decision centre actions |

**CI totals:** 17 CI-safe tests pass; 17 live tests skip without credentials.

**Smoke overlap:** Specs AC-03/04/05/10/14/15 extend the original 5 smoke specs with dedicated AC coverage. Smoke specs remain for fast regression (`npm run test:smoke`).

---

## Environment variables

### Mock / CI paths

| Variable | Required for mock? | Notes |
|----------|:------------------:|-------|
| `INVITE_JWT_SECRET` | Optional | Defaults to `e2e-smoke-invite-secret` in Playwright webServer |
| `E2E_MOCK_INVITES` | Auto in CI | Enables `mock-*-invite-token` on `/api/invites/validate` |
| `PLAYWRIGHT_BASE_URL` / `E2E_BASE_URL` | Optional | Default `http://127.0.0.1:3000` |

### Live browser flows

| Variable | Used for |
|----------|----------|
| `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD` | Default login |
| `E2E_TEST_PM_EMAIL` / `E2E_TEST_PM_PASSWORD` | PM flows (falls back to default) |
| `E2E_TEST_BA_EMAIL` / `E2E_TEST_BA_PASSWORD` | BA flows |
| `E2E_TEST_ENGINEER_EMAIL` / `E2E_TEST_ENGINEER_PASSWORD` | Engineer flows |
| `E2E_TEST_EXECUTIVE_EMAIL` / `E2E_TEST_EXECUTIVE_PASSWORD` | Sponsor / founder flows |
| `E2E_TEST_PROJECT_ID` | Project with BC, requirements, meetings |
| `E2E_TEST_MEETING_ID` | Existing meeting review (AC 11–12 live) |

Example:

```bash
export E2E_TEST_EMAIL=pm@your-org.test
export E2E_TEST_PASSWORD='your-test-password'
export E2E_TEST_PROJECT_ID='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
npm run test:e2e:acceptance
```

Never commit credentials.

---

## Selectors (`data-testid`)

| Hook | Used in |
|------|---------|
| `login-form` | Auth gates |
| `project-new-page` | AC-01 project creation |
| `join-invite-preview` | AC-03/04/09/14 invites |
| `sponsor-readonly-notice` | AC-14 sponsor invite |
| `ba-requirements-panel` | AC-05/06 requirements |
| `ba-handoff-kpis` | AC-07 BA share with PM |
| `pm-role-invites` (`data-panel`) | AC-03/08/14 team invites |
| `meeting-transcript-ingest` | AC-10 standup upload |
| `meeting-review-page` | AC-11/12 meeting intel |
| `standup-tasks-section` / `standup-tasks-empty` | AC-13 team tasks |
| `helm-copilot-panel` | AC-16 Copilot |
| `founder-decision-centre` (`data-panel`) | AC-17 decisions |
| `persona-home-nav` | Role home landing |
| `pending-reviews-strip` | AC-02 AI extraction |

---

## Related commands

| Command | What it runs |
|---------|--------------|
| `npm run test:e2e:acceptance` | 17 Playwright AC specs |
| `npm run test:smoke` | 5 Playwright smoke specs |
| `npm run test:e2e` | All Playwright (22 specs) |
| `npm run test:acceptance` | Vitest 17-step harness |
| `npm test` | Unit + Vitest e2e (no Playwright) |

---

## Troubleshooting

- **Dev server timeout:** Free port 3000 or set `PLAYWRIGHT_BASE_URL`.
- **Live tests skipped:** Export credentials in the same shell as the test run.
- **Flaky standup ingest:** Allow up to 45s; stub mode works without OpenAI.
- **Trace on failure:** `npx playwright test e2e/acceptance --trace on`

See also [E2E_SMOKE.md](./E2E_SMOKE.md) (smoke-only quick reference) and [env-checklist.md](./env-checklist.md).
