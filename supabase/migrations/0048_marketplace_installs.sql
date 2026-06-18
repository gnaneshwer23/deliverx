-- Sprint E2 — marketplace install audit trail

create table if not exists public.marketplace_installs (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  asset_id        uuid not null references public.marketplace_assets(id) on delete cascade,
  playbook_id     uuid not null references public.playbooks(id) on delete cascade,
  installed_by    uuid references public.users(id) on delete set null,
  installed_at    timestamptz not null default now(),
  unique (organisation_id, asset_id)
);

create index if not exists marketplace_installs_org_idx
  on public.marketplace_installs(organisation_id, installed_at desc);

alter table public.marketplace_installs enable row level security;

drop policy if exists "marketplace_installs_org" on public.marketplace_installs;
create policy "marketplace_installs_org" on public.marketplace_installs
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());
