# Setup audit

**Phase 0 (2026-05-31):** PR #11 merged to `main`. Vercel should redeploy automatically. Migration `architecture_os` is applied on Supabase.

## Primary AI: OpenAI

DeliverX uses **`OPENAI_API_KEY`** for:

- AI Assistant (`/workspace/assistant`)
- Business case review & guided project chat (`/project/new`)
- Structure generation, RAID, reports, insights
- Meeting transcription (Whisper)
- Charter embeddings

Default model: **`gpt-4o-mini`** (override with `OPENAI_MODEL`).

---

## Fix “no AI response”

1. [OpenAI API keys](https://platform.openai.com/api-keys) → create key
2. Vercel → **deliverx** → **Settings → Environment Variables**
3. Add **`OPENAI_API_KEY`** = `sk-...` → **Production**
4. **Redeploy** (required)

In-app: **Settings → Setup audit** should show OpenAI as configured.

---

## Auth (if login fails)

[Supabase → Email provider](https://supabase.com/dashboard/project/jibmyxaldetyycmtlxet/auth/providers) — enable **Email**.

Site URL: `https://www.deliverx.dev`  
Redirect: `https://www.deliverx.dev/auth/callback`

---

## Preview deployments

Preview env vars are often missing compared to Production. See **`docs/PREVIEW_ENV_PARITY.md`** for required names and Vercel sync steps (no secrets in repo).

---

## Local check

```bash
cp .env.example .env.local
# set OPENAI_API_KEY=sk-...
node scripts/check-env.mjs
npm run dev
```

## Observability (S1-B)

- **Vercel Analytics** and **Speed Insights** are wired in the root layout; they run on **Production** deploys only unless `NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS=true`.
- **Settings → Setup audit** includes a non-blocking check that the observability component is present.
