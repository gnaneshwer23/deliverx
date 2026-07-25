-- T5 — person PI notifications + pilot observability read model.
-- Consolidates the legacy review stub into one in-app inbox.
-- No email/channel expansion and no capability or verification writes.

create table if not exists public.pi_notifications (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users(id) on delete cascade,
  kind              text not null
    check (kind in ('review', 'intervention', 'privacy', 'system')),
  title             text not null check (length(btrim(title)) > 0),
  body              text not null default '',
  href              text not null check (href ~ '^/'),
  context_type      text not null
    check (context_type in (
      'project', 'task', 'meeting', 'evidence', 'career_objective', 'account'
    )),
  context_id        text,
  payload           jsonb not null default '{}'::jsonb,
  source_event_id   uuid references public.pi_domain_events(id) on delete set null,
  source_type       text not null,
  source_id         text not null,
  dedupe_key        text not null,
  delivery_channel  text not null default 'in_app'
    check (delivery_channel = 'in_app'),
  delivered_at      timestamptz not null default now(),
  read_at           timestamptz,
  created_at        timestamptz not null default now(),
  unique (user_id, dedupe_key)
);

create index if not exists pi_notifications_user_created_idx
  on public.pi_notifications (user_id, created_at desc);

create index if not exists pi_notifications_user_unread_idx
  on public.pi_notifications (user_id, created_at desc)
  where read_at is null;

create index if not exists pi_notifications_source_event_idx
  on public.pi_notifications (source_event_id)
  where source_event_id is not null;

alter table public.pi_notifications enable row level security;

drop policy if exists "pi_notifications_own_select" on public.pi_notifications;
create policy "pi_notifications_own_select" on public.pi_notifications
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "pi_notifications_own_insert" on public.pi_notifications;
create policy "pi_notifications_own_insert" on public.pi_notifications
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "pi_notifications_own_update" on public.pi_notifications;
create policy "pi_notifications_own_update" on public.pi_notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Preserve review notification history while future review writes move to the
-- consolidated module. The old table remains read-compatible for rollback.
insert into public.pi_notifications (
  user_id,
  kind,
  title,
  body,
  href,
  context_type,
  context_id,
  payload,
  source_type,
  source_id,
  dedupe_key,
  delivered_at,
  read_at,
  created_at
)
select
  n.user_id,
  'review',
  n.title,
  n.body,
  '/profile/evidence?review=' || coalesce(n.case_id::text, ''),
  'evidence',
  n.case_id::text,
  n.payload || jsonb_build_object('legacy_kind', n.kind),
  'pi_review_notification',
  n.id::text,
  'review:legacy:' || n.id::text,
  n.created_at,
  n.read_at,
  n.created_at
from public.pi_review_notifications n
on conflict (user_id, dedupe_key) do nothing;

-- Intervention offers are created in several existing paths. A narrow trigger
-- guarantees each offer reaches the consolidated inbox exactly once.
create or replace function public.pi_notify_intervention_offered()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  insert into public.pi_notifications (
    user_id,
    kind,
    title,
    body,
    href,
    context_type,
    context_id,
    payload,
    source_type,
    source_id,
    dedupe_key
  )
  values (
    new.user_id,
    'intervention',
    new.title,
    new.rationale,
    coalesce(nullif(new.href, ''), '/profile/evidence'),
    'evidence',
    coalesce(new.source_score_run_id::text, new.source_snapshot_id::text),
    jsonb_build_object(
      'interventionKind', new.kind,
      'targetGap', new.target_gap,
      'capabilityAssigned', false,
      'verificationChanged', false
    ),
    'pi_intervention',
    new.id::text,
    'intervention:' || new.id::text
  )
  on conflict (user_id, dedupe_key) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_pi_intervention_notification on public.pi_interventions;
create trigger trg_pi_intervention_notification
  after insert on public.pi_interventions
  for each row execute function public.pi_notify_intervention_offered();

-- Self-only operational read model. security_invoker ensures the underlying
-- ai_interactions RLS remains authoritative for authenticated users.
create or replace view public.pi_ai_usage_daily
with (security_invoker = true)
as
select
  user_id,
  date_trunc('day', created_at) as usage_day,
  agent_slug,
  count(*)::bigint as interaction_count,
  coalesce(sum(input_tokens), 0)::bigint as input_tokens,
  coalesce(sum(output_tokens), 0)::bigint as output_tokens,
  coalesce(sum(cost_estimate_usd), 0)::numeric(14, 8) as cost_estimate_usd,
  coalesce(round(avg(latency_ms)), 0)::bigint as average_latency_ms
from public.ai_interactions
group by user_id, date_trunc('day', created_at), agent_slug;

grant select on public.pi_ai_usage_daily to authenticated, service_role;

-- Extend the T1 purge without duplicating the long authoritative function.
-- Rename the T4 implementation once, then wrap it with T5 notification purge.
do $$
begin
  if to_regprocedure('public.pi_privacy_purge_person_data_t4(uuid,uuid)') is null then
    alter function public.pi_privacy_purge_person_data(uuid, uuid)
      rename to pi_privacy_purge_person_data_t4;
  end if;
end
$$;

revoke all on function public.pi_privacy_purge_person_data_t4(uuid, uuid)
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
  notification_count bigint;
  touched jsonb;
begin
  if p_user_id is null then
    raise exception 'p_user_id required';
  end if;

  delete from public.pi_notifications where user_id = p_user_id;
  get diagnostics notification_count = row_count;

  result := public.pi_privacy_purge_person_data_t4(p_user_id, p_request_id);
  touched := jsonb_build_array('pi_notifications:' || notification_count)
    || coalesce(result -> 'tables_touched', '[]'::jsonb);
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

comment on table public.pi_notifications is
  'T5 self-only person PI in-app inbox. Every row has a contextual href; no capability or verification writes.';
comment on view public.pi_ai_usage_daily is
  'T5 self-only daily AI cost/latency read model; underlying ai_interactions RLS applies.';
