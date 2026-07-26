-- B2 — Formal recommendation entity + state machine (FR-010 / TRD-SM-REC / PACK-E2).
-- Canonical Professional Intelligence recommendation lifecycle:
--   generated → viewed → accepted | dismissed ; accepted → completed | dismissed.
-- Recommendations are explainable next actions only — they never write capability,
-- never light deliverxVerified, and their rationale is immutable after insert.

-- ---------------------------------------------------------------------------
-- Entity
-- ---------------------------------------------------------------------------

create table if not exists public.pi_recommendations (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.users(id) on delete cascade,
  status               text not null default 'generated'
    check (status in ('generated', 'viewed', 'accepted', 'dismissed', 'completed')),
  title                text not null check (length(btrim(title)) > 0),
  -- Explainability is mandatory: every recommendation retains its rationale.
  rationale            text not null check (length(btrim(rationale)) > 0),
  competency_id        text,
  -- Deterministic internal next-step destination (no external links).
  href                 text not null check (href ~ '^/'),
  source_type          text not null default 'capability_snapshot'
    check (source_type in ('capability_snapshot')),
  source_id            text not null check (length(btrim(source_id)) > 0),
  source_snapshot_id   uuid references public.pi_capability_snapshots(id) on delete set null,
  source_score_run_id  uuid references public.pi_capability_score_runs(id) on delete set null,
  dedupe_key           text not null check (length(btrim(dedupe_key)) > 0),
  payload              jsonb not null default '{}'::jsonb,
  -- Trust rails: a recommendation can never itself assign capability or verification.
  capability_assigned  boolean not null default false check (capability_assigned = false),
  verification_changed boolean not null default false check (verification_changed = false),
  generated_at         timestamptz not null default now(),
  viewed_at            timestamptz,
  accepted_at          timestamptz,
  dismissed_at         timestamptz,
  completed_at         timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (user_id, dedupe_key)
);

create index if not exists pi_recommendations_user_created_idx
  on public.pi_recommendations (user_id, created_at desc);

create index if not exists pi_recommendations_user_active_idx
  on public.pi_recommendations (user_id, created_at desc)
  where status in ('generated', 'viewed', 'accepted');

-- ---------------------------------------------------------------------------
-- Evidence / claim linkage (recommendation → cited evidence references)
-- ---------------------------------------------------------------------------

create table if not exists public.pi_recommendation_evidence (
  id                 uuid primary key default gen_random_uuid(),
  recommendation_id  uuid not null references public.pi_recommendations(id) on delete cascade,
  user_id            uuid not null references public.users(id) on delete cascade,
  -- Text reference (evidence record id or judgement reference) — kept verbatim
  -- so citations survive even when the referenced row is later purged.
  evidence_reference text not null check (length(btrim(evidence_reference)) > 0),
  created_at         timestamptz not null default now(),
  unique (recommendation_id, evidence_reference)
);

create index if not exists pi_recommendation_evidence_rec_idx
  on public.pi_recommendation_evidence (recommendation_id);

-- ---------------------------------------------------------------------------
-- Append-only lifecycle audit
-- ---------------------------------------------------------------------------

create table if not exists public.pi_recommendation_events (
  id                 uuid primary key default gen_random_uuid(),
  recommendation_id  uuid not null references public.pi_recommendations(id) on delete cascade,
  user_id            uuid not null references public.users(id) on delete cascade,
  from_status        text
    check (from_status is null or from_status in ('generated', 'viewed', 'accepted', 'dismissed', 'completed')),
  to_status          text not null
    check (to_status in ('generated', 'viewed', 'accepted', 'dismissed', 'completed')),
  actor              text not null check (actor in ('user', 'system')),
  note               text not null default '',
  created_at         timestamptz not null default now()
);

create index if not exists pi_recommendation_events_rec_idx
  on public.pi_recommendation_events (recommendation_id, created_at);

-- ---------------------------------------------------------------------------
-- Deterministic state machine enforced in the database
-- ---------------------------------------------------------------------------

create or replace function public.pi_recommendation_transition_allowed(
  p_from text,
  p_to text
)
returns boolean
language sql
immutable
as $$
  select case
    when p_from = 'generated' and p_to in ('viewed', 'accepted', 'dismissed') then true
    when p_from = 'viewed'    and p_to in ('accepted', 'dismissed') then true
    when p_from = 'accepted'  and p_to in ('completed', 'dismissed') then true
    else false
  end;
$$;

create or replace function public.pi_recommendation_guard_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Identity, rationale and provenance are immutable (append-only history).
  if new.user_id is distinct from old.user_id
    or new.title is distinct from old.title
    or new.rationale is distinct from old.rationale
    or new.competency_id is distinct from old.competency_id
    or new.href is distinct from old.href
    or new.source_type is distinct from old.source_type
    or new.source_id is distinct from old.source_id
    or new.dedupe_key is distinct from old.dedupe_key
    or new.payload is distinct from old.payload
    or new.generated_at is distinct from old.generated_at
    or new.created_at is distinct from old.created_at then
    raise exception 'pi_recommendations core fields are immutable';
  end if;

  if new.status is distinct from old.status then
    if not public.pi_recommendation_transition_allowed(old.status, new.status) then
      raise exception 'invalid recommendation transition % -> %', old.status, new.status;
    end if;
    insert into public.pi_recommendation_events (
      recommendation_id, user_id, from_status, to_status, actor, note
    )
    values (
      new.id,
      new.user_id,
      old.status,
      new.status,
      case when auth.uid() is not null and auth.uid() = new.user_id then 'user' else 'system' end,
      'Lifecycle transition — never assigns capability or verification.'
    );
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_pi_recommendation_guard_update on public.pi_recommendations;
create trigger trg_pi_recommendation_guard_update
  before update on public.pi_recommendations
  for each row execute function public.pi_recommendation_guard_update();

