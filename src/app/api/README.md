# DeliverX API routes

Most workspace pages load data via **Server Components** calling `@/services/*` directly. The routes below are **REST mirrors** for the same logic — useful for external integrations, cron, or future client-side fetch.

## Called from the UI (client fetch)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/ai/assistant` | POST | AI workspace chat |
| `/api/ai/insights` | POST | Dashboard AI panel |
| `/api/ai/review-business-case` | POST | Project new — business case review |
| `/api/ai/structure-project` | POST | Project new — AI structure |
| `/api/ai/raid/suggest` | POST | RAID suggestions |
| `/api/ai/reports/generate` | POST | Report generation |
| `/api/ai/meetings/summarize` | POST | Meeting summary |
| `/api/ai/meetings/transcribe` | POST | Audio → transcript |
| `/api/ai/alignment/score` | POST | Alignment preview |
| `/api/ai/recommendations/enrich` | POST | Recommendation enrich |
| `/api/ai/recommendation/review` | POST | Recommendation review |
| `/api/adaptive/recommendation/review` | POST | Adaptive review |
| `/api/copilot/simulate` | POST | Strategic copilot |
| `/api/twin/simulate` | POST | Twin scenario |
| `/api/twin/snapshot` | GET/POST | Twin snapshot (cron + panel) |
| `/api/playbook/apply` | POST | Apply playbook to existing project |
| `/api/ai/status` | GET | AI configured? (also shown in Settings) |

## Server-only mirrors (no UI fetch today)

Pages use services instead; these routes remain for API consumers:

- `/api/project/[id]/health`, `/confidence`, `/recommendations`
- `/api/programme/[id]/dependencies`, `/analysis`
- `/api/portfolio/health`
- `/api/forecast/project/[id]`, `/scenarios`
- `/api/memory/search`
- `/api/adaptive/stability`, `/drift`, `/recommendations`
- `/api/coordination/loop`, `/graph`, `/snapshot`, `/agents`
- `/api/global/loop`, `/benchmarks`, `/patterns`, `/graph`
- `/api/marketplace/assets`, `/share`
- `/api/twin/state`, `/optimize`
- `/api/playbooks` (list)

All authenticated routes expect a valid Supabase session cookie unless documented otherwise (e.g. cron uses `CRON_SECRET`).
