# Environment checklist — local dev, CI, and E2E smoke

Use this checklist before running DeliverX locally, opening a PR preview, or interpreting **Slice A** smoke tests (`e2e/slice-a-production-smoke.test.ts`).

For full variable descriptions see [API_KEYS.md](./API_KEYS.md). For Vercel Preview parity see [PREVIEW_ENV_PARITY.md](./PREVIEW_ENV_PARITY.md). For production ops see [OPS_ENV_RUNBOOK.md](./OPS_ENV_RUNBOOK.md).

---

## Required (app + smoke tests)

| Variable | Local | CI (`/.github/workflows/ci.yml`) | Used for |
|----------|:-----:|:--------------------------------:|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ (placeholder) | Auth, database, storage |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ (placeholder) | Client Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ✅ (placeholder) | Server admin, invite validation DB lookup |
| `NEXT_PUBLIC_APP_URL` | ✅ | ✅ | Auth redirects, `/join?token=` links |
| `OPENAI_API_KEY` | ✅ for live AI | Optional (placeholder in build) | Assistant, Helm, BC review, meeting extraction, **Whisper audio upload** (≤25 MB on `/project/[id]/meetings`), **Brain ingest classification** |
| `INVITE_JWT_SECRET` | ✅ | ✅ (CI) | Signs project invite JWTs (7-day). **Required explicitly on Vercel Production** — local dev may fall back to `CRON_SECRET` |

Quick local check:

```bash
cp .env.example .env.local
# fill values, then:
node scripts/check-env.mjs
node scripts/check-env.mjs --production   # stricter — no INVITE_JWT_SECRET fallback
```

---

## Optional (feature-specific)

| Variable | When needed |
|----------|-------------|
| `OPENAI_MODEL` | Override default `gpt-4o-mini` |
| `CRON_SECRET` | Vercel cron routes (`/api/twin/snapshot`, loops, notifications) |
| `RESEND_API_KEY` + `EMAIL_FROM` | Report publish emails; **project invite emails** (`/api/invites/generate` with `email`) |
| `RECALL_API_KEY`, `RECALL_REGION`, `RECALL_WEBHOOK_SECRET` | Recall.ai meeting bot on `/project/[id]/meetings` — bot join, transcript sync, webhook auto-ingest. Without `RECALL_API_KEY`, use **Quick ingest** (Whisper audio upload or paste transcript; audio needs `OPENAI_API_KEY`). `RECALL_REGION` defaults to `us-east-1`. `RECALL_WEBHOOK_SECRET` verifies `/api/integrations/recall/webhook` (requires `NEXT_PUBLIC_APP_URL`). |
| `MINIMAX_API_KEY`, `ANTHROPIC_API_KEY` | Legacy AI fallbacks |
| `NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS` | Analytics on Preview deploys |

---

## Vercel deployment

1. [Vercel → deliverx → Settings → Environment Variables](https://vercel.com/dashboard)
2. Set required rows for **Production** and **Preview** (see [PREVIEW_ENV_PARITY.md](./PREVIEW_ENV_PARITY.md))
3. **`INVITE_JWT_SECRET`** — set on Production (and Preview when testing invites); do not rely on `CRON_SECRET` fallback in deployed environments
4. Redeploy after changes

### Supabase auth URLs (Production)

In [Supabase → Auth → URL Configuration](https://supabase.com/dashboard/project/jibmyxaldetyycmtlxet/auth/url-configuration):

- **Site URL:** `https://www.deliverx.dev`
- **Redirect allowlist:** `https://www.deliverx.dev/auth/callback`, plus preview/local callbacks as needed (see [OPS_ENV_RUNBOOK.md](./OPS_ENV_RUNBOOK.md))

```bash
vercel env pull .env.local   # never commit the pulled file
npm run build
```

---

## Slice A smoke tests — what runs where

| Test file | Needs DB? | Needs browser login? | Needs `OPENAI_API_KEY`? |
|-----------|:---------:|:--------------------:|:-----------------------:|
| `e2e/gateway-bc-go-bootstrap.test.ts` | No | No | Only for optional live AI review test |
| `e2e/slice-a-production-smoke.test.ts` | No | No | No (stub meeting path; Helm reports honest empty state) |

Run locally:

```bash
npm test                              # all unit + Vitest e2e specs
npm test -- e2e/slice-a-production-smoke.test.ts
npm run test:e2e                      # Playwright 5-step browser smoke (see E2E_SMOKE.md)
```

---

## Playwright smoke (`e2e/smoke/`)

| Spec | Mock path (CI) | Live path |
|------|:--------------:|:---------:|
| Auth login | ✅ | `E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD` |
| Invite join | ✅ (mock validate API) | PM credentials |
| BA requirements | ✅ (auth gate) | BA credentials + `E2E_TEST_PROJECT_ID` |
| Standup flow | ✅ (auth gate) | PM credentials + project id |
| Sponsor read-only | ✅ (mock invite + auth gate) | Executive credentials |

See [E2E_SMOKE.md](./E2E_SMOKE.md) for full variable list.

---

## In-app verification

After env is set: **Settings → Setup audit**, or `GET /api/setup/diagnostics` when logged in.

---

## Still manual (not covered by Slice A / Playwright mock smoke)

- Supabase migrations **0060–0063** on prod (`jibmyxaldetyycmtlxet`) — verified 2026-07-01; re-check via [OPS_ENV_RUNBOOK.md](./OPS_ENV_RUNBOOK.md) if schema drift suspected
- Live browser login with real Supabase test accounts (Playwright live paths — see [E2E_SMOKE.md](./E2E_SMOKE.md))
- Live `POST /api/invites/generate` and `POST /api/invites/accept` against Supabase
- Live `POST /api/project/[id]/meetings/ingest` with authenticated PM session
- Live `POST /api/ai/helm` chat when `OPENAI_API_KEY` is set
- Preview URL auth redirect quirks (`NEXT_PUBLIC_APP_URL` per deployment)

Never commit `.env.local` or paste secrets into the repo.
