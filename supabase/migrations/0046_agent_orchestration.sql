-- Sprint D2 — Agent orchestration (Stage 16 lite)

do $$ begin
  create type agent_workflow_status as enum ('running', 'completed', 'failed');
exception when duplicate_object then null; end $$;

create table if not exists public.agent_workflow_runs (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references public.organisations(id) on delete cascade,
  project_id        uuid not null references public.projects(id) on delete cascade,
  status            agent_workflow_status not null default 'running',
  trigger_source    text not null default 'manual',
  intent            text,
  routed_agents     text[] not null default '{}',
  synthesis         text,
  human_review_required boolean not null default true,
  started_at        timestamptz not null default now(),
  completed_at      timestamptz
);

create index if not exists agent_workflow_runs_org_idx
  on public.agent_workflow_runs(organisation_id, started_at desc);

create table if not exists public.agent_activity_events (
  id                    uuid primary key default gen_random_uuid(),
  organisation_id       uuid not null references public.organisations(id) on delete cascade,
  project_id            uuid not null references public.projects(id) on delete cascade,
  workflow_run_id       uuid references public.agent_workflow_runs(id) on delete cascade,
  agent_role            text not null,
  event_type            text not null,
  message               text not null,
  detail                jsonb not null default '{}'::jsonb,
  rag_source_count      integer not null default 0,
  handoff_to            text,
  human_review_required boolean not null default true,
  created_at            timestamptz not null default now()
);

create index if not exists agent_activity_events_org_idx
  on public.agent_activity_events(organisation_id, created_at desc);

create index if not exists agent_activity_events_project_idx
  on public.agent_activity_events(project_id, created_at desc);

alter table public.agent_workflow_runs enable row level security;
alter table public.agent_activity_events enable row level security;

drop policy if exists "agent_workflow_runs_org" on public.agent_workflow_runs;
create policy "agent_workflow_runs_org" on public.agent_workflow_runs
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "agent_activity_events_org" on public.agent_activity_events;
create policy "agent_activity_events_org" on public.agent_activity_events
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());
