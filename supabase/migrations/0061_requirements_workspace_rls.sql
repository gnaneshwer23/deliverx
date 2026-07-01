-- H2 — requirements workspace RLS + clarification_gaps from BC extraction

alter table public.requirements
  add column if not exists business_case_review_id uuid references public.business_case_reviews(id) on delete set null,
  add column if not exists structured_item_id text;

create index if not exists requirements_bc_review_idx
  on public.requirements(project_id, business_case_review_id);

do $$ begin
  create type public.clarification_gap_type as enum (
    'gap', 'missing_info', 'clarification'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.clarification_gap_status as enum ('open', 'resolved', 'deferred');
exception when duplicate_object then null; end $$;

create table if not exists public.clarification_gaps (
  id                      uuid primary key default gen_random_uuid(),
  organisation_id         uuid not null references public.organisations(id) on delete cascade,
  project_id              uuid not null references public.projects(id) on delete cascade,
  requirement_id          uuid references public.requirements(id) on delete set null,
  business_case_review_id uuid references public.business_case_reviews(id) on delete set null,
  structured_item_id      text,
  title                   text not null,
  description             text not null default '',
  gap_type                public.clarification_gap_type not null default 'gap',
  status                  public.clarification_gap_status not null default 'open',
  priority                text not null default 'medium',
  source                  text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists clarification_gaps_project_idx
  on public.clarification_gaps(project_id, status);

-- Project-scoped access: workspace members + org PM/executive
create or replace function public.is_workspace_project_member(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.project_id = p_project_id
      and wm.user_id = auth.uid()
      and wm.organisation_id = public.current_org_id()
  )
  or exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.organisation_id = public.current_org_id()
      and u.role in ('pm', 'executive')
  );
$$;

revoke all on function public.is_workspace_project_member(uuid) from public;
grant execute on function public.is_workspace_project_member(uuid) to authenticated, service_role;

alter table public.clarification_gaps enable row level security;

drop policy if exists "requirements_org" on public.requirements;
drop policy if exists "requirements_project_member" on public.requirements;
create policy "requirements_project_member" on public.requirements
  for all using (
    organisation_id = public.current_org_id()
    and public.is_workspace_project_member(project_id)
  )
  with check (
    organisation_id = public.current_org_id()
    and public.is_workspace_project_member(project_id)
  );

drop policy if exists "clarifications_org" on public.requirement_clarifications;
drop policy if exists "clarifications_project_member" on public.requirement_clarifications;
create policy "clarifications_project_member" on public.requirement_clarifications
  for all using (
    organisation_id = public.current_org_id()
    and public.is_workspace_project_member(project_id)
  )
  with check (
    organisation_id = public.current_org_id()
    and public.is_workspace_project_member(project_id)
  );

drop policy if exists "clarification_gaps_project_member" on public.clarification_gaps;
create policy "clarification_gaps_project_member" on public.clarification_gaps
  for all using (
    organisation_id = public.current_org_id()
    and public.is_workspace_project_member(project_id)
  )
  with check (
    organisation_id = public.current_org_id()
    and public.is_workspace_project_member(project_id)
  );

drop trigger if exists clarification_gaps_set_updated_at on public.clarification_gaps;
create trigger clarification_gaps_set_updated_at before update on public.clarification_gaps
  for each row execute function public.set_updated_at();
