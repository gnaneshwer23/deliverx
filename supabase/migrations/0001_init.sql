-- Deliverx Phase 1 schema
-- Paste this into Supabase Dashboard → SQL Editor → New query, then Run.
-- Idempotent where reasonable; safe to re-run during early dev.

-- ===========================================================================
-- 1. Enums
-- ===========================================================================
do $$ begin
  create type user_role as enum ('pm', 'team_member', 'executive');
exception when duplicate_object then null; end $$;

do $$ begin
  create type invitation_status as enum ('pending', 'accepted', 'expired', 'revoked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_status as enum ('draft', 'active', 'paused', 'completed', 'archived');
exception when duplicate_object then null; end $$;

-- ===========================================================================
-- 2. organisations
-- ===========================================================================
create table if not exists public.organisations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  industry      text,
  team_size     text,
  delivery_type text,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ===========================================================================
-- 3. users (profile rows linked 1:1 with auth.users)
-- ===========================================================================
create table if not exists public.users (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  name            text,
  role            user_role,
  organisation_id uuid references public.organisations(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists users_organisation_id_idx on public.users(organisation_id);

-- Auto-create a public.users row when an auth user signs up.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ===========================================================================
-- 4. invitations
-- ===========================================================================
create table if not exists public.invitations (
  id              uuid primary key default gen_random_uuid(),
  email           text not null,
  role            user_role not null default 'team_member',
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  status          invitation_status not null default 'pending',
  token           text not null unique default encode(gen_random_bytes(24), 'hex'),
  invited_by      uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  expires_at      timestamptz not null default (now() + interval '14 days')
);

create index if not exists invitations_org_idx   on public.invitations(organisation_id);
create index if not exists invitations_email_idx on public.invitations(email);

-- ===========================================================================
-- 5. projects (draft entry — Phase 2 will enrich)
-- ===========================================================================
create table if not exists public.projects (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  created_by      uuid references public.users(id) on delete set null,
  name            text not null,
  goal            text,
  delivery_type   text,
  timeline        text,
  business_case_url text,
  status          project_status not null default 'draft',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists projects_org_idx on public.projects(organisation_id);

-- ===========================================================================
-- 6. updated_at triggers
-- ===========================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists organisations_set_updated_at on public.organisations;
create trigger organisations_set_updated_at before update on public.organisations
  for each row execute function public.set_updated_at();

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- 7. Row Level Security
-- ===========================================================================
alter table public.organisations enable row level security;
alter table public.users         enable row level security;
alter table public.invitations   enable row level security;
alter table public.projects      enable row level security;

-- Helper: current user's organisation_id
create or replace function public.current_org_id()
returns uuid
language sql stable
security definer
set search_path = public
as $$
  select organisation_id from public.users where id = auth.uid()
$$;

-- users: a user can read & update their own row
drop policy if exists "users_self_select" on public.users;
create policy "users_self_select" on public.users
  for select using (id = auth.uid());

drop policy if exists "users_self_update" on public.users;
create policy "users_self_update" on public.users
  for update using (id = auth.uid()) with check (id = auth.uid());

-- users: org members can see each other
drop policy if exists "users_org_select" on public.users;
create policy "users_org_select" on public.users
  for select using (
    organisation_id is not null
    and organisation_id = public.current_org_id()
  );

-- organisations: members can read; creator can insert; creator can update
drop policy if exists "organisations_member_select" on public.organisations;
create policy "organisations_member_select" on public.organisations
  for select using (id = public.current_org_id());

drop policy if exists "organisations_insert_self" on public.organisations;
create policy "organisations_insert_self" on public.organisations
  for insert with check (created_by = auth.uid());

drop policy if exists "organisations_creator_update" on public.organisations;
create policy "organisations_creator_update" on public.organisations
  for update using (created_by = auth.uid()) with check (created_by = auth.uid());

-- invitations: org members can read/create/revoke for their org
drop policy if exists "invitations_org_select" on public.invitations;
create policy "invitations_org_select" on public.invitations
  for select using (organisation_id = public.current_org_id());

drop policy if exists "invitations_org_insert" on public.invitations;
create policy "invitations_org_insert" on public.invitations
  for insert with check (organisation_id = public.current_org_id());

drop policy if exists "invitations_org_update" on public.invitations;
create policy "invitations_org_update" on public.invitations
  for update using (organisation_id = public.current_org_id())
  with check  (organisation_id = public.current_org_id());

-- projects: org members can read; any org member can insert; creator/PM can update
drop policy if exists "projects_org_select" on public.projects;
create policy "projects_org_select" on public.projects
  for select using (organisation_id = public.current_org_id());

drop policy if exists "projects_org_insert" on public.projects;
create policy "projects_org_insert" on public.projects
  for insert with check (
    organisation_id = public.current_org_id()
    and created_by  = auth.uid()
  );

drop policy if exists "projects_creator_update" on public.projects;
create policy "projects_creator_update" on public.projects
  for update using (
    organisation_id = public.current_org_id()
    and (created_by = auth.uid()
         or exists (select 1 from public.users u
                    where u.id = auth.uid() and u.role = 'pm'))
  );
