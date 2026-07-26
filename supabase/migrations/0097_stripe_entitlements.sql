-- T9 — Commercial packaging / Stripe entitlements.
-- Founder-authorized 2026-07-26 (`approve t9`).
-- Stores Stripe customer/subscription linkage and derived product entitlements.
-- Never stores PANs. Webhook writers are service_role only.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.billing_customers (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null unique references public.users(id) on delete cascade,
  stripe_customer_id   text not null unique,
  email                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint billing_customers_stripe_id_nonempty
    check (char_length(trim(stripe_customer_id)) >= 3)
);

create index if not exists billing_customers_user_idx
  on public.billing_customers(user_id);

create table if not exists public.billing_subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references public.users(id) on delete cascade,
  customer_id              uuid not null references public.billing_customers(id) on delete cascade,
  stripe_subscription_id   text not null unique,
  stripe_price_id          text not null,
  product_sku              text not null
    check (product_sku in ('experience', 'launchpad', 'professional')),
  status                   text not null
    check (status in (
      'active', 'trialing', 'past_due', 'canceled', 'unpaid',
      'incomplete', 'incomplete_expired', 'paused'
    )),
  current_period_end       timestamptz,
  cancel_at_period_end     boolean not null default false,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists billing_subscriptions_user_idx
  on public.billing_subscriptions(user_id, created_at desc);
create index if not exists billing_subscriptions_status_idx
  on public.billing_subscriptions(user_id, status);

create table if not exists public.billing_entitlements (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(id) on delete cascade,
  product_sku      text not null
    check (product_sku in ('experience', 'launchpad', 'professional')),
  source           text not null
    check (source in ('stripe_subscription', 'manual_grant', 'complimentary')),
  status           text not null
    check (status in ('active', 'revoked', 'expired')),
  subscription_id  uuid references public.billing_subscriptions(id) on delete set null,
  granted_at       timestamptz not null default now(),
  expires_at       timestamptz,
  revoked_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create unique index if not exists billing_entitlements_active_sku_uidx
  on public.billing_entitlements(user_id, product_sku)
  where status = 'active';

create index if not exists billing_entitlements_user_idx
  on public.billing_entitlements(user_id, status);

-- Idempotency + audit for Stripe webhook deliveries (no card data).
create table if not exists public.billing_webhook_events (
  id                 uuid primary key default gen_random_uuid(),
  stripe_event_id    text not null unique,
  event_type         text not null,
  livemode           boolean not null default false,
  processing_status  text not null default 'processed'
    check (processing_status in ('processed', 'ignored', 'failed')),
  result_summary     text not null default '',
  payload_digest     text not null default '',
  error_message      text,
  processed_at       timestamptz not null default now(),
  created_at         timestamptz not null default now()
);

create index if not exists billing_webhook_events_type_idx
  on public.billing_webhook_events(event_type, processed_at desc);

drop trigger if exists billing_customers_set_updated_at on public.billing_customers;
create trigger billing_customers_set_updated_at
  before update on public.billing_customers
  for each row execute function public.set_updated_at();

drop trigger if exists billing_subscriptions_set_updated_at on public.billing_subscriptions;
create trigger billing_subscriptions_set_updated_at
  before update on public.billing_subscriptions
  for each row execute function public.set_updated_at();

drop trigger if exists billing_entitlements_set_updated_at on public.billing_entitlements;
create trigger billing_entitlements_set_updated_at
  before update on public.billing_entitlements
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — owner SELECT only; webhook / checkout writers use service_role.
-- ---------------------------------------------------------------------------

alter table public.billing_customers enable row level security;
alter table public.billing_subscriptions enable row level security;
alter table public.billing_entitlements enable row level security;
alter table public.billing_webhook_events enable row level security;

drop policy if exists "billing_customers_own_select" on public.billing_customers;
create policy "billing_customers_own_select" on public.billing_customers
  for select using (user_id = auth.uid());

drop policy if exists "billing_subscriptions_own_select" on public.billing_subscriptions;
create policy "billing_subscriptions_own_select" on public.billing_subscriptions
  for select using (user_id = auth.uid());

drop policy if exists "billing_entitlements_own_select" on public.billing_entitlements;
create policy "billing_entitlements_own_select" on public.billing_entitlements
  for select using (user_id = auth.uid());

-- Webhook events are not user-readable (ops / service_role only).
-- No authenticated policies on billing_webhook_events.

revoke all on table public.billing_customers from anon;
revoke all on table public.billing_subscriptions from anon;
revoke all on table public.billing_entitlements from anon;
revoke all on table public.billing_webhook_events from anon, authenticated;

grant select on table public.billing_customers to authenticated;
grant select on table public.billing_subscriptions to authenticated;
grant select on table public.billing_entitlements to authenticated;
grant all on table public.billing_customers to service_role;
grant all on table public.billing_subscriptions to service_role;
grant all on table public.billing_entitlements to service_role;
grant all on table public.billing_webhook_events to service_role;

-- ---------------------------------------------------------------------------
-- Privacy purge — billing person rows before prior cascade (T8 wrapper)
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regprocedure('public.pi_privacy_purge_person_data_t8(uuid,uuid)') is null then
    alter function public.pi_privacy_purge_person_data(uuid, uuid)
      rename to pi_privacy_purge_person_data_t8;
  end if;
end
$$;

revoke all on function public.pi_privacy_purge_person_data_t8(uuid, uuid)
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

  -- Entitlements first (may FK subscription)
  delete from public.billing_entitlements where user_id = p_user_id;
  get diagnostics n = row_count;
  touched := touched || jsonb_build_array('billing_entitlements:' || n);

  delete from public.billing_subscriptions where user_id = p_user_id;
  get diagnostics n = row_count;
  touched := touched || jsonb_build_array('billing_subscriptions:' || n);

  delete from public.billing_customers where user_id = p_user_id;
  get diagnostics n = row_count;
  touched := touched || jsonb_build_array('billing_customers:' || n);

  -- Webhook rows are not person-owned; leave for ops audit.

  result := public.pi_privacy_purge_person_data_t8(p_user_id, p_request_id);
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

comment on table public.billing_customers is
  'T9 Stripe customer linkage per DeliverX user. No PAN storage.';
comment on table public.billing_subscriptions is
  'T9 Stripe subscription mirror. Source of entitlement grants.';
comment on table public.billing_entitlements is
  'T9 derived product access (experience / launchpad / professional).';
comment on table public.billing_webhook_events is
  'T9 Stripe webhook idempotency + audit. Not person-exportable.';
comment on function public.pi_privacy_purge_person_data(uuid, uuid) is
  'T9 wrapper: purge billing person rows then T8 cascade. service_role only.';
