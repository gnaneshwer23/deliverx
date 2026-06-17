-- Sprint B5 — calendar follow-ups + Slack/Teams/email notifications

do $$ begin
  create type public.notification_channel as enum ('slack', 'teams', 'email');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.notification_kind as enum (
    'proposal_applied',
    'daily_digest',
    'reminder',
    'calendar'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.org_notification_settings (
  organisation_id           uuid primary key references public.organisations(id) on delete cascade,
  slack_webhook_url         text,
  teams_webhook_url         text,
  digest_enabled            boolean not null default true,
  digest_recipients         text[] not null default '{}',
  notify_on_proposal_apply  boolean not null default true,
  notify_on_pending_reminder boolean not null default true,
  reminder_threshold_hours  int not null default 48,
  updated_at                timestamptz not null default now()
);

create table if not exists public.notification_deliveries (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id      uuid references public.projects(id) on delete set null,
  channel         public.notification_channel not null,
  kind            public.notification_kind not null,
  status          text not null default 'sent',
  payload         jsonb not null default '{}',
  error           text,
  created_at      timestamptz not null default now()
);

create index if not exists notification_deliveries_org_idx
  on public.notification_deliveries(organisation_id, created_at desc);

alter table public.org_notification_settings enable row level security;
alter table public.notification_deliveries enable row level security;

drop policy if exists "org_notification_settings_org" on public.org_notification_settings;
create policy "org_notification_settings_org" on public.org_notification_settings
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "notification_deliveries_org" on public.notification_deliveries;
create policy "notification_deliveries_org" on public.notification_deliveries
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());
