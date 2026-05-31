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

Local dev does **not** need `CRON_SECRET` unless you test the cron route manually.

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
3. Add **`OPENAI_API_KEY`** for **Production** (and Preview if needed)
4. Optionally add `OPENAI_MODEL` (e.g. `gpt-4o-mini`)
5. **Redeploy** after saving env vars

```bash
vercel env add OPENAI_API_KEY production
vercel --prod
```

**Never** commit `.env.local` or paste API keys into the repo.

See also [SETUP_AUDIT.md](./SETUP_AUDIT.md).
