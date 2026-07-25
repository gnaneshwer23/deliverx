-- Phase 6: Learning Intelligence — person knowledge records + gap-driven paths.
-- Additive. Learning ≠ competency. Completing learning never assigns capability
-- or lights Verified. Capability only via ScoreRun on ledger evidence.
-- RLS: self-only on all person learning tables.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.pi_learning_item_kind as enum (
    'book',
    'article',
    'course',
    'podcast',
    'certification',
    'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.pi_learning_evidence_level as enum (
    'consumed',
    'understood',
    'reflected_upon',
    'applied',
    'repeatedly_applied',
    'outcome_supported'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.pi_learning_path_status as enum (
    'offered',
    'accepted',
    'in_progress',
    'completed',
    'dismissed',
    'unproven'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Gap-driven learning paths (recommendations — never capability)
-- ---------------------------------------------------------------------------
create table if not exists public.pi_learning_paths (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null references public.users(id) on delete cascade,
  title                     text not null,
  rationale                 text not null default '',
  target_gap                text,
  competency_codes          text[] not null default '{}',
  status                    public.pi_learning_path_status not null default 'offered',
  -- Application trigger: recommend Experience / workspace exercise after learning
  application_trigger       jsonb not null default '{}'::jsonb,
  steps                     jsonb not null default '[]'::jsonb,
  source_snapshot_id        uuid,
  source_score_run_id       uuid,
  framework_version_id      uuid,
  -- Outcome discipline: only true when linked evidence + measured level change exists
  outcome_supported         boolean not null default false,
  outcome_evidence_id       uuid,
  outcome_snapshot_delta_id uuid,
  capability_assigned       boolean not null default false,
  learning_not_capability   boolean not null default true,
  metadata                  jsonb not null default '{}'::jsonb,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  constraint pi_learning_paths_no_capability_chk check (capability_assigned = false),
  constraint pi_learning_paths_learning_flag_chk check (learning_not_capability = true)
);

create index if not exists pi_learning_paths_user_status_idx
  on public.pi_learning_paths (user_id, status, created_at desc);

create index if not exists pi_learning_paths_user_gap_idx
  on public.pi_learning_paths (user_id, target_gap);

alter table public.pi_learning_paths enable row level security;

drop policy if exists "pi_learning_paths_own" on public.pi_learning_paths;
create policy "pi_learning_paths_own" on public.pi_learning_paths
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Person learning items (books / articles / courses / podcasts / certs)
-- ---------------------------------------------------------------------------
create table if not exists public.pi_learning_items (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null references public.users(id) on delete cascade,
  kind                      public.pi_learning_item_kind not null default 'other',
  title                     text not null,
  topic                     text not null default '',
  source                    text not null default '',
  consumed_on               date,
  concepts                  text[] not null default '{}',
  reflection                text not null default '',
  relevance_to_role         text not null default '',
  relevance_to_gaps         text[] not null default '{}',
  target_competency_codes   text[] not null default '{}',
  evidence_level            public.pi_learning_evidence_level not null default 'consumed',
  evidence_id               uuid,
  learning_path_id          uuid references public.pi_learning_paths(id) on delete set null,
  -- Soft links to application practice (Experience / workspace) — not capability
  application_evidence_ids  uuid[] not null default '{}',
  application_href          text,
  capability_assigned       boolean not null default false,
  learning_not_capability   boolean not null default true,
  metadata                  jsonb not null default '{}'::jsonb,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  constraint pi_learning_items_no_capability_chk check (capability_assigned = false),
  constraint pi_learning_items_learning_flag_chk check (learning_not_capability = true),
  constraint pi_learning_items_title_chk check (char_length(trim(title)) > 0)
);

create index if not exists pi_learning_items_user_idx
  on public.pi_learning_items (user_id, created_at desc);

create index if not exists pi_learning_items_user_level_idx
  on public.pi_learning_items (user_id, evidence_level);

create index if not exists pi_learning_items_path_idx
  on public.pi_learning_items (learning_path_id)
  where learning_path_id is not null;

create index if not exists pi_learning_items_evidence_idx
  on public.pi_learning_items (evidence_id)
  where evidence_id is not null;

alter table public.pi_learning_items enable row level security;

drop policy if exists "pi_learning_items_own" on public.pi_learning_items;
create policy "pi_learning_items_own" on public.pi_learning_items
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Soft FK note: evidence_id intentionally not hard-FK'd to pi_evidence_records
-- so ledger append can race safely; domain lib keeps them in sync.
comment on table public.pi_learning_items is
  'Person Learning Intelligence records. Knowledge evidence only — never competency proof.';
comment on column public.pi_learning_items.evidence_level is
  'consumed → understood → reflected_upon → applied → repeatedly_applied → outcome_supported. outcome_supported requires linked evidence + measured ScoreRun delta.';
comment on column public.pi_learning_items.capability_assigned is
  'Invariant false. Learning never writes capability levels.';
comment on table public.pi_learning_paths is
  'Gap-driven learning path recommendations with application triggers. Unproven until outcome_supported.';
