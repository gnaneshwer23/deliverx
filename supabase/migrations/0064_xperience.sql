-- Xperience product tables (candidate experience simulation)
-- Isolated from Team Co-pilot org/workspace schema.
-- TODO(payment): entitlement / Stripe £500 checkout not enforced yet.

-- ===========================================================================
-- Profiles (onboarding state per auth user)
-- ===========================================================================
create table if not exists public.xperience_profiles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade unique,
  first_name      text,
  last_name       text,
  email           text,
  target_role     text not null default 'Associate Product Manager',
  industry        text,
  company_type    text,
  background      text,
  work_style      text,
  learning_style  text,
  selected_skill  text,
  confidence      text default '3',
  start_timeline  text,
  career_score    int not null default 0,
  onboarding_status text not null default 'started'
    check (onboarding_status in ('started', 'completed')),
  profile_data    jsonb not null default '{}'::jsonb,
  -- TODO(payment): set when Stripe entitlement is wired
  entitlement_status text not null default 'open'
    check (entitlement_status in ('open', 'pending_payment', 'active', 'expired')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists xperience_profiles_user_id_idx
  on public.xperience_profiles(user_id);

-- ===========================================================================
-- Enrolments (company experience run)
-- ===========================================================================
create table if not exists public.xperience_enrolments (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  profile_id      uuid references public.xperience_profiles(id) on delete set null,
  company_name    text not null default 'MediFlow',
  day             int not null default 1,
  status          text not null default 'ACTIVE'
    check (status in ('ACTIVE', 'PAUSED', 'COMPLETED')),
  state           jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists xperience_enrolments_user_id_idx
  on public.xperience_enrolments(user_id);

-- ===========================================================================
-- Decisions + evidence
-- ===========================================================================
create table if not exists public.xperience_decisions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  enrolment_id    uuid references public.xperience_enrolments(id) on delete cascade,
  choice_id       text not null,
  choice_label    text not null,
  rationale       text,
  effects         jsonb not null default '{}'::jsonb,
  evidence_score  int,
  created_at      timestamptz not null default now()
);

create index if not exists xperience_decisions_user_id_idx
  on public.xperience_decisions(user_id);
create index if not exists xperience_decisions_enrolment_id_idx
  on public.xperience_decisions(enrolment_id);

create table if not exists public.xperience_evidence (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  enrolment_id    uuid references public.xperience_enrolments(id) on delete set null,
  title           text not null,
  evidence_type   text not null default 'decision',
  content         jsonb not null default '{}'::jsonb,
  score           int,
  status          text not null default 'observed'
    check (status in ('observed', 'supported', 'platform_verified')),
  created_at      timestamptz not null default now()
);

create index if not exists xperience_evidence_user_id_idx
  on public.xperience_evidence(user_id);

-- ===========================================================================
-- RLS — owner-only (auth.uid())
-- ===========================================================================
alter table public.xperience_profiles enable row level security;
alter table public.xperience_enrolments enable row level security;
alter table public.xperience_decisions enable row level security;
alter table public.xperience_evidence enable row level security;

drop policy if exists "xperience_profiles_self" on public.xperience_profiles;
create policy "xperience_profiles_self" on public.xperience_profiles
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "xperience_enrolments_self" on public.xperience_enrolments;
create policy "xperience_enrolments_self" on public.xperience_enrolments
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "xperience_decisions_self" on public.xperience_decisions;
create policy "xperience_decisions_self" on public.xperience_decisions
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "xperience_evidence_self" on public.xperience_evidence;
create policy "xperience_evidence_self" on public.xperience_evidence
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop trigger if exists xperience_profiles_set_updated_at on public.xperience_profiles;
create trigger xperience_profiles_set_updated_at
  before update on public.xperience_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists xperience_enrolments_set_updated_at on public.xperience_enrolments;
create trigger xperience_enrolments_set_updated_at
  before update on public.xperience_enrolments
  for each row execute function public.set_updated_at();
