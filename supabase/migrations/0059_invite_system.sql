-- Phase 1 — project-scoped invite tokens + workspace membership

do $$ begin
  create type public.invite_view_mode as enum ('full', 'read_only');
exception when duplicate_object then null; end $$;

create table if not exists public.invite_tokens (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  role            public.user_role not null,
  invited_by      uuid references public.users(id) on delete set null,
  token_hash      text not null unique,
  view_mode       public.invite_view_mode not null default 'full',
  expires_at      timestamptz not null,
  created_at      timestamptz not null default now(),
  revoked_at      timestamptz
);

create index if not exists invite_tokens_org_idx
  on public.invite_tokens(organisation_id, created_at desc);

create index if not exists invite_tokens_project_idx
  on public.invite_tokens(project_id, role, created_at desc);

create index if not exists invite_tokens_hash_idx
  on public.invite_tokens(token_hash);

create table if not exists public.workspace_members (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  user_id         uuid not null references public.users(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  role            public.user_role not null,
  view_mode       public.invite_view_mode not null default 'full',
  invited_by      uuid references public.users(id) on delete set null,
  joined_at       timestamptz not null default now(),
  unique (user_id, project_id)
);

create index if not exists workspace_members_org_idx
  on public.workspace_members(organisation_id);

create index if not exists workspace_members_project_idx
  on public.workspace_members(project_id, role);

create index if not exists workspace_members_user_idx
  on public.workspace_members(user_id);

alter table public.invite_tokens enable row level security;
alter table public.workspace_members enable row level security;

drop policy if exists "invite_tokens_org_select" on public.invite_tokens;
create policy "invite_tokens_org_select" on public.invite_tokens
  for select using (organisation_id = public.current_org_id());

drop policy if exists "invite_tokens_pm_insert" on public.invite_tokens;
create policy "invite_tokens_pm_insert" on public.invite_tokens
  for insert with check (
    organisation_id = public.current_org_id()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.organisation_id = invite_tokens.organisation_id
        and u.role in ('pm', 'executive')
    )
  );

drop policy if exists "invite_tokens_pm_update" on public.invite_tokens;
create policy "invite_tokens_pm_update" on public.invite_tokens
  for update using (
    organisation_id = public.current_org_id()
    and exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.organisation_id = invite_tokens.organisation_id
        and u.role in ('pm', 'executive')
    )
  )
  with check (organisation_id = public.current_org_id());

drop policy if exists "workspace_members_org_select" on public.workspace_members;
create policy "workspace_members_org_select" on public.workspace_members
  for select using (organisation_id = public.current_org_id());

drop policy if exists "workspace_members_self_select" on public.workspace_members;
create policy "workspace_members_self_select" on public.workspace_members
  for select using (user_id = auth.uid());
