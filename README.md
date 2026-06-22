# DeliverX

A project management workspace for product teams — built with Next.js 16 (App Router), TypeScript, Tailwind v4, shadcn/ui, and Supabase.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

Create a project at [supabase.com](https://supabase.com), then copy `.env.example` to `.env.local` and fill in the values from **Project Settings → API**:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # server-only
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The landing page shows a live Supabase status badge so you can confirm the credentials are wired up correctly.

## Project structure

```
src/
  app/               # App Router pages
  components/        # UI components
    ui/              # shadcn/ui primitives
  lib/
    supabase/
      client.ts      # browser Supabase client
      server.ts      # server (RSC / route handler) Supabase client
      middleware.ts  # session-refresh middleware helper
    utils.ts         # cn() helper from shadcn
middleware.ts        # Next.js middleware — refreshes auth on every request
```

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Backend:** Supabase (Postgres, Auth, Storage)
- **Auth:** `@supabase/ssr` cookie-based sessions

## Scripts

| Script          | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the dev server         |
| `npm run build` | Production build             |
| `npm run start` | Start the production server  |
| `npm run lint`  | Lint with ESLint             |

## Launch verification

Run this smoke path after `npm run dev` (or on your deployed URL) to confirm the core loop:

1. **Auth** — Sign up or log in with email and password → complete onboarding
2. **Project** — Create a project (optionally with AI structure)
3. **Charter** — Save charter at `/project/[id]/charter` → confirm alignment ring on overview
4. **Tasks** — Add at least one task
5. **Meeting** — Paste notes or upload audio → AI summary → approve decisions/RAID
6. **Traceability** — Open `/project/[id]/traceability` and confirm graph links
7. **Standup** — Submit at `/project/[id]/standups` → check health on project overview
8. **AI status** — `GET /api/ai/status` returns `{ "configured": true }` when `OPENAI_API_KEY` (or legacy `open_api_key`) is set

Required env vars for the full path: Supabase keys, `OPENAI_API_KEY`. Optional: `RESEND_API_KEY` for report emails, `RECALL_*` for meeting bot. See [docs/API_KEYS.md](docs/API_KEYS.md).

## Deployment

**Production:** https://www.deliverx.dev (Vercel, branch `main`)

1. Link the repo in [Vercel](https://vercel.com/) and set environment variables per [docs/API_KEYS.md](docs/API_KEYS.md).
2. For **Preview** deployments, copy Production vars using the checklist in [docs/PREVIEW_ENV_PARITY.md](docs/PREVIEW_ENV_PARITY.md) — Preview currently has only `open_api_key`; Supabase and `NEXT_PUBLIC_APP_URL` are required for auth and data.
3. After env changes, redeploy. Confirm **Settings → Setup audit** shows no missing required keys.
4. Sprint history and prod SHA: [docs/BUILD_REPORT.md](docs/BUILD_REPORT.md).
