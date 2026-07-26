-- B9 — Per-user PI API rate limits (TRD-SEC-RATE / R-P2-06)
-- Service-role only; mirrors 0050 / 0051 (RLS on, no client policies).

create table if not exists public.pi_api_rate_limits (
  user_id        uuid not null references auth.users(id) on delete cascade,
  window_bucket  timestamptz not null,
  request_count  integer not null default 1,
  primary key (user_id, window_bucket)
);

create index if not exists pi_api_rate_limits_bucket_idx
  on public.pi_api_rate_limits(window_bucket);

alter table public.pi_api_rate_limits enable row level security;
-- No RLS policies: accessed only via service role in PI API routes.
