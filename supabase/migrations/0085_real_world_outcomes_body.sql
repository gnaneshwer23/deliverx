-- Phase 7: Real-world outcome loop — body. Additive + idempotent. No row mutation/deletes.
-- Depends on 0084 (real_world_outcome enum value) already committed.
--
-- Candidates record real-world career activity and outcomes (applications, interviews,
-- feedback, offers, rejections, hires, promotions, performance feedback, external
-- projects). Outcomes append Evidence Ledger records that are SELF-REPORTED by default
-- (document_supported when an artefact backs them). They are NEVER externally verified
-- (P8 owns attestation) and NEVER assign capability (only the Capability Engine does).
-- Calibration findings are diagnostic guidance, reviewable/challengeable — never a
-- capability write. RLS self-only on every table.

-- ---------------------------------------------------------------------------
-- Evidence source catalogue: real_world_outcome (enum added in 0084)
-- Kept distinct from application_outcome so strength stays self-reported by default
-- and does not auto-promote to outcome_validated.
-- ---------------------------------------------------------------------------
insert into public.pi_evidence_sources (code, label, default_category, description) values
  (
    'real_world_outcome',
    'Real-world outcome',
    'outcome',
    'Self-reported real-world career activity/outcome. Self-reported unless an artefact backs it (document_supported). Never externally verified without P8 attestation; never a capability assignment.'
  )
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.pi_outcome_event_type as enum (
    'application_submitted',
    'interview_attended',
    'interview_feedback',
    'offer_received',
    'rejection',
    'job_started',
    'promotion_achieved',
    'performance_feedback',
    'external_project_completed'
  );
exception when duplicate_object then null; end $$;

-- P7 strength ceiling: self-report by default, document-supported when an artefact is
-- attached. Never externally_verified (that stays P8).
do $$ begin
  create type public.pi_outcome_strength as enum (
    'self_reported',
    'document_supported'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.pi_outcome_sentiment as enum (
    'positive',
    'neutral',
    'negative'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.pi_calibration_severity as enum (
    'info',
    'watch',
    'action'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.pi_calibration_finding_status as enum (
    'open',
    'acknowledged',
    'dismissed',
    'challenged'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Real-world outcome events (append-only intent; extends career_applications 0072)
-- ---------------------------------------------------------------------------
create table if not exists public.pi_outcome_events (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  -- Optional link back to the tracked application (0072). set null on app delete.
  application_id      uuid references public.career_applications(id) on delete set null,
  event_type          public.pi_outcome_event_type not null,
  occurred_on         date not null default current_date,
  title               text not null,
  detail              text not null default '',
  -- Sensitive third-party data — default private; never surfaced in shared artefacts.
  company             text,
  role_title          text,
  seniority           text,
  -- Interview funnel stage reached (e.g. phone_screen, onsite, final) for calibration.
  stage_reached       text,
  sentiment           public.pi_outcome_sentiment not null default 'neutral',
  -- Supporting artefact (offer letter, feedback doc). Presence => document_supported.
  artefact_ref        text,
  has_artefact        boolean not null default false,
  -- Soft link to the appended ledger record (not hard-FK'd so append can race safely).
  evidence_id         uuid,
  evidence_strength   public.pi_outcome_strength not null default 'self_reported',
  -- Invariants for P7: self-reported, never externally verified, never capability.
  self_reported       boolean not null default true,
  externally_verified boolean not null default false,
  capability_assigned boolean not null default false,
  confidentiality     public.pi_confidentiality not null default 'private',
  payload             jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint pi_outcome_events_title_chk check (char_length(trim(title)) > 0),
  constraint pi_outcome_events_self_reported_chk check (self_reported = true),
  constraint pi_outcome_events_not_externally_verified_chk check (externally_verified = false),
  constraint pi_outcome_events_no_capability_chk check (capability_assigned = false)
);

create index if not exists pi_outcome_events_user_idx
  on public.pi_outcome_events (user_id, occurred_on desc, created_at desc);

create index if not exists pi_outcome_events_user_type_idx
  on public.pi_outcome_events (user_id, event_type);

create index if not exists pi_outcome_events_application_idx
  on public.pi_outcome_events (application_id)
  where application_id is not null;

create index if not exists pi_outcome_events_evidence_idx
  on public.pi_outcome_events (evidence_id)
  where evidence_id is not null;

drop trigger if exists pi_outcome_events_set_updated_at on public.pi_outcome_events;
create trigger pi_outcome_events_set_updated_at
  before update on public.pi_outcome_events
  for each row execute function public.set_updated_at();

alter table public.pi_outcome_events enable row level security;

drop policy if exists "pi_outcome_events_own" on public.pi_outcome_events;
create policy "pi_outcome_events_own" on public.pi_outcome_events
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

comment on table public.pi_outcome_events is
  'Real-world career activity/outcomes. Self-reported evidence; never externally verified (P8) and never a capability assignment.';
comment on column public.pi_outcome_events.evidence_strength is
  'self_reported by default; document_supported only when an artefact backs the outcome. Never outcome_validated/externally_verified here.';

-- ---------------------------------------------------------------------------
-- Calibration findings (diagnostic snapshots — never capability assignment)
-- ---------------------------------------------------------------------------
create table if not exists public.pi_calibration_findings (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  finding_type        text not null,
  severity            public.pi_calibration_severity not null default 'info',
  title               text not null,
  detail              text not null default '',
  -- Evidence-linked & reviewable: cite the outcome/ledger evidence behind the pattern.
  evidence_ids        uuid[] not null default '{}',
  implicated_gaps     text[] not null default '{}',
  -- Sample sizes / counts for statistical honesty (G7). Every figure carries volume.
  metrics             jsonb not null default '{}'::jsonb,
  diagnostic_only     boolean not null default true,
  capability_assigned boolean not null default false,
  status              public.pi_calibration_finding_status not null default 'open',
  -- If the user challenges the diagnostic, link the pi_review case.
  review_case_id      uuid,
  source_window_start date,
  source_window_end   date,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint pi_calibration_findings_diagnostic_chk check (diagnostic_only = true),
  constraint pi_calibration_findings_no_capability_chk check (capability_assigned = false),
  constraint pi_calibration_findings_title_chk check (char_length(trim(title)) > 0)
);

create index if not exists pi_calibration_findings_user_idx
  on public.pi_calibration_findings (user_id, status, created_at desc);

create index if not exists pi_calibration_findings_user_type_idx
  on public.pi_calibration_findings (user_id, finding_type);

drop trigger if exists pi_calibration_findings_set_updated_at on public.pi_calibration_findings;
create trigger pi_calibration_findings_set_updated_at
  before update on public.pi_calibration_findings
  for each row execute function public.set_updated_at();

alter table public.pi_calibration_findings enable row level security;

drop policy if exists "pi_calibration_findings_own" on public.pi_calibration_findings;
create policy "pi_calibration_findings_own" on public.pi_calibration_findings
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

comment on table public.pi_calibration_findings is
  'Diagnostic calibration insights from real-world outcomes (e.g. N interviews 0 offers). Evidence-linked, reviewable/challengeable. Never assigns or lowers capability.';
comment on column public.pi_calibration_findings.metrics is
  'Sample sizes / counts behind the finding. Volume-floor suppression enforced in the domain lib (G7 statistical honesty).';
