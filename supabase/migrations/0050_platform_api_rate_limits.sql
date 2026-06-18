-- Sprint F2 — Platform API rate limiting (per-key sliding windows)

create table if not exists public.platform_api_rate_limits (
  key_id         uuid not null references public.org_api_keys(id) on delete cascade,
  window_bucket  timestamptz not null,
  request_count  integer not null default 1,
  primary key (key_id, window_bucket)
);

create index if not exists platform_api_rate_limits_bucket_idx
  on public.platform_api_rate_limits(window_bucket);

alter table public.platform_api_rate_limits enable row level security;
-- No RLS policies: accessed only via service role in Platform API routes.
