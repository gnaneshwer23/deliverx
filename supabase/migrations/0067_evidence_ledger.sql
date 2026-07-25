-- Evidence Ledger (person-level Professional Intelligence)
-- Append-only raw evidence; derived interpretations versioned separately.
-- Does not write competency scores. Additive; dual-write from Experience later.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.pi_evidence_source_type as enum (
    'baseline_assessment',
    'adaptive_interview',
    'work_sample',
    'experience_project',
    'meeting',
    'message',
    'decision',
    'artefact',
    'reflection',
    'learning_activity',
    'portfolio_import',
    'external_verification',
    'launchpad_interview',
    'application_outcome',
    'self_report',
    'system'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.pi_evidence_category as enum (
    'practice',
    'knowledge',
    'outcome',
    'attestation',
    'packaging',
    'communication',
    'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.pi_evidence_status as enum (
    'observed',
    'supported',
    'platform_verified',
    'disputed',
    'withdrawn'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.pi_actor_type as enum (
    'user',
    'ai',
    'system',
    'external_employer',
    'admin_attestor'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.pi_confidentiality as enum (
    'private',
    'restricted',
    'shareable',
    'public'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.pi_consent_scope as enum (
    'analysis_allowed',
    'share_restricted',
    'share_denied',
    'unknown'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.pi_processing_job_status as enum (
    'pending',
    'leased',
    'completed',
    'failed',
    'dead_letter'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.pi_challenge_status as enum (
    'open',
    'accepted',
    'rejected',
    'withdrawn'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Sources catalog (seed)
-- ---------------------------------------------------------------------------
create table if not exists public.pi_evidence_sources (
  code            public.pi_evidence_source_type primary key,
  label           text not null,
  default_category public.pi_evidence_category not null,
  description     text not null default ''
);

insert into public.pi_evidence_sources (code, label, default_category, description) values
  ('baseline_assessment', 'Baseline assessment', 'practice', 'Initial calibration assessment'),
  ('adaptive_interview', 'Adaptive interview', 'practice', 'Adaptive interview session'),
  ('work_sample', 'Work sample', 'practice', 'Submitted work sample'),
  ('experience_project', 'Experience project', 'practice', 'Simulated company project work'),
  ('meeting', 'Meeting', 'communication', 'Meeting contribution or outcome'),
  ('message', 'Message', 'communication', 'Message thread evidence'),
  ('decision', 'Decision', 'practice', 'Recorded professional decision'),
  ('artefact', 'Artefact', 'packaging', 'Career or delivery artefact'),
  ('reflection', 'Reflection', 'knowledge', 'User reflection'),
  ('learning_activity', 'Learning activity', 'knowledge', 'Learning completion (not competency proof)'),
  ('portfolio_import', 'Portfolio import', 'packaging', 'Imported portfolio item (draft until verified)'),
  ('external_verification', 'External verification', 'attestation', 'Employer or third-party attestation'),
  ('launchpad_interview', 'Launchpad interview', 'practice', 'Launchpad mock/real interview'),
  ('application_outcome', 'Application outcome', 'outcome', 'Application result signal'),
  ('self_report', 'Self report', 'other', 'User self-reported statement'),
  ('system', 'System', 'other', 'System-generated capture')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- Immutable evidence body
-- ---------------------------------------------------------------------------
create table if not exists public.pi_evidence_records (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  source_type         public.pi_evidence_source_type not null
    references public.pi_evidence_sources(code),
  source_record_type  text,
  source_record_id    text,
  category            public.pi_evidence_category not null,
  title               text not null,
  summary             text not null default '',
  raw_content         jsonb not null default '{}'::jsonb,
  storage_ref         text,
  content_hash        text not null,
  idempotency_key     text,
  confidentiality     public.pi_confidentiality not null default 'private',
  consent_status      public.pi_consent_scope not null default 'unknown',
  captured_at         timestamptz not null default now(),
  created_at          timestamptz not null default now()
  -- intentionally no updated_at
);

create unique index if not exists pi_evidence_records_user_hash_uidx
  on public.pi_evidence_records(user_id, content_hash);

create unique index if not exists pi_evidence_records_idempotency_uidx
  on public.pi_evidence_records(user_id, idempotency_key)
  where idempotency_key is not null;

create index if not exists pi_evidence_records_user_created_idx
  on public.pi_evidence_records(user_id, created_at desc);

create index if not exists pi_evidence_records_source_idx
  on public.pi_evidence_records(user_id, source_type);

-- ---------------------------------------------------------------------------
-- Provenance (1:1)
-- ---------------------------------------------------------------------------
create table if not exists public.pi_evidence_provenance (
  evidence_id         uuid primary key references public.pi_evidence_records(id) on delete cascade,
  actor_type          public.pi_actor_type not null,
  actor_user_id       uuid references public.users(id) on delete set null,
  user_contribution   jsonb not null default '{}'::jsonb,
  ai_contribution     jsonb not null default '{}'::jsonb,
  model_id            text,
  model_version       text,
  prompt_slug         text,
  prompt_version      text,
  prompt_hash         text,
  raw_ref             jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Status transitions (append-only)
-- ---------------------------------------------------------------------------
create table if not exists public.pi_evidence_status_transitions (
  id              uuid primary key default gen_random_uuid(),
  evidence_id     uuid not null references public.pi_evidence_records(id) on delete cascade,
  from_status     public.pi_evidence_status,
  to_status       public.pi_evidence_status not null,
  reason          text,
  actor_type      public.pi_actor_type not null default 'system',
  actor_user_id   uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists pi_evidence_status_transitions_evidence_idx
  on public.pi_evidence_status_transitions(evidence_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Versioned interpretations (classify / map / judge) — NOT competency scores
-- ---------------------------------------------------------------------------
create table if not exists public.pi_evidence_interpretations (
  id              uuid primary key default gen_random_uuid(),
  evidence_id     uuid not null references public.pi_evidence_records(id) on delete cascade,
  version         int not null,
  kind            text not null
    check (kind in ('classification', 'competency_map', 'judgement', 'summary')),
  payload         jsonb not null default '{}'::jsonb,
  model_id        text,
  model_version   text,
  prompt_slug     text,
  prompt_version  text,
  prompt_hash     text,
  created_at      timestamptz not null default now(),
  unique (evidence_id, kind, version)
);

create index if not exists pi_evidence_interpretations_evidence_idx
  on public.pi_evidence_interpretations(evidence_id, kind, version desc);

-- ---------------------------------------------------------------------------
-- Competency mappings (derived; strength only — no profile score write)
-- ---------------------------------------------------------------------------
create table if not exists public.pi_evidence_competency_links (
  id                  uuid primary key default gen_random_uuid(),
  evidence_id         uuid not null references public.pi_evidence_records(id) on delete cascade,
  interpretation_id   uuid references public.pi_evidence_interpretations(id) on delete set null,
  competency_code     text not null,
  strength            numeric(4,3) not null default 0
    check (strength >= 0 and strength <= 1),
  rationale           text,
  created_at          timestamptz not null default now()
);

create index if not exists pi_evidence_competency_links_evidence_idx
  on public.pi_evidence_competency_links(evidence_id);

create index if not exists pi_evidence_competency_links_code_idx
  on public.pi_evidence_competency_links(competency_code);

-- ---------------------------------------------------------------------------
-- Processing queue
-- ---------------------------------------------------------------------------
create table if not exists public.pi_evidence_processing_jobs (
  id              uuid primary key default gen_random_uuid(),
  evidence_id     uuid not null references public.pi_evidence_records(id) on delete cascade,
  status          public.pi_processing_job_status not null default 'pending',
  attempts        int not null default 0,
  max_attempts    int not null default 5,
  lease_owner     text,
  lease_expires_at timestamptz,
  last_error      text,
  next_attempt_at timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  completed_at    timestamptz
);

create index if not exists pi_evidence_processing_jobs_poll_idx
  on public.pi_evidence_processing_jobs(status, next_attempt_at)
  where status in ('pending', 'failed', 'leased');

create index if not exists pi_evidence_processing_jobs_evidence_idx
  on public.pi_evidence_processing_jobs(evidence_id);

drop trigger if exists pi_evidence_processing_jobs_set_updated_at on public.pi_evidence_processing_jobs;
create trigger pi_evidence_processing_jobs_set_updated_at
  before update on public.pi_evidence_processing_jobs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Challenges / corrections
-- ---------------------------------------------------------------------------
create table if not exists public.pi_evidence_challenges (
  id              uuid primary key default gen_random_uuid(),
  evidence_id     uuid not null references public.pi_evidence_records(id) on delete cascade,
  user_id         uuid not null references public.users(id) on delete cascade,
  status          public.pi_challenge_status not null default 'open',
  reason          text not null,
  proposed_correction jsonb not null default '{}'::jsonb,
  resolution_notes text,
  resolved_by     uuid references public.users(id) on delete set null,
  resolved_at     timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists pi_evidence_challenges_evidence_idx
  on public.pi_evidence_challenges(evidence_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Domain event outbox
-- ---------------------------------------------------------------------------
create table if not exists public.pi_domain_events (
  id              uuid primary key default gen_random_uuid(),
  event_type      text not null,
  aggregate_type  text not null,
  aggregate_id    uuid not null,
  user_id         uuid references public.users(id) on delete set null,
  payload         jsonb not null default '{}'::jsonb,
  schema_version  int not null default 1,
  created_at      timestamptz not null default now(),
  published_at    timestamptz
);

create index if not exists pi_domain_events_unpublished_idx
  on public.pi_domain_events(created_at)
  where published_at is null;

create index if not exists pi_domain_events_aggregate_idx
  on public.pi_domain_events(aggregate_type, aggregate_id);

-- ---------------------------------------------------------------------------
-- Compatibility: link Experience evidence rows to ledger
-- ---------------------------------------------------------------------------
alter table public.xperience_evidence
  add column if not exists ledger_evidence_id uuid
    references public.pi_evidence_records(id) on delete set null;

create index if not exists xperience_evidence_ledger_idx
  on public.xperience_evidence(ledger_evidence_id)
  where ledger_evidence_id is not null;

-- ---------------------------------------------------------------------------
-- Append-only enforcement
-- ---------------------------------------------------------------------------
create or replace function public.pi_forbid_evidence_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'append-only: % does not allow %', tg_table_name, tg_op;
end;
$$;

drop trigger if exists trg_pi_evidence_records_immutable on public.pi_evidence_records;
create trigger trg_pi_evidence_records_immutable
  before update or delete on public.pi_evidence_records
  for each row execute function public.pi_forbid_evidence_mutation();

drop trigger if exists trg_pi_evidence_provenance_immutable on public.pi_evidence_provenance;
create trigger trg_pi_evidence_provenance_immutable
  before update or delete on public.pi_evidence_provenance
  for each row execute function public.pi_forbid_evidence_mutation();

drop trigger if exists trg_pi_evidence_transitions_no_update on public.pi_evidence_status_transitions;
create trigger trg_pi_evidence_transitions_no_update
  before update or delete on public.pi_evidence_status_transitions
  for each row execute function public.pi_forbid_evidence_mutation();

drop trigger if exists trg_pi_evidence_interpretations_no_update on public.pi_evidence_interpretations;
create trigger trg_pi_evidence_interpretations_no_update
  before update or delete on public.pi_evidence_interpretations
  for each row execute function public.pi_forbid_evidence_mutation();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.pi_evidence_sources enable row level security;
alter table public.pi_evidence_records enable row level security;
alter table public.pi_evidence_provenance enable row level security;
alter table public.pi_evidence_status_transitions enable row level security;
alter table public.pi_evidence_interpretations enable row level security;
alter table public.pi_evidence_competency_links enable row level security;
alter table public.pi_evidence_processing_jobs enable row level security;
alter table public.pi_evidence_challenges enable row level security;
alter table public.pi_domain_events enable row level security;

drop policy if exists "pi_evidence_sources_read" on public.pi_evidence_sources;
create policy "pi_evidence_sources_read" on public.pi_evidence_sources
  for select to authenticated using (true);

drop policy if exists "pi_evidence_records_select_own" on public.pi_evidence_records;
create policy "pi_evidence_records_select_own" on public.pi_evidence_records
  for select using (user_id = auth.uid());

drop policy if exists "pi_evidence_records_insert_own" on public.pi_evidence_records;
create policy "pi_evidence_records_insert_own" on public.pi_evidence_records
  for insert with check (user_id = auth.uid());

drop policy if exists "pi_evidence_provenance_select_own" on public.pi_evidence_provenance;
create policy "pi_evidence_provenance_select_own" on public.pi_evidence_provenance
  for select using (
    exists (
      select 1 from public.pi_evidence_records r
      where r.id = evidence_id and r.user_id = auth.uid()
    )
  );

drop policy if exists "pi_evidence_provenance_insert_own" on public.pi_evidence_provenance;
create policy "pi_evidence_provenance_insert_own" on public.pi_evidence_provenance
  for insert with check (
    exists (
      select 1 from public.pi_evidence_records r
      where r.id = evidence_id and r.user_id = auth.uid()
    )
  );

drop policy if exists "pi_evidence_transitions_select_own" on public.pi_evidence_status_transitions;
create policy "pi_evidence_transitions_select_own" on public.pi_evidence_status_transitions
  for select using (
    exists (
      select 1 from public.pi_evidence_records r
      where r.id = evidence_id and r.user_id = auth.uid()
    )
  );

drop policy if exists "pi_evidence_transitions_insert_own" on public.pi_evidence_status_transitions;
create policy "pi_evidence_transitions_insert_own" on public.pi_evidence_status_transitions
  for insert with check (
    exists (
      select 1 from public.pi_evidence_records r
      where r.id = evidence_id and r.user_id = auth.uid()
    )
  );

drop policy if exists "pi_evidence_interpretations_select_own" on public.pi_evidence_interpretations;
create policy "pi_evidence_interpretations_select_own" on public.pi_evidence_interpretations
  for select using (
    exists (
      select 1 from public.pi_evidence_records r
      where r.id = evidence_id and r.user_id = auth.uid()
    )
  );

drop policy if exists "pi_evidence_competency_links_select_own" on public.pi_evidence_competency_links;
create policy "pi_evidence_competency_links_select_own" on public.pi_evidence_competency_links
  for select using (
    exists (
      select 1 from public.pi_evidence_records r
      where r.id = evidence_id and r.user_id = auth.uid()
    )
  );

drop policy if exists "pi_evidence_jobs_select_own" on public.pi_evidence_processing_jobs;
create policy "pi_evidence_jobs_select_own" on public.pi_evidence_processing_jobs
  for select using (
    exists (
      select 1 from public.pi_evidence_records r
      where r.id = evidence_id and r.user_id = auth.uid()
    )
  );

drop policy if exists "pi_evidence_challenges_own" on public.pi_evidence_challenges;
create policy "pi_evidence_challenges_own" on public.pi_evidence_challenges
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "pi_domain_events_select_own" on public.pi_domain_events;
create policy "pi_domain_events_select_own" on public.pi_domain_events
  for select using (user_id = auth.uid());

-- Inserts into jobs/interpretations/events typically via service role or security definer.
-- Allow authenticated insert of jobs for own evidence (append path).
drop policy if exists "pi_evidence_jobs_insert_own" on public.pi_evidence_processing_jobs;
create policy "pi_evidence_jobs_insert_own" on public.pi_evidence_processing_jobs
  for insert with check (
    exists (
      select 1 from public.pi_evidence_records r
      where r.id = evidence_id and r.user_id = auth.uid()
    )
  );

drop policy if exists "pi_domain_events_insert_own" on public.pi_domain_events;
create policy "pi_domain_events_insert_own" on public.pi_domain_events
  for insert with check (user_id = auth.uid());

drop policy if exists "pi_evidence_interpretations_insert_own" on public.pi_evidence_interpretations;
create policy "pi_evidence_interpretations_insert_own" on public.pi_evidence_interpretations
  for insert with check (
    exists (
      select 1 from public.pi_evidence_records r
      where r.id = evidence_id and r.user_id = auth.uid()
    )
  );

drop policy if exists "pi_evidence_competency_links_insert_own" on public.pi_evidence_competency_links;
create policy "pi_evidence_competency_links_insert_own" on public.pi_evidence_competency_links
  for insert with check (
    exists (
      select 1 from public.pi_evidence_records r
      where r.id = evidence_id and r.user_id = auth.uid()
    )
  );

-- Job status updates: allow owner path for process worker running as user session;
-- production cron should use service role.
drop policy if exists "pi_evidence_jobs_update_own" on public.pi_evidence_processing_jobs;
create policy "pi_evidence_jobs_update_own" on public.pi_evidence_processing_jobs
  for update using (
    exists (
      select 1 from public.pi_evidence_records r
      where r.id = evidence_id and r.user_id = auth.uid()
    )
  );
