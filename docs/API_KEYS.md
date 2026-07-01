# API keys & environment setup

DeliverX reads secrets from **`.env.local`** locally and from **Vercel → Project → Settings → Environment Variables** in production.

Copy the template first:

```bash
cp .env.example .env.local
```

Then fill in each value below.

---

## Required (app will not work without these)

| Variable | Where to get it | Used for |
|----------|-----------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | [Supabase](https://supabase.com/dashboard) → Project → **Settings → API** → Project URL | Database, auth, storage |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page → **anon public** key | Client-side Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page → **service_role** key (keep secret) | Server admin ops, global intelligence network writes |
| `NEXT_PUBLIC_APP_URL` | Your app URL, e.g. `http://localhost:3000` or `https://www.deliverx.dev` | Auth redirects, invite links |
| `INVITE_JWT_SECRET` | Generate with `openssl rand -base64 32` — set in Vercel **Production** (and Preview) | Signs project invite JWT links (7-day). Local dev may fall back to `CRON_SECRET`; **do not rely on fallback in deployed environments** |
| **`OPENAI_API_KEY`** | [OpenAI Platform](https://platform.openai.com/api-keys) | **All text AI** (assistant, reviews, structure, discovery chat), Whisper transcription, charter embeddings |

| Variable | Where to get it | Used for |
|----------|-----------------|----------|
| `OPENAI_MODEL` | Optional, default **`gpt-4o-mini`** | Override chat model (e.g. `gpt-4o` for higher quality) |

**Check status:** Settings → **Setup audit**, or `GET /api/setup/diagnostics` when logged in.

---

## Optional fallbacks (not needed if you use OpenAI only)

| Variable | Used for |
|----------|----------|
| `MINIMAX_API_KEY` + `MINIMAX_MODEL` | Legacy alternative text AI |
| `ANTHROPIC_API_KEY` | Legacy alternative text AI |

OpenAI is checked **first** when `OPENAI_API_KEY` is set.

---

## Production cron (Vercel only)

| Variable | Where to set | Used for |
|----------|--------------|----------|
| `CRON_SECRET` | Vercel env vars — any long random string you generate | Secures `GET /api/twin/snapshot` (daily twin snapshot, see `vercel.json`) |
| `INVITE_JWT_SECRET` | Vercel **Production** + **Preview** — separate from `CRON_SECRET` | Signs project invite JWTs (`/join?token=`, `/api/invites/*`) |

Local dev does **not** need `CRON_SECRET` unless you test the cron route manually. Set `INVITE_JWT_SECRET` explicitly before testing invite flows in staging/production.

---

## Report emails (optional — Phase 1)

| Variable | Where to get it | Used for |
|----------|-----------------|----------|
| `RESEND_API_KEY` | [Resend](https://resend.com) → API Keys | Sending stakeholder emails when a report is published |
| `EMAIL_FROM` | Resend → verified domain, e.g. `DeliverX <reports@yourdomain.com>` | From address (defaults to Resend onboarding address if unset) |

Publishing a report still works without these keys; the UI shows a warning if emails were requested but not sent.

---

## Local development

1. Create `.env.local` from `.env.example`
2. Add Supabase keys from your project dashboard
3. Add **`OPENAI_API_KEY`** (starts with `sk-`)
4. Run `node scripts/check-env.mjs` then `npm run dev`
5. Open **Settings → Setup audit** to confirm AI is configured

---

## Vercel deployment

1. Open [Vercel Dashboard](https://vercel.com/) → project **deliverx**
2. **Settings → Environment Variables**
3. Add **`OPENAI_API_KEY`** for **Production** and **Preview** (see [PREVIEW_ENV_PARITY.md](./PREVIEW_ENV_PARITY.md))
4. Mirror Supabase and `NEXT_PUBLIC_APP_URL` to Preview where safe
5. Optionally add `OPENAI_MODEL` (e.g. `gpt-4o-mini`)
6. **Redeploy** after saving env vars

```bash
vercel env add OPENAI_API_KEY production
vercel --prod
```

**Never** commit `.env.local` or paste API keys into the repo.

See also [SETUP_AUDIT.md](./SETUP_AUDIT.md).
