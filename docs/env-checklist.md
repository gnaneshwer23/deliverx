# Environment checklist — local dev, CI, and E2E smoke

Use this checklist before running DeliverX locally, opening a PR preview, or interpreting **Slice A** smoke tests (`e2e/slice-a-production-smoke.test.ts`).

For full variable descriptions see [API_KEYS.md](./API_KEYS.md). For Vercel Preview parity see [PREVIEW_ENV_PARITY.md](./PREVIEW_ENV_PARITY.md).

---

## Required (app + smoke tests)

| Variable | Local | CI (`/.github/workflows/ci.yml`) | Used for |
|----------|:-----:|:--------------------------------:|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ (placeholder) | Auth, database, storage |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ (placeholder) | Client Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ✅ (placeholder) | Server admin, invite validation DB lookup |
| `NEXT_PUBLIC_APP_URL` | ✅ | ✅ | Auth redirects, `/join?token=` links |
| `OPENAI_API_KEY` | ✅ for live AI | Optional (placeholder in build) | Assistant, Helm, BC review, meeting extraction, **Brain ingest classification** |
| `INVITE_JWT_SECRET` | ✅ | Optional | Signs project invite JWTs (7-day). Falls back to `CRON_SECRET` in dev |

Quick local check:

```bash
cp .env.example .env.local
# fill values, then:
node scripts/check-env.mjs
```

---

## Optional (feature-specific)

| Variable | When needed |
|----------|-------------|
| `OPENAI_MODEL` | Override default `gpt-4o-mini` |
| `CRON_SECRET` | Vercel cron routes (`/api/twin/snapshot`, loops, notifications) |
| `RESEND_API_KEY` + `EMAIL_FROM` | Report publish emails; **project invite emails** (`/api/invites/generate` with `email`) |
| `RECALL_API_KEY`, `RECALL_REGION`, `RECALL_WEBHOOK_SECRET` | Recall.ai meeting bot on `/project/[id]/meetings` — bot join, transcript sync, webhook auto-ingest. Without `RECALL_API_KEY`, use **Quick ingest** (paste transcript). `RECALL_REGION` defaults to `us-east-1`. `RECALL_WEBHOOK_SECRET` verifies `/api/integrations/recall/webhook` (requires `NEXT_PUBLIC_APP_URL`). |
| `MINIMAX_API_KEY`, `ANTHROPIC_API_KEY` | Legacy AI fallbacks |
| `NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS` | Analytics on Preview deploys |

---

## Vercel deployment

1. [Vercel → deliverx → Settings → Environment Variables](https://vercel.com/dashboard)
2. Set required rows for **Production** and **Preview** (see [PREVIEW_ENV_PARITY.md](./PREVIEW_ENV_PARITY.md))
3. Redeploy after changes

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
npm test                              # all unit + e2e vitest specs
npm test -- e2e/slice-a-production-smoke.test.ts
```

---

## In-app verification

After env is set: **Settings → Setup audit**, or `GET /api/setup/diagnostics` when logged in.

---

## Still manual (not covered by Slice A)

- Apply Supabase migration `0060_brain_storage.sql` for Brain ingest uploads (`/brain/ingest`)
- Browser login (Supabase OAuth / email) on `/join` and workspace routes
- Live `POST /api/invites/generate` and `POST /api/invites/accept` against Supabase
- Live `POST /api/project/[id]/meetings/ingest` with authenticated PM session
- Live `POST /api/ai/helm` chat when `OPENAI_API_KEY` is set
- Preview URL auth redirect quirks (`NEXT_PUBLIC_APP_URL` per deployment)

Never commit `.env.local` or paste secrets into the repo.
