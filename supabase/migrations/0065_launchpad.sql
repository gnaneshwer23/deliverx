-- Launchpad product tables (career readiness)
-- Isolated from Team Co-pilot org/workspace and Xperience simulation schema.
-- TODO(payment): entitlement / Stripe £250 checkout not enforced yet.

-- ===========================================================================
-- Profiles (onboarding + Career Twin state per auth user)
-- ===========================================================================
create table if not exists public.launchpad_profiles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade unique,
  first_name      text,
  last_name       text,
  email           text,
  target_role     text not null default 'Associate Product Manager',
  experience_level text,
  strongest_skill text,
  growth_area     text,
  career_goal     text,
  timeline        text,
  confidence      text default '3',
  background      text,
  readiness_score int not null default 0,
  onboarding_status text not null default 'started'
    check (onboarding_status in ('started', 'completed')),
  twin_data       jsonb not null default '{}'::jsonb,
  profile_data    jsonb not null default '{}'::jsonb,
  -- TODO(payment): set when Stripe entitlement is wired
  entitlement_status text not null default 'open'
    check (entitlement_status in ('open', 'pending_payment', 'active', 'expired')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists launchpad_profiles_user_id_idx
  on public.launchpad_profiles(user_id);

-- ===========================================================================
-- Module progress (assessment, twin, cv, interview, readiness)
-- ===========================================================================
create table if not exists public.launchpad_progress (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  profile_id      uuid references public.launchpad_profiles(id) on delete set null,
  module_key      text not null
    check (module_key in (
      'assessment',
      'career_twin',
      'cv_portfolio',
      'interview_prep',
      'readiness'
    )),
  status          text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  score           int,
  summary         text,
  state           jsonb not null default '{}'::jsonb,
  completed_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, module_key)
);

create index if not exists launchpad_progress_user_id_idx
  on public.launchpad_progress(user_id);

-- ===========================================================================
-- Artefacts (CV drafts, STAR stories, portfolio notes, etc.)
-- ===========================================================================
create table if not exists public.launchpad_artefacts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  profile_id      uuid references public.launchpad_profiles(id) on delete set null,
  artefact_type   text not null
    check (artefact_type in (
      'cv_draft',
      'linkedin_notes',
      'portfolio_case',
      'star_story',
      'mock_interview',
      'branding_note'
    )),
  title           text not null,
  content         jsonb not null default '{}'::jsonb,
  status          text not null default 'draft'
    check (status in ('draft', 'ready', 'archived')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists launchpad_artefacts_user_id_idx
  on public.launchpad_artefacts(user_id);
create index if not exists launchpad_artefacts_type_idx
  on public.launchpad_artefacts(user_id, artefact_type);

-- ===========================================================================
-- RLS — owner-only (auth.uid())
-- ===========================================================================
alter table public.launchpad_profiles enable row level security;
alter table public.launchpad_progress enable row level security;
alter table public.launchpad_artefacts enable row level security;

drop policy if exists "launchpad_profiles_self" on public.launchpad_profiles;
create policy "launchpad_profiles_self" on public.launchpad_profiles
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "launchpad_progress_self" on public.launchpad_progress;
create policy "launchpad_progress_self" on public.launchpad_progress
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "launchpad_artefacts_self" on public.launchpad_artefacts;
create policy "launchpad_artefacts_self" on public.launchpad_artefacts
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop trigger if exists launchpad_profiles_set_updated_at on public.launchpad_profiles;
create trigger launchpad_profiles_set_updated_at
  before update on public.launchpad_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists launchpad_progress_set_updated_at on public.launchpad_progress;
create trigger launchpad_progress_set_updated_at
  before update on public.launchpad_progress
  for each row execute function public.set_updated_at();

drop trigger if exists launchpad_artefacts_set_updated_at on public.launchpad_artefacts;
create trigger launchpad_artefacts_set_updated_at
  before update on public.launchpad_artefacts
  for each row execute function public.set_updated_at();
