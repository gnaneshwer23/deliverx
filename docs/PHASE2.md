# Phase 2 — Intelligence automation

Branch: `cursor/phase-2`

## 2A — Scheduled loops (Vercel cron)

| Schedule (UTC) | Path | Action |
|----------------|------|--------|
| `0 6 * * *` | `/api/twin/snapshot` | Twin snapshots for all orgs (`CRON_SECRET`) |
| `0 7 * * *` | `/api/cron/loops` | Coordination runs + global network contributions |

Requires `CRON_SECRET` and `SUPABASE_SERVICE_ROLE_KEY` on Vercel Production.

Individual cron entry points (same secret):

- `GET /api/coordination/loop` with Bearer token
- `GET /api/global/loop` with Bearer token

## 2B — Run loop now (UI)

| Page | Button | API |
|------|--------|-----|
| Coordination | Run coordination loop | `POST /api/coordination/loop` (persists `coordination_runs`) |
| Global Intelligence | Run global loop | `POST /api/global/loop` |
| Digital Twin | Capture snapshot | `POST /api/twin/snapshot` (existing panel) |

## 2C — Realtime refresh

Migration `0021_phase2_realtime.sql` adds `coordination_runs` and `twin_snapshots` to `supabase_realtime`.

Client hook `useRealtimeTableRefresh` refreshes the page when new rows are inserted (coordination + twin pages).

Enable Realtime in Supabase Dashboard if inserts do not trigger refresh locally.

## Deploy checklist

1. Apply migration `0021_phase2_realtime.sql` on Supabase
2. Merge PR → Vercel deploy
3. Confirm `CRON_SECRET` on Production
4. Smoke test: Run loop buttons on Coordination / Global / Twin
5. Optional: wait for 07:00 UTC cron or call `/api/cron/loops` with Bearer `CRON_SECRET`

## Related

- `vercel.json` — cron definitions
- `docs/API_KEYS.md` — `CRON_SECRET`
