-- Sprint D3 — Platform API keys (read-only integrations)

create table if not exists public.org_api_keys (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  name            text not null,
  key_prefix      text not null,
  key_hash        text not null,
  scopes          text[] not null default '{read:projects,read:health}'::text[],
  last_used_at    timestamptz,
  revoked_at      timestamptz,
  created_by      uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  unique (organisation_id, name)
);

create index if not exists org_api_keys_org_idx
  on public.org_api_keys(organisation_id, revoked_at);

alter table public.org_api_keys enable row level security;

drop policy if exists "org_api_keys_org" on public.org_api_keys;
create policy "org_api_keys_org" on public.org_api_keys
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());
