-- PI Review & Challenge workflow
-- Append-only events; cases hold projected status. Never mutates capability levels.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.pi_review_subject_kind as enum (
    'imported_claim',
    'evidence_classification',
    'competency_mapping',
    'assessment_finding',
    'capability_level',
    'confidence',
    'strength',
    'development_gap',
    'role_readiness',
    'portfolio_claim'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.pi_review_status as enum (
    'pending_review',
    'accepted',
    'user_context_added',
    'challenged',
    'under_review',
    'additional_evidence_required',
    'reassessed',
    'upheld',
    'revised',
    'escalated_to_human_review'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.pi_review_action as enum (
    'accept',
    'correct_factual',
    'add_context',
    'add_evidence',
    'challenge_judgement',
    'request_reassessment',
    'hide_evidence',
    'change_visibility',
    'report_inappropriate',
    'start_review',
    'request_evidence',
    'uphold',
    'revise',
    'escalate',
    'mark_reassessed',
    'reopen'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.pi_review_actor_role as enum (
    'subject_user',
    'admin_reviewer',
    'system'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Cases (projected status; history lives in events)
-- ---------------------------------------------------------------------------
create table if not exists public.pi_review_cases (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  subject_kind        public.pi_review_subject_kind not null,
  subject_ref_type    text not null,
  subject_ref_id      text not null,
  subject_label       text not null default '',
  subject_snapshot    jsonb not null default '{}'::jsonb,
  current_status      public.pi_review_status not null default 'pending_review',
  priority            text not null default 'normal'
    check (priority in ('low', 'normal', 'high', 'urgent')),
  assigned_reviewer_id uuid references public.users(id) on delete set null,
  sla_due_at          timestamptz,
  closed_at           timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists pi_review_cases_user_idx
  on public.pi_review_cases(user_id, current_status, created_at desc);

create index if not exists pi_review_cases_queue_idx
  on public.pi_review_cases(current_status, priority, created_at)
  where closed_at is null;

create index if not exists pi_review_cases_subject_idx
  on public.pi_review_cases(subject_kind, subject_ref_type, subject_ref_id);

-- ---------------------------------------------------------------------------
-- Append-only events (never UPDATE/DELETE)
-- ---------------------------------------------------------------------------
create table if not exists public.pi_review_events (
  id                  uuid primary key default gen_random_uuid(),
  case_id             uuid not null references public.pi_review_cases(id) on delete cascade,
  user_id             uuid not null references public.users(id) on delete cascade,
  actor_user_id       uuid references public.users(id) on delete set null,
  actor_role          public.pi_review_actor_role not null,
  action              public.pi_review_action not null,
  from_status         public.pi_review_status not null,
  to_status           public.pi_review_status not null,
  rationale           text not null default '',
  factual_correction  jsonb not null default '{}'::jsonb,
  context_note        text not null default '',
  evidence_ids        uuid[] not null default '{}',
  visibility_change   jsonb not null default '{}'::jsonb,
  proposed_revision   jsonb not null default '{}'::jsonb,
  audit               jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now()
);

create index if not exists pi_review_events_case_idx
  on public.pi_review_events(case_id, created_at);

create index if not exists pi_review_events_user_idx
  on public.pi_review_events(user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- In-app notifications stub (+ optional email hook payload)
-- ---------------------------------------------------------------------------
create table if not exists public.pi_review_notifications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  case_id         uuid references public.pi_review_cases(id) on delete set null,
  kind            text not null,
  title           text not null,
  body            text not null default '',
  payload         jsonb not null default '{}'::jsonb,
  read_at         timestamptz,
  email_queued_at timestamptz,
  email_sent_at   timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists pi_review_notifications_user_idx
  on public.pi_review_notifications(user_id, created_at desc)
  where read_at is null;

-- ---------------------------------------------------------------------------
-- Append-only enforcement on events
-- ---------------------------------------------------------------------------
create or replace function public.pi_forbid_review_event_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'append-only: pi_review_events does not allow %', tg_op;
end;
$$;

drop trigger if exists trg_pi_review_events_immutable on public.pi_review_events;
create trigger trg_pi_review_events_immutable
  before update or delete on public.pi_review_events
  for each row execute function public.pi_forbid_review_event_mutation();

drop trigger if exists pi_review_cases_set_updated_at on public.pi_review_cases;
create trigger pi_review_cases_set_updated_at
  before update on public.pi_review_cases
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.pi_review_cases enable row level security;
alter table public.pi_review_events enable row level security;
alter table public.pi_review_notifications enable row level security;

drop policy if exists "pi_review_cases_own" on public.pi_review_cases;
create policy "pi_review_cases_own" on public.pi_review_cases
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "pi_review_events_own_select" on public.pi_review_events;
create policy "pi_review_events_own_select" on public.pi_review_events
  for select using (user_id = auth.uid());

drop policy if exists "pi_review_events_own_insert" on public.pi_review_events;
create policy "pi_review_events_own_insert" on public.pi_review_events
  for insert with check (user_id = auth.uid());

drop policy if exists "pi_review_notifications_own" on public.pi_review_notifications;
create policy "pi_review_notifications_own" on public.pi_review_notifications
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());
