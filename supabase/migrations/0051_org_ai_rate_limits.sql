-- Sprint F3 — Per-organisation AI generation rate limits

create table if not exists public.org_ai_rate_limits (
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  window_bucket  timestamptz not null,
  request_count  integer not null default 1,
  primary key (organisation_id, window_bucket)
);

create index if not exists org_ai_rate_limits_bucket_idx
  on public.org_ai_rate_limits(window_bucket);

alter table public.org_ai_rate_limits enable row level security;
-- No RLS policies: accessed only via service role in AI generation paths.
