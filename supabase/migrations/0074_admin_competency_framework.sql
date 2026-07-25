-- Admin Competency Framework (versioned catalogue)
-- Source of truth for roles, competencies, rubrics, assessment content.
-- Published versions are immutable; assessments pin framework_version_id.
-- Aligns with PI rules: capability is never assigned by Experience/Launchpad.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.pi_cf_publication_status as enum (
    'draft',
    'internal_review',
    'calibration',
    'published',
    'deprecated',
    'archived'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pi_cf_assessment_kind as enum (
    'question',
    'scenario',
    'work_sample',
    'transfer_task'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pi_cf_capability_level as enum (
    'emerging',
    'developing',
    'proficient',
    'advanced'
  );
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Framework identity + versioned unit of publication
-- ---------------------------------------------------------------------------

create table if not exists public.pi_cf_frameworks (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  description     text not null default '',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.pi_cf_framework_versions (
  id                  uuid primary key default gen_random_uuid(),
  framework_id        uuid not null references public.pi_cf_frameworks(id) on delete cascade,
  version             text not null,
  title               text not null,
  status              public.pi_cf_publication_status not null default 'draft',
  changelog           text not null default '',
  content_hash        text,
  -- Optional bridge to existing capability-engine rubric seed (0068)
  rubric_version_id   uuid references public.pi_rubric_versions(id) on delete set null,
  published_at        timestamptz,
  published_by        uuid references public.users(id) on delete set null,
  deprecated_at       timestamptz,
  archived_at         timestamptz,
  superseded_by       uuid references public.pi_cf_framework_versions(id) on delete set null,
  created_by          uuid references public.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (framework_id, version)
);

create index if not exists pi_cf_framework_versions_status_idx
  on public.pi_cf_framework_versions(framework_id, status);

-- ---------------------------------------------------------------------------
-- Role catalogue (version-scoped — no hard-coded CAREER_ROLE_CATALOGUE)
-- ---------------------------------------------------------------------------

create table if not exists public.pi_cf_role_families (
  id                      uuid primary key default gen_random_uuid(),
  framework_version_id    uuid not null references public.pi_cf_framework_versions(id) on delete cascade,
  slug                    text not null,
  title                   text not null,
  description             text not null default '',
  sort_order              int not null default 0,
  unique (framework_version_id, slug)
);

create table if not exists public.pi_cf_seniority_levels (
  id                      uuid primary key default gen_random_uuid(),
  framework_version_id    uuid not null references public.pi_cf_framework_versions(id) on delete cascade,
  slug                    text not null,
  title                   text not null,
  rank                    int not null default 0,
  unique (framework_version_id, slug)
);

create table if not exists public.pi_cf_roles (
  id                      uuid primary key default gen_random_uuid(),
  framework_version_id    uuid not null references public.pi_cf_framework_versions(id) on delete cascade,
  role_family_id          uuid not null references public.pi_cf_role_families(id) on delete cascade,
  seniority_level_id      uuid not null references public.pi_cf_seniority_levels(id) on delete restrict,
  slug                    text not null,
  title                   text not null,
  industry_fit            text[] not null default '{}',
  description             text not null default '',
  unique (framework_version_id, slug)
);

create index if not exists pi_cf_roles_family_idx
  on public.pi_cf_roles(role_family_id);

-- ---------------------------------------------------------------------------
-- Competencies, indicators, rubric anchors
-- ---------------------------------------------------------------------------

create table if not exists public.pi_cf_competencies (
  id                      uuid primary key default gen_random_uuid(),
  framework_version_id    uuid not null references public.pi_cf_framework_versions(id) on delete cascade,
  code                    text not null, -- e.g. comp.stakeholder_management
  title                   text not null,
  description             text not null default '',
  sort_order              int not null default 0,
  unique (framework_version_id, code)
);

create table if not exists public.pi_cf_indicators (
  id                      uuid primary key default gen_random_uuid(),
  framework_version_id    uuid not null references public.pi_cf_framework_versions(id) on delete cascade,
  competency_id           uuid not null references public.pi_cf_competencies(id) on delete cascade,
  code                    text not null, -- e.g. ind.stakeholder_judgement
  key                     text not null, -- engine lookup key e.g. stakeholder_judgement
  title                   text not null,
  description             text not null default '',
  sort_order              int not null default 0,
  unique (framework_version_id, code),
  unique (framework_version_id, key)
);

create table if not exists public.pi_cf_rubric_anchors (
  id                      uuid primary key default gen_random_uuid(),
  framework_version_id    uuid not null references public.pi_cf_framework_versions(id) on delete cascade,
  indicator_id            uuid not null references public.pi_cf_indicators(id) on delete cascade,
  level                   public.pi_cf_capability_level not null,
  anchor_text             text not null,
  unique (indicator_id, level)
);

-- ---------------------------------------------------------------------------
-- Assessment content (questions, scenarios, work samples, transfer tasks)
-- ---------------------------------------------------------------------------

create table if not exists public.pi_cf_assessment_content (
  id                      uuid primary key default gen_random_uuid(),
  framework_version_id    uuid not null references public.pi_cf_framework_versions(id) on delete cascade,
  kind                    public.pi_cf_assessment_kind not null,
  slug                    text not null,
  title                   text not null,
  body                    text not null default '',
  payload                 jsonb not null default '{}'::jsonb,
  competency_ids          uuid[] not null default '{}',
  indicator_ids           uuid[] not null default '{}',
  sort_order              int not null default 0,
  unique (framework_version_id, kind, slug)
);

-- ---------------------------------------------------------------------------
-- Evidence rules, portfolio expectations, readiness requirements
-- ---------------------------------------------------------------------------

create table if not exists public.pi_cf_evidence_rules (
  id                      uuid primary key default gen_random_uuid(),
  framework_version_id    uuid not null references public.pi_cf_framework_versions(id) on delete cascade,
  slug                    text not null,
  title                   text not null,
  -- Matches pi_evidence_source_type codes / ledger categories
  source_type_hints       text[] not null default '{}',
  competency_id           uuid references public.pi_cf_competencies(id) on delete set null,
  indicator_id            uuid references public.pi_cf_indicators(id) on delete set null,
  rule                    jsonb not null default '{}'::jsonb,
  weight                  numeric(6,3) not null default 1,
  unique (framework_version_id, slug)
);

create table if not exists public.pi_cf_portfolio_expectations (
  id                      uuid primary key default gen_random_uuid(),
  framework_version_id    uuid not null references public.pi_cf_framework_versions(id) on delete cascade,
  role_id                 uuid references public.pi_cf_roles(id) on delete cascade,
  slug                    text not null,
  title                   text not null,
  expectation             text not null,
  required                boolean not null default true,
  unique (framework_version_id, slug)
);

create table if not exists public.pi_cf_readiness_requirements (
  id                      uuid primary key default gen_random_uuid(),
  framework_version_id    uuid not null references public.pi_cf_framework_versions(id) on delete cascade,
  role_id                 uuid not null references public.pi_cf_roles(id) on delete cascade,
  competency_id           uuid not null references public.pi_cf_competencies(id) on delete cascade,
  min_level               public.pi_cf_capability_level not null,
  weight                  numeric(6,3) not null default 1,
  unique (role_id, competency_id)
);

-- ---------------------------------------------------------------------------
-- Audit history (append-only)
-- ---------------------------------------------------------------------------

create table if not exists public.pi_cf_audit_events (
  id                      uuid primary key default gen_random_uuid(),
  framework_version_id    uuid references public.pi_cf_framework_versions(id) on delete set null,
  actor_id                uuid references public.users(id) on delete set null,
  action                  text not null,
  entity_type             text not null,
  entity_id               uuid,
  before_state            jsonb,
  after_state             jsonb,
  metadata                jsonb not null default '{}'::jsonb,
  created_at              timestamptz not null default now()
);

create index if not exists pi_cf_audit_events_version_idx
  on public.pi_cf_audit_events(framework_version_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Assessment runs pin framework version (never rewrite historical judgements)
-- ---------------------------------------------------------------------------

alter table public.pi_capability_score_runs
  add column if not exists framework_version_id uuid
    references public.pi_cf_framework_versions(id) on delete set null;

create index if not exists pi_capability_score_runs_framework_version_idx
  on public.pi_capability_score_runs(framework_version_id);

-- ---------------------------------------------------------------------------
-- Immutability: forbid content mutation when version is published+
-- ---------------------------------------------------------------------------

create or replace function public.pi_cf_version_is_immutable(p_version_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.pi_cf_framework_versions v
    where v.id = p_version_id
      and v.status in ('published', 'deprecated', 'archived')
  );
$$;

create or replace function public.pi_cf_forbid_immutable_content_mutation()
returns trigger
language plpgsql
as $$
declare
  version_id uuid;
begin
  version_id := coalesce(
    case when tg_op = 'DELETE' then old.framework_version_id else new.framework_version_id end,
    null
  );
  if version_id is not null and public.pi_cf_version_is_immutable(version_id) then
    raise exception
      'immutable framework version content: cannot % on % when status is published/deprecated/archived',
      lower(tg_op), tg_table_name;
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function public.pi_cf_forbid_immutable_version_fields()
returns trigger
language plpgsql
as $$
begin
  -- Status transitions are allowed via controlled API; content identity fields are not.
  if old.status in ('published', 'deprecated', 'archived') then
    if new.version is distinct from old.version
       or new.framework_id is distinct from old.framework_id
       or new.content_hash is distinct from old.content_hash
       or new.title is distinct from old.title
       or new.changelog is distinct from old.changelog
       or new.rubric_version_id is distinct from old.rubric_version_id then
      raise exception
        'immutable framework version: content fields locked after publish (create a new version instead)';
    end if;
    -- Allowed status moves: published → deprecated → archived only (enforced in app + check below)
    if old.status = 'published' and new.status not in ('published', 'deprecated') then
      raise exception 'invalid status transition from published to %', new.status;
    end if;
    if old.status = 'deprecated' and new.status not in ('deprecated', 'archived') then
      raise exception 'invalid status transition from deprecated to %', new.status;
    end if;
    if old.status = 'archived' and new.status is distinct from 'archived' then
      raise exception 'archived framework versions cannot change status';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_pi_cf_framework_versions_immutable on public.pi_cf_framework_versions;
create trigger trg_pi_cf_framework_versions_immutable
  before update on public.pi_cf_framework_versions
  for each row execute function public.pi_cf_forbid_immutable_version_fields();

do $$ 
declare
  t text;
begin
  foreach t in array array[
    'pi_cf_role_families',
    'pi_cf_seniority_levels',
    'pi_cf_roles',
    'pi_cf_competencies',
    'pi_cf_indicators',
    'pi_cf_rubric_anchors',
    'pi_cf_assessment_content',
    'pi_cf_evidence_rules',
    'pi_cf_portfolio_expectations',
    'pi_cf_readiness_requirements'
  ]
  loop
    execute format('drop trigger if exists trg_%s_immutable on public.%I', t, t);
    execute format(
      'create trigger trg_%s_immutable before insert or update or delete on public.%I
       for each row execute function public.pi_cf_forbid_immutable_content_mutation()',
      t, t
    );
  end loop;
end $$;

create or replace function public.pi_cf_forbid_audit_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'immutable audit event: %', tg_table_name;
end;
$$;

drop trigger if exists trg_pi_cf_audit_events_immutable on public.pi_cf_audit_events;
create trigger trg_pi_cf_audit_events_immutable
  before update or delete on public.pi_cf_audit_events
  for each row execute function public.pi_cf_forbid_audit_mutation();

-- ---------------------------------------------------------------------------
-- Seed: bootstrap pm-core framework from existing DEFAULT_RUBRIC / catalogue
-- ---------------------------------------------------------------------------

insert into public.pi_cf_frameworks (slug, title, description)
values (
  'pm-core',
  'Product Manager core framework',
  'Admin-managed competency framework replacing hard-coded CAREER_ROLE_CATALOGUE and in-code DEFAULT_RUBRIC.'
)
on conflict (slug) do nothing;

insert into public.pi_cf_framework_versions (framework_id, version, title, status, changelog, published_at)
select
  f.id,
  '2026.1',
  'Product Manager core framework',
  'published',
  'Bootstrapped from pi_rubric_versions pm-core@2026.1 and CAREER_ROLE_CATALOGUE seed.',
  now()
from public.pi_cf_frameworks f
where f.slug = 'pm-core'
on conflict (framework_id, version) do nothing;

-- Link to existing rubric version when present
update public.pi_cf_framework_versions fv
set rubric_version_id = rv.id
from public.pi_cf_frameworks f,
     public.pi_rubric_versions rv
where fv.framework_id = f.id
  and f.slug = 'pm-core'
  and fv.version = '2026.1'
  and rv.slug = 'pm-core'
  and rv.version = '2026.1'
  and fv.rubric_version_id is null;

-- ---------------------------------------------------------------------------
-- RLS: authenticated read published/deprecated; writes via service role / admin policies later
-- ---------------------------------------------------------------------------

alter table public.pi_cf_frameworks enable row level security;
alter table public.pi_cf_framework_versions enable row level security;
alter table public.pi_cf_role_families enable row level security;
alter table public.pi_cf_seniority_levels enable row level security;
alter table public.pi_cf_roles enable row level security;
alter table public.pi_cf_competencies enable row level security;
alter table public.pi_cf_indicators enable row level security;
alter table public.pi_cf_rubric_anchors enable row level security;
alter table public.pi_cf_assessment_content enable row level security;
alter table public.pi_cf_evidence_rules enable row level security;
alter table public.pi_cf_portfolio_expectations enable row level security;
alter table public.pi_cf_readiness_requirements enable row level security;
alter table public.pi_cf_audit_events enable row level security;

-- Public catalogue read for published / deprecated versions (runtime consumers)
drop policy if exists "pi_cf_frameworks_read" on public.pi_cf_frameworks;
create policy "pi_cf_frameworks_read" on public.pi_cf_frameworks
  for select to authenticated using (true);

drop policy if exists "pi_cf_framework_versions_read" on public.pi_cf_framework_versions;
create policy "pi_cf_framework_versions_read" on public.pi_cf_framework_versions
  for select to authenticated
  using (status in ('published', 'deprecated'));

-- Child content readable only when parent version is published/deprecated
create or replace function public.pi_cf_version_is_readable(p_version_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.pi_cf_framework_versions v
    where v.id = p_version_id
      and v.status in ('published', 'deprecated')
  );
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'pi_cf_role_families',
    'pi_cf_seniority_levels',
    'pi_cf_roles',
    'pi_cf_competencies',
    'pi_cf_indicators',
    'pi_cf_rubric_anchors',
    'pi_cf_assessment_content',
    'pi_cf_evidence_rules',
    'pi_cf_portfolio_expectations',
    'pi_cf_readiness_requirements'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', t || '_read', t);
    execute format(
      'create policy %I on public.%I for select to authenticated
       using (public.pi_cf_version_is_readable(framework_version_id))',
      t || '_read', t
    );
  end loop;
end $$;

-- Audit: no client read/write by default (admin API uses service role)
drop policy if exists "pi_cf_audit_events_deny" on public.pi_cf_audit_events;
-- Intentionally no authenticated policies → service role only for audit
;
