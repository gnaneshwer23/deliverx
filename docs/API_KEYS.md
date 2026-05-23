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
| `NEXT_PUBLIC_APP_URL` | Your app URL, e.g. `http://localhost:3000` or `https://your-app.vercel.app` | Auth redirects, invite links |

---

## AI — text generation (pick one)

| Variable | Where to get it | Used for |
|----------|-----------------|----------|
| `MINIMAX_API_KEY` | [MiniMax](https://www.minimax.io/) platform | Assistant, insights, RAID, reports, business case review, structure project |
| `MINIMAX_MODEL` | Optional, default `MiniMax-M2.7` | Model name |
| **OR** `ANTHROPIC_API_KEY` | [Anthropic Console](https://console.anthropic.com/) | Same features if MiniMax is not set |

**Check status:** Settings → **Integrations** in the app, or `GET /api/ai/status` when logged in.

---

## AI — optional features

| Variable | Where to get it | Used for |
|----------|-----------------|----------|
| `OPENAI_API_KEY` | [OpenAI Platform](https://platform.openai.com/api-keys) | Meeting transcription (Whisper), charter semantic embeddings |

Without OpenAI, text AI still works; meeting upload transcription and embedding-based alignment may be limited.

---

## Production cron (Vercel only)

| Variable | Where to set | Used for |
|----------|--------------|----------|
| `CRON_SECRET` | Vercel env vars — any long random string you generate | Secures `GET /api/twin/snapshot` (daily twin snapshot, see `vercel.json`) |

Local dev does **not** need `CRON_SECRET` unless you test the cron route manually.

---

## Local development

1. Create `.env.local` from `.env.example`
2. Add Supabase keys from your project dashboard
3. Add **either** `MINIMAX_API_KEY` **or** `ANTHROPIC_API_KEY`
4. Run `npm run dev`
5. Open **Settings → Integrations** to confirm AI is configured

---

## Vercel deployment

1. Open [Vercel Dashboard](https://vercel.com/) → your DeliverX project
2. **Settings → Environment Variables**
3. Add every variable from `.env.example` for **Production** (and Preview if you use preview deploys)
4. Redeploy after saving env vars
5. For cron: ensure `CRON_SECRET` is set — Vercel sends it as `Authorization: Bearer <CRON_SECRET>` on scheduled runs

**Never** commit `.env.local` or paste service role / API keys into the repo.
