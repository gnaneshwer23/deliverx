-- Deliverx Phase 8 — Operational Digital Twin snapshots
-- Apply after 0001 / 0002 / 0003 / 0004.
-- Paste into Supabase Dashboard → SQL Editor → New query → Run.

-- ===========================================================================
-- twin_snapshots
--
-- Append-only history of the org's digital twin state. The live UI computes
-- state on every read, but periodic snapshots (cron / event trigger) feed
-- trend charts, replay, and audit. JSONB keeps the schema flexible while
-- the twin model evolves.
-- ===========================================================================
create table if not exists public.twin_snapshots (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  captured_at     timestamptz not null default now(),
  state           jsonb not null,
  captured_by     uuid references public.users(id) on delete set null
);

create index if not exists twin_snapshots_org_time_idx
  on public.twin_snapshots(organisation_id, captured_at desc);

-- ===========================================================================
-- RLS — org-scoped
-- ===========================================================================
alter table public.twin_snapshots enable row level security;

drop policy if exists "twin_snapshots_org_select" on public.twin_snapshots;
create policy "twin_snapshots_org_select" on public.twin_snapshots
  for select using (organisation_id = public.current_org_id());

drop policy if exists "twin_snapshots_org_insert" on public.twin_snapshots;
create policy "twin_snapshots_org_insert" on public.twin_snapshots
  for insert with check (organisation_id = public.current_org_id());
