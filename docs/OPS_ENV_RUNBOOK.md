# OPS-ENV — Production environment runbook

Operational checklist for DeliverX production (`www.deliverx.dev`) and preview parity. **Never paste secret values into git, PRs, or chat.**

**Supabase project:** `jibmyxaldetyycmtlxet` (DeliverX, eu-central-2)  
**Vercel project:** `deliverx`  
**Last audit:** 2026-07-01 (OPS-ENV hardening)

Related docs: [env-checklist.md](./env-checklist.md), [PREVIEW_ENV_PARITY.md](./PREVIEW_ENV_PARITY.md), [API_KEYS.md](./API_KEYS.md)

---

## 1. Quick verification (local / CI)

```bash
# Local .env.local — required keys for dev
node scripts/check-env.mjs

# Stricter check (Production parity — explicit INVITE_JWT_SECRET, no fallbacks)
node scripts/check-env.mjs --production
```

In-app (requires login): **Settings → Setup audit**, or `GET /api/setup/diagnostics`.

---

## 2. Production env var audit (Vercel)

List names only (no values):

```bash
vercel env ls production
vercel env ls preview
```

### Required on Production

| Variable | Status (2026-07-01) | Notes |
|----------|:-------------------:|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Present | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Present | Client auth + RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Present | Server admin, invite DB lookup |
| `NEXT_PUBLIC_APP_URL` | ✅ Present | Must be `https://www.deliverx.dev` |
| `OPENAI_API_KEY` | ✅ Present | Primary AI (replaces legacy `open_api_key`) |
| `INVITE_JWT_SECRET` | ✅ Present | **Explicit secret required in Production** — signs 7-day invite JWTs |
| `CRON_SECRET` | ✅ Present | Secures `/api/twin/snapshot`, `/api/cron/loops`, `/api/cron/notifications` |

### Recommended / optional on Production

| Variable | Status (2026-07-01) | Notes |
|----------|:-------------------:|-------|
| `RESEND_API_KEY` + `EMAIL_FROM` | ✅ `RESEND_API_KEY` present | Invite + report emails |
| `OPENAI_MODEL` | ○ Not set | Defaults to `gpt-4o-mini` |
| `MINIMAX_MODEL` | ✅ Present | Legacy fallback only |
| `RECALL_*` | ○ Not set | Meeting bot — add when testing Recall |
| `NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS` | ○ Not set | Analytics on production deploys by default |

### INVITE_JWT_SECRET — explicit vs fallback

Code accepts fallbacks for **local dev only** (`CRON_SECRET`, then `SUPABASE_SERVICE_ROLE_KEY`). **Production must set `INVITE_JWT_SECRET` explicitly** so invite signing is isolated from cron auth and service-role rotation.

Generate a new value (example — use your own):

```bash
openssl rand -base64 32
```

Vercel → **deliverx** → **Settings → Environment Variables** → add `INVITE_JWT_SECRET` → **Production** → redeploy.

`node scripts/check-env.mjs --production` fails if only a fallback secret is available.

---

## 3. Preview env parity

Preview deployments need core Supabase + app URL vars. See [PREVIEW_ENV_PARITY.md](./PREVIEW_ENV_PARITY.md) for the full sync table.

**Gap (2026-07-01):** Preview is missing Supabase trio and `NEXT_PUBLIC_APP_URL` on most branches. Only `OPENAI_API_KEY`, `RESEND_API_KEY`, and branch-scoped `INVITE_JWT_SECRET` (on `cursor/phase-1`) are set.

### Manual sync (Vercel dashboard)

For each variable below, enable **Preview** on the existing Production row (or add a Preview row with the same value):

1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `SUPABASE_SERVICE_ROLE_KEY`
4. `NEXT_PUBLIC_APP_URL` — use stable preview domain or PR URL (not `www.deliverx.dev`)
5. `INVITE_JWT_SECRET` — same value as Production (all Preview branches)
6. `OPENAI_API_KEY` — already synced ✅
7. `RESEND_API_KEY` — already synced ✅

Optional: `CRON_SECRET` (only if testing cron routes on preview), `OPENAI_MODEL`, `RECALL_*`.

After saving: **Redeploy** the preview branch.

---

## 4. Supabase auth URLs (`www.deliverx.dev`)

