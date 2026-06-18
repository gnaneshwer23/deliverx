-- Sprint C3 — external stakeholder read-only share links

do $$ begin
  create type public.share_link_status as enum ('active', 'revoked', 'expired');
exception when duplicate_object then null; end $$;

create table if not exists public.stakeholder_share_links (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  token           text not null unique default encode(gen_random_bytes(24), 'hex'),
  label           text,
  recipient_name  text,
  recipient_email text,
  status          public.share_link_status not null default 'active',
  expires_at      timestamptz not null default (now() + interval '30 days'),
  created_by      uuid references public.users(id) on delete set null,
  last_viewed_at  timestamptz,
  view_count      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists stakeholder_share_links_project_idx
  on public.stakeholder_share_links(project_id, created_at desc);

create index if not exists stakeholder_share_links_token_idx
  on public.stakeholder_share_links(token);

alter table public.stakeholder_share_links enable row level security;

drop policy if exists "stakeholder_share_links_org" on public.stakeholder_share_links;
create policy "stakeholder_share_links_org" on public.stakeholder_share_links
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());
