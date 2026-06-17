-- Phase 3 — proposed actions queue (meeting → calendar/tasks/RAID with approval)

do $$ begin
  create type proposal_action_type as enum (
    'create_task', 'create_raid', 'create_decision', 'calendar_event'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type proposal_source as enum ('meeting', 'assistant');
exception when duplicate_object then null; end $$;

do $$ begin
  create type proposal_status as enum ('pending', 'approved', 'rejected', 'applied');
exception when duplicate_object then null; end $$;

create table if not exists public.proposed_actions (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references public.organisations(id) on delete cascade,
  project_id        uuid not null references public.projects(id) on delete cascade,
  source            proposal_source not null,
  source_id         uuid,
  action_type       proposal_action_type not null,
  title             text not null,
  summary           text not null default '',
  payload           jsonb not null default '{}'::jsonb,
  status            proposal_status not null default 'pending',
  reviewer_notes    text,
  apply_result      jsonb,
  decided_by        uuid references public.users(id) on delete set null,
  decided_at        timestamptz,
  applied_at        timestamptz,
  created_by        uuid references public.users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists proposed_actions_project_idx
  on public.proposed_actions(project_id, created_at desc);

create index if not exists proposed_actions_status_idx
  on public.proposed_actions(status, created_at desc);

alter table public.proposed_actions enable row level security;

drop policy if exists "proposed_actions_org" on public.proposed_actions;
create policy "proposed_actions_org" on public.proposed_actions
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop trigger if exists proposed_actions_set_updated_at on public.proposed_actions;
create trigger proposed_actions_set_updated_at before update on public.proposed_actions
  for each row execute function public.set_updated_at();