Configure in [Supabase → Authentication → URL Configuration](https://supabase.com/dashboard/project/jibmyxaldetyycmtlxet/auth/url-configuration):

| Setting | Value |
|---------|-------|
| **Site URL** | `https://www.deliverx.dev` |
| **Redirect URLs** (allowlist) | `https://www.deliverx.dev/auth/callback` |
| | `https://www.deliverx.dev/**` (wildcard for in-app routes if supported) |
| | `http://localhost:3000/auth/callback` (local dev) |
| | `http://localhost:3000/**` (local dev) |

For Vercel preview deploys, add each preview origin you use:

- `https://<branch>-<team>.vercel.app/auth/callback`
- Or a stable preview domain if configured

Also verify [Email provider](https://supabase.com/dashboard/project/jibmyxaldetyycmtlxet/auth/providers) is enabled for password/OAuth flows you use.

---

## 5. Supabase migrations 0060–0063

Verify on project `jibmyxaldetyycmtlxet`:

| Migration | Name (remote) | Purpose | Verified |
|-----------|---------------|---------|:--------:|
| 0060 | `brain_storage` | `brain-documents` storage bucket | ✅ |
| 0061 | `0061_requirements_workspace_rls` | Requirements RLS + `clarification_gaps` | ✅ |
| 0062 | `0062_task_meeting_source` | `tasks.source` / `source_id` columns | ✅ |
| 0063 | `0063_tasks_realtime` | `tasks` in `supabase_realtime` publication | ✅ |

### Re-verify via Supabase MCP or SQL

```sql
-- 0060
SELECT id FROM storage.buckets WHERE id = 'brain-documents';

-- 0061
SELECT to_regclass('public.clarification_gaps') IS NOT NULL;

-- 0062
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'source'
);

-- 0063
SELECT EXISTS (
  SELECT 1 FROM pg_publication_tables
  WHERE pubname = 'supabase_realtime' AND tablename = 'tasks'
);
```

List applied migrations:

```bash
# Via Supabase dashboard → Database → Migrations
# Or Supabase MCP: list_migrations(project_id: jibmyxaldetyycmtlxet)
```

If any migration is missing, apply from repo:

```bash
supabase link --project-ref jibmyxaldetyycmtlxet
supabase db push
```

---

## 6. Post-change verification

1. **Redeploy** Production (and Preview if vars changed).
2. Open `https://www.deliverx.dev` → sign in.
3. **Settings → Setup audit** — all required keys green.
4. Generate a project invite link (PM) → open `/join?token=…` in incognito.
5. Optional: `npm test -- e2e/slice-a-production-smoke.test.ts` locally with env set.

---

## 7. Manual dashboard steps (agent cannot set secrets)

| Step | Where | Action |
|------|-------|--------|
| Preview Supabase sync | Vercel → deliverx → Env Vars | Enable Preview on `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY` |
| Preview app URL | Vercel | Add `NEXT_PUBLIC_APP_URL` for Preview (per preview domain strategy) |
| Preview invite secret | Vercel | Add `INVITE_JWT_SECRET` for **all Preview** branches (not one branch only) |
| Auth redirect allowlist | Supabase → Auth → URL Configuration | Confirm Site URL + callback URLs for prod and preview |
| Rotate invite secret | Vercel Production | New `INVITE_JWT_SECRET` → redeploy (invalidates outstanding invite JWTs) |
| **Google Search Console — submit sitemap** | [search.google.com/search-console](https://search.google.com/search-console) | See §7a below (agent cannot log into founder GSC) |

### 7a. Google Search Console — sitemap submit

Live sitemap (verified 200): `https://www.deliverx.dev/sitemap.xml`  
Robots: `https://www.deliverx.dev/robots.txt` (points at the sitemap; auth/app paths stay disallowed)

1. Open [Google Search Console](https://search.google.com/search-console) with the property owner account.
2. Select (or add) the property for **`https://www.deliverx.dev`** — prefer the **URL-prefix** property on `www` (canonical host). If only the apex domain exists, add `www` as well so Google sees the same host users hit.
3. Left nav → **Sitemaps**.
4. Under **Add a new sitemap**, enter: `sitemap.xml` (or the full URL `https://www.deliverx.dev/sitemap.xml`).
5. Click **Submit**. Status should move to **Success** after Google fetches it (may take minutes–hours).
6. Optional: **URL Inspection** → paste `https://www.deliverx.dev/` → **Request indexing** for the homepage once; do not mass-request auth URLs.
7. Re-check **Sitemaps** later for discovered URL count (~11 marketing URLs expected; auth stays out via robots/`noindex`).

---

## 8. Verification results snapshot (2026-07-01)

| Check | Result |
|-------|--------|
| Prod `INVITE_JWT_SECRET` | ✅ Name present on Production |
| Prod Supabase trio + `NEXT_PUBLIC_APP_URL` | ✅ All present |
| Prod `OPENAI_API_KEY` | ✅ Present (Preview + Production) |
| Preview Supabase + app URL | ❌ Missing on general Preview |
| Migration 0060 `brain-documents` | ✅ Applied |
| Migration 0061 `clarification_gaps` | ✅ Applied |
| Migration 0062 `tasks.source` | ✅ Applied |
| Migration 0063 realtime on `tasks` | ✅ Applied |
