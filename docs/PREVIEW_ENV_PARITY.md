# Preview environment parity

DeliverX preview deployments (Vercel **Preview**) should mirror **Production** for core app behavior. Analytics and cron secrets stay production-only unless noted.

**Last audited:** 2026-06-19 (Sprint S1-B) via `vercel env ls` — names only, no secret values.

---

## Current Vercel state (deliverx project)

| Environment | Count | Variable names |
|-------------|------:|----------------|
| **Production** | 7 | `open_api_key`, `NEXT_PUBLIC_APP_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `MINIMAX_MODEL`, `CRON_SECRET` |
| **Preview** | 1 | `open_api_key` |

Preview is missing Supabase, app URL, and cron configuration. Login, database, and AI features will fail or behave incorrectly on preview URLs until these are synced.

**Post-audit (2026-06-19):** unchanged — user must add the 6 Production-only vars above in the Vercel dashboard (secret values not settable from CI).

**Note:** Production uses legacy name `open_api_key` for OpenAI. Code accepts both `open_api_key` and `OPENAI_API_KEY`; prefer `OPENAI_API_KEY` for new entries (see `docs/API_KEYS.md`).

---

## Required on Preview (safe to mirror Production values)

Copy the **same values** as Production for these (they are not production-only secrets in the sense of “must never leave prod” — they are the shared Supabase project and public URLs):

| Variable | Why Preview needs it |
|----------|----------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth and RLS client |
| `SUPABASE_SERVICE_ROLE_KEY` | Server admin routes |
| `NEXT_PUBLIC_APP_URL` | Set to the **preview URL pattern** or your canonical preview base if you use one fixed preview domain; required for auth redirects on that deployment |
| `OPENAI_API_KEY` or `open_api_key` | AI assistant, reviews, structure (Preview already has `open_api_key`) |

Optional but useful on Preview:

| Variable | Notes |
|----------|--------|
| `OPENAI_MODEL` | Same model as Production |
| `RESEND_API_KEY` | Only if testing report email on preview |
| `EMAIL_FROM` | Paired with Resend |

---

## Production-only or optional on Preview

| Variable | Guidance |
|----------|----------|
| `CRON_SECRET` | Twin/loop cron jobs in `vercel.json` — usually **Production only** unless you intentionally hit cron routes on preview |
| `MINIMAX_MODEL` | Legacy fallback; omit on Preview if unused |
| `RECALL_*` | Meeting bot — add when testing Recall on preview |
| `NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS` | Set `true` on Preview **only** when you want Analytics + Speed Insights on a preview deploy (default: production only) |

Vercel Analytics and Speed Insights do **not** require env vars; they activate when the app is deployed on Vercel and `VERCEL_ENV=production` (or when `NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS=true`).

---

## Sync in Vercel dashboard

1. Open [Vercel → deliverx → Settings → Environment Variables](https://vercel.com/dashboard).
2. For each variable in **Required on Preview**, either:
   - Edit an existing Production-only row → enable **Preview** (and **Development** if you use `vercel dev` with pulled env), or
   - **Add** the variable and check **Preview** (and Production if missing).
3. For `NEXT_PUBLIC_APP_URL` on Preview, use your preview canonical URL or document that each PR URL may need a wildcard strategy (many teams use the Vercel preview URL for smoke tests and accept redirect quirks, or set a stable preview domain).
4. **Redeploy** the preview branch after saving.

---

## Sync via Vercel CLI (names only — prompts for values)

From repo root, linked to the project:

```bash
# List names per environment (no values printed)
vercel env ls
vercel env ls preview
vercel env ls production

# Add or extend an existing key to Preview (paste value when prompted)
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
vercel env add SUPABASE_SERVICE_ROLE_KEY preview
vercel env add NEXT_PUBLIC_APP_URL preview
vercel env add OPENAI_API_KEY preview

# Pull a local .env.local for development (still never commit)
vercel env pull .env.local
```

Rename legacy key when convenient:

```bash
# After adding OPENAI_API_KEY to Production + Preview, remove open_api_key in dashboard
```

---

## Local template

See `.env.example` at repo root and `docs/API_KEYS.md` for the full variable list. Run `node scripts/check-env.mjs` locally after copying to `.env.local`.

---

## Verify after sync

1. Open a preview deployment URL → sign in (Supabase).
2. **Settings → Setup audit** — no red required keys.
3. Send a message in **AI Assistant** — expect a reply, not 503.
4. Production: confirm **Vercel Analytics** and **Speed Insights** in the Vercel project **Analytics** / **Speed Insights** tabs after traffic hits the site.

See also `docs/SETUP_AUDIT.md` and `docs/PHASE0_CHECKLIST.md`.
