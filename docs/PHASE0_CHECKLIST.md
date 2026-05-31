# Phase 0 — Ship & stabilize

**Completed:** 2026-05-31  
**Production commit:** `44f2216` (merge of PR #11)

## Checklist

| Step | Status | Notes |
|------|--------|-------|
| Merge PR #11 → `main` | Done | https://github.com/gnaneshwer23/deliverx/pull/11 |
| Vercel production deploy | Auto | Triggers on `main` push; confirm in Vercel dashboard |
| Supabase migration `architecture_os` | Done | Remote migration `20260523100932` applied |
| OpenAI on server | Configured | Vercel `open_api_key` (alias supported in code) |
| `npm run build` on `main` | Pass | Run locally after pull |

## Manual smoke test (you)

While logged in at https://www.deliverx.dev:

1. **Settings → Setup audit** — OpenAI configured, no red required keys.
2. **AI Assistant** — send a message; expect a reply (not 503).
3. **New project → Guided questionnaire** — complete chat; reach project setup.
4. **Project → Benefits / Milestones** — add one row each (no migration banner).
5. **Capacity** — apply a rebalance suggestion if suggestions show.
6. **Sign out** — avatar menu or sidebar → returns to login.

## Optional cleanup (Vercel)

- Rename `open_api_key` → `OPENAI_API_KEY` (clarity only).
- Remove unused `MINIMAX_MODEL` if not using MiniMax.

## Next: Phase 1

See implementation plan — start with **PDF business case upload** (PR 1A).
