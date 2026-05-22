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
