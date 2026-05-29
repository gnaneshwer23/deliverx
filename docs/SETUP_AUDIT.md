# Setup audit

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

## Local check

```bash
cp .env.example .env.local
# set OPENAI_API_KEY=sk-...
node scripts/check-env.mjs
npm run dev
```
