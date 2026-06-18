-- Sprint H3 — collaborative loop snapshot history + agent orchestration impact source

alter type public.delivery_impact_source add value if not exists 'agent';

create table if not exists public.collaborative_loop_snapshots (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id      uuid references public.projects(id) on delete cascade,
  persona         public.delivery_impact_role not null,
  snapshot        jsonb not null,
  trigger_source  text not null default 'manual',
  created_at      timestamptz not null default now()
);

create index if not exists collaborative_loop_snapshots_project_idx
  on public.collaborative_loop_snapshots(project_id, persona, created_at desc);

create index if not exists collaborative_loop_snapshots_org_idx
  on public.collaborative_loop_snapshots(organisation_id, created_at desc);

alter table public.collaborative_loop_snapshots enable row level security;

drop policy if exists "collaborative_loop_snapshots_org" on public.collaborative_loop_snapshots;
create policy "collaborative_loop_snapshots_org" on public.collaborative_loop_snapshots
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());