create or replace function public.pi_recommendation_audit_insert()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  insert into public.pi_recommendation_events (
    recommendation_id, user_id, from_status, to_status, actor, note
  )
  values (
    new.id,
    new.user_id,
    null,
    new.status,
    case when auth.uid() is not null and auth.uid() = new.user_id then 'user' else 'system' end,
    'Recommendation generated from ' || new.source_type || ' ' || new.source_id || '.'
  );
  return new;
end;
$$;

drop trigger if exists trg_pi_recommendation_audit_insert on public.pi_recommendations;
create trigger trg_pi_recommendation_audit_insert
  after insert on public.pi_recommendations
  for each row execute function public.pi_recommendation_audit_insert();

-- ---------------------------------------------------------------------------
-- RLS — self-only access; events append-only for authenticated users
-- ---------------------------------------------------------------------------

alter table public.pi_recommendations enable row level security;
alter table public.pi_recommendation_evidence enable row level security;
alter table public.pi_recommendation_events enable row level security;

drop policy if exists "pi_recommendations_own_select" on public.pi_recommendations;
create policy "pi_recommendations_own_select" on public.pi_recommendations
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "pi_recommendations_own_insert" on public.pi_recommendations;
create policy "pi_recommendations_own_insert" on public.pi_recommendations
  for insert to authenticated
  with check (user_id = auth.uid() and status = 'generated');

drop policy if exists "pi_recommendations_own_update" on public.pi_recommendations;
create policy "pi_recommendations_own_update" on public.pi_recommendations
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "pi_recommendation_evidence_own_select" on public.pi_recommendation_evidence;
create policy "pi_recommendation_evidence_own_select" on public.pi_recommendation_evidence
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "pi_recommendation_evidence_own_insert" on public.pi_recommendation_evidence;
create policy "pi_recommendation_evidence_own_insert" on public.pi_recommendation_evidence
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "pi_recommendation_events_own_select" on public.pi_recommendation_events;
create policy "pi_recommendation_events_own_select" on public.pi_recommendation_events
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "pi_recommendation_events_own_insert" on public.pi_recommendation_events;
create policy "pi_recommendation_events_own_insert" on public.pi_recommendation_events
  for insert to authenticated
  with check (user_id = auth.uid());

-- No delete for authenticated anywhere; no update on evidence links or events.
revoke all on table public.pi_recommendations from anon;
revoke all on table public.pi_recommendation_evidence from anon;
revoke all on table public.pi_recommendation_events from anon;
revoke delete on table public.pi_recommendations from authenticated;
revoke update, delete on table public.pi_recommendation_evidence from authenticated;
revoke update, delete on table public.pi_recommendation_events from authenticated;

grant select, insert, update on table public.pi_recommendations to authenticated;
grant select, insert on table public.pi_recommendation_evidence to authenticated;
grant select, insert on table public.pi_recommendation_events to authenticated;
grant all on table public.pi_recommendations to service_role;
grant all on table public.pi_recommendation_evidence to service_role;
grant all on table public.pi_recommendation_events to service_role;

-- ---------------------------------------------------------------------------
-- Privacy purge — recommendation rows before prior cascade (T9 wrapper)
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regprocedure('public.pi_privacy_purge_person_data_t9(uuid,uuid)') is null then
    alter function public.pi_privacy_purge_person_data(uuid, uuid)
      rename to pi_privacy_purge_person_data_t9;
  end if;
end
$$;

revoke all on function public.pi_privacy_purge_person_data_t9(uuid, uuid)
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

  delete from public.pi_recommendation_events where user_id = p_user_id;
  get diagnostics n = row_count;
  touched := touched || jsonb_build_array('pi_recommendation_events:' || n);

  delete from public.pi_recommendation_evidence where user_id = p_user_id;
  get diagnostics n = row_count;
  touched := touched || jsonb_build_array('pi_recommendation_evidence:' || n);

  delete from public.pi_recommendations where user_id = p_user_id;
  get diagnostics n = row_count;
  touched := touched || jsonb_build_array('pi_recommendations:' || n);

  result := public.pi_privacy_purge_person_data_t9(p_user_id, p_request_id);
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

comment on table public.pi_recommendations is
  'B2 canonical PI recommendation entity. Lifecycle generated→viewed→accepted|dismissed (accepted→completed|dismissed). Explainable, self-only, never writes capability or Verified.';
comment on table public.pi_recommendation_evidence is
  'B2 recommendation → evidence/claim reference links (citations kept verbatim).';
comment on table public.pi_recommendation_events is
  'B2 append-only recommendation lifecycle audit. No authenticated update/delete.';
comment on function public.pi_privacy_purge_person_data(uuid, uuid) is
  'B2 wrapper: purge recommendation person rows then T9 cascade. service_role only.';
