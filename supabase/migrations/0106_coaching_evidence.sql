-- Phase 4 — Coaching evidence workflow (Lovable-derived enhancement).
-- Structured submission -> HUMAN coach confirmation -> append-only `supported`
-- (non-Verified) Evidence Ledger entry citing an immutable artefact version.
--
-- Trust rails (a reviewer will check these):
--   * Human confirmation is the ONLY path to evidence. AI never confirms.
--   * Confirmation appends evidence at `supported` strength via a NEW source
--     `coach_confirmation` — coach-attestation-adjacent, NOT external
--     verification (T8). deliverxVerified is NEVER lit from this path.
--   * No capability writes (Capability Engine remains the only writer).
--   * Append-only + provenance; rejections create no evidence.
--   * Evidence private by default; self-only learner RLS; coach access via
--     service-role behind an app-level coach/reviewer gate.
--   * Framework pinned to the pilot seed pm-core@2026.1.
--
-- IMPORTANT (apply note): `alter type ... add value` is the FIRST statement and
-- must be COMMITTED before the new value is used. Supabase applies each migration
-- file with per-statement autocommit (no wrapping transaction), so the catalogue
-- seed below is safe. Do NOT wrap this file in an explicit BEGIN/COMMIT.

-- ---------------------------------------------------------------------------
-- 1. New evidence source enum value + catalogue seed
-- ---------------------------------------------------------------------------
alter type public.pi_evidence_source_type add value if not exists 'coach_confirmation';

insert into public.pi_evidence_sources (code, label, default_category, description) values
  ('coach_confirmation', 'Coach confirmation', 'practice',
   'Human coach/reviewer-confirmed coaching submission. Supported strength, not external verification; never lights Verified.')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- 2. Coaching enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.coaching_intake_method as enum ('text', 'file', 'link');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.coaching_submission_status as enum (
    'submitted', 'under_review', 'confirmed', 'rejected', 'changes_requested', 'withdrawn'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.coaching_review_decision as enum ('confirm', 'reject', 'request_changes');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.coaching_reviewer_role as enum ('coach', 'reviewer', 'system');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- 3. Catalogue: programmes + exercises (org-shared, NOT person data)
--    Individual programmes default disabled until a founder approves them.
-- ---------------------------------------------------------------------------
create table if not exists public.coaching_programmes (
  id                     uuid primary key default gen_random_uuid(),
  slug                   text not null unique,
  title                  text not null,
  description            text not null default '',
  framework_version_ref  text not null default 'pm-core@2026.1',
  enabled                boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  constraint coaching_programmes_title_nonempty check (char_length(trim(title)) >= 3)
);

create table if not exists public.coaching_exercises (
  id                uuid primary key default gen_random_uuid(),
  programme_id      uuid not null references public.coaching_programmes(id) on delete cascade,
  slug              text not null,
  title             text not null,
  instructions      text not null default '',
  artefact_kind     text not null default 'work_sample',
  capability_ref    text,
  enabled           boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (programme_id, slug),
  constraint coaching_exercises_title_nonempty check (char_length(trim(title)) >= 3)
);

create index if not exists coaching_exercises_programme_idx
  on public.coaching_exercises (programme_id, enabled);

drop trigger if exists coaching_programmes_set_updated_at on public.coaching_programmes;
create trigger coaching_programmes_set_updated_at
  before update on public.coaching_programmes
  for each row execute function public.set_updated_at();

drop trigger if exists coaching_exercises_set_updated_at on public.coaching_exercises;
create trigger coaching_exercises_set_updated_at
  before update on public.coaching_exercises
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Person data: submissions (self-only) + append-only review decisions
-- ---------------------------------------------------------------------------
create table if not exists public.coaching_submissions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.users(id) on delete cascade,
  programme_id         uuid not null references public.coaching_programmes(id) on delete restrict,
  exercise_id          uuid not null references public.coaching_exercises(id) on delete restrict,
  -- The submission body is captured as an immutable artefact version (T3 rails).
  artefact_id          uuid not null references public.artefacts(id) on delete restrict,
  artefact_version_id  uuid not null references public.artefact_versions(id) on delete restrict,
  intake_method        public.coaching_intake_method not null default 'text',
  content_hash         text not null,
  -- Self-reported confidence is a CLAIM, never evidence.
  self_confidence      int check (self_confidence is null or (self_confidence between 1 and 5)),
  status               public.coaching_submission_status not null default 'submitted',
  attempt              int not null default 1,
  -- Set ONLY on human confirmation; the evidence is `supported`, never verified.
  evidence_id          uuid references public.pi_evidence_records(id) on delete set null,
  reviewer_id          uuid references public.users(id) on delete set null,
  reviewed_at          timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (user_id, exercise_id, attempt)
);

create index if not exists coaching_submissions_user_idx
  on public.coaching_submissions (user_id, created_at desc);
create index if not exists coaching_submissions_status_idx
  on public.coaching_submissions (status, created_at asc);
create index if not exists coaching_submissions_exercise_idx
  on public.coaching_submissions (exercise_id);

drop trigger if exists coaching_submissions_set_updated_at on public.coaching_submissions;
create trigger coaching_submissions_set_updated_at
  before update on public.coaching_submissions
  for each row execute function public.set_updated_at();

