# Setup audit (May 2026)

## Why AI features return no response

Production on Vercel project **`deliverx`** was checked via `vercel env ls`:

| Variable | Production |
|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Set |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Set |
| `NEXT_PUBLIC_APP_URL` | ✅ Set |
| `MINIMAX_MODEL` | ✅ Set |
| `CRON_SECRET` | ✅ Set |
| **`MINIMAX_API_KEY`** | ❌ **Missing** |
| **`ANTHROPIC_API_KEY`** | ❌ **Missing** |
| `OPENAI_API_KEY` | ❌ Missing (optional) |

**`MINIMAX_MODEL` alone does not enable AI.** You must add **`MINIMAX_API_KEY`** (or `ANTHROPIC_API_KEY`).

In-app: **Settings → Setup audit** (or `GET /api/setup/diagnostics` when logged in).

---

## Fix AI (5 minutes)

### Vercel (production)

1. Get a key from [MiniMax](https://www.minimax.io/) or [Anthropic](https://console.anthropic.com/).
2. [Vercel Dashboard](https://vercel.com/) → project **deliverx** → **Settings → Environment Variables**.
3. Add **`MINIMAX_API_KEY`** = your key → **Production** (and Preview if needed).
4. **Deployments → Redeploy** latest (env vars apply only after redeploy).

Or CLI:

```bash
vercel env add MINIMAX_API_KEY production
vercel --prod
```

### Local (`.env.local`)

```bash
cp .env.example .env.local
# Edit .env.local — set MINIMAX_API_KEY=...
npm run dev
```

---

## Login / auth

If sign-in fails with “email logins disabled”:

1. [Supabase Auth Providers](https://supabase.com/dashboard/project/jibmyxaldetyycmtlxet/auth/providers)
2. Enable **Email**
3. **URL configuration**: Site URL `https://www.deliverx.dev`, redirect `https://www.deliverx.dev/auth/callback`

---

## Optional

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Meeting Whisper transcription |
| `CRON_SECRET` | Already set — twin daily snapshot |

See [API_KEYS.md](./API_KEYS.md) for full reference.
