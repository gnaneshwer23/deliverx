-- Sprint F4 — Enterprise SSO domain routing (Supabase SAML)

create table if not exists public.org_sso_settings (
  organisation_id uuid primary key references public.organisations(id) on delete cascade,
  enabled               boolean not null default false,
  allowed_domains       text[] not null default '{}',
  idp_name              text,
  sso_required          boolean not null default false,
  updated_at            timestamptz not null default now()
);

create index if not exists org_sso_settings_domains_idx
  on public.org_sso_settings using gin (allowed_domains);

alter table public.org_sso_settings enable row level security;

drop policy if exists "org_sso_settings_org" on public.org_sso_settings;
create policy "org_sso_settings_org" on public.org_sso_settings
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());