create table if not exists public.coaching_submission_reviews (
  id                uuid primary key default gen_random_uuid(),
  submission_id     uuid not null references public.coaching_submissions(id) on delete cascade,
  user_id           uuid not null references public.users(id) on delete cascade,
  reviewer_id       uuid references public.users(id) on delete set null,
  reviewer_role     public.coaching_reviewer_role not null default 'coach',
  decision          public.coaching_review_decision not null,
  from_status       public.coaching_submission_status not null,
  to_status         public.coaching_submission_status not null,
  rationale         text not null,
  ai_assisted       boolean not null default false,
  citations         jsonb not null default '[]'::jsonb,
  evidence_id       uuid references public.pi_evidence_records(id) on delete set null,
  created_at        timestamptz not null default now(),
  -- intentionally no updated_at — review decisions are append-only
  constraint coaching_review_rationale_nonempty check (char_length(trim(rationale)) >= 8),
  -- Only a confirm decision may carry an evidence reference.
  constraint coaching_review_evidence_only_on_confirm
    check (decision = 'confirm' or evidence_id is null)
);

create index if not exists coaching_submission_reviews_submission_idx
  on public.coaching_submission_reviews (submission_id, created_at asc);
create index if not exists coaching_submission_reviews_user_idx
  on public.coaching_submission_reviews (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 5. Append-only enforcement for review decisions (privacy-purge bypass only)
-- ---------------------------------------------------------------------------
create or replace function public.coaching_forbid_review_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_setting('app.pi_privacy_delete', true) = 'on' and tg_op = 'DELETE' then
    return old;
  end if;
  raise exception 'append-only coaching review history: % does not allow %', tg_table_name, tg_op;
end;
$$;

drop trigger if exists trg_coaching_reviews_immutable on public.coaching_submission_reviews;
create trigger trg_coaching_reviews_immutable
  before update or delete on public.coaching_submission_reviews
  for each row execute function public.coaching_forbid_review_mutation();

-- ---------------------------------------------------------------------------
-- 6. RLS
--    Catalogue: readable to authenticated; writes are service-role/admin only.
--    Submissions: self-only. Learner INSERT is pinned to an honest initial state
--      (status submitted, no evidence, no reviewer) so a learner can never
--      self-confirm. No authenticated UPDATE — decisions run via service role.
--    Reviews: learner reads own; INSERT is service-role only (coach path).
-- ---------------------------------------------------------------------------
alter table public.coaching_programmes enable row level security;
alter table public.coaching_exercises enable row level security;
alter table public.coaching_submissions enable row level security;
alter table public.coaching_submission_reviews enable row level security;

drop policy if exists "coaching_programmes_read" on public.coaching_programmes;
create policy "coaching_programmes_read" on public.coaching_programmes
  for select to authenticated using (true);

drop policy if exists "coaching_exercises_read" on public.coaching_exercises;
create policy "coaching_exercises_read" on public.coaching_exercises
  for select to authenticated using (true);

drop policy if exists "coaching_submissions_own_select" on public.coaching_submissions;
create policy "coaching_submissions_own_select" on public.coaching_submissions
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "coaching_submissions_own_insert" on public.coaching_submissions;
create policy "coaching_submissions_own_insert" on public.coaching_submissions
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and status = 'submitted'
    and evidence_id is null
    and reviewer_id is null
  );

drop policy if exists "coaching_reviews_own_select" on public.coaching_submission_reviews;
create policy "coaching_reviews_own_select" on public.coaching_submission_reviews
  for select to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 7. Extend person PI purge (T1) to coaching submission + review person rows.
--    Catalogue tables (programmes/exercises) are org-shared and NOT purged.
--    Chains to the current active purge function (renamed once, idempotently).
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regprocedure('public.pi_privacy_purge_person_data_pre_coaching(uuid,uuid)') is null then
    alter function public.pi_privacy_purge_person_data(uuid, uuid)
      rename to pi_privacy_purge_person_data_pre_coaching;
  end if;
end
$$;

revoke all on function public.pi_privacy_purge_person_data_pre_coaching(uuid, uuid)
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
  n bigint := 0;
  touched jsonb := '[]'::jsonb;
begin
  if p_user_id is null then
    raise exception 'p_user_id required';
  end if;

  -- Allow the append-only review DELETE bypass for this purge only.
  perform set_config('app.pi_privacy_delete', 'on', true);

  -- Reviews first (FK to submissions), then submissions. Artefacts + evidence are
  -- purged by the prior (pre-coaching) cascade; coaching_submissions FK to them is
  -- ON DELETE RESTRICT, so submissions MUST be cleared here first.
  delete from public.coaching_submission_reviews where user_id = p_user_id;
  get diagnostics n = row_count;
  touched := touched || jsonb_build_array('coaching_submission_reviews:' || n);

  delete from public.coaching_submissions where user_id = p_user_id;
  get diagnostics n = row_count;
  touched := touched || jsonb_build_array('coaching_submissions:' || n);

  result := public.pi_privacy_purge_person_data_pre_coaching(p_user_id, p_request_id);
  touched := touched || coalesce(result -> 'tables_touched', '[]'::jsonb);
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

-- ---------------------------------------------------------------------------
-- 8. Comments (contracts)
-- ---------------------------------------------------------------------------
comment on table public.coaching_programmes is
  'Phase 4 coaching programme catalogue (org-shared). enabled defaults false until a founder approves.';
comment on table public.coaching_exercises is
  'Phase 4 coaching exercises. Pinned to pm-core@2026.1. enabled defaults false.';
comment on table public.coaching_submissions is
  'Phase 4 learner coaching submissions. Self-only RLS, private by default. Body captured as an immutable artefact version. evidence_id set ONLY on human confirmation (supported strength, never Verified).';
comment on table public.coaching_submission_reviews is
  'Phase 4 append-only coach decisions. Only confirm carries an evidence reference. AI never confirms; rationale required. Never writes capability or lights Verified.';
comment on function public.pi_privacy_purge_person_data(uuid, uuid) is
  'Phase 4 wrapper: purge coaching submission/review person rows then prior cascade. service_role only. Catalogue tables are org-shared and not purged.';
