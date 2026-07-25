-- Professional Workspace contribution trail (append-oriented)
-- Tracks user authored / AI suggested / accepted / edited / submitted / outcome

create table if not exists public.workspace_contributions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.users(id) on delete cascade,
  module_id               text not null,
  kind                    text not null check (kind in (
    'user_authored',
    'ai_suggested',
    'user_accepted',
    'user_edited',
    'user_submitted',
    'outcome_followed'
  )),
  project_kind            text not null check (project_kind in ('org', 'experience')),
  project_id              text not null,
  project_name            text,
  title                   text not null,
  summary                 text,
  payload                 jsonb not null default '{}'::jsonb,
  parent_contribution_id  uuid references public.workspace_contributions(id) on delete set null,
  artefact_type           text,
  artefact_id             text,
  user_contribution       jsonb not null default '{}'::jsonb,
  ai_contribution         jsonb not null default '{}'::jsonb,
  created_at              timestamptz not null default now()
);

create index if not exists workspace_contributions_user_idx
  on public.workspace_contributions(user_id, created_at desc);

create index if not exists workspace_contributions_project_idx
  on public.workspace_contributions(project_kind, project_id, created_at desc);

create index if not exists workspace_contributions_module_idx
  on public.workspace_contributions(module_id, created_at desc);

alter table public.workspace_contributions enable row level security;

drop policy if exists "workspace_contributions_own" on public.workspace_contributions;
create policy "workspace_contributions_own" on public.workspace_contributions
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());
