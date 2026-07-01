# E2E smoke — Playwright 5-step suite

Browser smoke tests for DeliverX pilot readiness (**E2E-SMOKE-5**). Complements the Vitest integration harness in `e2e/acceptance-17-step.test.ts`.

For the full manual 17-step pilot checklist, see [PILOT_17_STEP_RUNBOOK.md](./PILOT_17_STEP_RUNBOOK.md).

---

## Quick start

```bash
npm install
npx playwright install chromium   # first run only

# Mock-safe smoke (no secrets) — starts dev server automatically
npm run test:e2e

# Same as above, explicit smoke path
npm run test:smoke
```

Against a running app or preview URL:

```bash
PLAYWRIGHT_BASE_URL=https://your-preview.vercel.app npm run test:e2e
```

---

## Five smoke specs

| # | Spec file | Mock path (CI) | Live path (needs env) |
|---|-----------|----------------|------------------------|
| 1 | `e2e/smoke/01-auth.spec.ts` | Login page renders sign-in form | Login → role home + persona nav |
| 2 | `e2e/smoke/02-invite-join.spec.ts` | Mocked `/api/invites/validate` → BA join preview | PM opens pm-mission invite section |
| 3 | `e2e/smoke/03-ba-requirements.spec.ts` | `/workspace/ba` redirects to login | BA workspace shows requirements register |
| 4 | `e2e/smoke/04-standup-flow.spec.ts` | Project meetings route auth-gated | PM paste transcript → review → approve |
| 5 | `e2e/smoke/05-sponsor-readonly.spec.ts` | Sponsor invite read-only copy + founder auth gate | Executive lands on `/workspace/founder` |

**CI (`/.github/workflows/ci.yml`)** runs the mock-safe paths on every PR. Live paths use `test.skip()` when credentials are absent.

---

## Environment variables

### Always (local dev server via Playwright)

Playwright starts `npm run dev` with placeholder Supabase values unless you set real ones. Minimum for mock smoke:

| Variable | Required for mock smoke? | Notes |
|----------|:------------------------:|-------|
| `INVITE_JWT_SECRET` | Optional | Defaults to `e2e-smoke-invite-secret` in Playwright webServer |
| `E2E_MOCK_INVITES` | Auto in CI | Set to `true` by Playwright webServer — enables `mock-*` invite tokens |
| `PLAYWRIGHT_BASE_URL` / `E2E_BASE_URL` | Optional | Default `http://127.0.0.1:3000` |

### Live browser flows

Set these in `.env.local`, CI secrets, or export before running:

| Variable | Used for |
|----------|----------|
| `E2E_TEST_EMAIL` | Default login for live auth smoke |
| `E2E_TEST_PASSWORD` | Default password |
| `E2E_TEST_PM_EMAIL` / `E2E_TEST_PM_PASSWORD` | PM standup + invite live tests (falls back to default) |
| `E2E_TEST_BA_EMAIL` / `E2E_TEST_BA_PASSWORD` | BA requirements live test (falls back to default) |
| `E2E_TEST_EXECUTIVE_EMAIL` / `E2E_TEST_EXECUTIVE_PASSWORD` | Sponsor/founder live test (falls back to default) |
| `E2E_TEST_PROJECT_ID` | Project with BC + requirements for BA/standup live tests |
| `E2E_TEST_MEETING_ID` | Optional — open existing meeting review if ingest does not link |

Example local live run:

```bash
export E2E_TEST_EMAIL=pm@your-org.test
export E2E_TEST_PASSWORD='your-test-password'
export E2E_TEST_PROJECT_ID='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
npm run test:e2e
```

Use seeded test accounts in Supabase — **never commit credentials**.

---

## Related test commands

| Command | What it runs |
|---------|--------------|
| `npm run test:e2e` | Playwright browser smoke (`e2e/smoke/`) |
| `npm run test:smoke` | Same as `test:e2e` |
| `npm run test:e2e:vitest` | Vitest specs in `e2e/` (slice-a, gateway, acceptance) |
| `npm run test:acceptance` | 17-step Vitest harness only |
| `npm test` | All unit + Vitest e2e tests (no Playwright) |

---

## Selectors

Prefer stable `data-testid` hooks:

- `login-form`
- `join-invite-preview`
- `sponsor-readonly-notice`
- `ba-requirements-panel`
- `meeting-transcript-ingest`
- `meeting-review-page`
- `persona-home-nav`

---

## Troubleshooting

- **Dev server timeout:** Ensure port 3000 is free, or set `PLAYWRIGHT_BASE_URL` to an already-running instance.
- **Live login skipped:** Confirm `E2E_TEST_EMAIL` and `E2E_TEST_PASSWORD` are exported in the same shell.
- **Flaky live standup:** Ingest uses stub mode when OpenAI is absent; allow up to 45s for proposal queue messaging.
- **Trace on failure:** Re-run with `npx playwright test --trace on`.

See also [env-checklist.md](./env-checklist.md) and [OPS_ENV_RUNBOOK.md](./OPS_ENV_RUNBOOK.md).
