-- PR2 — V1 delivery data layer: workstreams + tasks

-- ===========================================================================
-- Enums
-- ===========================================================================
do $$ begin
  create type task_status as enum ('todo', 'in_progress', 'blocked', 'done');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_priority as enum ('low', 'medium', 'high', 'critical');
exception when duplicate_object then null; end $$;

do $$ begin
  create type workstream_status as enum ('planned', 'active', 'completed');
exception when duplicate_object then null; end $$;

-- ===========================================================================
-- workstreams
-- ===========================================================================
create table if not exists public.workstreams (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  name            text not null,
  description     text,
  status          workstream_status not null default 'planned',
  owner_id        uuid references public.users(id) on delete set null,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists workstreams_org_idx on public.workstreams(organisation_id);
create index if not exists workstreams_project_idx on public.workstreams(project_id);

-- ===========================================================================
-- tasks
-- ===========================================================================
create table if not exists public.tasks (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  workstream_id   uuid references public.workstreams(id) on delete set null,
  title           text not null,
  description     text,
  status          task_status not null default 'todo',
  priority        task_priority not null default 'medium',
  assignee_id     uuid references public.users(id) on delete set null,
  due_date        date,
  blocked_reason  text,
  completed_at    timestamptz,
  created_by      uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists tasks_org_idx on public.tasks(organisation_id);
create index if not exists tasks_project_idx on public.tasks(project_id);
create index if not exists tasks_workstream_idx on public.tasks(workstream_id);
create index if not exists tasks_status_idx on public.tasks(project_id, status);
create index if not exists tasks_due_date_idx on public.tasks(project_id, due_date)
  where status not in ('done');

-- Auto-set completed_at when a task moves to done
create or replace function public.set_task_completed_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'done' and (old.status is distinct from 'done') then
    new.completed_at = coalesce(new.completed_at, now());
  elsif new.status is distinct from 'done' then
    new.completed_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists tasks_set_completed_at on public.tasks;
create trigger tasks_set_completed_at
  before insert or update of status on public.tasks
  for each row execute function public.set_task_completed_at();

drop trigger if exists workstreams_set_updated_at on public.workstreams;
create trigger workstreams_set_updated_at before update on public.workstreams
  for each row execute function public.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.workstreams enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "workstreams_org_select" on public.workstreams;
create policy "workstreams_org_select" on public.workstreams
  for select using (organisation_id = public.current_org_id());

drop policy if exists "workstreams_org_insert" on public.workstreams;
create policy "workstreams_org_insert" on public.workstreams
  for insert with check (
    organisation_id = public.current_org_id()
    and exists (
      select 1 from public.projects p
      where p.id = project_id
        and p.organisation_id = public.current_org_id()
    )
  );

drop policy if exists "workstreams_org_update" on public.workstreams;
create policy "workstreams_org_update" on public.workstreams
  for update using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "workstreams_org_delete" on public.workstreams;
create policy "workstreams_org_delete" on public.workstreams
  for delete using (organisation_id = public.current_org_id());

drop policy if exists "tasks_org_select" on public.tasks;
create policy "tasks_org_select" on public.tasks
  for select using (organisation_id = public.current_org_id());

drop policy if exists "tasks_org_insert" on public.tasks;
create policy "tasks_org_insert" on public.tasks
  for insert with check (
    organisation_id = public.current_org_id()
    and exists (
      select 1 from public.projects p
      where p.id = project_id
        and p.organisation_id = public.current_org_id()
    )
  );

drop policy if exists "tasks_org_update" on public.tasks;
create policy "tasks_org_update" on public.tasks
  for update using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "tasks_org_delete" on public.tasks;
create policy "tasks_org_delete" on public.tasks
  for delete using (organisation_id = public.current_org_id());
