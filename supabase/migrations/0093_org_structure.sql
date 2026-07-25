-- T7 — Organisation structure foundations (departments · teams · membership).
-- Bounded: no marketplace, no mission-control, no messages SKU, no capability SoT.
-- Org tables are shared within the organisation; membership rows are person data
-- and are included in the T1 privacy export/purge cascade.
-- Preserves TD-016 SECURITY DEFINER grant posture.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.departments (
  id                    uuid primary key default gen_random_uuid(),
  organisation_id       uuid not null references public.organisations(id) on delete cascade,
  name                  text not null,
  description           text not null default '',
  parent_department_id  uuid references public.departments(id) on delete set null,
  created_by            uuid references public.users(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint departments_name_nonempty check (char_length(trim(name)) > 0),
  constraint departments_org_name_unique unique (organisation_id, name)
);

create index if not exists departments_org_idx
  on public.departments(organisation_id);
create index if not exists departments_parent_idx
  on public.departments(parent_department_id);

create table if not exists public.teams (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  uuid not null references public.organisations(id) on delete cascade,
  department_id    uuid references public.departments(id) on delete set null,
  name             text not null,
  description      text not null default '',
  created_by       uuid references public.users(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint teams_name_nonempty check (char_length(trim(name)) > 0),
  constraint teams_org_name_unique unique (organisation_id, name)
);

create index if not exists teams_org_idx
  on public.teams(organisation_id);
create index if not exists teams_department_idx
  on public.teams(department_id);

create table if not exists public.department_members (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  uuid not null references public.organisations(id) on delete cascade,
  department_id    uuid not null references public.departments(id) on delete cascade,
  user_id          uuid not null references public.users(id) on delete cascade,
  member_role      text not null default 'member'
                   check (member_role in ('member', 'lead')),
  created_at       timestamptz not null default now(),
  constraint department_members_unique unique (department_id, user_id)
);

create index if not exists department_members_user_idx
  on public.department_members(user_id);
create index if not exists department_members_org_idx
  on public.department_members(organisation_id);

create table if not exists public.team_members (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  uuid not null references public.organisations(id) on delete cascade,
  team_id          uuid not null references public.teams(id) on delete cascade,
  user_id          uuid not null references public.users(id) on delete cascade,
  member_role      text not null default 'member'
                   check (member_role in ('member', 'lead')),
  created_at       timestamptz not null default now(),
  constraint team_members_unique unique (team_id, user_id)
);

create index if not exists team_members_user_idx
  on public.team_members(user_id);
create index if not exists team_members_org_idx
  on public.team_members(organisation_id);

drop trigger if exists departments_set_updated_at on public.departments;
create trigger departments_set_updated_at before update on public.departments
  for each row execute function public.set_updated_at();

drop trigger if exists teams_set_updated_at on public.teams;
create trigger teams_set_updated_at before update on public.teams
  for each row execute function public.set_updated_at();

-- Parent department must belong to the same organisation.
create or replace function public.departments_same_org_parent()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.parent_department_id is null then
    return new;
  end if;
  if not exists (
    select 1 from public.departments d
    where d.id = new.parent_department_id
      and d.organisation_id = new.organisation_id
  ) then
    raise exception 'parent_department_id must belong to the same organisation';
  end if;
  if new.parent_department_id = new.id then
    raise exception 'department cannot be its own parent';
  end if;
  return new;
end;
$$;

drop trigger if exists departments_same_org_parent_trg on public.departments;
create trigger departments_same_org_parent_trg
  before insert or update on public.departments
  for each row execute function public.departments_same_org_parent();

-- Team department must belong to the same organisation.
create or replace function public.teams_same_org_department()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.department_id is null then
    return new;
  end if;
  if not exists (
    select 1 from public.departments d
    where d.id = new.department_id
      and d.organisation_id = new.organisation_id
  ) then
    raise exception 'department_id must belong to the same organisation';
  end if;
  return new;
end;
$$;

drop trigger if exists teams_same_org_department_trg on public.teams;
create trigger teams_same_org_department_trg
  before insert or update on public.teams
  for each row execute function public.teams_same_org_department();

-- ---------------------------------------------------------------------------
-- RLS helpers (SECURITY DEFINER, TD-016 posture)
-- ---------------------------------------------------------------------------

create or replace function public.is_org_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.organisation_id = public.current_org_id()
      and u.role in ('pm', 'executive')
  );
$$;

revoke execute on function public.is_org_admin() from public, anon;
grant execute on function public.is_org_admin()
  to authenticated, service_role;

create or replace function public.is_department_member(p_department_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.department_members dm
    where dm.department_id = p_department_id
      and dm.user_id = auth.uid()
      and dm.organisation_id = public.current_org_id()
  )
  or public.is_org_admin();
$$;

revoke execute on function public.is_department_member(uuid) from public, anon;
grant execute on function public.is_department_member(uuid)
  to authenticated, service_role;

create or replace function public.is_team_member(p_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.team_members tm
    where tm.team_id = p_team_id
      and tm.user_id = auth.uid()
      and tm.organisation_id = public.current_org_id()
  )
  or public.is_org_admin();
$$;

revoke execute on function public.is_team_member(uuid) from public, anon;
grant execute on function public.is_team_member(uuid)
  to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- RLS policies
-- ---------------------------------------------------------------------------

alter table public.departments enable row level security;
alter table public.teams enable row level security;
alter table public.department_members enable row level security;
alter table public.team_members enable row level security;

drop policy if exists "departments_org_select" on public.departments;
create policy "departments_org_select" on public.departments
  for select using (organisation_id = public.current_org_id());

drop policy if exists "departments_admin_insert" on public.departments;
create policy "departments_admin_insert" on public.departments
  for insert with check (
    organisation_id = public.current_org_id()
    and public.is_org_admin()
  );

drop policy if exists "departments_admin_update" on public.departments;
create policy "departments_admin_update" on public.departments
  for update using (
    organisation_id = public.current_org_id()
    and public.is_org_admin()
  )
  with check (
    organisation_id = public.current_org_id()
    and public.is_org_admin()
  );

drop policy if exists "departments_admin_delete" on public.departments;
create policy "departments_admin_delete" on public.departments
  for delete using (
    organisation_id = public.current_org_id()
    and public.is_org_admin()
  );

drop policy if exists "teams_org_select" on public.teams;
create policy "teams_org_select" on public.teams
  for select using (organisation_id = public.current_org_id());

drop policy if exists "teams_admin_insert" on public.teams;
create policy "teams_admin_insert" on public.teams
  for insert with check (
    organisation_id = public.current_org_id()
    and public.is_org_admin()
  );

drop policy if exists "teams_admin_update" on public.teams;
create policy "teams_admin_update" on public.teams
  for update using (
    organisation_id = public.current_org_id()
    and public.is_org_admin()
  )
  with check (
    organisation_id = public.current_org_id()
    and public.is_org_admin()
  );

drop policy if exists "teams_admin_delete" on public.teams;
create policy "teams_admin_delete" on public.teams
  for delete using (
    organisation_id = public.current_org_id()
    and public.is_org_admin()
  );

drop policy if exists "department_members_org_select" on public.department_members;
create policy "department_members_org_select" on public.department_members
  for select using (organisation_id = public.current_org_id());

drop policy if exists "department_members_admin_write" on public.department_members;
create policy "department_members_admin_write" on public.department_members
  for all using (
    organisation_id = public.current_org_id()
    and public.is_org_admin()
  )
  with check (
    organisation_id = public.current_org_id()
    and public.is_org_admin()
  );

drop policy if exists "team_members_org_select" on public.team_members;
create policy "team_members_org_select" on public.team_members
  for select using (organisation_id = public.current_org_id());

drop policy if exists "team_members_admin_write" on public.team_members;
create policy "team_members_admin_write" on public.team_members
  for all using (
    organisation_id = public.current_org_id()
    and public.is_org_admin()
  )
  with check (
    organisation_id = public.current_org_id()
    and public.is_org_admin()
  );

-- ---------------------------------------------------------------------------
-- Privacy purge — remove person membership rows; keep org structure
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regprocedure('public.pi_privacy_purge_person_data_t5(uuid,uuid)') is null then
    alter function public.pi_privacy_purge_person_data(uuid, uuid)
      rename to pi_privacy_purge_person_data_t5;
  end if;
end
$$;

revoke all on function public.pi_privacy_purge_person_data_t5(uuid, uuid)
  from public, anon, authenticated, service_role;

create or replace function public.pi_privacy_purge_person_data(
  p_user_id uuid,
  p_request_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
  dept_count bigint := 0;
  team_count bigint := 0;
  touched jsonb;
begin
  if p_user_id is null then
    raise exception 'p_user_id required';
  end if;

  delete from public.department_members where user_id = p_user_id;
  get diagnostics dept_count = row_count;

  delete from public.team_members where user_id = p_user_id;
  get diagnostics team_count = row_count;

  result := public.pi_privacy_purge_person_data_t5(p_user_id, p_request_id);
  touched := jsonb_build_array(
      'department_members:' || dept_count,
      'team_members:' || team_count
    )
    || coalesce(result -> 'tables_touched', '[]'::jsonb);
  result := jsonb_set(result, '{tables_touched}', touched, true);

  if p_request_id is not null then
    update public.pi_privacy_requests
      set tables_touched = array(
        select jsonb_array_elements_text(touched)
      ),
      updated_at = now()
      where id = p_request_id;
  end if;

  return result;
end;
$$;

revoke all on function public.pi_privacy_purge_person_data(uuid, uuid) from public;
revoke all on function public.pi_privacy_purge_person_data(uuid, uuid)
  from anon, authenticated;
grant execute on function public.pi_privacy_purge_person_data(uuid, uuid)
  to service_role;

comment on table public.departments is
  'T7 org structure — departments within an organisation. Shared org data; not person-owned.';
comment on table public.teams is
  'T7 org structure — teams optionally under a department. Shared org data; not person-owned.';
comment on table public.department_members is
  'T7 person membership of a department. Included in privacy export/purge; does not assign capability.';
comment on table public.team_members is
  'T7 person membership of a team. Included in privacy export/purge; does not assign capability.';
