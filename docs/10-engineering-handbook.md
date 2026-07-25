# 10 — Engineering Handbook

**Status:** Active  
**Audience:** Engineers, agents  
**Canonical detail:** [`engineering/codebase-map.md`](./engineering/codebase-map.md) · [`engineering/testing-strategy.md`](./engineering/testing-strategy.md) · [`engineering/api-contracts.md`](./engineering/api-contracts.md)

---

## Repo structure

| Path | Role |
| --- | --- |
| `src/app/` | Next.js App Router pages + `api/**` Route Handlers |
| `src/lib/` | Domain modules (PI SoT + legacy delivery) |
| `src/components/` | UI (incl. design-system pieces) |
| `src/config/` | Nav, persona, flags |
| `supabase/migrations/` | Schema — PI pivot `0066`–`0094` |
| `docs/` | Product Bible `00`–`15` + product/engineering/qa/architecture |
| `e2e/` | Vitest E2E / gates · Playwright smoke under scripts |
| `.cursor/rules/deliverx.mdc` | Always-on constitution |

**Stack:** Next.js (App Router) · TypeScript · React · Supabase (Postgres + Auth + RLS) · Vitest · Vercel deploy.

---

## Conventions

### TypeScript / React

- Prefer typed domain functions in `src/lib/<module>` over fat route handlers  
- Colocate `*.test.ts` with modules  
- Follow existing patterns; this Next version may differ from older training data — check `node_modules/next/dist/docs/` when unsure  

### API Route Handlers

- Person PI: require session → **401** if missing  
- Return structured JSON errors; use shared helpers where present (`src/lib/api`, `db-errors`)  
- Document new PI routes in `docs/engineering/api-contracts.md`  

### Migrations

- Additive, reviewed migrations in `supabase/migrations/`  
- Prefer RLS + triggers for invariants (immutability, cite version ids)  
- SECURITY DEFINER: fixed `search_path`; revoke anon EXECUTE (see `0092`)  
- Never claim applied until verified against project  

### Errors / flags / logging

- User-facing: calm, actionable  
- Feature gates: env-based (`DELIVERX_*`) — full flag platform deferred (TD-008)  
- AI: log cost/latency on orchestration paths  
- Domain events: `pi_domain_events`  

### Security

- Least privilege; evidence private by default  
- Consent default OFF for observation  
- See [`engineering/security-model.md`](./engineering/security-model.md)  

### Performance

- Modular monolith; avoid premature service splits  
- Prefer server components / route handlers for PI aggregates  

### Testing

| Command | Purpose |
| --- | --- |
| `npm run test` | Vitest unit/integration |
| `npm run test:pi` | PI invariant suite |
| `npm run test:release-gate` | Composite T6 gate |
| `npm run test:release-gate:live` | Live signed-in (+ secrets) |
| `npm run lint` | ESLint |
| `npm run build` | Production build |

### Documentation

- Update Product Bible chapter + engineering detail when behaviour changes  
- Record architectural decisions in `docs/product/product-decisions.md`  
- Ship notes in `docs/engineering/implementation-log.md` when shipping phases  

---

## Definition of Done

1. Typecheck clean on touched scope (note TD-017 fixture debt if unrelated)  
2. Lint clean on touched files  
3. Unit/integration tests for changed invariants  
4. Migration + RLS/access reviewed if schema touched  
5. Docs updated (bible and/or engineering detail)  
6. Product decision recorded if architectural  
7. No claim of “works” without verification  

## PR checklist

- [ ] Charter conflict check (Build Charter + refuse list)  
- [ ] Smallest coherent vertical slice  
- [ ] Tests for trust rails if touched  
- [ ] API/data-model docs if contracts changed  
- [ ] Honesty: no AI-as-verified; no unexplained scores  
- [ ] Release gate locally if PI trust rails touched  

---

## Before / during / after (product-team behaviour)

See constitution (`.cursor/rules/deliverx.mdc`) — act as PM + UX + Staff Eng + QA + Security + Tech Writer; refuse charter conflicts; implement only the next slice.
