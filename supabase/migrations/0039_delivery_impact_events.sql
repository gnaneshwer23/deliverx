-- Sprint B4 — delivery impact events (approve → apply → dashboard update)

do $$ begin
  create type public.delivery_impact_role as enum (
    'founder',
    'product',
    'pm',
    'ba',
    'engineer',
    'qa',
    'scrum'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.delivery_impact_tone as enum (
    'ready',
    'waiting',
    'blocked',
    'updated',
    'pending'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.delivery_impact_source as enum (
    'proposal',
    'meeting',
    'artifact',
    'bootstrap'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.delivery_impact_events (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  source          public.delivery_impact_source not null default 'proposal',
  source_id       uuid,
  proposal_id     uuid references public.proposed_actions(id) on delete set null,
  action_type     text not null,
  entity_type     text,
  entity_id       uuid,
  target_role     public.delivery_impact_role not null,
  message         text not null,
  tone            public.delivery_impact_tone not null default 'updated',
  created_at      timestamptz not null default now()
);

create index if not exists delivery_impact_events_project_idx
  on public.delivery_impact_events(project_id, created_at desc);

create index if not exists delivery_impact_events_org_idx
  on public.delivery_impact_events(organisation_id, created_at desc);

create index if not exists delivery_impact_events_role_idx
  on public.delivery_impact_events(project_id, target_role, created_at desc);

alter table public.delivery_impact_events enable row level security;

drop policy if exists "delivery_impact_events_org" on public.delivery_impact_events;
create policy "delivery_impact_events_org" on public.delivery_impact_events
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());
