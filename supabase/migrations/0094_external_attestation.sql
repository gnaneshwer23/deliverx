-- T8 — External attestation (employer / third-party verify).
-- Lights deliverxVerified only when externally_attested + externally_verified.
-- Never writes capability. Preserves TD-016 SECURITY DEFINER grant posture.
-- Migration number 0094 (0093 taken by T7 org structure).

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.vpp_attestation_requests (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.users(id) on delete cascade,
  entry_id             uuid not null references public.vpp_entries(id) on delete cascade,
  share_id             uuid references public.vpp_shares(id) on delete set null,
  claim_field          text not null default 'general',
  claim_label          text not null,
  claim_summary        text not null default '',
  status               text not null default 'pending'
    check (status in (
      'pending', 'confirmed', 'disputed', 'expired', 'revoked', 'cancelled'
    )),
  token                text not null unique,
  relationship_hint    text,
  consent_to_share     boolean not null default false,
  expires_at           timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint vpp_attestation_requests_label_nonempty
    check (char_length(trim(claim_label)) >= 3),
  constraint vpp_attestation_requests_consent_when_pending
    check (status <> 'pending' or consent_to_share = true)
);

create index if not exists vpp_attestation_requests_user_idx
  on public.vpp_attestation_requests(user_id, created_at desc);
create index if not exists vpp_attestation_requests_entry_idx
  on public.vpp_attestation_requests(entry_id, created_at desc);
create index if not exists vpp_attestation_requests_token_idx
  on public.vpp_attestation_requests(token);

create table if not exists public.vpp_attestations (
  id                       uuid primary key default gen_random_uuid(),
  request_id               uuid not null unique
    references public.vpp_attestation_requests(id) on delete cascade,
  entry_id                 uuid not null references public.vpp_entries(id) on delete cascade,
  user_id                  uuid not null references public.users(id) on delete cascade,
  decision                 text not null check (decision in ('confirm', 'dispute')),
  attestor_display_name    text not null,
  attestor_relationship    text not null
    check (attestor_relationship in (
      'former_manager', 'current_manager', 'colleague', 'client', 'mentor', 'other'
    )),
  attestor_organisation    text,
  statement                text not null,
  evidence_id              uuid references public.pi_evidence_records(id) on delete set null,
  review_case_id           uuid,
  created_at               timestamptz not null default now(),
  constraint vpp_attestations_name_nonempty
    check (char_length(trim(attestor_display_name)) >= 2),
  constraint vpp_attestations_statement_nonempty
    check (char_length(trim(statement)) >= 10),
  constraint vpp_attestations_confirm_has_evidence
    check (decision <> 'confirm' or evidence_id is not null)
);

create index if not exists vpp_attestations_user_idx
  on public.vpp_attestations(user_id, created_at desc);
create index if not exists vpp_attestations_entry_idx
  on public.vpp_attestations(entry_id, created_at desc);

create table if not exists public.vpp_attestation_events (
  id               uuid primary key default gen_random_uuid(),
  request_id       uuid not null
    references public.vpp_attestation_requests(id) on delete cascade,
  attestation_id   uuid references public.vpp_attestations(id) on delete set null,
  user_id          uuid not null references public.users(id) on delete cascade,
  event_type       text not null
    check (event_type in (
      'requested', 'confirmed', 'disputed', 'revoked', 'cancelled', 'expired'
    )),
  payload          jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now()
);

create index if not exists vpp_attestation_events_request_idx
  on public.vpp_attestation_events(request_id, created_at asc);
create index if not exists vpp_attestation_events_user_idx
  on public.vpp_attestation_events(user_id, created_at desc);

drop trigger if exists vpp_attestation_requests_set_updated_at
  on public.vpp_attestation_requests;
create trigger vpp_attestation_requests_set_updated_at
  before update on public.vpp_attestation_requests
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — owner read/write for requests; owner read for attestations/events.
-- Tokenised attestor path uses service role (same pattern as vpp_shares public).
-- ---------------------------------------------------------------------------

alter table public.vpp_attestation_requests enable row level security;
alter table public.vpp_attestations enable row level security;
alter table public.vpp_attestation_events enable row level security;

drop policy if exists "vpp_attestation_requests_own" on public.vpp_attestation_requests;
create policy "vpp_attestation_requests_own" on public.vpp_attestation_requests
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "vpp_attestations_own_select" on public.vpp_attestations;
create policy "vpp_attestations_own_select" on public.vpp_attestations
  for select using (user_id = auth.uid());

drop policy if exists "vpp_attestation_events_own_select" on public.vpp_attestation_events;
create policy "vpp_attestation_events_own_select" on public.vpp_attestation_events
  for select using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Privacy purge — attestation person data before prior cascade
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regprocedure('public.pi_privacy_purge_person_data_t7(uuid,uuid)') is null then
    alter function public.pi_privacy_purge_person_data(uuid, uuid)
      rename to pi_privacy_purge_person_data_t7;
  end if;
end
$$;

revoke all on function public.pi_privacy_purge_person_data_t7(uuid, uuid)
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

  -- Events first (FK to attestations / requests)
  delete from public.vpp_attestation_events where user_id = p_user_id;
  get diagnostics n = row_count;
  touched := touched || jsonb_build_array('vpp_attestation_events:' || n);

  delete from public.vpp_attestations where user_id = p_user_id;
  get diagnostics n = row_count;
  touched := touched || jsonb_build_array('vpp_attestations:' || n);

  delete from public.vpp_attestation_requests where user_id = p_user_id;
  get diagnostics n = row_count;
  touched := touched || jsonb_build_array('vpp_attestation_requests:' || n);

  result := public.pi_privacy_purge_person_data_t7(p_user_id, p_request_id);
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

comment on table public.vpp_attestation_requests is
  'T8 tokenised attestation requests. Consent required. Never assigns capability.';
comment on table public.vpp_attestations is
  'T8 completed attestations. Confirm writes ledger external_verification; dispute opens review. Attestor PII minimal and not public.';
comment on table public.vpp_attestation_events is
  'T8 append-only attestation audit trail.';
comment on function public.pi_privacy_purge_person_data(uuid, uuid) is
  'T8 wrapper: purge attestation person rows then T7 cascade. service_role only.';
