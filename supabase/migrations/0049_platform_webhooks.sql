-- Sprint F1 — Platform webhooks + outbound event audit trail

create table if not exists public.platform_webhook_endpoints (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  name            text not null,
  url             text not null,
  secret          text not null,
  events          text[] not null default '{}'::text[],
  enabled         boolean not null default true,
  created_at      timestamptz not null default now(),
  unique (organisation_id, name)
);

create index if not exists platform_webhook_endpoints_org_idx
  on public.platform_webhook_endpoints(organisation_id, enabled);

create table if not exists public.platform_webhook_deliveries (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  endpoint_id     uuid references public.platform_webhook_endpoints(id) on delete set null,
  event_type      text not null,
  payload         jsonb not null default '{}'::jsonb,
  status          text not null default 'pending',
  response_code   integer,
  error           text,
  delivered_at    timestamptz not null default now()
);

create index if not exists platform_webhook_deliveries_org_idx
  on public.platform_webhook_deliveries(organisation_id, delivered_at desc);

alter table public.platform_webhook_endpoints enable row level security;
alter table public.platform_webhook_deliveries enable row level security;

drop policy if exists "platform_webhook_endpoints_org" on public.platform_webhook_endpoints;
create policy "platform_webhook_endpoints_org" on public.platform_webhook_endpoints
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "platform_webhook_deliveries_org" on public.platform_webhook_deliveries;
create policy "platform_webhook_deliveries_org" on public.platform_webhook_deliveries
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());
